# SHA-256 Chain-of-Custody Protocol — Gabriel's Deed Documents
## TSK-006 — URGENT — Execute Before Any Other Action

## What This Accomplishes

Creates a tamper-evident fingerprint (hash) for each document file. If the file is ever altered — even a single pixel — the hash changes. This is the legal chain-of-custody standard for digital evidence.

## Step 0 — Physical-Condition Log (Chain of custody begins on folder open)

Before photographing anything, note the physical condition of each document in a separate log entry — water damage, fold marks, signature condition, seal condition, paper type. Write it by hand in a notebook or type it into a plain text file. If the authenticity of a deed is ever challenged, the physical-condition record is your first line of defense. Chain of custody begins the moment you open the folder, not when you run the hash.

## Step 1 — Photograph Every Physical Deed

- Use your phone camera in highest resolution
- Photograph EVERY page, including blank pages and covers
- Photograph front and back of every document
- Include a ruler or coin in one frame for scale reference
- Photograph in good flat light — no shadows across text
- Save as PDF (scan) or as JPG series per document
- **Disable any auto-enhancement** in scanner/photo apps — avoid filters that whiten background, deskew, or aggressively crop. Ideal: color photos, no extra compression, as they come out of the camera.

## Step 2 — Name the Files (Standardized)

Use this naming convention:

```
LAND-002_deed_[description]_[approx_date]_p[page].pdf
```

Examples:
```
LAND-002_deed_water_rights_san_javier_1905_p1.pdf
LAND-002_deed_bridge_dam_1908_p1.pdf
LAND-004_registros_libro45_folio12_1892_p1.pdf
LAND-005_escritura_libro92_folio37_1907_p1.pdf
```

## Step 3 — Run SHA-256 on Each File

**Mac/Linux** (single file):
```bash
shasum -a 256 LAND-002_deed_water_rights_san_javier_1905_p1.pdf
```

**Mac/Linux** (entire folder of PDFs/JPGs in one pass — recommended, harder to miss a file):
```bash
find . -type f \( -name "*.pdf" -o -name "*.jpg" \) -exec shasum -a 256 {} \; > deed_hashes_2026-05-20.txt
```

**Windows** (PowerShell):
```powershell
Get-FileHash LAND-002_deed_water_rights_san_javier_1905_p1.pdf -Algorithm SHA256
```

**Windows** (cmd):
```
certutil -hashfile LAND-002_deed_water_rights_san_javier_1905_p1.pdf SHA256
```

Output will look like:
```
a3f1b2c4d5e6...  LAND-002_deed_water_rights_san_javier_1905_p1.pdf
```

## Step 4 — Record ALL Hashes in a Single Text File

Create `deed_hashes_[date].txt` with this format:

```
=== TE360 DEED HASH REGISTER ===
Date generated: 2026-05-20
Operator: [Your name]
Location of originals: [Gabriel's address/location]
Device: iPhone 14 (or applicable model)
Method: camera → export to PDF (no edits)

SHA-256 HASHES:
a3f1b2c4d5e6...  LAND-002_deed_water_rights_san_javier_1905_p1.pdf
[hash]           LAND-002_deed_water_rights_san_javier_1905_p2.pdf
[hash]           LAND-004_registros_libro45_folio12_1892_p1.pdf
[hash]           LAND-005_escritura_libro92_folio37_1907_p1.pdf
[etc.]
```

## Step 5 — Store Copies in Three Separate Locations

1. Cloud storage (Google Drive, iCloud, or Dropbox) — upload the PDFs + hash file
2. External USB drive — copy all files
3. Email the hash file to yourself AND one other trusted person

## Step 6 — Do NOT Open or Modify the Original Files After Hashing

Once hashed, treat the original files as read-only.

Work in two folders:
- `originals/` — read-only, already hashed
- `working/` — for OCR, annotation, cropping, etc.

If you accidentally change something in `originals/`, re-hash and document the incident in the TXT register.

## Applies Equally to FamilySearch Screenshots

When you get a FamilySearch hit (per TSK-001/002 protocol), SHA-256 hash the screenshot image file. Same command, applied to the JPG. This creates a chain of custody for the digital discovery the same way the deed hashing creates chain of custody for the physical documents.

## For TE360 Database Entry

Each deed gets an evidence row with:

- `source_system`: `"gabriel_family_custody"`
- `storage_uri`: `[cloud URL]`
- `sha256`: `[the hash string]`
- `provenance_score`: 8/10 (family oral history + physical custody)
- `authenticity_score`: PENDING (requires AHES cross-check with Libro 45/92)
- `contamination_score`: 0
- `review_status`: `"triaged — awaiting AHES cross-verification"`
