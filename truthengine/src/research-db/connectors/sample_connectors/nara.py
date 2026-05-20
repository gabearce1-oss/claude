"""NARA Catalog API connector (Top priority source #1)."""
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


class NaraConnector(BaseConnector):
    source_family_id = "nara_catalog"
    connector_class = "OFFICIAL_API"
    base_url = "https://catalog.archives.gov/api/v1/"
    
    def discover(self, query: DiscoverQuery) -> Iterable[Dict[str, Any]]:
        """
        Query NARA catalog API.
        GET /api/v1?description.item.title=<q>&resultTypes=item
        """
        params = {
            "q": query.q,
            "resultTypes": "item",
            "rows": query.page_size,
        }
        if query.from_date:
            params["filters"] = f"dateCreatedRangeBegin:{query.from_date}"
        
        resp = requests.get(f"{self.base_url}", params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        for result in data.get("opaResponse", {}).get("results", []):
            yield {
                "na_id": result.get("naId"),
                "title": result.get("title"),
                "summary": result.get("scopeAndContentNote"),
                "url": f"https://catalog.archives.gov/id/{result.get('naId')}",
                "date": result.get("levelOfDescription"),
            }
    
    def fetch(self, handle: Dict[str, Any]) -> RawEnvelope:
        """GET /api/v1?naIds=<naId> for full item metadata."""
        na_id = handle.get("na_id")
        params = {"naIds": na_id, "resultTypes": "item"}
        
        resp = requests.get(f"{self.base_url}", params=params, timeout=30)
        resp.raise_for_status()
        
        return RawEnvelope(
            source_family_id=self.source_family_id,
            endpoint_id="nara_catalog_api",
            fetched_at=datetime.utcnow().isoformat(),
            request_url=resp.url,
            http_status=resp.status_code,
            content_type="application/json",
            payload=resp.content,
            etag=resp.headers.get("ETag"),
            last_modified=resp.headers.get("Last-Modified"),
        )
    
    def normalize(self, raw: RawEnvelope) -> Iterable[NormalizedRecord]:
        """Parse JSON response into normalized records."""
        import json
        data = json.loads(raw.payload)
        
        for result in data.get("opaResponse", {}).get("results", []):
            na_id = result.get("naId")
            yield NormalizedRecord(
                source_family_id=self.source_family_id,
                source_record_id=na_id,
                record_type="archival_description",
                title=result.get("title", ""),
                summary=result.get("scopeAndContentNote"),
                language="en",
                publish_date=None,  # Archives don't have traditional pub dates
                canonical_url=f"https://catalog.archives.gov/id/{na_id}",
                source_hash=raw.payload_sha256,
                sensitivity_class="LOW",
            )
    
    def cite(self, record: NormalizedRecord) -> CitationBundle:
        return CitationBundle(
            citation_text=f"National Archives and Records Administration. {record.title}. {record.canonical_url}. Accessed {datetime.utcnow().strftime('%Y-%m-%d')}.",
            source_url=record.canonical_url,
            access_date=datetime.utcnow().strftime("%Y-%m-%d"),
            publisher="National Archives and Records Administration",
            title=record.title,
            publication_date=None,
        )