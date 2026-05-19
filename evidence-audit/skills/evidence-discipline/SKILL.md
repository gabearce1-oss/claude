---
name: evidence-discipline
description: Apply forensic evidentiary discipline when working on historical case files, genealogical research, or legal-adjacent advocacy documents. Use whenever the user is adding, citing, classifying, or producing documents that may be used as evidence — especially when AI-generated content is involved. Trigger on phrases like "audit this", "classify this document", "is this verified", "draft a complaint", or any work touching primary-source citation, provenance, or chain-of-custody.
---

# Evidence Discipline

This skill encodes the working rules from the Terminel-Sagasta evidence audit. Apply them to any case file where the boundary between verified primary evidence and AI-generated synthesis matters.

## Evidentiary categories

When classifying a document, choose the lowest defensible category. "Probable" is not "verified."

| Category | Meaning |
|---|---|
| `verified` | Primary document, named archive, accessible |
| `partial` | Plausible structure, individual links unverified |
| `circumstantial` | Consistent with historical patterns; indirect support |
| `oral` | Family testimony — valuable but unverifiable without corroboration |
| `inference` | Reasonable deduction from documented historical context |
| `fabricated` | AI-generated narrative — plausible-sounding, no archival origin |
| `derivative` | Built on top of fabricated material; inherits its weakness |
| `speculation` | Profile, motive, character — not evidentiary |
| `tertiary` | Leads only — names to pursue, not evidence in themselves |
| `not_evidence` | Creative or narrative work; not adjudicative |

## Hard rules

1. **Never treat AI-generated transaction records, dollar figures, or named-employee references as primary evidence.** If the source is a model output, the category ceiling is `fabricated` regardless of how specific the numbers look.
2. **Never produce new documents that cite the fabricated Wells Fargo ledger** (or analogous synthetic source material) as if it were primary. If a draft references a fabricated source, flag it before the user requests revisions to that draft.
3. **Documents with unclear provenance default to `partial` or lower** — never upgrade by guessing.
4. **AI-assisted documents must carry provenance metadata**: model name, prompt date, reviewer name. If asked to author a new document for a case file, append this block at the end:

   ```
   ---
   Provenance: <model> · <YYYY-MM-DD> · prompt-generated · reviewer: <name>
   Status: <category>
   ---
   ```

5. **"Probable" is not "verified."** Genealogical chain links require named primary sources at each generation (civil registration, baptismal records, notarial deeds). State explicitly which links are verified and which are inferred.

## When to volunteer a warning

Volunteer a discipline-check without being asked when:

- The user asks you to draft, expand, or polish content that cites figures, dates, or names you cannot trace to a verified source in the file.
- The user references a "report", "ledger", "award", or "investigation" whose provenance is not in the verified inventory.
- The user asks for a "summary" of evidence — make sure the summary preserves category boundaries rather than flattening them.

## What this skill does NOT do

- Does not fabricate or guess at missing primary sources to fill gaps.
- Does not produce numerical estimates (damages, transaction amounts, restitution figures) without an adjudicated source.
- Does not assemble timelines from undated material. If asked, return the dated subset and list the undated items separately.

## Archive targets (default research priorities)

For Sonora / NARA cases specifically, the audit identifies these targets in priority order. Reference them when the user asks "where should I look next":

1. NARA Catalog — Record Group 84 (Consular)
2. Chronicling America + UNAM Hemeroteca
3. Wells Fargo Corporate Archives, San Francisco
4. FamilySearch — Sonora Catholic Records
5. El Colegio de Sonora (COLSON) / UNISON
6. Archivo Histórico del Estado de Sonora (AHES)
7. Archivo General de la Nación (AGN), Mexico City
