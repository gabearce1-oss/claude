"""Background worker for PDF processing with OCR and chunking."""
import logging
import os
import re
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import tempfile

import psycopg
import pytesseract
from pdf2image import convert_from_path
from PIL import Image

logger = logging.getLogger(__name__)


class PDFProcessor:
    """Process PDFs: OCR → chunk → entity resolution trigger."""
    
    def __init__(
        self,
        db_url: str,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        min_chunk_length: int = 50,
    ):
        self.db_url = db_url
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.min_chunk_length = min_chunk_length
    
    def process_pending(self, batch_size: int = 10) -> int:
        """
        Process pending PDFs from raw_object table.
        
        Returns:
            Count of processed objects
        """
        with psycopg.connect(self.db_url) as conn:
            with conn.cursor() as cur:
                # Fetch pending PDFs
                cur.execute("""
                    SELECT id, object_url, object_path, source_id
                    FROM raw_object
                    WHERE status = 'pending_ocr'
                    AND mime_type IN ('application/pdf', 'image/png', 'image/jpeg')
                    ORDER BY created_date ASC
                    LIMIT %s
                """, (batch_size,))
                
                objects = cur.fetchall()
                processed = 0
                
                for obj_id, obj_url, obj_path, source_id in objects:
                    try:
                        self._process_object(conn, obj_id, obj_path, source_id)
                        processed += 1
                    except Exception as e:
                        logger.error(f"Failed to process {obj_id}: {e}")
                        self._mark_failed(conn, obj_id, str(e))
        
        return processed
    
    def _process_object(
        self,
        conn: psycopg.Connection,
        obj_id: str,
        obj_path: str,
        source_id: str,
    ) -> None:
        """Process single object: OCR → chunk → entity extract."""
        
        # 1. OCR text extraction
        logger.info(f"Processing {obj_id}: OCR extraction")
        text = self._extract_text(obj_path)
        
        if not text or len(text.strip()) < 20:
            raise ValueError("No text extracted or text too short")
        
        # 2. Chunk text
        logger.info(f"Processing {obj_id}: Text chunking")
        chunks = self._chunk_text(text)
        
        # 3. Store chunks in raw_object_part table
        with conn.cursor() as cur:
            for idx, chunk in enumerate(chunks):
                chunk_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO raw_object_part
                    (id, raw_object_id, chunk_index, text, token_count, created_date)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    chunk_id,
                    obj_id,
                    idx,
                    chunk,
                    len(chunk.split()),
                    datetime.utcnow(),
                ))
            
            # Update parent object status
            cur.execute("""
                UPDATE raw_object
                SET status = 'ocr_complete', 
                    updated_date = %s,
                    ocr_text_length = %s
                WHERE id = %s
            """, (datetime.utcnow(), len(text), obj_id))
            
            conn.commit()
        
        # 4. Trigger entity resolution
        self._trigger_entity_resolution(conn, obj_id, chunks)
        
        logger.info(f"✓ Processed {obj_id}: {len(chunks)} chunks")
    
    def _extract_text(self, obj_path: str) -> str:
        """Extract text from PDF or image using OCR."""
        
        if obj_path.lower().endswith('.pdf'):
            return self._extract_text_from_pdf(obj_path)
        else:
            return self._extract_text_from_image(obj_path)
    
    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF via OCR."""
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path)
            
            full_text = []
            for page_num, image in enumerate(images):
                # OCR each page
                page_text = pytesseract.image_to_string(image)
                full_text.append(page_text)
            
            return "\n".join(full_text)
        
        except Exception as e:
            logger.error(f"PDF extraction failed: {e}")
            raise
    
    def _extract_text_from_image(self, img_path: str) -> str:
        """Extract text from image via OCR."""
        try:
            image = Image.open(img_path)
            return pytesseract.image_to_string(image)
        except Exception as e:
            logger.error(f"Image extraction failed: {e}")
            raise
    
    def _chunk_text(self, text: str) -> List[str]:
        """
        Chunk text by sentence/paragraph with overlap.
        
        Strategy:
        1. Split by paragraphs (double newline)
        2. Split long paragraphs by sentences
        3. Group into chunks of ~chunk_size tokens
        4. Add overlap
        """
        
        # Clean text
        text = re.sub(r'\n\n+', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        
        # Split into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return []
        
        # Group sentences into chunks
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sentence in sentences:
            sentence_length = len(sentence.split())
            
            # Check if adding this sentence exceeds chunk_size
            if current_length + sentence_length > self.chunk_size and current_chunk:
                # Store current chunk
                chunk_text = " ".join(current_chunk)
                if len(chunk_text.split()) >= self.min_chunk_length:
                    chunks.append(chunk_text)
                
                # Start new chunk with overlap
                if chunks and self.chunk_overlap > 0:
                    # Keep last few sentences for overlap
                    overlap_sentences = []
                    overlap_length = 0
                    for s in reversed(current_chunk):
                        s_len = len(s.split())
                        if overlap_length + s_len > self.chunk_overlap:
                            break
                        overlap_sentences.insert(0, s)
                        overlap_length += s_len
                    current_chunk = overlap_sentences
                    current_length = overlap_length
                else:
                    current_chunk = []
                    current_length = 0
            
            current_chunk.append(sentence)
            current_length += sentence_length
        
        # Add final chunk
        if current_chunk:
            chunk_text = " ".join(current_chunk)
            if len(chunk_text.split()) >= self.min_chunk_length:
                chunks.append(chunk_text)
        
        return chunks
    
    def _trigger_entity_resolution(
        self,
        conn: psycopg.Connection,
        obj_id: str,
        chunks: List[str],
    ) -> None:
        """Trigger entity resolution for extracted chunks."""
        with conn.cursor() as cur:
            for chunk_idx, chunk in enumerate(chunks):
                # Queue for entity resolution
                task_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO resolution_queue
                    (id, raw_object_id, chunk_index, text, status, created_date)
                    VALUES (%s, %s, %s, %s, 'pending', %s)
                """, (
                    task_id,
                    obj_id,
                    chunk_idx,
                    chunk,
                    datetime.utcnow(),
                ))
            
            conn.commit()
        
        logger.info(f"Queued {len(chunks)} chunks for entity resolution")
    
    def _mark_failed(
        self,
        conn: psycopg.Connection,
        obj_id: str,
        error: str,
    ) -> None:
        """Mark object as failed with error message."""
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE raw_object
                SET status = 'ocr_failed', 
                    error_message = %s,
                    updated_date = %s
                WHERE id = %s
            """, (error, datetime.utcnow(), obj_id))
            conn.commit()


def main():
    """Main entry point for worker."""
    import sys
    
    # Setup logging
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO"),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("DATABASE_URL not set")
        sys.exit(1)
    
    processor = PDFProcessor(
        db_url=db_url,
        chunk_size=int(os.getenv("CHUNK_SIZE", "500")),
        chunk_overlap=int(os.getenv("CHUNK_OVERLAP", "50")),
        min_chunk_length=int(os.getenv("MIN_CHUNK_LENGTH", "50")),
    )
    
    # Process in batches
    while True:
        try:
            count = processor.process_pending(batch_size=10)
            if count == 0:
                logger.info("No pending PDFs, sleeping...")
                import time
                time.sleep(10)
        except Exception as e:
            logger.error(f"Worker error: {e}")
            import time
            time.sleep(5)


if __name__ == "__main__":
    main()