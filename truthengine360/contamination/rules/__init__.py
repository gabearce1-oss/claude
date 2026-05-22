"""Rule registry. ALL_RULES is the default rule set used by `score()`."""

from .citation import citation_rules
from .image import image_rules
from .linguistic import linguistic_rules
from .statistical import statistical_rules
from .structural import structural_rules

ALL_RULES = (
    structural_rules
    + statistical_rules
    + linguistic_rules
    + citation_rules
    + image_rules
)

__all__ = ["ALL_RULES"]
