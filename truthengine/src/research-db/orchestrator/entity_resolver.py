"""Entity resolution worker: extract person/org mentions from chunks."""
import logging
import os
import re
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple

import psycopg
import spacy
from spacy.tokens import Doc

logger = logging.getLogger(__name__)


class EntityResolver:
    """Extract and resolve person/organization mentions from text chunks."""
    
    def __init__(self, db_url: str, model: str = "en_core_web_sm"):
        self.db_url = db_url
        try:
            self.nlp = spacy.load(model)
        except OSError:
            logger.warning(f"Model {model} not found, downloading...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", model], check=True)
            self.nlp = spacy.load(model)
    
    def process_pending(self, batch_size: int = 20) -> int:
        """
        Process pending chunks from resolution_queue.
        
        Returns:
            Count of processed resolutions
        """
        with psycopg.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                # Fetch pending resolutions
                cur.execute("""
                    SELECT resolution_id, part_id, 
                           (SELECT text FROM raw_object_part WHERE part_id = resolution_queue.part_id) as text
                    FROM resolution_queue
                    WHERE status = 'pending'
                    ORDER BY created_at ASC
                    LIMIT %s
                """, (batch_size,))
                
                resolutions = cur.fetchall()
                processed = 0
                
                for res_id, part_id, text in resolutions:
                    try:
                        self._process_resolution(conn, res_id, part_id, text)
                        processed += 1
                    except Exception as e:
                        logger.error(f"Failed to process resolution {res_id}: {e}")
                        self._mark_failed(conn, res_id, str(e))
        
        return processed
    
    def _process_resolution(
        self,
        conn: psycopg.Connection,
        res_id: str,
        part_id: str,
        text: str,
    ) -> None:
        """Extract entities from chunk and store results."""
        
        logger.info(f"Processing resolution {res_id} from part {part_id}")
        
        # Extract mentions
        persons = self._extract_persons(text)
        orgs = self._extract_organizations(text)
        
        # Serialize results
        person_json = json.dumps([
            {"text": p["text"], "confidence": p["confidence"], "start": p["start"], "end": p["end"]}
            for p in persons
        ]) if persons else None
        
        org_json = json.dumps([
            {"text": o["text"], "confidence": o["confidence"], "start": o["start"], "end": o["end"]}
            for o in orgs
        ]) if orgs else None
        
        # Compute overall confidence
        all_mentions = persons + orgs
        avg_confidence = sum(m["confidence"] for m in all_mentions) / len(all_mentions) if all_mentions else 0.0
        
        # Update resolution_queue with results
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE resolution_queue
                SET status = 'completed',
                    person_mentions = %s,
                    organization_mentions = %s,
                    confidence_score = %s,
                    processed_date = %s,
                    updated_at = %s
                WHERE resolution_id = %s
            """, (
                person_json,
                org_json,
                avg_confidence,
                datetime.utcnow(),
                datetime.utcnow(),
                res_id,
            ))
            
            # Create entity assertion records for high-confidence mentions
            for person in persons:
                if person["confidence"] >= 0.7:
                    self._create_entity_assertion(
                        conn, part_id, "person", person, res_id
                    )
            
            for org in orgs:
                if org["confidence"] >= 0.7:
                    self._create_entity_assertion(
                        conn, part_id, "organization", org, res_id
                    )
            
            conn.commit()
        
        logger.info(f"✓ Resolved {res_id}: {len(persons)} persons, {len(orgs)} organizations")
    
    def _extract_persons(self, text: str) -> List[Dict[str, Any]]:
        """Extract person entity mentions using NER."""
        doc = self.nlp(text)
        persons = []
        
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                persons.append({
                    "text": ent.text,
                    "start": ent.start_char,
                    "end": ent.end_char,
                    "confidence": 0.85,  # Default spaCy confidence
                    "label": "PERSON",
                })
        
        return persons
    
    def _extract_organizations(self, text: str) -> List[Dict[str, Any]]:
        """Extract organization entity mentions using NER."""
        doc = self.nlp(text)
        orgs = []
        
        for ent in doc.ents:
            if ent.label_ == "ORG":
                orgs.append({
                    "text": ent.text,
                    "start": ent.start_char,
                    "end": ent.end_char,
                    "confidence": 0.85,
                    "label": "ORG",
                })
        
        return orgs
    
    def _create_entity_assertion(
        self,
        conn: psycopg.Connection,
        part_id: str,
        entity_type: str,
        mention: Dict[str, Any],
        res_id: str,
    ) -> None:
        """Create or link entity assertion for mention."""
        with conn.cursor() as cur:
            # Check if entity already exists
            cur.execute("""
                SELECT entity_id FROM entity
                WHERE canonical_name = %s AND entity_type = %s
                LIMIT 1
            """, (mention["text"], entity_type))
            
            result = cur.fetchone()
            if result:
                entity_id = result[0]
            else:
                # Create new entity
                entity_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO entity
                    (entity_id, entity_type, canonical_name, status, review_state)
                    VALUES (%s, %s, %s, 'unreviewed', 'pending')
                """, (entity_id, entity_type, mention["text"]))
            
            # Create assertion linking mention to entity
            assertion_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO entity_assertion
                (assertion_id, entity_id, assertion_type, value_text, confidence, review_state)
                VALUES (%s, %s, %s, %s, %s, 'unreviewed')
            """, (
                assertion_id,
                entity_id,
                "mentioned_in_text",
                mention["text"],
                mention["confidence"],
            ))
            
            # Link assertion to resolution for audit
            cur.execute("""
                INSERT INTO claim_evidence
                (claim_evidence_id, claim_id, raw_object_part_id, 
                 excerpt, char_start, char_end, evidence_score)
                VALUES (%s, NULL, %s, %s, %s, %s, %s)
            """, (
                str(uuid.uuid4()),
                part_id,
                mention["text"],
                mention["start"],
                mention["end"],
                mention["confidence"],
            ))
    
    def _mark_failed(
        self,
        conn: psycopg.Connection,
        res_id: str,
        error: str,
    ) -> None:
        """Mark resolution as failed."""
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE resolution_queue
                SET status = 'failed',
                    error_message = %s,
                    updated_at = %s
                WHERE resolution_id = %s
            """, (error, datetime.utcnow(), res_id))
            conn.commit()


def main():
    """Main entry point for entity resolver worker."""
    import sys
    
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO"),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("DATABASE_URL not set")
        sys.exit(1)
    
    resolver = EntityResolver(
        db_url=db_url,
        model=os.getenv("SPACY_MODEL", "en_core_web_sm"),
    )
    
    while True:
        try:
            count = resolver.process_pending(batch_size=20)
            if count == 0:
                logger.info("No pending resolutions, sleeping...")
                import time
                time.sleep(10)
        except Exception as e:
            logger.error(f"Worker error: {e}")
            import time
            time.sleep(5)


if __name__ == "__main__":
    main()