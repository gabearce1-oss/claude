"""Library of Congress JSON/YAML API connector (Top priority #2)."""
import requests
from typing import Dict, Any, Iterable
from datetime import datetime
from connectors.connector_interface import (
    BaseConnector,
    DiscoverQuery,
    RawEnvelope,
    NormalizedRecord,
    CitationBundle,
)


class LocConnector(BaseConnector):
    source_family_id = "loc_json"
    connector_class = "OFFICIAL_API"
    base_url = "https://www.loc.gov/apis/json/"
    
    def discover(self, query: DiscoverQuery) -> Iterable[Dict[str, Any]]:
        """
        Query LOC JSON API.
        GET /search/?fo=json&q=<query>
        """
        params = {
            "fo": "json",
            "q": query.q,
            "pageSize": query.page_size,
        }
        if query.from_date:
            params["dateissuedstart"] = query.from_date
        
        resp = requests.get(f"{self.base_url}search/", params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        for result in data.get("results", []):
            yield {
                "loc_id": result.get("id"),
                "title": result.get("title", [""])[0] if result.get("title") else "",
                "url": result.get("url"),
                "date": result.get("date", [""])[0] if result.get("date") else None,
            }
    
    def fetch(self, handle: Dict[str, Any]) -> RawEnvelope:
        """Fetch item metadata from LOC API."""
        loc_url = handle.get("url")
        params = {"fo": "json"}
        
        resp = requests.get(loc_url, params=params, timeout=30)
        resp.raise_for_status()
        
        return RawEnvelope(
            source_family_id=self.source_family_id,
            endpoint_id="loc_json_api",
            fetched_at=datetime.utcnow().isoformat(),
            request_url=resp.url,
            http_status=resp.status_code,
            content_type="application/json",
            payload=resp.content,
        )
    
    def normalize(self, raw: RawEnvelope) -> Iterable[NormalizedRecord]:
        """Parse LOC JSON into normalized records."""
        import json
        data = json.loads(raw.payload)
        
        result = data.get("result", {})
        yield NormalizedRecord(
            source_family_id=self.source_family_id,
            source_record_id=result.get("id", ""),
            record_type="collection_item",
            title=result.get("title", ""),
            summary=result.get("description", [""])[0] if result.get("description") else None,
            language="en",
            publish_date=result.get("date", [""])[0] if result.get("date") else None,
            canonical_url=result.get("url", ""),
            source_hash=raw.payload_sha256,
            sensitivity_class="LOW",
        )
    
    def cite(self, record: NormalizedRecord) -> CitationBundle:
        return CitationBundle(
            citation_text=f"Library of Congress. {record.title}. {record.canonical_url}. Accessed {datetime.utcnow().strftime('%Y-%m-%d')}.",
            source_url=record.canonical_url,
            access_date=datetime.utcnow().strftime("%Y-%m-%d"),
            publisher="Library of Congress",
            title=record.title,
            publication_date=record.publish_date,
        )