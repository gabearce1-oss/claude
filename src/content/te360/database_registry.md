# Database Registry
## Comprehensive catalog of archival, newspaper, banking, immigration, diplomatic, and mining databases relevant to TE360

## STRATEGIC INTELLIGENCE LAYERS

Five organizing layers cut across the 90+ databases below. Each one is composed of specific rows from the catalog and maps to one or more TE360 pipes. Use the layers to decide what to crawl, what to letter-write, and what to merge into the relationship graph; use the categorized tables below as the raw inventory.

### Layer 1 — Diplomatic Intelligence

**Sources:** FRUS · US State Department Office of the Historian · NARA RG 59 + RG 84 (Hermosillo / Nogales consular posts) · LoC Hispanic Reading Room · World Digital Library · National Archives Diplomatic Records · SRE Historical Archives · LoC Digital Collections.

**Pipes anchored:** POL · LEGAL · WF (indirectly via consular bullion / mining reports).

**Why it's a layer, not a row:** the consular cable chain is the *only* contemporaneous outside-state observer of the Sonora regime during 1895–1935. A telegram from the Hermosillo consul about silver shipments or Yaqui deportations independently corroborates (or refutes) the Mexican government record. NARA RG 84 Hermosillo is 11 cu.ft. + Nogales 42 cu.ft. — the largest single addressable source for this layer.

### Layer 2 — Bullion Economics

**Sources:** Banxico SIE API · FRED Precious Metals · LBMA bullion prices · USGS Mineral Resources · SGM (Servicio Geológico Mexicano) · Macrotrends · Cornell Historical Banking · HathiTrust banking texts · IFDP-599 Robitaille (already committed) · Gerber & Passananti 2015 (already committed).

**Pipes anchored:** WF · MIN · LEGAL.

**Why it's a layer:** the 1907 deed-valuation math on the Family Genealogy Generational Displacement calculator depends on a real silver-price series joined to a real peso/gold series joined to the contemporaneous Mexican banking regime. None of those three lives in a single database; together they make Aviana's $3,000 → 2026 calculation defensible.

### Layer 3 — Historical Newspaper

**Sources:** Chronicling America (already wired) · Hemeroteca Nacional Digital de México (HNDM) · California Digital Newspaper Collection · Newspapers.com (paid) · Internet Archive newspaper holdings · LoC Digital Collections.

**Pipes anchored:** WF · POL · LAND · TRADE · IND.

**Why it's a layer:** local newspapers preserved details the federal archives lost or never recorded. The 1912 Wells Fargo complaint, the desafuero coverage, the Bacobampo expropriation reportage, the Yaqui deportation campaign accounts — all of these surface first in newsprint. Local press is *the* compensating channel when the official archive has been culled.

### Layer 4 — Transnational Identity

**Sources:** FamilySearch Mexico parish/civil collections · USCIS Genealogy · NARA Immigration · Ellis Island + Castle Garden · Mexican Catholic Parish archives · AGN Migración · INM · CBP Stats · Selective Service · National Personnel Records Center · UCI Berkeley Bancroft · Smithsonian Indigenous Studies · INAH Fototecas.

**Pipes anchored:** GEN · IND · POL.

**Why it's a layer:** Aviana's daughter Nela was born in San Javier (1910) and died in Ontario CA (2012). That arc crosses parish baptism → civil registration → border-crossing record → US naturalization → death certificate → family knowledge keeper. The *graph* connecting those nodes is the case — no single archive holds it. Merging them is the work.

### Layer 5 — Regime Infrastructure

**Sources:** Banxico Historical Archive · CNBV · INEGI · Registro Agrario Nacional (RAN) · Registro Público de Comercio · INE · SAT · SEC EDGAR · OpenSecrets · AGN PARES · NARA RG 84 mining files · Mining Data Online · USGS · IFDP-599.

**Pipes anchored:** LEGAL · LAND · MIN · WF.

**Why it's a layer:** Porfirian Mexico ran on the railroad–bank–customs–mining-firm–land-registry quintet. Each of those institutions has its own archive. Tied together chronologically (1876 Porfirio → 1888 Bleichroeder loan → 1894 baldíos law → 1897 Limantour banking law → 1907 Panic → 1910 Revolution → 1917 Constitution → 1935 desafuero → 1938 Bacobampo expropriation) they produce the structural-extraction account that the TE360 case rests on.

---

## Raw catalog

Below: 16 categorized tables, 90+ databases. Every row is classified by **access pattern** so you know which can become an automated crawler vs. which stay on the paper trail. Pipe relevance is shown where one source obviously anchors a specific TE360 pipe; sources without a marked pipe are general context.

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

