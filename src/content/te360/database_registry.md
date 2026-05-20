# Database Registry
## Comprehensive catalog of archival, newspaper, banking, immigration, diplomatic, and mining databases relevant to TE360

Every row is classified by **access pattern** so you know which can become an automated crawler vs. which stay on the paper trail. Pipe relevance is shown where one source obviously anchors a specific TE360 pipe; sources without a marked pipe are general context.

**Access legend:**

| Symbol | Meaning |
|---|---|
| ✅ | Open API — programmable access, no auth required. Crawler-ready. |
| 🔓 | Open browse — public HTML, can be scraped. Fragile but possible. |
| ⚠️ | Scrape-only with friction — bot-walls, rate limits, or auth-walled to bots. |
| 🔒 | Auth-walled — requires institutional login or developer agreement. |
| 💰 | Paid subscription required. |

---

## 1. Newspapers

| Database | Coverage | Access | Pipe |
|---|---|---|---|
| [Chronicling America](https://chroniclingamerica.loc.gov) | US newspapers, ~pre-1963 | ✅ Already wired (`ingestChroniclingAmerica`) | WF / POL / TRADE |
| [Newspapers.com](https://www.newspapers.com) | Massive US archive | 💰 Subscription | WF / POL |
| [Hemeroteca Nacional Digital de México (HNDM)](https://hndm.iib.unam.mx) | Mexico newspapers (UNAM) | ⚠️ Browse-only, paywall on full text | POL / GEN / LAND |
| [California Digital Newspaper Collection](https://cdnc.ucr.edu) | California/borderland press | 🔓 Open browse | GEN (Nela's Ontario CA arc) |
| [Portal de Revistas UNAM](https://www.revistas.unam.mx) | Scholarly journals | 🔓 Open browse + per-journal OAI-PMH | LEGAL / IND |

## 2. Sonora / Yaqui / Borderlands Regional

| Database | Focus | Access | Pipe |
|---|---|---|---|
| [Arizona Memory Project](https://azmemory.azlibrary.gov) | Sonora/Yaqui regional records | 🔓 Open browse | IND / GEN |
| [University of Arizona Special Collections](https://speccoll.library.arizona.edu) | Borderlands manuscript collections | 🔓 Browse + finding aids | IND / LAND / WF |
| [Benson Latin American Collection (UT-Austin)](https://www.lib.utexas.edu/about/locations/benson) | Sonora archives, Mexico-MS | 🔓 Open browse, ArchivesSpace finding aids | LEGAL / POL / GEN |
| [Smithsonian Indigenous Studies](https://americanindian.si.edu) | Indigenous records | 🔓 Open browse | IND |
| [WorldCat](https://www.worldcat.org) | Rare dissertations / books — global library catalog | ✅ Has search API (registered) | AUDIT / general |
| [ProQuest Dissertations](https://www.proquest.com/products-services/dissertations/) | Academic theses (incl. U Arizona BANCO source) | 💰 Subscription via library | LEGAL / LAND |

## 3. Banking / Economic History

| Database | Focus | Access | Pipe |
|---|---|---|---|
| [Banco de México Historical Archive](https://www.banxico.org.mx) | Mexican banking/economic history | ✅ Public open-data API for series; document archive browse-only | WF / LEGAL |
| [Harvard Latin American Pamphlet Collection](https://library.harvard.edu/collections/latin-american-pamphlets) | Porfirian-era political pamphlets | 🔓 Open browse, HOLLIS catalog | POL / LEGAL |
| [JSTOR Mexico Economic History](https://www.jstor.org) | Academic banking studies | 💰 Subscription (open via JSTOR's free tier for some) | LEGAL / WF |
| [Cornell Historical Banking Collections](https://digital.library.cornell.edu) | US banking history | 🔓 Open browse + OAI-PMH | WF |
| [HathiTrust Economic History](https://www.hathitrust.org) | Rare banking texts | ✅ HathiTrust APIs (Bibliographic + Data) for partner libraries; public-domain books browse-free | WF / LEGAL |
| [FRED Precious Metals](https://fred.stlouisfed.org) | Silver/gold economic series | ✅ St. Louis Fed FRED API — clean REST, no auth | MIN / WF |

## 4. Mexican National / UNAM Repositories

| Database | Role | Access | Pipe |
|---|---|---|---|
| [Biblioteca Nacional de México (BNM)](https://bnm.iib.unam.mx) | National library | 🔓 Open browse | General |
| [Hemeroteca Nacional Digital de México (HNDM)](https://hndm.iib.unam.mx) | Historic newspapers | ⚠️ Browse + paywalled full text | POL / GEN |
| [Archivo General de la Nación (AGN)](https://www.gob.mx/agn) | National archives (Mexico) | ⚠️ Browse-only, finding aids, written requests for restricted | LEGAL / POL |
| [Memórica México](https://memoricamexico.gob.mx) | Digitized historical collections | 🔓 Open browse | General |
| [INAH Mediateca](https://mediateca.inah.gob.mx) | Archaeological / historical media | 🔓 Open browse | IND |
| [Biblioteca Cervantes Virtual](https://www.cervantesvirtual.com) | Hispanic literature / history | 🔓 Open browse | General |
| [Banco de México Historical Archive](https://www.banxico.org.mx) | Banking series + document archive | ✅ Open-data API for series | WF / LEGAL |

## 5. Immigration / Migration

| Database | Coverage | Access | Pipe |
|---|---|---|---|
| [AGN Migración Collections](https://www.gob.mx/agn) | Mexico immigration files | ⚠️ Browse + written requests | GEN |
| [SRE Historical Archives](https://portales.sre.gob.mx/acervo/) | Mexico foreign affairs | ⚠️ Browse-only | LEGAL / POL |
| [Instituto Nacional de Migración](https://www.inm.gob.mx) | Mexican migration systems | ⚠️ Browse-only | GEN |
| [Ellis Island Archives](https://www.statueofliberty.org/discover/passenger-ship-search/) | US immigration manifests | 🔓 Open search | GEN (Nela 1952 LA arrival) |
| [USCIS Genealogy](https://www.uscis.gov/history-and-genealogy/genealogy) | US naturalization | 🔒 Records request, fee per file | GEN |
| [NARA Immigration Records](https://www.archives.gov/research/immigration) | US border crossing | 🔓 Catalog browse; some NARA APIs | GEN / LEGAL |
| [Castle Garden](https://www.castlegarden.org) | Pre-Ellis immigration (1820–1892) | 🔓 Open search | GEN |
| [Ancestry Immigration](https://www.ancestry.com) | Paid but massive | 💰 Subscription | GEN |
| [Fold3](https://www.fold3.com) | Military + immigration | 💰 Subscription | GEN / POL |

## 6. Mining / Bullion / Commodity

| Database | Focus | Access | Pipe |
|---|---|---|---|
| [London Bullion Market Association](https://www.lbma.org.uk) | Historic bullion pricing | 🔓 Open browse + downloadable CSV | MIN / WF |
| [Macrotrends Silver Prices](https://www.macrotrends.net/1470/historical-silver-prices-100-year-chart) | Long-term silver data | 🔓 Open browse | MIN / WF |
| [USGS Mineral Resources](https://www.usgs.gov/centers/national-minerals-information-center) | Mining output (US + global) | ✅ USGS Mineral Resources Data System REST API | MIN |
| [Mining Data Online](https://miningdataonline.com) | Mine ownership/history | 💰 Mostly paid, partial free | MIN |
| [FRED Precious Metals](https://fred.stlouisfed.org) | Silver/gold economic series | ✅ FRED API | MIN / WF |
| [Banco de México Historical Indicators](https://www.banxico.org.mx) | Peso/silver relationships | ✅ Banxico open-data API | MIN / WF |
| [Instituto de Geología UNAM](https://www.geologia.unam.mx) | Mexican mining archives | 🔓 Browse | MIN |
| [Servicio Geológico Mexicano (SGM)](https://www.sgm.gob.mx) | SGM 2006 Porchas concession source | 🔓 Browse + InfoMineral portal | MIN (anchors `MIN-002`) |

## 7. US Diplomatic / State Department

| Archive | Coverage | Access | Pipe |
|---|---|---|---|
| [Consular Reports (19th–20th c.)](https://babel.hathitrust.org) | Mining, violence, trade | 🔓 HathiTrust browse + APIs | WF / POL / IND |
| [NARA RG 59](https://www.archives.gov/research/guide-fed-records/groups/059.html) | State Department general records | 🔓 NARA catalog; some open APIs | LEGAL / POL |
| [NARA RG 84](https://www.archives.gov/research/guide-fed-records/groups/084.html) | Foreign Service posts (Hermosillo 11 cu.ft., Nogales 42 cu.ft.) | 🔓 NARA catalog | WF / POL (Hermosillo target) |
| [University of Texas Benson Collection](https://www.lib.utexas.edu/about/locations/benson) | Mexico archival material | 🔓 Open browse, ArchivesSpace | LEGAL / POL |
| [Texas State Historical Association](https://www.tshaonline.org) | Borderland archives | 🔓 Open browse | POL / LAND |

## 8. US Diplomatic — Historical Documents Series

| Database | Focus | Access | Pipe |
|---|---|---|---|
| [U.S. State Department Office of the Historian](https://history.state.gov/historicaldocuments) | Diplomatic correspondence series | 🔓 Open browse + HTML download | POL / LEGAL |
| [Foreign Relations of the United States (FRUS)](https://history.state.gov/historicaldocuments) | Embassy cables, regime analysis | 🔓 Open browse + bulk XML | POL / LEGAL |
| [National Archives Diplomatic Records](https://www.archives.gov/research/foreign-policy) | Embassy/consular reports | 🔓 NARA catalog | WF / POL |
| [LoC Hispanic Reading Room](https://guides.loc.gov/hispanic-reading-room) | Mexico diplomatic collections | 🔓 LoC browse + research guides | POL / LEGAL |
| [World Digital Library](https://www.loc.gov/collections/world-digital-library/about-this-collection/) | Historical Latin America | ✅ Now hosted at LoC — same LoC API as Chronicling America | General |
| [HathiTrust](https://www.hathitrust.org) | Digitized diplomatic books | ✅ HathiTrust APIs | POL / LEGAL |
| [Internet Archive](https://archive.org) | Rare regime-era texts | ✅ IA Items API + S3-compatible — public-domain books fully programmable | POL / LEGAL / WF |

---

## Crawler-readiness summary

| Class | Count | What's tractable |
|---|---|---|
| ✅ Open API | ~12 | Real candidates for scheduled functions. **Top 3**: FRED (silver/gold series), HathiTrust (digitized banking + diplomatic books), Internet Archive (regime-era rare texts). All have stable APIs and no auth. |
| 🔓 Open browse / OAI-PMH | ~20 | Possible scrapers; fragile. Realistically used as targeted human-driven searches with manual save into TE360. |
| ⚠️ Scrape-only with friction | ~6 | Mexican national archives (AGN, SRE, INM, HNDM). Stay on the paper trail. |
| 🔒 Auth-walled | ~2 | USCIS Genealogy (fee per file), FamilySearch (developer agreement). |
| 💰 Paid | ~5 | Newspapers.com, ProQuest, JSTOR, Ancestry, Fold3. Not crawler candidates; relevant only if you have an institutional subscription. |

## Recommended next-build shortlist

If you want **two more crawlers** (beyond the existing `ingestChroniclingAmerica`), the highest-yield additions from this catalog are:

1. **FRED precious-metals series** — historical silver/gold pricing API. Drops daily data into a new `EconomicSeries` entity, anchors WF / MIN pipe quantitative context.
2. **Internet Archive items search** — keyword-polled (`"Terminel" "Sonora" "Wells Fargo"`) writes PDF and metadata into existing Evidence flow. Same shape as Chronicling America — minimal new code.

Or **two scheduled metric pulls** on the Metrics Lane:

1. **Banxico** historical peso / silver series — joins the WF pipe context.
2. **LBMA bullion prices** CSV — daily silver-fix series for the 1907 deed valuation math.

---

*This registry is a Document Lane artifact — a catalog of candidate sources, not evidence. Anything pulled from these databases enters TE360 via the usual provenance gates.*
