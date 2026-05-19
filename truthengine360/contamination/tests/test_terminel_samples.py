"""End-to-end smoke tests using stylized samples drawn from the
Terminel-Sagasta evidence audit. Verifies the detector correctly
distinguishes verified primary-source material from the AI-generated
synthetic narratives identified in that audit."""

from datetime import date

from truthengine360.contamination import Document, score


# ---------------------------------------------------------------------
# Fabricated samples — should land in 'high_priority' or 'quarantine'
# ---------------------------------------------------------------------

WELLS_FARGO_RESTITUTION = Document(
    title="Restitution Award — Terminel-Sagasta",
    ocr_text=(
        "Wells Fargo Bank Sonora Branch — Internal Memorandum\n"
        "Transaction ID: WF-1907-TX-00042   Amount: $639,000,000\n"
        "Transaction ID: WF-1908-TX-00043   Amount: $100,000,000\n"
        "Transaction ID: WF-1909-TX-00044   Amount: $10,000,000\n"
        "Memo: MEMO-00042 routed to the Vice President of Foreign Operations.\n"
        "In summary, it's important to note the comprehensive overview of "
        "stakeholder transfers totaling $1,000,000,000 through best-practices "
        "compliance review. Furthermore, the key takeaway aligns with "
        "the proprietary records on file. Additionally, due diligence was performed."
    ),
    archive_name="Wells Fargo Internal",
    record_date_start=date(1907, 6, 1),
    pdf_metadata={"producer": "Microsoft Word"},
)


def test_fabricated_wells_fargo_quarantined():
    report = score(WELLS_FARGO_RESTITUTION)
    rules_fired = {f.rule_id for f in report.findings}
    assert "S002_invented_identifier" in rules_fired, rules_fired
    assert "C002_anachronistic_titles" in rules_fired, rules_fired
    assert "L001_modern_phrasing" in rules_fired, rules_fired
    assert "L002_llm_discourse_markers" in rules_fired, rules_fired
    assert report.verdict in ("high_priority", "quarantine"), report.to_dict()
    assert report.composite_score >= 40, report.to_dict()


# ---------------------------------------------------------------------
# Verified samples — should land in 'low'
# ---------------------------------------------------------------------

NARA_CONSULAR_DISPATCH = Document(
    title="Hermosillo consular dispatch No. 412, August 1908",
    ocr_text=(
        "SIR: I have the honor to acknowledge receipt of your communication "
        "of July 23 last, in re the inquiry concerning lands held by señor "
        "Terminel near San Javier in this state. I beg to enclose herewith "
        "a transcript of the relevant entry from the registro publico, "
        "with my respects, your obedient servant."
    ),
    archive_name="NARA",
    collection_name="RG 84, Hermosillo Consular Records",
    box_number="Vol. 14",
    record_date_start=date(1908, 8, 12),
    ocr_confidence=82.0,
)


def test_verified_nara_dispatch_low_risk():
    report = score(NARA_CONSULAR_DISPATCH)
    assert report.verdict == "low", report.to_dict()
    assert report.composite_score < 20, report.to_dict()


AHES_NOTARIAL_RECORD = Document(
    title="Escritura de compraventa, San Javier, 1903",
    ocr_text=(
        "En la villa de San Javier, a quince días del mes de marzo de mil "
        "novecientos tres, ante mí, el escribano público de la municipalidad, "
        "compareció don Francisco Terminel, mayor de edad, vecino de esta "
        "jurisdicción, quien otorgó la presente escritura de compraventa..."
    ),
    archive_name="AHES",
    collection_name="Fondo Notarías, Serie San Javier",
    box_number="Caja 32",
    record_date_start=date(1903, 3, 15),
    language_code="es",
    ocr_confidence=78.0,
)


def test_verified_notarial_record_low_risk():
    report = score(AHES_NOTARIAL_RECORD)
    assert report.verdict == "low", report.to_dict()