## 9. Geospatial / GIS

| Database | Focus | Access | Pipe |
|---|---|---|---|
| [USGS Earth Explorer](https://earthexplorer.usgs.gov) | Satellite + historical imagery | ✅ M2M API (account required) | GEO / LAND |
| [NOAA Climate Data Online](https://www.ncei.noaa.gov/access/search-service-api-user-documentation) | Environmental history | ✅ Search Service API | GEO |
| [OpenStreetMap API](https://wiki.openstreetmap.org/wiki/API) | Open mapping | ✅ Overpass + Nominatim APIs | GEO |
| [ArcGIS Open Data](https://hub.arcgis.com/search) | Public GIS datasets | ✅ ArcGIS REST + OGC API | GEO |
| [INEGI Geospatial Services](https://www.inegi.org.mx/servicios/api_indicadores.html) | Mexican GIS | ✅ Public API | GEO / LAND |
| [SIAP Mexico](https://www.gob.mx/siap) | Agricultural mapping | 🔓 Open browse + dataset downloads | LAND |

## 10. Financial / Securities APIs

| Database | Use | Access | Pipe |
|---|---|---|---|
| [FRED API](https://fred.stlouisfed.org/docs/api/fred/) | Economic indicators | ✅ Free API key | WF / MIN |
| [NASDAQ Data Link](https://data.nasdaq.com) | Financial datasets | ⚠️ Free tier + paid premium series | WF |
| [OpenFIGI](https://www.openfigi.com/api) | Securities mapping | ✅ Free API | LEGAL |
| [SEC EDGAR API](https://www.sec.gov/edgar/sec-api-documentation) | Corporate filings | ✅ Free, rate-limited | WF / LEGAL |
| [FINRA API Center](https://developer.finra.org) | Broker/dealer data | 🔒 Registration required | WF |
| [CFPB Consumer Complaint DB](https://www.consumerfinance.gov/data-research/consumer-complaints/) | Consumer financial data | ✅ Open API | General |

## 11. Latin American Scholarly Repositories

| Database | Focus | Access | Pipe |
|---|---|---|---|
| [SciELO](https://scielo.org) | LatAm scholarship | ✅ articlemeta.scielo.org REST + OAI-PMH | LEGAL / POL / IND |
| [Redalyc](https://www.redalyc.org) | Mexican/LatAm journals | 🔓 OAI-PMH | LEGAL / IND |
| [Dialnet](https://dialnet.unirioja.es) | Spanish-language scholarship | 🔓 Open browse + REST search | LEGAL / IND |
| [CLACSO Biblioteca](https://www.clacso.org.ar/biblioteca) | LatAm social sciences | 🔓 OAI-PMH | IND / POL |
| [Repositorio UNAM](https://ru.dgb.unam.mx) | UNAM institutional archive | 🔓 OAI-PMH | LEGAL / GEN |
| [Repositorio Colegio de México](https://repositorio.colmex.mx) | Mexican historical/social research | 🔓 OAI-PMH | LEGAL / POL |

## 12. General Scholarly APIs

| Database | Specialty | Access | Pipe |
|---|---|---|---|
| [Google Scholar](https://scholar.google.com) | General scholarship | ⚠️ No official API; scraping blocked | General |
| [Semantic Scholar](https://www.semanticscholar.org/product/api) | AI-enhanced research | ✅ Free API key | General / IND |
| [Crossref API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) | DOI metadata | ✅ Open, polite-rate | General |
| [OpenAlex](https://openalex.org) | Massive scholarly graph (200M+ works) | ✅ Open API, no auth | General — **strongest single replacement for Google Scholar** |
| [CORE](https://core.ac.uk/services/api) | Open-access papers | ✅ Free API key | General |
| [DOAJ](https://doaj.org/api/v2/docs) | Open-access journals | ✅ Open API | General |
| [ERIC](https://eric.ed.gov) | Education research | ✅ Open API | General |
| [PubMed API / E-Utils](https://pubmed.ncbi.nlm.nih.gov/help/) | Medical research | ✅ Open API (Europe PMC also a clean alt) | IND (genetic / haplogroup B2) |
| [SSRN](https://www.ssrn.com) | Social sciences/legal | 🔓 Browse, no API | LEGAL |
| [JSTOR Open Content](https://about.jstor.org/oa-and-free/) | Humanities/history | 🔓 Open browse | LEGAL / POL |

## 13. Mexico Archives — Additional Specialized

| Database | Focus | Access | Pipe |
|---|---|---|---|
| [Archivo Histórico de Sonora (AHES)](https://isc.sonora.edu.mx/ahes.html) | Sonora notarial/judicial — **primary TE360 target** | ⚠️ Browse + written requests | LEGAL / LAND |
| [FamilySearch Mexico Collections](https://www.familysearch.org/search/collection/location/1927054) | Parish/civil records | 🔒 Developer agreement for API | GEN / IND |
| [Mexican Catholic Parish Archives (FS catalog)](https://www.familysearch.org/search/catalog) | Baptism/marriage/death — **catalogs 704679 / 704681 already in TE360** | 🔒 Same | GEN / IND |
| [HNDM](https://hndm.iib.unam.mx) | Historic newspapers | ⚠️ Browse + paywalled full text | POL / GEN |
| [Colecciones UNAM — Datos Abiertos](https://datosabiertos.unam.mx) | Scholarly/open data | ✅ Some open datasets | General |
| [Archivo General Agrario / RAN](https://www.gob.mx/ran) | Ejido/land redistribution — **anchors `LAND-001` Bacobampo 411.123/2174** | ⚠️ Browse + written requests | LAND |
| [Sistema Nacional de Fototecas INAH](https://fototeca.inah.gob.mx) | Historic photography | 🔓 Open browse | IND / GEN |
| [Mapoteca Manuel Orozco y Berra](https://mapoteca.siap.gob.mx) | Historic land maps | 🔓 Open browse | GEO / LAND |

## 14. Mexico Open-Data APIs

| Database | Type | Access | Pipe |
|---|---|---|---|
| [Datos Abiertos México](https://datos.gob.mx) | Master open-data portal | ✅ CKAN API | General |
| [INEGI](https://www.inegi.org.mx/app/api/denue/v1/) | Census/economic/geospatial | ✅ Public API | GEO / GEN |
| [Banco de México API](https://www.banxico.org.mx/SieAPIRest/service/v1/) | Financial/economic series (SIE API) | ✅ Free token, REST | WF / MIN / LEGAL |
| [Registro Agrario Nacional (RAN)](https://www.gob.mx/ran) | Agrarian/ejido land records | ⚠️ Partial open | LAND |
| [PARES / AGN México](https://www.gob.mx/agn) | National archive | 🔓 Open browse | LEGAL / POL |
| [INFOMEX / Plataforma Nacional de Transparencia](https://www.plataformadetransparencia.org.mx) | FOIA/transparency | 🔓 Open browse | POL / LEGAL |
| [INE (Instituto Nacional Electoral)](https://www.ine.mx/datos-abiertos/) | Electoral/public datasets | ✅ Open API | POL |
| [SAT Datos Abiertos](https://www.sat.gob.mx/aplicacion/79615/datos-abiertos) | Tax/customs/business | ✅ Open API | LEGAL |
| [Registro Público de Comercio (SIGER 2)](https://rpc.economia.gob.mx/siger2-web/publico) | Corporate registry | ⚠️ Partial open | LEGAL |
| [CNBV Datos Abiertos](https://portafolioinfo.cnbv.gob.mx/Paginas/Inicio.aspx) | Banking/financial regulation | ✅ Open datasets | WF / LEGAL |

## 15. US Military / Immigration / Security

| Database | Focus | Access | Pipe |
|---|---|---|---|
| [National Personnel Records Center](https://www.archives.gov/personnel-records-center) | Military service records | 🔒 Records request, fee | POL / GEN |
| [VA Open Data Portal](https://www.data.va.gov) | Veteran data | ✅ Open API | General |
| [Defense Technical Information Center (DTIC)](https://discover.dtic.mil) | Pentagon research | 🔓 Open browse | General |
| [Selective Service Data](https://www.sss.gov/open-government/) | Draft records | 🔓 Open browse | POL / GEN |
| [USCIS Genealogy Program](https://www.uscis.gov/history-and-genealogy/genealogy) | Immigration records | 🔒 Records request, fee | GEN |
| [CBP Stats and Data](https://www.cbp.gov/newsroom/stats) | Border statistics | ✅ Open data | GEN |
| [ICE FOIA Library](https://www.ice.gov/foia/library) | Deportation/immigration docs | 🔓 Open browse | GEN |
| [Homeland Security Data Framework](https://www.dhs.gov/data-statistics) | DHS datasets | ✅ Open data | General |

## 16. US Master Open-Data Portals

| Database | Type | Access | Pipe |
|---|---|---|---|
| [Data.gov](https://www.data.gov) | Master US open-data portal | ✅ CKAN API | General |
| [U.S. Census Bureau API](https://www.census.gov/data/developers/data-sets.html) | Census / demographics | ✅ Open API, free key | GEN / GEO |
| [Library of Congress Digital Collections](https://www.loc.gov/collections/) | Historical archives | ✅ Same loc.gov API as Chronicling America | General |
| [National Archives (NARA) Catalog](https://catalog.archives.gov) | Military / immigration / federal records | ✅ NARA Catalog API | LEGAL / POL / GEN |
| [Chronicling America](https://chroniclingamerica.loc.gov) | Historic newspapers | ✅ Already wired (`ingestChroniclingAmerica`) | WF / POL / TRADE |
| [Smithsonian Open Access](https://www.si.edu/openaccess) | Museum/media collections | ✅ Open API | IND |
| [Federal Reserve Economic Data (FRED)](https://fred.stlouisfed.org) | Economic/financial | ✅ Open API | WF / MIN |
| [SEC EDGAR](https://www.sec.gov/edgar/search/) | Corporate filings | ✅ Open API | LEGAL |
| [USAspending.gov](https://www.usaspending.gov) | Federal contracts/grants | ✅ Open API | General |
| [OpenSecrets](https://www.opensecrets.org/open-data/api) | Political finance | ✅ Open API | POL |

---

## Crawler-readiness summary

Updated with 16 categories and 90+ databases:

| Class | Count | Notable examples |
|---|---|---|
| ✅ Open API | ~40 | FRED, OpenAlex, Crossref, Semantic Scholar, CORE, DOAJ, ERIC, PubMed, SEC EDGAR, NARA Catalog, US Census, INEGI, Banxico SIE, USGS, NOAA, OSM, INE, SAT, CBP, CNBV, Smithsonian Open Access, World Digital Library, Internet Archive, HathiTrust, USAspending, OpenSecrets — most have free keys or no auth |
| 🔓 Open browse / OAI-PMH | ~25 | SciELO, Redalyc, Dialnet, CLACSO, Repositorio UNAM, Colegio de México, BNM, Memórica, INAH Mediateca, Mapoteca, LoC Hispanic Reading Room — scrapable through standard catalog endpoints |
| ⚠️ Scrape-only / friction | ~10 | AGN, SRE, HNDM, NASDAQ Data Link free tier, RAN partial, RPC SIGER 2 — possible but fragile |
| 🔒 Auth-walled | ~4 | FamilySearch (dev key), USCIS Genealogy (fee), NPRC (fee), FINRA |
| 💰 Paid | ~6 | Newspapers.com, ProQuest, JSTOR (full), Ancestry, Fold3, Mining Data Online |

## Recommended next-build shortlist (refined)

Six concrete crawler / metric-pull candidates, ranked by signal-to-noise for the TE360 case:

1. **OpenAlex** — single API replaces Google Scholar; semantic scholarly graph polled by keyword. Highest catch-rate for "Yaqui dispossession 1900s," "Sonora mining 1907," "Terminel," "Pima Bajo demographics" etc.
2. **FRED + Banxico SIE** — economic-series tile on the Dashboard. Banxico SIE gives Mexican silver/peso historical series; FRED gives US silver/gold. Joined → anchors the 1907 valuation math on the Family Genealogy displacement calculator.
3. **NARA Catalog API** — direct hit on RG 84 Hermosillo (11 cu.ft.) and Nogales (42 cu.ft.) — already the WF letter's pipe-defining target.
4. **Internet Archive items search** — keyword-polled for regime-era books and pamphlets that name Terminel, Verminel, Calles, Cárdenas senators 1935.
5. **Crossref + Semantic Scholar** — DOI / citation graph enrichment for any peer-reviewed paper we already cite. Cheap to add alongside OpenAlex.
6. **INEGI + INE** — Mexican census and electoral series for the GEO and POL pipes (San Javier population time series, 1932–34 elections).

## What NOT to crawl

- Mexican national archives (AGN, RAN, SRE, AHES, INM, HNDM) — stay on the **letter / written-request** trail. These have no stable APIs and their browse interfaces change. Manual searches save into TE360 via the Archive Requests workflow.
- Paid services (Newspapers.com, JSTOR full, Ancestry, Fold3, ProQuest) — outside the open-API budget. Use only when an institutional subscription is available, with manual save into TE360.
- Google Scholar — explicitly blocks programmatic access. Use OpenAlex instead.

---

*This registry is a Document Lane artifact — a catalog of candidate sources, not evidence. Anything pulled from these databases enters TE360 via the usual provenance gates.*
