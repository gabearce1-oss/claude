"""Document model — the input to contamination scoring.

A subset of the evidence-table fields specified in the MVP plan, chosen to
cover the inputs the contamination rules actually need. Loaders from the
full evidence schema (PostgreSQL) or from external connectors should adapt
to this shape before calling `score`.
"""

from dataclasses import dataclass, field
from datetime import date
from typing import Optional


@dataclass
class Document:
    title: str
    ocr_text: str = ""

    archive_name: Optional[str] = None
    collection_name: Optional[str] = None
    box_number: Optional[str] = None
    folder_number: Optional[str] = None
    call_number: Optional[str] = None

    record_date_start: Optional[date] = None
    record_date_end: Optional[date] = None

    language_code: Optional[str] = None
    ocr_confidence: Optional[float] = None  # 0-100

    # Free-form PDF metadata: { "producer": "...", "creator": "...", "created": "..." }
    pdf_metadata: dict = field(default_factory=dict)

    # Catch-all for connector-specific sidecar data.
    metadata: dict = field(default_factory=dict)

    @property
    def record_year(self) -> Optional[int]:
        if self.record_date_start:
            return self.record_date_start.year
        return None

    @property
    def has_archive_locator(self) -> bool:
        return bool(
            self.archive_name
            or self.collection_name
            or self.box_number
            or self.folder_number
            or self.call_number
        )
