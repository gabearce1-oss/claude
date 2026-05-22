"""Contamination scoring — detect AI-generated synthetic material that mimics
historical evidence. Implements the five rule classes and weighted composite
score from the TruthEngine360 MVP plan."""

from .document import Document
from .findings import Category, Finding, verdict, CATEGORY_WEIGHTS
from .scoring import ContaminationReport, score

__all__ = [
    "Document",
    "Category",
    "Finding",
    "ContaminationReport",
    "score",
    "verdict",
    "CATEGORY_WEIGHTS",
]
