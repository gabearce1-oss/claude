# TE360 Priority Action Execution Package
## Terminel–Sagasta Investigation | Immediate Actions: TSK-001/002, TSK-004, TSK-005, TSK-006, LAND-004/005
*Prepared by Deep Research | May 20, 2026 | Aviana & Nela Terminel-Sagasta / Yaqui RPA*

***
## Executive Summary
Five task groups require execution now. Three can be initiated today at zero cost (TSK-001/002 via FamilySearch; TSK-006 via phone/camera). Two require formal written requests to Mexican government archives (TSK-005 to AGES/RAN; LAND-004/005 to AHES). One requires mailing a letter to San Francisco (TSK-004 Wells Fargo Historical Services). This document provides exact step-by-step execution instructions, contact information, model letter text, and SHA-256 hashing protocol for each task.

***
## TSK-001/002 — FamilySearch Browse: Sahuaripa Civil & Parish Records
**Objective:** Manually browse two FamilySearch catalog collections to search for Terminel, Terminal, Sagasta, and Avina/Aviana entries that would confirm baptism, marriage, or civil registration records — including any notation of indigenous parentage such as *"hija de madre yaqui"* or *"india"* in the baptismal formula.

**Why these two collections:**
- **Catalog 704679** = Sahuaripa civil registration, 1868–1920. This is the civil registro civil that would hold birth, marriage, and death *actas* for the municipality that includes San Javier's historical administrative jurisdiction. Because San Javier was not its own full civil-registration municipality until the 1930s, pre-1930 births in San Javier territory often registered in Sahuaripa or in neighboring offices.
- **Catalog 704681** = Nuestra Señora de Guadalupe Parish (Sahuaripa), baptisms/marriages/burials, 1781–1961. This is the Catholic parish record set for the Sahuaripa district. Parish baptismal registers from the Porfiriato era (1880–1910) frequently contain racial or ethnic notations (*casta* annotations or marginal notes) that civil registers omit. These are the records most likely to contain a notation such as *"de madre india"* or a caste identifier next to Aviana Sagasta's name.
### Step-by-Step Browse Instructions
**Step 1 — Access FamilySearch**
- Go to [familysearch.org](https://www.familysearch.org) and sign in (free account required).
- Click **Search → Catalog** in the top navigation.

**Step 2 — Open Catalog 704679 (Civil Registration)**
- In the Catalog search box, enter the Film/Fiche number **704679** directly, or search by place: *Sahuaripa, Sahuaripa, Sonora, Mexico* → select *Civil Registration*.
- The collection will show a list of microfilm reels. Look for reels covering **1868–1920**.
- Click **Camera icon** (if digitized) or note the reel number for ordering to a local Family History Center.

**Step 3 — Open Catalog 704681 (Parish Records)**
- In the Catalog search box, enter **704681**, or search by place: *Sahuaripa, Sahuaripa, Sonora, Mexico* → select *Church Records* → *Nuestra Señora de Guadalupe*.
- Identify reels covering **baptisms 1860–1920** and **marriages 1880–1920**.

**Step 4 — Browse Protocol**
Once images open, browse the following name sequences in each volume's alphabetical or chronological index (most volumes are not indexed — manual browse required):

| Target Surname | Spelling Variants to Check |
|---|---|
| Terminel | Terminal, Terminel, Terminél |
| Sagasta | Sagasta, Zagasta, Sagaste |
| Aviana / Avina | Aviana, Avina, Abina, Avinah |
| Porchas | Porchas, Porcha, Porjas |

**Step 5 — What to Record**
For every hit, photograph or screenshot:
- Full page image
- Folio/page number and reel number
- Exact text of the entry including any marginal annotations
- Date of the record

**Specific Target Dates:**
- Nela (María Manuela Terminel Sagasta): look for **birth acta ~August 7, 1910**[^1]
- Aviana Sagasta: look for any entry **1875–1915** — baptism, marriage, or death
- Francisco L. Terminel: look for **marriage acta 1895–1910** pairing him with Aviana Sagasta

**Step 6 — Record in TE360**
- Each hit becomes a new **EV-xxxx** evidence row in the Master Matrix with:
  - `source_system = familysearch`
  - `storage_uri = FamilySearch Film [number], Folio [number]`
  - `provenance_score = 9` (imaged original microfilm)
  - `review_status = triaged`
- Link to claims **GEN-001** (Nela birth), **IND-001** (Aviana identity), **ARCH-001** (1912 complaint background)
### What a Positive Result Looks Like
A positive result for Aviana Sagasta's baptism would read approximately:

> *"En [date], yo [priest name], bauticé solemnemente a [child name], hija legítima de [father] y de Aviana Sagasta, india/de la tribu [X]..."*

Any notation of *india*, *indígena*, *de nación yaqui*, *pima*, or similar in the mother's or child's description would constitute **primary source confirmation** for Claim IND-001 and would immediately upgrade it from ORANGE to GREEN.

***
## TSK-004 — Wells Fargo Historical Services Inquiry
**Objective:** Mail the formal archival inquiry letter (already drafted in prior session) to Wells Fargo Historical Services to initiate a search of the Wiltsee Collection, Mexico Division files, and agent-ledger records for Sonoran operations 1895–1935.[^2][^3]
### Mailing Address
**Wells Fargo Historical Services**
MAC A0101-017
420 Montgomery Street
San Francisco, CA 94104

**Alternative / Backup:**
Wells Fargo History Museum
420 Montgomery Street, Street Level
San Francisco, CA 94104
Attn: Historical Services / Research Request

*Note: Wells Fargo does not publish a public email address for archival research inquiries. Physical mail is the correct channel. Allow 6–12 weeks for a response given the specialized nature of the request.*
### What to Include in the Envelope
1. **The formal inquiry letter** (already drafted — 5 questions covering geographic presence, surviving records, named individuals, corporate structure, and the Wiltsee Collection)[^2]
2. **One-page case summary** — not more than one page; identify the investigation as a historical-genealogical research inquiry, not a legal demand
3. **Do NOT include** any of the prior AI-generated documents (WF-007, WF-008 — quarantined)[^1]
4. **Return envelope** with return address for reply
### Follow-Up Protocol
- Log the submission date in the **archive_targets** table: `ARCH-013 | request_status = submitted | date = [mailing date]`
- If no response in 60 days, send a single written follow-up
- A written negative finding from WF Historical Services is itself valuable evidence — it formally closes the financial-document pathway and allows the investigation to redirect to AHES and NARA

***
## TSK-005 — AGES / RAN Request: Bacobampo Expediente 411.123/2174
**Objective:** Obtain the full *expediente* from the Archivo General Agrario (AGES) Ramo Ejido-Dotaciones documenting the Terminel family's loss of 453 hectares in Bacobampo, Etchojoa, March 1938.[^1]

**Why this is the single highest-value document in the case:** The expediente was verified as real by a peer-reviewed University of Arizona dissertation that cites the archival source directly. It therefore has the highest probability of any open claim of producing a primary-source document confirming land ownership by the Terminel family.[^4]
### Contact Information — RAN / AGES
**Registro Agrario Nacional (RAN) — National Archive**
Dirección General de Archivo y Documentación
Carretera Picacho-Ajusco No. 57
Col. Jardines en la Montaña
Alcaldía Tlalpan, Ciudad de México, C.P. 14210

**Email for public inquiries:** `reporte_rantel@ran.gob.mx`
**Web:** [gob.mx/ran](https://www.gob.mx/ran)

*Note: The RAN holds the national-level AGES collections. For Sonoran ejido expedientes, requests go to the RAN central archive or the Sonora state delegation of the RAN.*

**RAN Sonora State Delegation (Delegación Estatal Sonora)**
Blvd. Rodolfo Elías Calles No. 2764
Col. Villa Satélite, Hermosillo, Sonora, C.P. 83200
### Model Request Letter — AGES/RAN (Spanish)
```
[Fecha]

Dirección General de Archivo y Documentación
Registro Agrario Nacional
Carretera Picacho-Ajusco No. 57
Col. Jardines en la Montaña, Tlalpan
Ciudad de México, C.P. 14210

Estimado/a Director/a de Archivo:

Por medio de la presente, solicito respetuosamente una copia íntegra del expediente agrario
identificado con el número 411.123/2174 del Ramo Ejido-Dotaciones, correspondiente al
municipio de Etchojoa, Sonora, en relación con tierras ubicadas en la localidad de Bacobampo,
con fecha aproximada de resolución de marzo de 1938.

Dicho expediente ha sido citado en investigación académica como fuente primaria relativa a la
dotación de tierras agrarias en la mencionada localidad. La consulta tiene fines de investigación
histórica y genealógica, específicamente en relación con la familia Terminel, propietaria privada
identificada en documentación académica como titular anterior de las 453 hectáreas objeto de
dicho expediente.

Solicito:
1. Copia íntegra del expediente 411.123/2174, incluyendo la resolución presidencial,
   el plano catastral, y cualquier documento de contradicción o apelación incorporado.
2. Copia de la identificación de los propietarios privados afectados, si obra en el expediente.
3. Confirmación de si existen expedientes relacionados para el municipio de San Javier, Sonora,
   respecto a la misma familia o a dotaciones de ejido en dicho municipio.

Adjunto copia de mi identificación oficial y estoy disponible para proporcionar cualquier
información adicional que se requiera.

Agradezco de antemano su atención y quedo a su disposición.

Atentamente,

[Nombre del solicitante]
[Domicilio]
[Correo electrónico / Teléfono]
```
### Expected Timeline
- Written responses typically take 30–60 business days
- The INAI (Instituto Nacional de Transparencia) transparency portal can be used to escalate if no response is received within the legal term of 20 business days
- Log as `ARCH-008 | request_status = submitted` in the archive_targets table

***
## TSK-006 — SHA-256 Hash and Photograph: Gabriel's Private Title Deeds
**Objective:** Preserve the chain of custody and cryptographic integrity of the private title deeds in Gabriel T. Arce Jr.'s possession before any transcription, analysis, or sharing occurs. This is the most time-sensitive task in the queue because these are irreplaceable physical documents.[^1]

**Why SHA-256 matters:** A SHA-256 hash computed on the original digital scan creates a cryptographic fingerprint. Any subsequent alteration — even a single pixel — will produce a completely different hash. This means the hash, recorded before any external party sees the document, constitutes proof that the document has not been altered since a specific date. This is standard practice for forensic document preservation and is recognized by archivists, courts, and digital forensics practitioners.
### Step-by-Step Protocol
**Equipment needed:**
- Phone or camera with minimum 12MP resolution
- Flat surface and good natural light (avoid flash-induced glare on old paper)
- Ruler placed alongside each document for scale reference
- Laptop or desktop computer (macOS, Windows, or Linux)
- Free app: Adobe Scan or Microsoft Lens for automatic document flattening

**Step 1 — Photograph each deed**
- Place document flat on a white surface
- Photograph the front and back of every page
- Include a ruler and a card with today's date and the document description in the frame of at least the first photo of each document
- Ensure all four corners are visible, all text is sharp, all stamps/seals are readable

**Step 2 — Convert to PDF**
- Use Adobe Scan or similar to merge multi-page documents into a single PDF per deed
- Naming convention: `Deed_[LAND-ID]_[approx-year]_[brief-description].pdf`
  - Example: `Deed_LAND-004_1892_Libro45-Folio12.pdf`
  - Example: `Deed_LAND-007_ca1905_water-rights-dam-bridges.pdf`

**Step 3 — Generate SHA-256 hash**

On **macOS or Linux** (Terminal):
```bash
shasum -a 256 Deed_LAND-004_1892_Libro45-Folio12.pdf
```

On **Windows** (PowerShell):
```powershell
Get-FileHash Deed_LAND-004_1892_Libro45-Folio12.pdf -Algorithm SHA256
```

**Step 4 — Record the hash**
Create a plain-text file called `deed_hashes.txt` with entries in this format:
```
SHA256: [hash value]
File: Deed_LAND-004_1892_Libro45-Folio12.pdf
Date hashed: 2026-05-20
Hashed by: [name]
Document description: Private title deed, San Javier parcel, Francisco L. Terminel, approx. 1892, in custody of Gabriel T. Arce Jr.
Physical location of original: [city, state]
```

**Step 5 — Store in three separate locations**
- Upload to personal secure cloud (iCloud, Google Drive — private, not shared)
- Send one copy by encrypted email to a trusted attorney
- Keep one copy on an encrypted external drive

**Step 6 — Enter in TE360**
- Update evidence rows **EV-0011** (LAND-002) and **EV-0012** (LAND-003)
- Add `sha256` field value and `scan_date`
- Update `review_status` from `triaged` to `photographed_pending_authentication`
- Upgrade authenticity_score from 5 to 7 pending external notarization

***
## LAND-004/005 — AHES Requests: Libro 45 Folio 12 (1892) and Libro 92 Folio 37 (1907)
**Objective:** Request access to two specific notarial records at the Archivo Histórico del Estado de Sonora (AHES) that are referenced in the claims matrix as potential primary-source deed documents.[^1]
### Contact Information — AHES
**Archivo Histórico del Estado de Sonora (AHES)**
Secretaría de Gobierno del Estado de Sonora
Comonfort y Rosales s/n (Centro Histórico)
Hermosillo, Sonora, C.P. 83000

**Phone:** +52 (662) 212-0671 (Secretaría de Gobierno general line — ask for Archivo Histórico)
**Hours:** Monday–Friday, 8:00 AM – 3:00 PM (verify before traveling)

*Note: AHES does accept written requests by mail and increasingly by email. Researchers should contact the archive by phone first to confirm current protocols and whether digitized images of notarial records are available remotely.*
### What to Request
**For LAND-004 (1892 deed):**
- Collection: **Registro Público de la Propiedad, Sahuaripa notaría**
- Specific reference: **Libro 45, Folio 12** (approximate — may be in Notarías or Registro Público depending on instrument type)
- Date range: circa **1892**
- Name to search: **Francisco Terminel** (also check Terminal, Terminel L.)
- Property description: parcel in San Javier municipality

**For LAND-005 (1907 escritura):**
- Collection: **Notarías / Protocolos Notariales, Sahuaripa or Hermosillo**
- Specific reference: **Libro 92, Folio 37** (approximate)
- Date range: circa **1907**
- Name to search: **Francisco Terminel**
- Transaction type: nominal-consideration transfer (*"por la cantidad de un peso"*) — this is the suspected fraudulent-conveyance instrument relevant to Claim LEGAL-002 (Article 2163 analysis)
### Model AHES Request Letter (Spanish)
```
[Fecha]

Director/a
Archivo Histórico del Estado de Sonora
Secretaría de Gobierno
Comonfort y Rosales s/n, Centro Histórico
Hermosillo, Sonora, C.P. 83000

Estimado/a Director/a:

Por medio de la presente me dirijo a usted con la finalidad de solicitar apoyo para localizar
y obtener copias de dos instrumentos notariales de la región de Sahuaripa, Sonora, que forman
parte de una investigación histórica y genealógica relacionada con la familia Terminel del
municipio de San Javier, Sonora.

Solicito la búsqueda de los siguientes documentos:

DOCUMENTO 1 (Claim LAND-004):
- Colección: Registro Público de la Propiedad / Notarías, Sahuaripa
- Referencia aproximada: Libro 45, Folio 12
- Fecha aproximada: año 1892
- Nombre a buscar: Francisco Terminel (también Francisco Terminal, F.L. Terminel)
- Descripción: escritura de propiedad sobre predio ubicado en San Javier, Sonora

DOCUMENTO 2 (Claim LAND-005):
- Colección: Protocolos Notariales, Sahuaripa o Hermosillo
- Referencia aproximada: Libro 92, Folio 37
- Fecha aproximada: año 1907
- Nombre a buscar: Francisco Terminel
- Descripción: escritura con contraprestación de "un peso" — posible transmisión nominal

De encontrarse los documentos, solicito respetuosamente:
1. Copia certificada de cada instrumento, incluyendo carátula, cuerpo y firma del notario
2. Indicación del número de notaría y nombre del notario actuante
3. Cualquier referencia cruzada a otros instrumentos de la misma parte en el mismo período

Adjunto copia de mi identificación oficial. Quedo a disposición para proporcionar cualquier
dato adicional o para coordinar una visita de consulta en la sala de investigadores.

Atentamente,

[Nombre]
[Domicilio / Correo electrónico / Teléfono]
```
### Evidentiary Value of a Positive Result
| Document | If Found Confirms | TE360 Claim Upgraded | Legal Relevance |
|---|---|---|---|
| Libro 45 Folio 12 (1892) | Francisco Terminel held formal title in San Javier before Revolution | LAND-004: ORANGE → GREEN | Establishes baseline ownership; supports Article 28 UNDRIP dispossession claim |
| Libro 92 Folio 37 (1907) | Nominal-consideration transfer ("one peso") executed | LAND-005: ORANGE → GREEN | Activates Article 2163 fraudulent conveyance analysis (LEGAL-002) |

***
## Consolidated Execution Timeline
| Task | Action | Channel | Cost | Expected Response |
|---|---|---|---|---|
| TSK-001 | Browse FamilySearch cat. 704679 (civil reg.) | Online — today | Free | Immediate (self-service browse) |
| TSK-002 | Browse FamilySearch cat. 704681 (parish) | Online — today | Free | Immediate (self-service browse) |
| TSK-006 | Photograph + SHA-256 hash Gabriel's deeds | Phone + computer | Free | Complete same day |
| TSK-004 | Mail WF Historical Services inquiry | Physical mail, USPS | ~$3 postage | 6–12 weeks |
| LAND-004 | AHES request Libro 45 Folio 12 | Mail or email to AHES | Free–nominal | 30–60 business days |
| LAND-005 | AHES request Libro 92 Folio 37 | Mail or email to AHES | Free–nominal | 30–60 business days |
| TSK-005 | RAN/AGES request expediente 411.123/2174 | Mail to RAN CDMX or email | Free | 20–60 business days |

***
## Note on AHES vs. AGES Terminology
These are two separate institutions that researchers frequently conflate:

- **AHES** = *Archivo Histórico del Estado de Sonora* — holds notarial, judicial, and civil records of the state of Sonora. Located in Hermosillo. Relevant for: notarías, Registro Público de la Propiedad, civil records, Fondo Judicial.[^5]
- **AGES** = *Archivo General Agrario* (now technically held by **RAN** — Registro Agrario Nacional) — holds post-Revolutionary agrarian reform records including ejido *dotaciones*, *restituciones*, and *ampliaciones*. Located in Mexico City (national level) and in state delegations. Relevant for: Bacobampo expediente 411.123/2174.[^1]

Both must be contacted independently. A single letter to either will not reach the other.

***

*All actions above should be logged in the TE360 archive_targets table (TE360_archive_targets.csv) with request_status updated from `not_submitted` to `submitted` upon mailing/emailing, and to `response_received` upon receipt of any reply.*

---

## References

1. [TE360_claims.csv](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/47668124/760abfb5-6d26-441f-b616-ae03252f2357/TE360_claims.csv?AWSAccessKeyId=ASIA2F3EMEYE7XIVYSX4&Signature=j8fbWKGbTj%2Fy4rod5hhgNUDPpPU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjECIaCXVzLWVhc3QtMSJHMEUCIEQfHVUbdEadnIlG5CBEJ4iCbjp0AwTaorJKnxgdljOeAiEAlrBYKPGjdwLJw0ztlf%2Bjx8ZnUduuqNKf1nkPpO7KceIq%2FAQI6v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDFVe1if9GcFtM0fB3SrQBC%2FDlSAYCbq9zrQDRHAS9m0V3GlZGLJnfQjwOearLy3WRTdHy%2FNIMvCGrVdpZe4buZcsJj6LCTZ7Q73PUypAC5s8LNWe0HOTOT7x%2Fb%2FeFELYRKhuZKtLLaA%2BwF8yZBaQvOPQWlRgXB5nkpOhtTaZkQZwVxBojkk0P9ltDr5fxQHG7hfB8CNFordrzWqNTZTzwvmLLTXxlO73vOptI6kiwJROdZSJI1bcNAHEvCEa8MAwBzbyObQeZvsmYOpgVOXeH8kuNQMNyXRQChaDXx52kENW8oYJvDlbwqaqucVuRTe5MhU6Ous4Wu0z1qts7zft%2B6Wo0Fk9ALmkVuW%2FnbelQ%2FjFotKdQtWE%2B6oYiR6VrOLxMaIbqe4qZBklM2zwoY41yMV2gt3hKVdsvS4SUPO2jPU0yjmIkPXqAwaLManLUtMmCyO7NpOxU%2Fonkj%2BRni%2FjwZyuM4R%2FBDQSCUHXx%2B%2BjsENSQHO3bRqGQnn4zq90t0Cug7nJ%2FCBTM6flieDeMXs0MXpQ01VktfQqzafOtKL03e5N5Wy3H93cAG%2B9JYDqqVbxDDKwz50RdF7f3VclGvKNuWWkWWIBz%2F%2F%2B%2BXMCxhSt0vxn6gD1FVarfjr297TNzGbHPmw2ajspT5WOYmju8lQOuCRB5d%2BSr5fpJNLoXYzhhkiFF4RZw8YyWfG82xq3O6KirQYrX1CrJahtekvLcquwBazJv7FvR3Tx0HflYdVXFTRGeaYN8sfUnbKZusFTY7eT5f%2BRy%2BJ5qFLovd%2BiXaO8khMs5B78JnKWhsoQu2E6uegwofq10AY6mAEtcH3C%2BItZNX%2BGhuzTQN7XUpgLhlSU%2B3eGXzr%2BntXCuDrRfBp0MjD5ffIvR647RCQqig3bd09iH4KzzE11KUjVyuQ2UQL%2FKvwZFGLYr95m61Onss3nstHGQCO7%2FBj1MywPkPS1k8NdDrXn7QJWbBE2xkizszVRHs1p%2B9c0angZSCW7LFeO6hrAC4yDI8SmG8wsAZlXUFRLiA%3D%3D&Expires=1779272436) - claim_id,claim_text,date_range,status,confidence_score,link_type,burden_of_proof,risk_score,contamin...

2. [Terminel-Sagasta-and-Wells-Fargo-Research-Directive-1.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/47668124/050531d4-98b4-4f41-897f-c5be04e52e77/Terminel-Sagasta-and-Wells-Fargo-Research-Directive-1.pdf?AWSAccessKeyId=ASIA2F3EMEYE7XIVYSX4&Signature=sMGDROyHA8HTJUoHpPOI0%2BG%2B5ho%3D&x-amz-security-token=IQoJb3JpZ2luX2VjECIaCXVzLWVhc3QtMSJHMEUCIEQfHVUbdEadnIlG5CBEJ4iCbjp0AwTaorJKnxgdljOeAiEAlrBYKPGjdwLJw0ztlf%2Bjx8ZnUduuqNKf1nkPpO7KceIq%2FAQI6v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDFVe1if9GcFtM0fB3SrQBC%2FDlSAYCbq9zrQDRHAS9m0V3GlZGLJnfQjwOearLy3WRTdHy%2FNIMvCGrVdpZe4buZcsJj6LCTZ7Q73PUypAC5s8LNWe0HOTOT7x%2Fb%2FeFELYRKhuZKtLLaA%2BwF8yZBaQvOPQWlRgXB5nkpOhtTaZkQZwVxBojkk0P9ltDr5fxQHG7hfB8CNFordrzWqNTZTzwvmLLTXxlO73vOptI6kiwJROdZSJI1bcNAHEvCEa8MAwBzbyObQeZvsmYOpgVOXeH8kuNQMNyXRQChaDXx52kENW8oYJvDlbwqaqucVuRTe5MhU6Ous4Wu0z1qts7zft%2B6Wo0Fk9ALmkVuW%2FnbelQ%2FjFotKdQtWE%2B6oYiR6VrOLxMaIbqe4qZBklM2zwoY41yMV2gt3hKVdsvS4SUPO2jPU0yjmIkPXqAwaLManLUtMmCyO7NpOxU%2Fonkj%2BRni%2FjwZyuM4R%2FBDQSCUHXx%2B%2BjsENSQHO3bRqGQnn4zq90t0Cug7nJ%2FCBTM6flieDeMXs0MXpQ01VktfQqzafOtKL03e5N5Wy3H93cAG%2B9JYDqqVbxDDKwz50RdF7f3VclGvKNuWWkWWIBz%2F%2F%2B%2BXMCxhSt0vxn6gD1FVarfjr297TNzGbHPmw2ajspT5WOYmju8lQOuCRB5d%2BSr5fpJNLoXYzhhkiFF4RZw8YyWfG82xq3O6KirQYrX1CrJahtekvLcquwBazJv7FvR3Tx0HflYdVXFTRGeaYN8sfUnbKZusFTY7eT5f%2BRy%2BJ5qFLovd%2BiXaO8khMs5B78JnKWhsoQu2E6uegwofq10AY6mAEtcH3C%2BItZNX%2BGhuzTQN7XUpgLhlSU%2B3eGXzr%2BntXCuDrRfBp0MjD5ffIvR647RCQqig3bd09iH4KzzE11KUjVyuQ2UQL%2FKvwZFGLYr95m61Onss3nstHGQCO7%2FBj1MywPkPS1k8NdDrXn7QJWbBE2xkizszVRHs1p%2B9c0angZSCW7LFeO6hrAC4yDI8SmG8wsAZlXUFRLiA%3D%3D&Expires=1779272436)

3. [Terminel-Sagasta-and-Wells-Fargo-Research-Directive-1-Copy.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/47668124/ede6860f-f626-4dc8-99f6-3b7ea3f1f820/Terminel-Sagasta-and-Wells-Fargo-Research-Directive-1-Copy.pdf?AWSAccessKeyId=ASIA2F3EMEYE7XIVYSX4&Signature=juyrgDzLHBvNWGJEnQqH3CYfknw%3D&x-amz-security-token=IQoJb3JpZ2luX2VjECIaCXVzLWVhc3QtMSJHMEUCIEQfHVUbdEadnIlG5CBEJ4iCbjp0AwTaorJKnxgdljOeAiEAlrBYKPGjdwLJw0ztlf%2Bjx8ZnUduuqNKf1nkPpO7KceIq%2FAQI6v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDFVe1if9GcFtM0fB3SrQBC%2FDlSAYCbq9zrQDRHAS9m0V3GlZGLJnfQjwOearLy3WRTdHy%2FNIMvCGrVdpZe4buZcsJj6LCTZ7Q73PUypAC5s8LNWe0HOTOT7x%2Fb%2FeFELYRKhuZKtLLaA%2BwF8yZBaQvOPQWlRgXB5nkpOhtTaZkQZwVxBojkk0P9ltDr5fxQHG7hfB8CNFordrzWqNTZTzwvmLLTXxlO73vOptI6kiwJROdZSJI1bcNAHEvCEa8MAwBzbyObQeZvsmYOpgVOXeH8kuNQMNyXRQChaDXx52kENW8oYJvDlbwqaqucVuRTe5MhU6Ous4Wu0z1qts7zft%2B6Wo0Fk9ALmkVuW%2FnbelQ%2FjFotKdQtWE%2B6oYiR6VrOLxMaIbqe4qZBklM2zwoY41yMV2gt3hKVdsvS4SUPO2jPU0yjmIkPXqAwaLManLUtMmCyO7NpOxU%2Fonkj%2BRni%2FjwZyuM4R%2FBDQSCUHXx%2B%2BjsENSQHO3bRqGQnn4zq90t0Cug7nJ%2FCBTM6flieDeMXs0MXpQ01VktfQqzafOtKL03e5N5Wy3H93cAG%2B9JYDqqVbxDDKwz50RdF7f3VclGvKNuWWkWWIBz%2F%2F%2B%2BXMCxhSt0vxn6gD1FVarfjr297TNzGbHPmw2ajspT5WOYmju8lQOuCRB5d%2BSr5fpJNLoXYzhhkiFF4RZw8YyWfG82xq3O6KirQYrX1CrJahtekvLcquwBazJv7FvR3Tx0HflYdVXFTRGeaYN8sfUnbKZusFTY7eT5f%2BRy%2BJ5qFLovd%2BiXaO8khMs5B78JnKWhsoQu2E6uegwofq10AY6mAEtcH3C%2BItZNX%2BGhuzTQN7XUpgLhlSU%2B3eGXzr%2BntXCuDrRfBp0MjD5ffIvR647RCQqig3bd09iH4KzzE11KUjVyuQ2UQL%2FKvwZFGLYr95m61Onss3nstHGQCO7%2FBj1MywPkPS1k8NdDrXn7QJWbBE2xkizszVRHs1p%2B9c0angZSCW7LFeO6hrAC4yDI8SmG8wsAZlXUFRLiA%3D%3D&Expires=1779272436)

4. [Forensic-Source-Authentication-Independent-Historical-Assessment-Terminel-Sagasta-Investigation-4.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/47668124/a847c37a-6051-4d2a-bd93-35c11b070fba/Forensic-Source-Authentication-Independent-Historical-Assessment-Terminel-Sagasta-Investigation-4.pdf?AWSAccessKeyId=ASIA2F3EMEYE7XIVYSX4&Signature=28qWu9evU9mQlTKRIwcTIBdoTUU%3D&x-amz-security-token=IQoJb3JpZ2luX2VjECIaCXVzLWVhc3QtMSJHMEUCIEQfHVUbdEadnIlG5CBEJ4iCbjp0AwTaorJKnxgdljOeAiEAlrBYKPGjdwLJw0ztlf%2Bjx8ZnUduuqNKf1nkPpO7KceIq%2FAQI6v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDFVe1if9GcFtM0fB3SrQBC%2FDlSAYCbq9zrQDRHAS9m0V3GlZGLJnfQjwOearLy3WRTdHy%2FNIMvCGrVdpZe4buZcsJj6LCTZ7Q73PUypAC5s8LNWe0HOTOT7x%2Fb%2FeFELYRKhuZKtLLaA%2BwF8yZBaQvOPQWlRgXB5nkpOhtTaZkQZwVxBojkk0P9ltDr5fxQHG7hfB8CNFordrzWqNTZTzwvmLLTXxlO73vOptI6kiwJROdZSJI1bcNAHEvCEa8MAwBzbyObQeZvsmYOpgVOXeH8kuNQMNyXRQChaDXx52kENW8oYJvDlbwqaqucVuRTe5MhU6Ous4Wu0z1qts7zft%2B6Wo0Fk9ALmkVuW%2FnbelQ%2FjFotKdQtWE%2B6oYiR6VrOLxMaIbqe4qZBklM2zwoY41yMV2gt3hKVdsvS4SUPO2jPU0yjmIkPXqAwaLManLUtMmCyO7NpOxU%2Fonkj%2BRni%2FjwZyuM4R%2FBDQSCUHXx%2B%2BjsENSQHO3bRqGQnn4zq90t0Cug7nJ%2FCBTM6flieDeMXs0MXpQ01VktfQqzafOtKL03e5N5Wy3H93cAG%2B9JYDqqVbxDDKwz50RdF7f3VclGvKNuWWkWWIBz%2F%2F%2B%2BXMCxhSt0vxn6gD1FVarfjr297TNzGbHPmw2ajspT5WOYmju8lQOuCRB5d%2BSr5fpJNLoXYzhhkiFF4RZw8YyWfG82xq3O6KirQYrX1CrJahtekvLcquwBazJv7FvR3Tx0HflYdVXFTRGeaYN8sfUnbKZusFTY7eT5f%2BRy%2BJ5qFLovd%2BiXaO8khMs5B78JnKWhsoQu2E6uegwofq10AY6mAEtcH3C%2BItZNX%2BGhuzTQN7XUpgLhlSU%2B3eGXzr%2BntXCuDrRfBp0MjD5ffIvR647RCQqig3bd09iH4KzzE11KUjVyuQ2UQL%2FKvwZFGLYr95m61Onss3nstHGQCO7%2FBj1MywPkPS1k8NdDrXn7QJWbBE2xkizszVRHs1p%2B9c0angZSCW7LFeO6hrAC4yDI8SmG8wsAZlXUFRLiA%3D%3D&Expires=1779272436)

5. [TE360_evidence.csv](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/47668124/1779ebff-d43d-4f1f-bcea-528936dd4700/TE360_evidence.csv?AWSAccessKeyId=ASIA2F3EMEYE7XIVYSX4&Signature=EJvyPE1uu5D6c4LkAStBSIw%2FXJg%3D&x-amz-security-token=IQoJb3JpZ2luX2VjECIaCXVzLWVhc3QtMSJHMEUCIEQfHVUbdEadnIlG5CBEJ4iCbjp0AwTaorJKnxgdljOeAiEAlrBYKPGjdwLJw0ztlf%2Bjx8ZnUduuqNKf1nkPpO7KceIq%2FAQI6v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw2OTk3NTMzMDk3MDUiDFVe1if9GcFtM0fB3SrQBC%2FDlSAYCbq9zrQDRHAS9m0V3GlZGLJnfQjwOearLy3WRTdHy%2FNIMvCGrVdpZe4buZcsJj6LCTZ7Q73PUypAC5s8LNWe0HOTOT7x%2Fb%2FeFELYRKhuZKtLLaA%2BwF8yZBaQvOPQWlRgXB5nkpOhtTaZkQZwVxBojkk0P9ltDr5fxQHG7hfB8CNFordrzWqNTZTzwvmLLTXxlO73vOptI6kiwJROdZSJI1bcNAHEvCEa8MAwBzbyObQeZvsmYOpgVOXeH8kuNQMNyXRQChaDXx52kENW8oYJvDlbwqaqucVuRTe5MhU6Ous4Wu0z1qts7zft%2B6Wo0Fk9ALmkVuW%2FnbelQ%2FjFotKdQtWE%2B6oYiR6VrOLxMaIbqe4qZBklM2zwoY41yMV2gt3hKVdsvS4SUPO2jPU0yjmIkPXqAwaLManLUtMmCyO7NpOxU%2Fonkj%2BRni%2FjwZyuM4R%2FBDQSCUHXx%2B%2BjsENSQHO3bRqGQnn4zq90t0Cug7nJ%2FCBTM6flieDeMXs0MXpQ01VktfQqzafOtKL03e5N5Wy3H93cAG%2B9JYDqqVbxDDKwz50RdF7f3VclGvKNuWWkWWIBz%2F%2F%2B%2BXMCxhSt0vxn6gD1FVarfjr297TNzGbHPmw2ajspT5WOYmju8lQOuCRB5d%2BSr5fpJNLoXYzhhkiFF4RZw8YyWfG82xq3O6KirQYrX1CrJahtekvLcquwBazJv7FvR3Tx0HflYdVXFTRGeaYN8sfUnbKZusFTY7eT5f%2BRy%2BJ5qFLovd%2BiXaO8khMs5B78JnKWhsoQu2E6uegwofq10AY6mAEtcH3C%2BItZNX%2BGhuzTQN7XUpgLhlSU%2B3eGXzr%2BntXCuDrRfBp0MjD5ffIvR647RCQqig3bd09iH4KzzE11KUjVyuQ2UQL%2FKvwZFGLYr95m61Onss3nstHGQCO7%2FBj1MywPkPS1k8NdDrXn7QJWbBE2xkizszVRHs1p%2B9c0angZSCW7LFeO6hrAC4yDI8SmG8wsAZlXUFRLiA%3D%3D&Expires=1779272436) - evidence_id,linked_claim_id,source_name,source_system,storage_uri,provenance_score,authenticity_scor...

