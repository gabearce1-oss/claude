"""Base connector interface for all source families."""
from dataclasses import dataclass, field
from typing import Iterable, Optional, Any, Dict
from datetime import datetime
import hashlib
from abc import ABC, abstractmethod


@dataclass
class DiscoverQuery:
    q: str
    language: str = "en"
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    cursor: Optional[str] = None
    page_size: int = 100


@dataclass
class RawEnvelope:
    source_family_id: str
    endpoint_id: str
    fetched_at: str
    request_url: str
    http_status: int
    content_type: str
    payload: bytes
    etag: Optional[str] = None
    last_modified: Optional[str] = None

    @property
    def payload_sha256(self) -> str:
        return hashlib.sha256(self.payload).hexdigest()

    @property
    def payload_size_bytes(self) -> int:
        return len(self.payload)


@dataclass
class NormalizedRecord:
    source_family_id: str
    source_record_id: str
    record_type: str
    title: str
    summary: Optional[str]
    language: str
    publish_date: Optional[str]
    canonical_url: str
    source_hash: str
    entities: list = field(default_factory=list)  # [{type, name, confidence}, ...]
    claims: list = field(default_factory=list)    # [{subject, predicate, object}, ...]
    attachments: list = field(default_factory=list)  # [{url, media_type, hash}, ...]
    rights: Optional[str] = None
    sensitivity_class: str = "MEDIUM"


@dataclass
class CitationBundle:
    citation_text: str
    source_url: str
    access_date: str
    publisher: str
    title: str
    publication_date: Optional[str] = None


class BaseConnector(ABC):
    """Base class for all connectors."""
    
    source_family_id: str
    connector_class: str  # api_crawler, bulk_downloader, ckan, socrata, etc.
    
    @abstractmethod
    def discover(self, query: DiscoverQuery) -> Iterable[Dict[str, Any]]:
        """
        Find candidate records matching the query.
        Yields dicts with 'handle' (for fetch()), 'title', 'url', 'date'.
        """
        raise NotImplementedError
    
    @abstractmethod
    def fetch(self, handle: Dict[str, Any]) -> RawEnvelope:
        """Fetch the raw object for a given handle."""
        raise NotImplementedError
    
    @abstractmethod
    def normalize(self, raw: RawEnvelope) -> Iterable[NormalizedRecord]:
        """Parse raw payload into normalized records."""
        raise NotImplementedError
    
    @abstractmethod
    def cite(self, record: NormalizedRecord) -> CitationBundle:
        """Generate a citation for a record."""
        raise NotImplementedError
    
    def should_backoff(self, http_status: int) -> bool:
        """Check if we should back off (rate limit or server error)."""
        return http_status in {429, 500, 502, 503, 504}
    
    def can_store_raw(self, content_type: str) -> bool:
        """Check if we can store this content type."""
        return True


class BrowserFallbackMixin:
    """Mixin for connectors that need headless browser fallback."""
    
    async def fetch_via_browser(self, handle: Dict[str, Any], url: str) -> RawEnvelope:
        """
        Fallback: use Playwright for public portals that block automation.
        Implement in subclass if needed.
        """
        raise NotImplementedError("Browser fallback not implemented for this connector")


class SensitiveSourceGuard:
    """Guard for handling sensitive data (addresses, phone, precise coords, etc.)."""
    
    @staticmethod
    def enforce(record: NormalizedRecord) -> NormalizedRecord:
        """
        Strip PII from record before storage.
        - Remove precise coordinates (round to city-level)
        - Mask phone/email
        - Remove personal addresses
        - Keep only structural/organizational info
        """
        # Implement field-level redaction per sensitivity class
        if record.sensitivity_class == "HIGH":
            record.summary = "[REDACTED]"
        return record