"""U.S. Census Data API connector (Top priority #4)."""
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


class CensusConnector(BaseConnector):
    source_family_id = "census_api"
    connector_class = "OFFICIAL_API"
    base_url = "https://api.census.gov/data/"
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    def discover(self, query: DiscoverQuery) -> Iterable[Dict[str, Any]]:
        """
        Discover Census datasets.
        Returns available datasets and variables for the query.
        """
        # For demo, return some known Census datasets
        datasets = [
            {"name": "acs/acs1", "title": "American Community Survey 1-Year"},
            {"name": "acs/acs5", "title": "American Community Survey 5-Year"},
            {"name": "dec/dhc", "title": "Decennial Census"},
        ]
        for ds in datasets:
            yield {
                "dataset": ds["name"],
                "title": ds["title"],
            }
    
    def fetch(self, handle: Dict[str, Any]) -> RawEnvelope:
        """
        Fetch Census dataset metadata.
        GET /api/census/data/<dataset>?key=<api_key>
        """
        dataset = handle.get("dataset")
        params = {"key": self.api_key}
        
        resp = requests.get(f"{self.base_url}{dataset}", params=params, timeout=30)
        resp.raise_for_status()
        
        return RawEnvelope(
            source_family_id=self.source_family_id,
            endpoint_id="census_api",
            fetched_at=datetime.utcnow().isoformat(),
            request_url=resp.url,
            http_status=resp.status_code,
            content_type="application/json",
            payload=resp.content,
        )
    
    def normalize(self, raw: RawEnvelope) -> Iterable[NormalizedRecord]:
        """Parse Census metadata into normalized records."""
        import json
        data = json.loads(raw.payload)
        
        # Census API returns variable definitions
        for var_name, var_meta in data.items():
            if isinstance(var_meta, dict):
                yield NormalizedRecord(
                    source_family_id=self.source_family_id,
                    source_record_id=var_name,
                    record_type="census_variable",
                    title=var_meta.get("label", var_name),
                    summary=var_meta.get("concept"),
                    language="en",
                    publish_date=None,
                    canonical_url=f"https://api.census.gov/data/{self.source_family_id}",
                    source_hash=raw.payload_sha256,
                    sensitivity_class="MEDIUM",
                )
    
    def cite(self, record: NormalizedRecord) -> CitationBundle:
        return CitationBundle(
            citation_text=f"U.S. Census Bureau. {record.title}. {record.canonical_url}. Accessed {datetime.utcnow().strftime('%Y-%m-%d')}.",
            source_url=record.canonical_url,
            access_date=datetime.utcnow().strftime("%Y-%m-%d"),
            publisher="U.S. Census Bureau",
            title=record.title,
            publication_date=None,
        )