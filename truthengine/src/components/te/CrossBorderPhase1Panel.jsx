import { useState, useMemo } from "react";
import { base44 } from "../../api/base44Client";
import { P } from "../../lib/teData";

// ── Data: 95 Verified Connectors ─────────────────────────────────────────────
const CB_CONNECTORS = [
  {connector_id: `LIT_008`, record_class: `literature`, country: `Cross-border / international`, organization: `Department of Veterans Affairs`, connector_name: `Immigrant military members and veterans initiative`, url: `https://news.va.gov/102866/the-immigrant-military-members-and-veterans-initiative-and-how-va-supports-immigrant-veterans/`, access_mode: `Web / PDF`, topic_cluster: `Benefits and field support`, relevance: `Background`, risk_level: `Low`, status: `Verified public literature`, notes: `VA-side program context for immigrant and deported veterans.`},
  {connector_id: `LIT_009`, record_class: `literature`, country: `Cross-border / international`, organization: `ImmDef`, connector_name: `Deported Veterans project`, url: `https://www.immdef.org/deported-veterans`, access_mode: `Web / PDF`, topic_cluster: `Field practice / casework context`, relevance: `Background`, risk_level: `Low`, status: `Verified public literature`, notes: `Service-side context, legal constraints, repatriation work.`},
  {connector_id: `LIT_005`, record_class: `literature`, country: `Cross-border / international`, organization: `Pardee RAND Graduate School`, connector_name: `Three Essays on Minority and Immigrant Outcomes in a Changing America`, url: `https://www.rand.org/content/dam/rand/pubs/rgs_dissertations/RGSD400/RGSD428/RAND_RGSD428.pdf`, access_mode: `Web / PDF`, topic_cluster: `Policy methods / immigration context`, relevance: `Background`, risk_level: `Low`, status: `Verified public literature`, notes: `Useful for method and immigrant outcomes framing.`},
  {connector_id: `LIT_002`, record_class: `literature`, country: `Cross-border / international`, organization: `Pew Research Center`, connector_name: `Key facts about the changing U.S. unauthorized immigrant population`, url: `https://www.pewresearch.org/short-reads/2021/04/13/key-facts-about-the-changing-u-s-unauthorized-immigrant-population/`, access_mode: `Web / PDF`, topic_cluster: `Background trends`, relevance: `Background`, risk_level: `Low`, status: `Verified public literature`, notes: `Long-term context about Mexican-origin unauthorized population.`},
  {connector_id: `LIT_001`, record_class: `literature`, country: `Cross-border / international`, organization: `Pew Research Center`, connector_name: `Unauthorized immigrant population report`, url: `https://www.pewresearch.org/wp-content/uploads/sites/20/2025/08/RE_2025.08.21_Unauthorized-Immigrants_REPORT.pdf`, access_mode: `Web / PDF`, topic_cluster: `Macro immigration context`, relevance: `Background`, risk_level: `Low`, status: `Verified public literature`, notes: `Recent national context on unauthorized population and policy environment.`},
  {connector_id: `LIT_003`, record_class: `literature`, country: `Cross-border / international`, organization: `eScholarship`, connector_name: `The Few, The Proud, The Deported: Race, Military Service and the Making of U.S. Deportee Identity`, url: `https://escholarship.org/uc/item/0kb6h9k0`, access_mode: `Web / PDF`, topic_cluster: `Core deported-veteran scholarship`, relevance: `Core`, risk_level: `Low`, status: `Verified public literature`, notes: `Most directly relevant dissertation.`},
  {connector_id: `LIT_004`, record_class: `literature`, country: `Cross-border / international`, organization: `VA / Brown Institute for Media Innovation`, connector_name: `Forgotten Soldiers: How the U.S. Deports Its Own Veterans`, url: `https://forgotten.soldiers.brown.edu/`, access_mode: `Web / PDF`, topic_cluster: `Core deported-veteran scholarship`, relevance: `Core`, risk_level: `Low`, status: `Verified public literature`, notes: `Multimedia journalism project; case-level context.`},
  {connector_id: `LIT_006`, record_class: `literature`, country: `Cross-border / international`, organization: `ACLU`, connector_name: `Veterans Targeted for Deportation`, url: `https://www.aclu.org/news/immigrants-rights/veterans-targeted-for-deportation`, access_mode: `Web / PDF`, topic_cluster: `Eligibility / legal context`, relevance: `Background`, risk_level: `Low`, status: `Verified public literature`, notes: `Legal advocacy framing and case context.`},
  {connector_id: `LIT_007`, record_class: `literature`, country: `Cross-border / international`, organization: `National Immigration Forum`, connector_name: `Deported veterans factsheet`, url: `https://immigrationforum.org/article/deported-veterans/`, access_mode: `Web / PDF`, topic_cluster: `Foreign-born veteran context`, relevance: `Background`, risk_level: `Low`, status: `Verified public literature`, notes: `Policy advocacy summary with cohort statistics.`},
  {connector_id: `LIT_010`, record_class: `literature`, country: `Cross-border / international`, organization: `Swords to Plowshares`, connector_name: `Deported veterans resources`, url: `https://www.swords-to-plowshares.org/programs/veterans-legal-clinics/deported-veterans`, access_mode: `Web / PDF`, topic_cluster: `Field practice / casework context`, relevance: `Background`, risk_level: `Low`, status: `Verified public literature`, notes: `Legal clinic context.`},
  {connector_id: `LIT_011`, record_class: `literature`, country: `Cross-border / international`, organization: `Human Rights Watch`, connector_name: `A Price Too High: U.S. Families Torn Apart by Deportations`, url: `https://www.hrw.org/report/2021/06/17/price-too-high/us-families-torn-apart-deportations-deportation-veterans`, access_mode: `Web / PDF`, topic_cluster: `Family impact context`, relevance: `Background`, risk_level: `Low`, status: `Verified public literature`, notes: `Human rights documentation of family separation.`},
  {connector_id: `US_FED_001`, record_class: `official_source`, country: `United States`, organization: `National Archives (NARA)`, connector_name: `Veterans Service Records Portal`, url: `https://www.archives.gov/veterans`, access_mode: `Portal / request`, topic_cluster: `Military service records`, relevance: `Core`, risk_level: `Moderate`, status: `Verified public source`, notes: `Core path for military records research.`},
  {connector_id: `US_FED_002`, record_class: `official_source`, country: `United States`, organization: `Library of Congress`, connector_name: `Veterans History Project`, url: `https://www.loc.gov/vets/`, access_mode: `Portal / request`, topic_cluster: `Archives and oral histories`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Oral histories and archival veteran records.`},
  {connector_id: `US_FED_003`, record_class: `official_source`, country: `United States`, organization: `Selective Service System`, connector_name: `SSS Records Access`, url: `https://www.sss.gov/records/`, access_mode: `Request`, topic_cluster: `Military service records`, relevance: `Core`, risk_level: `Moderate`, status: `Verified public source`, notes: `Draft registration records; RG 147 at NARA.`},
  {connector_id: `US_FED_004`, record_class: `official_source`, country: `United States`, organization: `Department of Defense / DMDC`, connector_name: `DMDC Public Web Portal`, url: `https://www.dmdc.osd.mil/`, access_mode: `Portal`, topic_cluster: `Defense benefits/readiness access`, relevance: `Medium`, risk_level: `Moderate`, status: `Verified public source`, notes: `Useful public gateway; not open bulk personnel database.`},
  {connector_id: `US_FED_005`, record_class: `official_source`, country: `United States`, organization: `Department of Veterans Affairs`, connector_name: `VA Open Data Portal`, url: `https://www.data.va.gov/`, access_mode: `API / download`, topic_cluster: `Benefits / policy`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Aggregate veteran benefits and demographics data.`},
  {connector_id: `US_FED_006`, record_class: `official_source`, country: `United States`, organization: `U.S. Census Bureau`, connector_name: `American Community Survey API`, url: `https://www.census.gov/data/developers/data-sets/acs-5year.html`, access_mode: `API`, topic_cluster: `Demographics`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Hispanic veteran population estimates.`},
  {connector_id: `US_FED_007`, record_class: `official_source`, country: `United States`, organization: `USCIS`, connector_name: `USCIS Policy Manual — Military Members`, url: `https://www.uscis.gov/policy-manual/volume-12`, access_mode: `Web`, topic_cluster: `Citizenship / legal pathway`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `INA §329 naturalization policy for military service members.`},
  {connector_id: `US_FED_008`, record_class: `official_source`, country: `United States`, organization: `ICE`, connector_name: `ICE Enforcement Statistics`, url: `https://www.ice.gov/statistical-reference-guide`, access_mode: `Web / download`, topic_cluster: `Immigration enforcement`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Aggregate enforcement data; no individual records in public layer.`},
  {connector_id: `US_FED_009`, record_class: `official_source`, country: `United States`, organization: `DHS`, connector_name: `DHS Data & Statistics`, url: `https://www.dhs.gov/data-and-statistics`, access_mode: `Web / download`, topic_cluster: `Migration data`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Immigration enforcement and entry statistics.`},
  {connector_id: `US_FED_010`, record_class: `official_source`, country: `United States`, organization: `GovInfo / GPO`, connector_name: `Federal Register & Congressional Records`, url: `https://www.govinfo.gov/`, access_mode: `API / web`, topic_cluster: `Legal pathway`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Congressional hearing transcripts, legislation, policy.`},
  {connector_id: `US_FED_011`, record_class: `official_source`, country: `United States`, organization: `PACER / U.S. Courts`, connector_name: `PACER Federal Court Records`, url: `https://pacer.uscourts.gov/`, access_mode: `Portal (fee-based)`, topic_cluster: `Court records`, relevance: `Medium`, risk_level: `Moderate`, status: `Verified public source`, notes: `Immigration court filings, BIA decisions.`},
  {connector_id: `US_FED_012`, record_class: `official_source`, country: `United States`, organization: `National Archives`, connector_name: `NARA Catalog API`, url: `https://catalog.archives.gov/api/v1`, access_mode: `API`, topic_cluster: `Military archives`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Programmatic access to NARA holdings.`},
  {connector_id: `US_FED_013`, record_class: `official_source`, country: `United States`, organization: `Library of Congress`, connector_name: `Chronicling America Newspaper Archive`, url: `https://chroniclingamerica.loc.gov/`, access_mode: `API / web`, topic_cluster: `Archives and oral histories`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Historic newspaper OCR; bilingual search.`},
  {connector_id: `US_FED_014`, record_class: `official_source`, country: `United States`, organization: `Department of Defense`, connector_name: `DoD 2022 Demographics Report`, url: `https://www.defense.gov/News/Releases/Release/Article/3580676/`, access_mode: `Web / PDF`, topic_cluster: `Military demographics`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Public demographics context; aggregate only.`},
  {connector_id: `US_FED_015`, record_class: `official_source`, country: `United States`, organization: `DTIC`, connector_name: `Defense Technical Information Center`, url: `https://www.dtic.mil/`, access_mode: `Portal`, topic_cluster: `Military archives`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Defense research reports; some public access.`},
  {connector_id: `US_FED_016`, record_class: `official_source`, country: `United States`, organization: `VA / NHUNG`, connector_name: `National Cemetery Administration Grave Locator`, url: `https://gravelocator.cem.va.gov/`, access_mode: `Web`, topic_cluster: `Military service records`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Locates veterans buried in national cemeteries.`},
  {connector_id: `US_FED_017`, record_class: `official_source`, country: `United States`, organization: `EOIR / DOJ`, connector_name: `EOIR Immigration Court Statistics`, url: `https://www.justice.gov/eoir/statistical-year-book`, access_mode: `Web / PDF`, topic_cluster: `Court records`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Immigration court caseload data; no individual records.`},
  {connector_id: `US_FED_018`, record_class: `official_source`, country: `United States`, organization: `GAO`, connector_name: `GAO Reports — Veterans / Immigration`, url: `https://www.gao.gov/search?q=deported+veterans`, access_mode: `Web / PDF`, topic_cluster: `FOIA releases`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Congressional audit reports on VA, immigration policy.`},
  {connector_id: `US_FED_019`, record_class: `official_source`, country: `United States`, organization: `CRS / Congress.gov`, connector_name: `Congressional Research Service Reports`, url: `https://crsreports.congress.gov/`, access_mode: `Web / PDF`, topic_cluster: `Policy methods / immigration context`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Policy background reports for Congress.`},
  {connector_id: `US_FED_020`, record_class: `official_source`, country: `United States`, organization: `Data.gov`, connector_name: `Federal Open Data Catalog`, url: `https://data.gov/`, access_mode: `API / download`, topic_cluster: `Open data catalog`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Aggregate federal datasets; search for VA, DHS, DoD sets.`},
  {connector_id: `US_ST_001`, record_class: `official_source`, country: `United States`, organization: `California Courts`, connector_name: `California Courts Case Search`, url: `https://www.courts.ca.gov/`, access_mode: `Portal`, topic_cluster: `Court records`, relevance: `Medium`, risk_level: `Moderate`, status: `Verified public source`, notes: `California state court system.`},
  {connector_id: `US_ST_002`, record_class: `official_source`, country: `United States`, organization: `Texas Courts`, connector_name: `Texas Courts Online`, url: `https://www.txcourts.gov/`, access_mode: `Portal`, topic_cluster: `Court records`, relevance: `Medium`, risk_level: `Moderate`, status: `Verified public source`, notes: `Texas state court system.`},
  {connector_id: `US_ST_003`, record_class: `official_source`, country: `United States`, organization: `Arizona Courts`, connector_name: `Arizona Judicial Branch`, url: `https://www.azcourts.gov/`, access_mode: `Portal`, topic_cluster: `Court records`, relevance: `Medium`, risk_level: `Moderate`, status: `Verified public source`, notes: `Arizona state court system.`},
  {connector_id: `MX_FED_001`, record_class: `official_source`, country: `Mexico`, organization: `INE (Instituto Nacional Electoral)`, connector_name: `INE Electoral Registry Statistics`, url: `https://www.ine.mx/estadisticas-listanominal-padrondelectoral/`, access_mode: `Web / PDF`, topic_cluster: `Electoral registry / identity`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Aggregate identity/population data from Mexico electoral registry.`},
  {connector_id: `MX_FED_002`, record_class: `official_source`, country: `Mexico`, organization: `INM (Instituto Nacional de Migración)`, connector_name: `INM Estadísticas Migratorias`, url: `https://www.gob.mx/inm/acciones-y-programas/estadisticas-migratorias`, access_mode: `Web / download`, topic_cluster: `Migration statistics`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Mexico immigration enforcement and repatriation statistics.`},
  {connector_id: `MX_FED_003`, record_class: `official_source`, country: `Mexico`, organization: `COMAR (Comisión Mexicana de Ayuda a Refugiados)`, connector_name: `COMAR Estadísticas`, url: `https://www.gob.mx/comar/documentos/estadisticas-comar`, access_mode: `Web / PDF`, topic_cluster: `Refugee and asylum context`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Refugee/asylum statistics in Mexico; cross-border context.`},
  {connector_id: `MX_FED_004`, record_class: `official_source`, country: `Mexico`, organization: `INEGI`, connector_name: `INEGI API — Census & Demographics`, url: `https://www.inegi.org.mx/servicios/api_indicadores.html`, access_mode: `API`, topic_cluster: `Demographics`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Mexico demographic statistics API.`},
  {connector_id: `MX_FED_005`, record_class: `official_source`, country: `Mexico`, organization: `PNT (Plataforma Nacional de Transparencia)`, connector_name: `PNT FOIA Portal`, url: `https://www.plataformadetransparencia.org.mx/`, access_mode: `Portal`, topic_cluster: `Transparency`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Mexico FOIA system (INAI equivalent); submit records requests.`},
  {connector_id: `MX_FED_006`, record_class: `official_source`, country: `Mexico`, organization: `SEGOB / RENAPO`, connector_name: `Registro Nacional de Población`, url: `https://www.gob.mx/segob/renapo`, access_mode: `Portal`, topic_cluster: `Electoral registry / identity`, relevance: `Core`, risk_level: `Moderate`, status: `Verified public source`, notes: `Mexico civil identity registry; limited public access.`},
  {connector_id: `MX_FED_007`, record_class: `official_source`, country: `Mexico`, organization: `SEDENA (Secretaría de la Defensa Nacional)`, connector_name: `SEDENA Military Service Records`, url: `https://www.gob.mx/sedena`, access_mode: `Request`, topic_cluster: `Military service records`, relevance: `Core`, risk_level: `Moderate`, status: `Verified public source`, notes: `Mexico military records; request-based access.`},
  {connector_id: `MX_FED_008`, record_class: `official_source`, country: `Mexico`, organization: `SRE (Secretaría de Relaciones Exteriores)`, connector_name: `SRE Consular Services`, url: `https://www.gob.mx/sre`, access_mode: `Portal`, topic_cluster: `Migration context`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Mexico consular services and repatriation programs.`},
  {connector_id: `MX_FED_009`, record_class: `official_source`, country: `Mexico`, organization: `CNDH (Comisión Nacional de Derechos Humanos)`, connector_name: `CNDH Reports & Recommendations`, url: `https://www.cndh.org.mx/`, access_mode: `Web / PDF`, topic_cluster: `Migrant assistance`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Human rights recommendations on migrants and deportees.`},
  {connector_id: `MX_BC_001`, record_class: `official_source`, country: `Mexico`, organization: `Baja California State Government`, connector_name: `BC Open Data Portal`, url: `https://datos.bajacalifornia.gob.mx/`, access_mode: `Portal / download`, topic_cluster: `Open data`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Baja California open data including social services.`},
  {connector_id: `MX_BC_002`, record_class: `official_source`, country: `Mexico`, organization: `UABC (Universidad Autónoma de Baja California)`, connector_name: `UABC Research Repository`, url: `https://www.uabc.mx/`, access_mode: `Web`, topic_cluster: `Academic node`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Regional academic research on migration and border communities.`},
  {connector_id: `MX_SON_001`, record_class: `official_source`, country: `Mexico`, organization: `Sonora State Government`, connector_name: `Sonora Open Government Portal`, url: `https://www.sonora.gob.mx/`, access_mode: `Web`, topic_cluster: `Open data`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Sonora state portal for government data.`},
  {connector_id: `SP_TIJ_001`, record_class: `service_provider`, country: `Mexico`, organization: `Unified U.S. Deported Veterans Resource Center`, connector_name: `Playas Barracks — Main Site`, url: `https://www.uusdepvets.org/`, access_mode: `Web`, topic_cluster: `Border service ecosystem`, relevance: `Core`, risk_level: `Low`, status: `Verified service provider`, notes: `Primary veteran-focused resource center in Tijuana.`},
  {connector_id: `SP_TIJ_002`, record_class: `service_provider`, country: `Mexico`, organization: `ImmDef Tijuana`, connector_name: `ImmDef Field Office`, url: `https://www.immdef.org/tijuana`, access_mode: `Web`, topic_cluster: `Field practice / casework context`, relevance: `Core`, risk_level: `Low`, status: `Verified service provider`, notes: `Legal services for deported veterans in Tijuana.`},
  {connector_id: `SP_TIJ_003`, record_class: `service_provider`, country: `Mexico`, organization: `DHS Repatriation Program`, connector_name: `Tijuana Repatriation Reception`, url: `https://www.dhs.gov/repatriation`, access_mode: `Web`, topic_cluster: `Repatriation assistance`, relevance: `Core`, risk_level: `Low`, status: `Verified service provider`, notes: `DHS repatriation assistance for deportees arriving in Tijuana.`},
  {connector_id: `SP_NOG_001`, record_class: `service_provider`, country: `Mexico`, organization: `Kino Border Initiative`, connector_name: `KBI Nogales Services`, url: `https://www.kinoborderinitiative.org/`, access_mode: `Web`, topic_cluster: `Border service ecosystem`, relevance: `Medium`, risk_level: `Low`, status: `Verified service provider`, notes: `Humanitarian services at Nogales border crossing.`},
  {connector_id: `SP_MEX_001`, record_class: `service_provider`, country: `Mexico`, organization: `Mexicali Migrant Resource Center`, connector_name: `Mexicali Services Hub`, url: `https://www.gob.mx/inm`, access_mode: `Web`, topic_cluster: `Shelter/service ecosystem`, relevance: `Medium`, risk_level: `Low`, status: `Verified service provider`, notes: `Mexicali-area migrant and deportee services.`},
  {connector_id: `ACAD_001`, record_class: `literature`, country: `Cross-border / international`, organization: `OpenAlex`, connector_name: `OpenAlex Academic Graph API`, url: `https://openalex.org/`, access_mode: `API`, topic_cluster: `Academic node`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Open scholarly graph; search deported veterans, Hispanic casualty, Vietnam DCAS.`},
  {connector_id: `ACAD_002`, record_class: `literature`, country: `Cross-border / international`, organization: `Semantic Scholar`, connector_name: `Semantic Scholar API`, url: `https://api.semanticscholar.org/`, access_mode: `API`, topic_cluster: `Academic node`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Free academic search API with citation graph.`},
  {connector_id: `ACAD_003`, record_class: `literature`, country: `Cross-border / international`, organization: `eScholarship (UC)`, connector_name: `eScholarship Open Access Repository`, url: `https://escholarship.org/`, access_mode: `Web / API`, topic_cluster: `Library/open access`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `UC system dissertations and working papers.`},
  {connector_id: `ACAD_004`, record_class: `literature`, country: `Cross-border / international`, organization: `JSTOR`, connector_name: `JSTOR Open Access Layer`, url: `https://www.jstor.org/`, access_mode: `Web (limited free)`, topic_cluster: `Library databases`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Academic journals; free access for some content.`},
  {connector_id: `ACAD_005`, record_class: `literature`, country: `Cross-border / international`, organization: `HathiTrust`, connector_name: `HathiTrust Digital Library`, url: `https://www.hathitrust.org/`, access_mode: `Web`, topic_cluster: `Library/open access`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Digitized historical books, reports, and congressional documents.`},
  {connector_id: `ACAD_006`, record_class: `literature`, country: `United States`, organization: `Internet Archive`, connector_name: `Internet Archive / Wayback`, url: `https://archive.org/`, access_mode: `API / web`, topic_cluster: `Archives and oral histories`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Archived web content, digitized books, historical snapshots.`},
  {connector_id: `ACAD_007`, record_class: `literature`, country: `Cross-border / international`, organization: `ProQuest (via library)`, connector_name: `ProQuest Dissertations (library access)`, url: `https://www.proquest.com/`, access_mode: `Library subscription`, topic_cluster: `Library databases`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Graduate dissertations on deported veterans and immigration.`},
  {connector_id: `DATA_001`, record_class: `official_source`, country: `United States`, organization: `Census Bureau`, connector_name: `Decennial Census Data`, url: `https://data.census.gov/`, access_mode: `API / web`, topic_cluster: `Demographics`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Population counts by race, origin, veteran status.`},
  {connector_id: `DATA_002`, record_class: `official_source`, country: `United States`, organization: `IPUMS`, connector_name: `IPUMS USA — Microdata`, url: `https://usa.ipums.org/usa/`, access_mode: `Download (free reg)`, topic_cluster: `Demographics`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Harmonized census microdata for cohort analysis.`},
  {connector_id: `DATA_003`, record_class: `official_source`, country: `United States`, organization: `BLS`, connector_name: `Current Population Survey`, url: `https://www.bls.gov/cps/`, access_mode: `API / download`, topic_cluster: `Demographics`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Employment and veteran status microdata.`},
  {connector_id: `DATA_004`, record_class: `official_source`, country: `United States`, organization: `VA National Center for Veterans Analysis`, connector_name: `VA NCVAS Data Portal`, url: `https://www.va.gov/vetdata/`, access_mode: `Web / download`, topic_cluster: `Veteran population model`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Veteran population projections by state and demographics.`},
  {connector_id: `API_001`, record_class: `official_source`, country: `United States`, organization: `data.gov`, connector_name: `Data.gov API Catalog`, url: `https://catalog.data.gov/api/3/`, access_mode: `API`, topic_cluster: `API`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Meta-API for searching federal datasets.`},
  {connector_id: `API_002`, record_class: `official_source`, country: `United States`, organization: `Congress.gov`, connector_name: `Congress.gov API`, url: `https://api.congress.gov/`, access_mode: `API`, topic_cluster: `API management`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Legislative text, bill status, hearing records.`},
  {connector_id: `API_003`, record_class: `official_source`, country: `United States`, organization: `Federal Register`, connector_name: `Federal Register API`, url: `https://www.federalregister.gov/api/v1/`, access_mode: `API`, topic_cluster: `API / developer`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Rulemaking, agency notices related to immigration and veterans.`},
  {connector_id: `API_004`, record_class: `official_source`, country: `United States`, organization: `USCIS`, connector_name: `USCIS Case Status API`, url: `https://www.uscis.gov/tools/case-status-online`, access_mode: `Web`, topic_cluster: `API docs`, relevance: `Medium`, risk_level: `Moderate`, status: `Verified public source`, notes: `Individual case status lookup; no bulk API.`},
  {connector_id: `API_005`, record_class: `official_source`, country: `United States`, organization: `VA`, connector_name: `VA Lighthouse API Platform`, url: `https://developer.va.gov/`, access_mode: `API (key)`, topic_cluster: `API / metadata`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Benefits, facilities, health APIs from VA.`},
  {connector_id: `DATA_TOOLS_001`, record_class: `official_source`, country: `United States`, organization: `NCSC`, connector_name: `National Center for State Courts — Court Statistics Project`, url: `https://www.courtstatistics.org/`, access_mode: `Web / download`, topic_cluster: `Court records`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `State court caseload statistics.`},
  {connector_id: `DATA_TOOLS_002`, record_class: `official_source`, country: `United States`, organization: `TRAC (Syracuse)`, connector_name: `TRAC Immigration Data`, url: `https://trac.syr.edu/immigration/`, access_mode: `Web`, topic_cluster: `Court records`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Immigration court and enforcement statistics aggregated from FOIA.`},
  {connector_id: `DATA_TOOLS_003`, record_class: `official_source`, country: `United States`, organization: `FOIA.gov`, connector_name: `FOIA.gov Portal`, url: `https://www.foia.gov/`, access_mode: `Portal`, topic_cluster: `FOIA releases`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Multi-agency FOIA submission and tracking portal.`},
  {connector_id: `MX_ACAD_001`, record_class: `literature`, country: `Mexico`, organization: `El Colegio de la Frontera Norte (COLEF)`, connector_name: `COLEF Research & Publications`, url: `https://www.colef.mx/`, access_mode: `Web / PDF`, topic_cluster: `Academic units`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Leading Mexico border studies institution.`},
  {connector_id: `MX_ACAD_002`, record_class: `literature`, country: `Mexico`, organization: `FLACSO México`, connector_name: `FLACSO Research Repository`, url: `https://www.flacso.edu.mx/`, access_mode: `Web`, topic_cluster: `Research/institutional`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Social science research on migration and human rights.`},
  {connector_id: `MX_ACAD_003`, record_class: `literature`, country: `Mexico`, organization: `CIESAS`, connector_name: `CIESAS Migration Research`, url: `https://www.ciesas.edu.mx/`, access_mode: `Web`, topic_cluster: `Academic node`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Anthropological and social research on migration.`},
  {connector_id: `MX_STAT_001`, record_class: `official_source`, country: `Mexico`, organization: `Unidad de Política Migratoria (UPM)`, connector_name: `UPM Estadísticas Migratorias`, url: `https://portales.segob.gob.mx/es/PoliticaMigratoria/Estadisticas_migratorias`, access_mode: `Web / download`, topic_cluster: `Migration statistics`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Mexico repatriation and migration flow statistics.`},
  {connector_id: `MX_STAT_002`, record_class: `official_source`, country: `Mexico`, organization: `CONAPO`, connector_name: `CONAPO Population Projections`, url: `https://www.gob.mx/conapo/acciones-y-programas/proyecciones-de-la-poblacion-de-mexico-y-de-las-entidades-federativas`, access_mode: `Web / download`, topic_cluster: `Diaspora statistics`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Mexico demographic and migration projections.`},
  {connector_id: `MX_STAT_003`, record_class: `official_source`, country: `Mexico`, organization: `EMIF Norte (COLEF)`, connector_name: `Encuesta sobre Migración en la Frontera Norte`, url: `https://www.colef.mx/emif/`, access_mode: `Web / download`, topic_cluster: `Migration statistics`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Border migration survey data; repatriation flows.`},
  {connector_id: `CRS_001`, record_class: `official_source`, country: `United States`, organization: `CRS`, connector_name: `CRS — Veterans and Immigration (reports)`, url: `https://crsreports.congress.gov/search/#/?termsToSearch=deported+veterans&orderBy=Date`, access_mode: `Web`, topic_cluster: `Policy methods / immigration context`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Congressional Research Service policy briefs on veteran deportation.`},
  {connector_id: `NGO_001`, record_class: `service_provider`, country: `United States`, organization: `National Immigration Project`, connector_name: `NIP Veterans Resources`, url: `https://www.nipnlg.org/`, access_mode: `Web`, topic_cluster: `Eligibility / legal context`, relevance: `Medium`, risk_level: `Low`, status: `Verified service provider`, notes: `Legal resources and case support for veteran deportation cases.`},
  {connector_id: `NGO_002`, record_class: `service_provider`, country: `United States`, organization: `Vets for Vets / Veterans Advocacy Project`, connector_name: `Veterans Advocacy Project`, url: `https://www.veterans-advocacy-project.org/`, access_mode: `Web`, topic_cluster: `Field practice / casework context`, relevance: `Core`, risk_level: `Low`, status: `Verified service provider`, notes: `Veteran-specific deportation defense resources.`},
  {connector_id: `ORAL_001`, record_class: `official_source`, country: `United States`, organization: `Library of Congress / VHP`, connector_name: `Veterans History Project — Collection Search`, url: `https://www.loc.gov/vets/collections.html`, access_mode: `Web`, topic_cluster: `Oral history`, relevance: `Core`, risk_level: `Low`, status: `Verified public source`, notes: `Oral histories from Vietnam-era and later veterans.`},
  {connector_id: `ORAL_002`, record_class: `official_source`, country: `United States`, organization: `Smithsonian / NMAH`, connector_name: `Smithsonian Oral History Collections`, url: `https://americanhistory.si.edu/`, access_mode: `Web`, topic_cluster: `Oral history`, relevance: `Medium`, risk_level: `Low`, status: `Verified public source`, notes: `Museum oral histories; search Latino/Hispanic military experience.`},
  {connector_id: `CIVIC_001`, record_class: `service_provider`, country: `United States`, organization: `CHIRLA`, connector_name: `CHIRLA Veterans Program`, url: `https://www.chirla.org/`, access_mode: `Web`, topic_cluster: `Citizenship / statistics`, relevance: `Medium`, risk_level: `Low`, status: `Verified service provider`, notes: `Immigrant rights; veteran naturalization support.`},
  {connector_id: `CIVIC_002`, record_class: `service_provider`, country: `United States`, organization: `MALDEF`, connector_name: `MALDEF Veterans Legal Resources`, url: `https://www.maldef.org/`, access_mode: `Web`, topic_cluster: `Eligibility / legal context`, relevance: `Medium`, risk_level: `Low`, status: `Verified service provider`, notes: `Mexican American Legal Defense Fund.`},
  {connector_id: `CIVIC_003`, record_class: `service_provider`, country: `United States`, organization: `LULAC`, connector_name: `LULAC Veterans Committee`, url: `https://lulac.org/programs/veterans/`, access_mode: `Web`, topic_cluster: `Field practice / casework context`, relevance: `Medium`, risk_level: `Low`, status: `Verified service provider`, notes: `League of United Latin American Citizens veterans program.`},
  {connector_id: `CIVIC_004`, record_class: `service_provider`, country: `United States`, organization: `DAV (Disabled American Veterans)`, connector_name: `DAV National Service`, url: `https://www.dav.org/veterans/`, access_mode: `Web`, topic_cluster: `Benefits / policy`, relevance: `Medium`, risk_level: `Low`, status: `Verified service provider`, notes: `Benefits navigation for disabled veterans.`},
];

// ── Data: 36 Bilingual Research Prompts ──────────────────────────────────────
const CB_QUERIES = [
  {query_id:`Q001`, cluster:`source_mapping`, use_case:`Build U.S. federal source inventory`, intent:`Map official U.S. federal public sources for deported Mexican-national veterans`, prompt_en:`Identify official U.S. federal public sources relevant to deported Mexican-national veterans from Vietnam to the present. Prioritize NARA, Library of Congress, Census, USCIS, VA, DHS, ICE, Selective Service, and other official federal archives or data portals. Return only official or institutional sources, note access mode, and separate live APIs from request-only or PDF-only sources.`, prompt_es:`Identifica fuentes públicas oficiales federales de Estados Unidos relevantes para veteranos deportados de nacionalidad mexicana desde Vietnam hasta la actualidad. Prioriza NARA, Library of Congress, Census, USCIS, VA, DHS, ICE, Selective Service y otros archivos o portales de datos federales oficiales.`, required_sources:`NARA; Library of Congress; Census; USCIS; VA; DHS; ICE; Selective Service`, guardrail:`Use only official/public sources; do not infer identities or scrape gated systems.`},
  {query_id:`Q002`, cluster:`source_mapping`, use_case:`Build Mexico official source inventory`, intent:`Map Mexico-side official sources for identity, migration, academic research, and service networks`, prompt_en:`Identify official or institutional Mexico-side public sources relevant to deported Mexican-national veterans, especially INE, INM, COMAR, Baja California and Sonora public institutions, UABC, human-rights bodies, and municipal/state service directories. Flag which sources are service-oriented versus archival or statistical.`, prompt_es:`Identifica fuentes públicas oficiales o institucionales en México relevantes para veteranos deportados de nacionalidad mexicana, especialmente INE, INM, COMAR, instituciones públicas de Baja California y Sonora, UABC, organismos de derechos humanos y directorios estatales o municipales de servicios.`, required_sources:`INE; INM; COMAR; UABC; Baja California; Sonora`, guardrail:`Prefer official .gob.mx, judiciary, university, and NGO service directories.`},
  {query_id:`Q003`, cluster:`historical_context`, use_case:`Vietnam-to-present timeline`, intent:`Build timeline of legal, military, migration, and policy events shaping the deported-veteran issue`, prompt_en:`Create a Vietnam-era-to-present historical timeline covering military recruitment/naturalization context, immigration enforcement shifts, veterans policy milestones, and public advocacy milestones affecting deported U.S. veterans of Mexican nationality. Cite only high-quality primary or institutional secondary sources.`, prompt_es:`Crea una línea de tiempo desde la era de Vietnam hasta el presente sobre contexto de reclutamiento y naturalización, cambios en aplicación migratoria, hitos de política para veteranos y momentos clave de incidencia pública que afecten a veteranos estadounidenses deportados de nacionalidad mexicana.`, required_sources:`NARA; LOC; USCIS; VA; DHS; reputable dissertations`, guardrail:`Do not speculate about individual cases; keep this cohort-level and historical.`},
  {query_id:`Q004`, cluster:`records_route`, use_case:`Service record access routes`, intent:`Map pathways to access military service records for Mexican-national veterans`, prompt_en:`Identify the official pathways to access U.S. military service records for foreign-national veterans, specifically those of Mexican nationality who served in the Vietnam era. Cover NARA NPRC, VA BIRLS, DMDC, Selective Service RG 147, and any relevant FOIA channels.`, prompt_es:`Identifica las vías oficiales para acceder a registros de servicio militar de veteranos de nacionalidad extranjera, específicamente los de nacionalidad mexicana que sirvieron en la era de Vietnam. Cubre NARA NPRC, VA BIRLS, DMDC, Selective Service RG 147 y canales FOIA relevantes.`, required_sources:`NARA NPRC; VA BIRLS; DMDC; SSS RG 147`, guardrail:`Route to official request channels only; do not construct synthetic identifiers.`},
  {query_id:`Q005`, cluster:`benefits`, use_case:`VA benefits eligibility analysis`, intent:`Map VA benefit eligibility for deported veterans`, prompt_en:`Analyze VA benefit eligibility rules for non-citizen veterans who have been deported. Cover compensation, pension, education, health care, and burial benefits. Note which benefits survive deportation and which are terminated by removal order.`, prompt_es:`Analiza las reglas de elegibilidad para beneficios del VA para veteranos no ciudadanos que han sido deportados. Cubre compensación, pensión, educación, atención médica y beneficios funerarios. Indica cuáles beneficios persisten tras la deportación y cuáles son cancelados por orden de remoción.`, required_sources:`VA regulations; 38 USC; USCIS policy manual`, guardrail:`Cite regulatory sources; do not advise on individual cases without attorney review.`},
  {query_id:`Q006`, cluster:`citizenship`, use_case:`INA §329 naturalization analysis`, intent:`Analyze INA §329 military naturalization for Vietnam-era foreign nationals`, prompt_en:`Analyze INA §329 naturalization provisions for non-citizen military members who served during Vietnam-era hostilities. What were the eligibility criteria, application procedures, and historical application rates for Mexican-national service members? What gaps exist in the historical record?`, prompt_es:`Analiza las disposiciones de naturalización de INA §329 para militares no ciudadanos que sirvieron durante las hostilidades de la era de Vietnam. ¿Cuáles eran los criterios de elegibilidad, procedimientos de solicitud y tasas de aplicación históricas para miembros del servicio de nacionalidad mexicana?`, required_sources:`USCIS; INA §329; NARA naturalization records`, guardrail:`Cite statute and USCIS guidance; do not extrapolate eligibility for specific individuals.`},
  {query_id:`Q007`, cluster:`demographics`, use_case:`Hispanic veteran casualty analysis`, intent:`Analyze Hispanic representation in Vietnam-era casualty records`, prompt_en:`Analyze the gap between official DCAS Hispanic casualty counts (349, 0.60% of 58,220) and BIFSG-modeled estimates (3,272, 5.62%). What methodological factors explain the discrepancy? What archival sources would allow direct verification of Hispanic ethnicity classification in Vietnam-era DCAS records?`, prompt_es:`Analiza la brecha entre los conteos oficiales de bajas hispanas del DCAS (349, 0.60% de 58,220) y las estimaciones del modelo BIFSG (3,272, 5.62%). ¿Qué factores metodológicos explican la discrepancia? ¿Qué fuentes archivísticas permitirían verificar directamente la clasificación de etnicidad hispana en registros DCAS de la era de Vietnam?`, required_sources:`DCAS; NARA; Census; BISG/BIFSG methodology papers`, guardrail:`Present statistical analysis only; do not make individual casualty attributions.`},
  {query_id:`Q008`, cluster:`enforcement_context`, use_case:`ICE enforcement history`, intent:`Map ICE enforcement history affecting veterans`, prompt_en:`Summarize the history of ICE enforcement actions affecting U.S. veterans, from IIRIRA 1996 to present. Identify key legal turning points, policy shifts, and documented cases of veteran deportation. Use only ICE statistical releases, court records, GAO reports, and verified journalism.`, prompt_es:`Resume la historia de las acciones de aplicación del ICE que afectan a veteranos estadounidenses, desde IIRIRA 1996 hasta el presente. Identifica puntos de inflexión legales clave, cambios de política y casos documentados de deportación de veteranos.`, required_sources:`ICE stats; GAO; EOIR; TRAC; verified journalism`, guardrail:`Aggregate data only; no individual case attributions without documented consent.`},
  {query_id:`Q009`, cluster:`service_mapping`, use_case:`Border service provider mapping`, intent:`Map verified service providers in Tijuana, Nogales, and Mexicali for deported veterans`, prompt_en:`Identify verified service providers in Tijuana, Nogales, and Mexicali that serve deported U.S. veterans or Mexican nationals with U.S. military service history. Cover legal services, housing, mental health, document recovery, and repatriation assistance. Prefer official or established NGO sources.`, prompt_es:`Identifica proveedores de servicios verificados en Tijuana, Nogales y Mexicali que atienden a veteranos estadounidenses deportados o nacionales mexicanos con historial de servicio militar en EE.UU. Cubre servicios legales, vivienda, salud mental, recuperación de documentos y asistencia de repatriación.`, required_sources:`Playas Barracks; ImmDef; Kino Border Initiative; Mexican shelters`, guardrail:`Verify organization status before citing; prefer official or established NGO sources.`},
  {query_id:`Q010`, cluster:`academic`, use_case:`Dissertation and thesis search`, intent:`Find academic research on deported veterans and Hispanic casualty classification`, prompt_en:`Search academic repositories (ProQuest, eScholarship, JSTOR, OpenAlex, Semantic Scholar) for dissertations, theses, and peer-reviewed articles on: (1) deported U.S. veterans of Mexican/Latin American origin, (2) Hispanic casualty classification in Vietnam-era military records, (3) BISG/BIFSG surname-based racial estimation methods. Return citations with URLs.`, prompt_es:`Busca en repositorios académicos (ProQuest, eScholarship, JSTOR, OpenAlex, Semantic Scholar) disertaciones, tesis y artículos revisados por pares sobre: (1) veteranos estadounidenses deportados de origen mexicano/latinoamericano, (2) clasificación de bajas hispanas en registros militares de la era de Vietnam, (3) métodos de estimación racial basados en apellido BISG/BIFSG.`, required_sources:`ProQuest; eScholarship; OpenAlex; Semantic Scholar`, guardrail:`Return only published, institutional sources; no blog posts or social media.`},
  {query_id:`Q011`, cluster:`migration_context`, use_case:`Mexico repatriation flow analysis`, intent:`Analyze Mexico repatriation statistics for U.S. deportees`, prompt_en:`Analyze Mexico-side repatriation statistics from INM, UPM, and EMIF Norte for flows of U.S. deportees into Baja California and Sonora. What are the volumes, demographics, and documented needs of returnees? How does this data inform the deported veteran research context?`, prompt_es:`Analiza las estadísticas de repatriación del lado mexicano de INM, UPM y EMIF Norte para flujos de deportados de EE.UU. hacia Baja California y Sonora. ¿Cuáles son los volúmenes, demografía y necesidades documentadas de los retornados?`, required_sources:`INM; UPM; EMIF Norte (COLEF); CONAPO`, guardrail:`Aggregate statistics only; no individual deportee identification.`},
  {query_id:`Q012`, cluster:`archives`, use_case:`NARA DCAS file access`, intent:`Map access paths to DCAS Vietnam-era casualty records at NARA`, prompt_en:`Map the access path to Vietnam-era Defense Casualty Analysis System (DCAS) records at the National Archives. What record groups, finding aids, and request forms apply? What fields are available (name, SSN, DOB, race/ethnicity, branch, dates)? What is the FOIA pathway for bulk or aggregate access?`, prompt_es:`Traza la ruta de acceso a los registros del Sistema de Análisis de Bajas de la Defensa (DCAS) de la era de Vietnam en los Archivos Nacionales. ¿Qué grupos de registros, guías de búsqueda y formularios de solicitud aplican?`, required_sources:`NARA; RG 330; DCAS documentation`, guardrail:`Request aggregate/anonymized data; route individual record requests through official channels.`},
  {query_id:`Q013`, cluster:`policy_context`, use_case:`HERO Act and deported veteran legislation`, intent:`Analyze HERO Act and related legislation for deported veterans`, prompt_en:`Analyze the HERO Act (Help Every Returning Operative Act) and related legislation addressing deportation of U.S. military veterans. What are the current legislative status, key provisions, Congressional sponsors, and prospects for passage? Include related bills from the past three Congresses.`, prompt_es:`Analiza la Ley HERO (Help Every Returning Operative Act) y la legislación relacionada que aborda la deportación de veteranos militares estadounidenses. ¿Cuál es el estado legislativo actual, disposiciones clave, patrocinadores del Congreso y perspectivas de aprobación?`, required_sources:`Congress.gov; CRS; CHC legislative history`, guardrail:`Report legislative status factually; do not predict outcomes.`},
  {query_id:`Q014`, cluster:`literature_review`, use_case:`Comprehensive literature review`, intent:`Conduct systematic literature review on deported veterans topic`, prompt_en:`Conduct a systematic literature review on deported U.S. veterans. Identify the key scholarly works, policy reports, legal cases, and journalism covering the topic from 2000 to present. Organize by theme: legal/immigration, military service, public health, advocacy, and historical.`, prompt_es:`Realiza una revisión sistemática de la literatura sobre veteranos estadounidenses deportados. Identifica los principales trabajos académicos, informes de política, casos legales y periodismo que cubren el tema desde 2000 hasta el presente. Organiza por tema: legal/inmigración, servicio militar, salud pública, incidencia e histórico.`, required_sources:`OpenAlex; Semantic Scholar; eScholarship; JSTOR; HRW; ACLU`, guardrail:`Focus on published, verifiable sources; note publication dates and institutional affiliations.`},
  {query_id:`Q015`, cluster:`identity_context`, use_case:`Name variant and identity disambiguation`, intent:`Develop strategy for name-variant matching across U.S. and Mexico records`, prompt_en:`Develop a methodology for matching name variants of Mexican-nationality veterans across U.S. and Mexican record systems. Address: Spanish surname ordering (paternal/maternal), accented character normalization, anglicization patterns common in Vietnam-era military records, nickname use, and middle-name variation. Use only published identity-matching methodologies.`, prompt_es:`Desarrolla una metodología para hacer coincidir variantes de nombres de veteranos de nacionalidad mexicana en sistemas de registros de EE.UU. y México. Aborda: ordenación de apellidos españoles (paterno/materno), normalización de caracteres con acento, patrones de anglización comunes en registros militares de la era de Vietnam.`, required_sources:`Published record-linkage methodologies; NARA guidance`, guardrail:`Methodology use only; do not construct individual identity profiles.`},
  {query_id:`Q016`, cluster:`courts`, use_case:`Immigration court case analysis`, intent:`Map immigration court decisions affecting veterans`, prompt_en:`Using TRAC Immigration data and EOIR statistical releases, analyze immigration court case outcomes for veteran respondents. What are the removal order rates, grant rates, and representation levels for veterans? Identify any published BIA or circuit court decisions addressing veteran status as a factor in removal proceedings.`, prompt_es:`Usando datos de TRAC Immigration y estadísticas de EOIR, analiza los resultados de los casos de los tribunales de inmigración para respondientes veteranos. ¿Cuáles son las tasas de órdenes de remoción, tasas de concesión y niveles de representación para veteranos?`, required_sources:`TRAC Immigration; EOIR stats; BIA decisions; PACER`, guardrail:`Aggregate statistics only; specific cases only via published court records.`},
  {query_id:`Q017`, cluster:`case_support`, use_case:`Document recovery pathways`, intent:`Map document recovery pathways for deported veterans`, prompt_en:`Map the pathways for a deported veteran of Mexican nationality to recover critical U.S. documents: DD-214 (military discharge), VA eligibility records, Selective Service registration, naturalization denial/approval notices, and any immigration court records. For each document type, identify the request agency, form number, estimated timeline, and fee.`, prompt_es:`Traza las rutas para que un veterano deportado de nacionalidad mexicana recupere documentos críticos de EE.UU.: DD-214 (baja militar), registros de elegibilidad del VA, registro del Servicio Selectivo, avisos de negación/aprobación de naturalización y cualquier registro del tribunal de inmigración.`, required_sources:`NARA; VA; SSS; USCIS; EOIR`, guardrail:`Procedural guidance only; direct veterans to legal counsel for individual cases.`},
  {query_id:`Q018`, cluster:`monitoring`, use_case:`Deportation policy monitoring`, intent:`Monitor current deportation policy changes affecting veterans`, prompt_en:`Identify current (2024–2025) federal policy changes, executive orders, and agency guidance affecting the deportation of U.S. military veterans. Sources: Federal Register, DHS press releases, VA policy updates, and verified news reporting. Flag any changes to the Parole in Place program, veteran exemptions, or DHS enforcement priorities.`, prompt_es:`Identifica los cambios actuales (2024–2025) de política federal, órdenes ejecutivas y orientación de agencias que afectan la deportación de veteranos militares de EE.UU. Fuentes: Registro Federal, comunicados de prensa del DHS, actualizaciones de política del VA y noticias verificadas.`, required_sources:`Federal Register; DHS; VA policy; verified news`, guardrail:`Report policy changes factually; do not predict enforcement outcomes.`},
  {query_id:`Q019`, cluster:`reporting`, use_case:`CHC briefing package`, intent:`Build Congressional Hispanic Caucus briefing package on DCAS anomaly`, prompt_en:`Build a Congressional Hispanic Caucus briefing package on the DCAS Vietnam-era Hispanic casualty undercount anomaly. Structure: (1) verified statistical baseline, (2) methodology explanation, (3) policy gap identification, (4) archive request priorities, (5) legislative options. Use only verified, citable sources.`, prompt_es:`Elabora un paquete de presentación para el Caucus Hispano del Congreso sobre la anomalía del subconteo de bajas hispanas del DCAS en la era de Vietnam. Estructura: (1) base estadística verificada, (2) explicación metodológica, (3) identificación de brechas de política, (4) prioridades de solicitud de archivo, (5) opciones legislativas.`, required_sources:`DCAS official data; BISG/BIFSG; NARA; CHC records`, guardrail:`Use only verified, citable data; clearly label statistical estimates as estimates.`},
  {query_id:`Q020`, cluster:`requests`, use_case:`FOIA request drafting`, intent:`Draft FOIA requests for key agency records`, prompt_en:`Draft FOIA requests to: (1) VA for BIRLS records on Vietnam-era veterans with Spanish surnames, (2) DoD/DMDC for DCAS race/ethnicity classification methodology documentation, (3) ICE for ENFORCE database aggregate data on veterans removed 1996–present. Include statutory citations, fee waiver language, and expedited processing requests where applicable.`, prompt_es:`Redacta solicitudes FOIA a: (1) VA para registros BIRLS sobre veteranos de la era de Vietnam con apellidos hispanos, (2) DoD/DMDC para documentación sobre metodología de clasificación racial/étnica del DCAS, (3) ICE para datos agregados de la base de datos ENFORCE sobre veteranos removidos de 1996 al presente.`, required_sources:`5 USC §552; VA; DoD; ICE FOIA offices`, guardrail:`FOIA requests for public records only; do not request records requiring individual consent.`},
  {query_id:`Q021`, cluster:`qa`, use_case:`Source quality assessment`, intent:`QA check on cross-border research sources`, prompt_en:`Conduct a quality assessment of the following source types for cross-border deported veteran research: (1) official government statistical releases, (2) NGO case reports, (3) academic dissertations, (4) investigative journalism, (5) AI-generated summaries. For each, rate reliability, bias risk, verification steps, and appropriate citation level.`, prompt_es:`Realiza una evaluación de calidad de los siguientes tipos de fuentes para investigación transfronteriza sobre veteranos deportados: (1) publicaciones estadísticas oficiales del gobierno, (2) informes de casos de ONG, (3) disertaciones académicas, (4) periodismo de investigación, (5) resúmenes generados por IA.`, required_sources:`Published source quality frameworks`, guardrail:`Evaluate source types generally; do not dismiss individual sources without review.`},
  {query_id:`Q022`, cluster:`data_model`, use_case:`Data schema design`, intent:`Design a research data model for cross-border veteran research`, prompt_en:`Design a research data model for cross-border deported veteran research. Include tables for: source catalog, document store, entity registry (anonymized), case support layer (consent-gated), and event timeline. Define primary keys, foreign key relationships, and sensitivity tiers. Use only publicly documented schema patterns.`, prompt_es:`Diseña un modelo de datos de investigación para investigación transfronteriza sobre veteranos deportados. Incluye tablas para: catálogo de fuentes, repositorio de documentos, registro de entidades (anonimizado), capa de apoyo de casos (con consentimiento) y línea de tiempo de eventos.`, required_sources:`Published data modeling standards`, guardrail:`Schema design only; do not populate with real personal data without consent framework.`},
  {query_id:`Q023`, cluster:`pipeline`, use_case:`Ingestion pipeline design`, intent:`Design safe data ingestion pipeline for public records`, prompt_en:`Design a lawful public-records ingestion pipeline for the cross-border deported veteran research database. Cover: (1) source provenance screening, (2) sensitivity classification, (3) chunking and vectorization for bilingual search, (4) citation preservation, (5) refresh and deduplication logic. Align with the SPPS governance framework.`, prompt_es:`Diseña una tubería de ingestión de registros públicos legal para la base de datos de investigación transfronteriza sobre veteranos deportados. Cubre: (1) análisis de procedencia de fuentes, (2) clasificación de sensibilidad, (3) fragmentación y vectorización para búsqueda bilingüe, (4) preservación de citas, (5) lógica de actualización y deduplicación.`, required_sources:`Published pipeline architectures; SPPS framework`, guardrail:`Public records only; no gated or private content ingestion.`},
  {query_id:`Q024`, cluster:`governance`, use_case:`Privacy governance framework`, intent:`Develop privacy governance rules for research database`, prompt_en:`Develop a privacy governance framework for the cross-border deported veteran research database. Address: (1) direct identifier exclusion from core warehouse, (2) consent requirements for case-level data, (3) cross-border jurisdiction compliance, (4) data retention limits, (5) analyst access controls.`, prompt_es:`Desarrolla un marco de gobernanza de privacidad para la base de datos de investigación transfronteriza sobre veteranos deportados. Aborda: (1) exclusión de identificadores directos del almacén central, (2) requisitos de consentimiento para datos a nivel de caso, (3) cumplimiento de jurisdicción transfronteriza, (4) límites de retención de datos, (5) controles de acceso de analistas.`, required_sources:`Published privacy frameworks; GDPR/CCPA principles`, guardrail:`Framework design only; actual implementation requires legal review.`},
];

// ── Data: 90 Vocabulary Terms (sample key terms) ─────────────────────────────
const CB_VOCAB = [
  {term_id:`TERM_001`, cluster:`identity`, english_term:`deported veteran`, spanish_term:`veterano deportado`, aliases:`removed veteran; deported U.S. veteran`},
  {term_id:`TERM_002`, cluster:`identity`, english_term:`veteran`, spanish_term:`veterano`, aliases:`ex-servicemember; exmilitar`},
  {term_id:`TERM_003`, cluster:`identity`, english_term:`Mexican national`, spanish_term:`nacional mexicano`, aliases:`persona de nacionalidad mexicana`},
  {term_id:`TERM_004`, cluster:`identity`, english_term:`non-citizen veteran`, spanish_term:`veterano no ciudadano`, aliases:`lawful permanent resident veteran`},
  {term_id:`TERM_005`, cluster:`identity`, english_term:`lawful permanent resident`, spanish_term:`residente permanente legal`, aliases:`LPR; green card holder`},
  {term_id:`TERM_006`, cluster:`military`, english_term:`military service`, spanish_term:`servicio militar`, aliases:`armed forces service; U.S. military service`},
  {term_id:`TERM_007`, cluster:`military`, english_term:`DD-214`, spanish_term:`DD-214 (Certificado de baja)`, aliases:`certificate of release or discharge from active duty`},
  {term_id:`TERM_008`, cluster:`military`, english_term:`Vietnam era`, spanish_term:`era de Vietnam`, aliases:`Vietnam-era service; 1964–1975`},
  {term_id:`TERM_009`, cluster:`military`, english_term:`killed in action`, spanish_term:`muerto en acción`, aliases:`KIA; caído en combate`},
  {term_id:`TERM_010`, cluster:`military`, english_term:`DCAS`, spanish_term:`DCAS (Sistema de Análisis de Bajas de la Defensa)`, aliases:`Defense Casualty Analysis System`},
  {term_id:`TERM_011`, cluster:`immigration`, english_term:`deportation`, spanish_term:`deportación`, aliases:`removal; remoción forzada`},
  {term_id:`TERM_012`, cluster:`immigration`, english_term:`removal order`, spanish_term:`orden de remoción`, aliases:`order of deportation; final order of removal`},
  {term_id:`TERM_013`, cluster:`immigration`, english_term:`repatriation`, spanish_term:`repatriación`, aliases:`voluntary return; retorno`},
  {term_id:`TERM_014`, cluster:`immigration`, english_term:`Parole in Place`, spanish_term:`Libertad Condicional en el Lugar`, aliases:`PIP; military PIP`},
  {term_id:`TERM_015`, cluster:`immigration`, english_term:`INA §329`, spanish_term:`INA §329 (naturalización militar)`, aliases:`military naturalization; wartime naturalization`},
  {term_id:`TERM_016`, cluster:`benefits`, english_term:`VA benefits`, spanish_term:`beneficios del VA`, aliases:`veterans benefits; Department of Veterans Affairs benefits`},
  {term_id:`TERM_017`, cluster:`benefits`, english_term:`disability compensation`, spanish_term:`compensación por discapacidad`, aliases:`service-connected disability; compensación por servicio`},
  {term_id:`TERM_018`, cluster:`benefits`, english_term:`BIRLS`, spanish_term:`BIRLS (Beneficiary Identification Records Locator System)`, aliases:`VA BIRLS; beneficiary locator`},
  {term_id:`TERM_019`, cluster:`records`, english_term:`NPRC`, spanish_term:`NPRC (Centro Nacional de Registros de Personal)`, aliases:`National Personnel Records Center; St. Louis records`},
  {term_id:`TERM_020`, cluster:`records`, english_term:`service record`, spanish_term:`registro de servicio`, aliases:`military record; OMPF; Official Military Personnel File`},
  {term_id:`TERM_021`, cluster:`records`, english_term:`Selective Service registration`, spanish_term:`registro del Servicio Selectivo`, aliases:`draft card; SSS registration; RG 147`},
  {term_id:`TERM_022`, cluster:`records`, english_term:`FOIA`, spanish_term:`FOIA (Ley de Libertad de Información)`, aliases:`Freedom of Information Act; ley de transparencia`},
  {term_id:`TERM_023`, cluster:`geography_providers`, english_term:`Tijuana`, spanish_term:`Tijuana`, aliases:`Tijuana, B.C.; TIJ`},
  {term_id:`TERM_024`, cluster:`geography_providers`, english_term:`Nogales`, spanish_term:`Nogales`, aliases:`Nogales, Sonora; NOG`},
  {term_id:`TERM_025`, cluster:`geography_providers`, english_term:`Mexicali`, spanish_term:`Mexicali`, aliases:`Mexicali, B.C.; MEX`},
  {term_id:`TERM_026`, cluster:`geography_providers`, english_term:`Baja California`, spanish_term:`Baja California`, aliases:`B.C.; BC; Baja`},
  {term_id:`TERM_027`, cluster:`geography_providers`, english_term:`Sonora`, spanish_term:`Sonora`, aliases:`SON; estado de Sonora`},
  {term_id:`TERM_028`, cluster:`analytics_governance`, english_term:`BISG`, spanish_term:`BISG (estimación racial por apellido y geografía)`, aliases:`Bayesian Improved Surname Geocoding; race surname estimator`},
  {term_id:`TERM_029`, cluster:`analytics_governance`, english_term:`BIFSG`, spanish_term:`BIFSG`, aliases:`Bayesian Improved First Name Surname Geocoding`},
  {term_id:`TERM_030`, cluster:`analytics_governance`, english_term:`confidence level`, spanish_term:`nivel de confianza`, aliases:`reliability rating; evidence grade`},
];

// ── Data: 18 Field Providers ──────────────────────────────────────────────────
const CB_PROVIDERS = [
  {provider_id:`PR_TIJ_001`, city:`Tijuana`, state_region:`Baja California`, country:`Mexico`, provider_name:`Unified U.S. Deported Veterans Resource Center / Playas Barracks`, provider_type:`Veteran resource center`, url:`https://www.uusdepvets.org/`, veteran_specific:`Yes`, services_public_notes:`Legal matters, return-to-U.S. navigation, mental health care, employment, housing support, community reintegration.`, housing_signal:`Yes`, notes:`Primary veteran-focused public resource in Tijuana.`},
  {provider_id:`PR_TIJ_002`, city:`Tijuana`, state_region:`Baja California`, country:`Mexico`, provider_name:`Playas Barracks / About Us`, provider_type:`Veteran resource center`, url:`https://www.uusdepvets.org/about-us`, veteran_specific:`Yes`, services_public_notes:`Tijuana resource center for deported U.S. veterans; legal assistance, medical care, community.`, housing_signal:`Yes`, notes:`Use as primary veteran-specific Tijuana node.`},
  {provider_id:`PR_TIJ_003`, city:`Tijuana`, state_region:`Baja California`, country:`Mexico`, provider_name:`Support in Obtaining Documents`, provider_type:`Veteran support service`, url:`https://www.uusdepvets.org/support-in-obtaning-documents`, veteran_specific:`Yes`, services_public_notes:`Help obtaining identification and military documentation.`, housing_signal:`No/Support`, notes:`Records-recovery node.`},
  {provider_id:`PR_TIJ_004`, city:`Tijuana`, state_region:`Baja California`, country:`Mexico`, provider_name:`ImmDef — Deported Veterans`, provider_type:`Legal services`, url:`https://www.immdef.org/deported-veterans`, veteran_specific:`Yes`, services_public_notes:`Legal representation for deported veterans; return-to-U.S. applications.`, housing_signal:`No`, notes:`Public legal services for deported veterans.`},
  {provider_id:`PR_TIJ_005`, city:`Tijuana`, state_region:`Baja California`, country:`Mexico`, provider_name:`Desayunador Salesiano Padre Chava`, provider_type:`Shelter / food service`, url:`https://www.salesianostijuana.com/`, veteran_specific:`No`, services_public_notes:`Meals, shelter, social services for migrants and deportees.`, housing_signal:`Yes`, notes:`Known shelter for general deportee population including some veterans.`},
  {provider_id:`PR_TIJ_006`, city:`Tijuana`, state_region:`Baja California`, country:`Mexico`, provider_name:`Casa del Migrante Tijuana`, provider_type:`Shelter / migrant services`, url:`https://www.casadelmigrante.org/tijuana/`, veteran_specific:`No`, services_public_notes:`Emergency shelter, food, legal orientation, health services for migrants.`, housing_signal:`Yes`, notes:`General migrant shelter in Tijuana.`},
  {provider_id:`PR_TIJ_007`, city:`Tijuana`, state_region:`Baja California`, country:`Mexico`, provider_name:`HIAS Mexico — Tijuana`, provider_type:`Refugee and migrant legal services`, url:`https://www.hias.org/mexico`, veteran_specific:`No`, services_public_notes:`Legal services, psychosocial support, shelter referral.`, housing_signal:`No`, notes:`Legal aid for migrants including deportees.`},
  {provider_id:`PR_TIJ_008`, city:`Tijuana`, state_region:`Baja California`, country:`Mexico`, provider_name:`Al Otro Lado`, provider_type:`Legal clinic`, url:`https://alotrolado.org/`, veteran_specific:`No`, services_public_notes:`Immigration legal services, legal orientation at ports of entry, asylum assistance.`, housing_signal:`No`, notes:`Cross-border legal clinic serving Tijuana and San Diego.`},
  {provider_id:`PR_NOG_001`, city:`Nogales`, state_region:`Sonora`, country:`Mexico`, provider_name:`Kino Border Initiative`, provider_type:`Humanitarian services`, url:`https://www.kinoborderinitiative.org/`, veteran_specific:`No`, services_public_notes:`Meals, shelter, legal orientation, social services at Nogales crossing.`, housing_signal:`Yes`, notes:`Primary humanitarian resource at Nogales, Sonora / Nogales, AZ crossing.`},
  {provider_id:`PR_NOG_002`, city:`Nogales`, state_region:`Sonora`, country:`Mexico`, provider_name:`Centro de Atención al Migrante Exodus`, provider_type:`Migrant shelter`, url:`https://www.casadelmigrante.org/nogales/`, veteran_specific:`No`, services_public_notes:`Emergency shelter, legal orientation, health referral for deportees.`, housing_signal:`Yes`, notes:`Sonora migrant shelter network.`},
  {provider_id:`PR_NOG_003`, city:`Nogales`, state_region:`Sonora`, country:`Mexico`, provider_name:`Grupos Beta Sonora — Nogales`, provider_type:`Mexican government migrant assistance`, url:`https://www.gob.mx/inm/acciones-y-programas/grupos-beta`, veteran_specific:`No`, services_public_notes:`INM humanitarian assistance, protection for migrants and deportees.`, housing_signal:`No`, notes:`Official Mexico government migrant protection corps.`},
  {provider_id:`PR_MEX_001`, city:`Mexicali`, state_region:`Baja California`, country:`Mexico`, provider_name:`Derechos Humanos — Mexicali`, provider_type:`Human rights / legal`, url:`https://www.cndh.org.mx/sitio/mexicali`, veteran_specific:`No`, services_public_notes:`Human rights complaints, advocacy, legal guidance for deportees.`, housing_signal:`No`, notes:`CNDH Mexicali delegación for human rights support.`},
  {provider_id:`PR_MEX_002`, city:`Mexicali`, state_region:`Baja California`, country:`Mexico`, provider_name:`Casa del Migrante Mexicali`, provider_type:`Migrant shelter`, url:`https://www.casadelmigrante.org/mexicali/`, veteran_specific:`No`, services_public_notes:`Shelter, food, health services for migrants and deportees.`, housing_signal:`Yes`, notes:`Migrant shelter node in Mexicali.`},
  {provider_id:`PR_MEX_003`, city:`Mexicali`, state_region:`Baja California`, country:`Mexico`, provider_name:`Grupos Beta Baja California — Mexicali`, provider_type:`Mexican government migrant assistance`, url:`https://www.gob.mx/inm/acciones-y-programas/grupos-beta`, veteran_specific:`No`, services_public_notes:`INM humanitarian protection and assistance.`, housing_signal:`No`, notes:`Official Mexico government migrant protection; Mexicali node.`},
  {provider_id:`PR_MEX_004`, city:`Mexicali`, state_region:`Baja California`, country:`Mexico`, provider_name:`UABC Centro de Orientación Migratoria`, provider_type:`University / research support`, url:`https://www.uabc.mx/`, veteran_specific:`No`, services_public_notes:`Migration research, legal orientation, academic support for returnees.`, housing_signal:`No`, notes:`UABC migration research and orientation services.`},
  {provider_id:`PR_XB_001`, city:`Cross-border`, state_region:`CA/Baja California`, country:`Cross-border`, provider_name:`Border Angels`, provider_type:`Humanitarian / advocacy`, url:`https://www.borderangels.org/`, veteran_specific:`No`, services_public_notes:`Humanitarian aid, water stations, advocacy at U.S./Mexico border crossings.`, housing_signal:`No`, notes:`Cross-border humanitarian organization.`},
  {provider_id:`PR_XB_002`, city:`Cross-border`, state_region:`CA/Sonora/AZ`, country:`Cross-border`, provider_name:`Florence Project (Arizona)`, provider_type:`Legal services`, url:`https://firrp.org/`, veteran_specific:`No`, services_public_notes:`Immigration legal services for detained individuals in Arizona.`, housing_signal:`No`, notes:`Key resource for Arizona detention system; cross-border reach.`},
  {provider_id:`PR_XB_003`, city:`Cross-border`, state_region:`International`, country:`Cross-border`, provider_name:`American Friends Service Committee — Deported Veterans`, provider_type:`Advocacy / support`, url:`https://www.afsc.org/resource/afsc-deported-veterans-support`, veteran_specific:`Yes`, services_public_notes:`Advocacy, documentation support, community connection for deported veterans.`, housing_signal:`No`, notes:`Cross-border veteran advocacy organization.`},
];

// ── Data: 10 Risk Controls ────────────────────────────────────────────────────
const CB_RISKS = [
  {risk_id:`R01`, risk:`Privacy exposure through accidental identifier retention`, severity:`High`, likelihood:`Medium`, mitigation:`Keep direct identifiers out of the core warehouse; isolate any consent-based support data in restricted tables with minimization rules.`},
  {risk_id:`R02`, risk:`Cross-border misidentification from bilingual name variants`, severity:`High`, likelihood:`High`, mitigation:`Use confidence levels, require multi-source corroboration, and treat fuzzy matches as leads only.`},
  {risk_id:`R03`, risk:`Overreliance on public-safety registries as research shortcuts`, severity:`High`, likelihood:`Medium`, mitigation:`Query such systems on demand only, never as a cohort proxy, and document their limitations in analyst guidance.`},
  {risk_id:`R04`, risk:`Unsupported inference about PTSD, trauma, or mental state`, severity:`High`, likelihood:`High`, mitigation:`Prohibit behavioral or mental-health inference from public content; route any wellbeing concerns to licensed service referrals only.`},
  {risk_id:`R05`, risk:`Drift into private-platform or closed-group surveillance`, severity:`High`, likelihood:`High`, mitigation:`Restrict the project to official/public/open literature and public service directories.`},
  {risk_id:`R06`, risk:`Stale, moved, or removed official endpoints`, severity:`Medium`, likelihood:`High`, mitigation:`Run monthly refresh checks and diff reports; keep last-verified dates for each connector.`},
  {risk_id:`R07`, risk:`Translation drift and terminology inconsistency`, severity:`Medium`, likelihood:`Medium`, mitigation:`Use the controlled vocabulary and bilingual QA review for prompts and extracted metadata.`},
  {risk_id:`R08`, risk:`Jurisdictional inconsistency across U.S. states and Mexican states`, severity:`Medium`, likelihood:`High`, mitigation:`Use jurisdiction-specific discovery queues and document local caveats.`},
  {risk_id:`R09`, risk:`Provider-data staleness in fast-changing border environments`, severity:`Medium`, likelihood:`High`, mitigation:`Re-verify service providers regularly and mark uncertain statuses explicitly.`},
  {risk_id:`R10`, risk:`Mission creep from public-interest research into adverse decisioning`, severity:`High`, likelihood:`Medium`, mitigation:`Keep the scope limited to research, historical analysis, lawful record routing, and service referral support.`},
];

const TABS = [
  { id: 'connectors', label: `Connectors (${CB_CONNECTORS.length})` },
  { id: 'queries', label: `Research Prompts (${CB_QUERIES.length})` },
  { id: 'vocab', label: `Vocabulary (${CB_VOCAB.length})` },
  { id: 'providers', label: `Field Providers (${CB_PROVIDERS.length})` },
  { id: 'risks', label: 'Risk Controls' },
];

const RISK_COLOR = { High: P.red, Medium: P.gold, Low: '#22c55e' };
const RECORD_COLOR = { literature: '#818cf8', official_source: P.teal, service_provider: P.gold };
const COUNTRY_COLOR = { 'United States': '#3b82f6', 'Mexico': '#22c55e', 'Cross-border / international': P.gold };

export default function CrossBorderPhase1Panel() {
  const [activeTab, setActiveTab] = useState('connectors');
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterCluster, setFilterCluster] = useState('all');
  const [queryLang, setQueryLang] = useState('en');
  const [vocabCluster, setVocabCluster] = useState('all');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [runningQuery, setRunningQuery] = useState(null);

  const filteredConnectors = useMemo(() => {
    return CB_CONNECTORS.filter(c => {
      if (filterClass !== 'all' && c.record_class !== filterClass) return false;
      if (filterCountry !== 'all' && c.country !== filterCountry) return false;
      if (filterRisk !== 'all' && c.risk_level !== filterRisk) return false;
      if (search) {
        const q = search.toLowerCase();
        return (c.connector_name || '').toLowerCase().includes(q) ||
          (c.organization || '').toLowerCase().includes(q) ||
          (c.topic_cluster || '').toLowerCase().includes(q) ||
          (c.notes || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, filterClass, filterCountry, filterRisk]);

  const filteredQueries = useMemo(() => {
    return CB_QUERIES.filter(q => {
      if (filterCluster !== 'all' && q.cluster !== filterCluster) return false;
      if (search) {
        const s = search.toLowerCase();
        return (q.use_case || '').toLowerCase().includes(s) || (q.intent || '').toLowerCase().includes(s);
      }
      return true;
    });
  }, [search, filterCluster]);

  const filteredVocab = useMemo(() => {
    return CB_VOCAB.filter(v => {
      if (vocabCluster !== 'all' && v.cluster !== vocabCluster) return false;
      if (search) {
        const s = search.toLowerCase();
        return (v.english_term || '').toLowerCase().includes(s) || (v.spanish_term || '').toLowerCase().includes(s);
      }
      return true;
    });
  }, [search, vocabCluster]);

  const runQuery = async (q) => {
    setRunningQuery(q.query_id);
    setAiLoading(true);
    setAiResult('');
    const prompt = queryLang === 'es' ? q.prompt_es : q.prompt_en;
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Cross-Border Research Query [${q.query_id}]: ${q.use_case}\n\nRequired Sources: ${q.required_sources}\nGuardrail: ${q.guardrail}\n\n${prompt}`,
        system_prompt: `You are a specialized cross-border research analyst for the TruthEngine360 platform investigating deported U.S. military veterans of Mexican nationality. Your primary investigation context: DCAS Vietnam-era Hispanic casualty undercount (official 349 vs BIFSG estimate 3,272, 83.6% gap). Apply strict source standards: official archives, government databases, peer-reviewed research, and established NGOs only. Flag AI-generated content. Cite sources specifically. Never speculate about individual identities. Respect privacy guardrails.`,
        add_context_from_previous_messages: false,
      });
      setAiResult(typeof res === 'string' ? res : res?.text || JSON.stringify(res));
    } catch (e) {
      setAiResult(`Error: ${e.message}`);
    }
    setAiLoading(false);
    setRunningQuery(null);
  };

  const S = {
    wrap: { background: P.bg, minHeight: '100%', padding: '16px 20px', fontFamily: "'IBM Plex Mono', monospace", color: P.t1 },
    header: { background: `${P.navy}cc`, border: `1px solid ${P.gold}33`, borderRadius: 8, padding: '14px 18px', marginBottom: 16 },
    metrics: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginTop: 12 },
    metric: { background: `${P.blue}11`, border: `1px solid ${P.blue}44`, borderRadius: 6, padding: '8px 12px', textAlign: 'center' },
    tabs: { display: 'flex', gap: 4, marginBottom: 16, borderBottom: `1px solid ${P.b}`, paddingBottom: 4 },
    tab: (active) => ({ background: active ? `${P.gold}22` : 'transparent', border: `1px solid ${active ? P.gold : P.b}`, borderRadius: '4px 4px 0 0', padding: '6px 14px', cursor: 'pointer', color: active ? P.gold : P.t2, fontSize: 11 }),
    filters: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' },
    input: { background: `${P.navy}cc`, border: `1px solid ${P.b}`, borderRadius: 4, padding: '5px 10px', color: P.t1, fontSize: 12, outline: 'none' },
    select: { background: `${P.navy}cc`, border: `1px solid ${P.b}`, borderRadius: 4, padding: '5px 8px', color: P.t1, fontSize: 11 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
    th: { background: `${P.navy}dd`, color: P.gold, padding: '6px 8px', textAlign: 'left', borderBottom: `1px solid ${P.b}`, position: 'sticky', top: 0 },
    td: { padding: '5px 8px', borderBottom: `1px solid ${P.b}22`, verticalAlign: 'top', lineHeight: 1.4 },
    badge: (col) => ({ display: 'inline-block', background: `${col}22`, border: `1px solid ${col}55`, borderRadius: 3, padding: '1px 5px', fontSize: 10, color: col }),
    card: { background: `${P.navy}88`, border: `1px solid ${P.b}`, borderRadius: 6, padding: '12px 14px', marginBottom: 10 },
    aiBox: { background: '#0a1628', border: `1px solid ${P.teal}44`, borderRadius: 6, padding: 12, marginTop: 12, fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto', color: '#e2e8f0' },
  };

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: P.gold, fontSize: 13, fontWeight: 700 }}>CROSS-BORDER RESEARCH PHASE 1</div>
            <div style={{ color: P.t2, fontSize: 10, marginTop: 2 }}>Connector-ready package for deported U.S. military veterans of Mexican nationality</div>
          </div>
          <span style={S.badge(P.teal)}>GPT-5.4 RESEARCH PACKAGE</span>
        </div>
        <div style={S.metrics}>
          {[
            { label: 'Verified Connectors', val: '95' },
            { label: 'Discovery Queue', val: '816' },
            { label: 'Bilingual Prompts', val: '36' },
            { label: 'Vocab Terms', val: '90' },
            { label: 'Field Providers', val: '18' },
          ].map(m => (
            <div key={m.label} style={S.metric}>
              <div style={{ color: P.gold, fontSize: 16, fontWeight: 700 }}>{m.val}</div>
              <div style={{ color: P.t2, fontSize: 9 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {TABS.map(t => (
          <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => { setActiveTab(t.id); setSearch(''); }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search bar (shared) */}
      {activeTab !== 'risks' && (
        <div style={S.filters}>
          <input
            style={{ ...S.input, width: 260 }}
            placeholder={`Search ${activeTab}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {activeTab === 'connectors' && <>
            <select style={S.select} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
              <option value="all">All classes</option>
              <option value="official_source">Official Source</option>
              <option value="literature">Literature</option>
              <option value="service_provider">Service Provider</option>
            </select>
            <select style={S.select} value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
              <option value="all">All countries</option>
              <option value="United States">United States</option>
              <option value="Mexico">Mexico</option>
              <option value="Cross-border / international">Cross-border</option>
            </select>
            <select style={S.select} value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
              <option value="all">All risk levels</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
            </select>
          </>}
          {activeTab === 'queries' && <>
            <select style={S.select} value={filterCluster} onChange={e => setFilterCluster(e.target.value)}>
              <option value="all">All clusters</option>
              {[...new Set(CB_QUERIES.map(q => q.cluster))].sort().map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              style={{ ...S.select, background: queryLang === 'en' ? `${P.blue}33` : `${P.teal}33`, cursor: 'pointer' }}
              onClick={() => setQueryLang(l => l === 'en' ? 'es' : 'en')}
            >
              {queryLang === 'en' ? 'EN' : 'ES'} ↔
            </button>
          </>}
          {activeTab === 'vocab' && (
            <select style={S.select} value={vocabCluster} onChange={e => setVocabCluster(e.target.value)}>
              <option value="all">All clusters</option>
              {[...new Set(CB_VOCAB.map(v => v.cluster))].sort().map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
          <span style={{ color: P.t3, fontSize: 10, marginLeft: 'auto' }}>
            {activeTab === 'connectors' && `${filteredConnectors.length} / ${CB_CONNECTORS.length}`}
            {activeTab === 'queries' && `${filteredQueries.length} / ${CB_QUERIES.length}`}
            {activeTab === 'vocab' && `${filteredVocab.length} / ${CB_VOCAB.length}`}
          </span>
        </div>
      )}

      {/* ── Connectors Tab ─────────────────────────────── */}
      {activeTab === 'connectors' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['ID', 'Class', 'Country', 'Organization', 'Source / Connector', 'Access', 'Topic', 'Risk', 'Notes'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredConnectors.map(c => (
                <tr key={c.connector_id} style={{ background: 'transparent' }}>
                  <td style={S.td}><span style={{ color: P.t3, fontSize: 10 }}>{c.connector_id}</span></td>
                  <td style={S.td}><span style={S.badge(RECORD_COLOR[c.record_class] || P.t2)}>{c.record_class?.replace('_', ' ')}</span></td>
                  <td style={S.td}><span style={{ color: COUNTRY_COLOR[c.country] || P.t2, fontSize: 10 }}>{c.country?.split(' ')[0]}</span></td>
                  <td style={S.td}><span style={{ color: P.t1, fontSize: 11 }}>{c.organization}</span></td>
                  <td style={S.td}>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ color: P.teal, fontSize: 11 }}>
                        {c.connector_name}
                      </a>
                    ) : (
                      <span style={{ fontSize: 11 }}>{c.connector_name}</span>
                    )}
                  </td>
                  <td style={S.td}><span style={{ color: P.t2, fontSize: 10 }}>{c.access_mode}</span></td>
                  <td style={S.td}><span style={{ color: P.t3, fontSize: 10 }}>{c.topic_cluster}</span></td>
                  <td style={S.td}><span style={S.badge(RISK_COLOR[c.risk_level] || P.t2)}>{c.risk_level}</span></td>
                  <td style={{ ...S.td, maxWidth: 200 }}><span style={{ color: P.t2, fontSize: 10 }}>{c.notes}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Research Prompts Tab ────────────────────────── */}
      {activeTab === 'queries' && (
        <div>
          {aiResult && (
            <div style={S.aiBox}>
              <div style={{ color: P.teal, fontSize: 10, marginBottom: 6 }}>── AI RESEARCH RESPONSE ──</div>
              {aiResult}
            </div>
          )}
          {filteredQueries.map(q => (
            <div key={q.query_id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <span style={{ color: P.gold, fontSize: 11, fontWeight: 700 }}>{q.query_id}</span>
                  <span style={{ ...S.badge(P.blue), marginLeft: 8 }}>{q.cluster}</span>
                </div>
                <button
                  onClick={() => runQuery(q)}
                  disabled={aiLoading}
                  style={{
                    background: runningQuery === q.query_id ? `${P.teal}33` : `${P.blue}22`,
                    border: `1px solid ${P.blue}`,
                    borderRadius: 4, padding: '3px 10px', color: P.teal, fontSize: 10, cursor: 'pointer',
                  }}
                >
                  {runningQuery === q.query_id ? '⟳ Running…' : `▶ Run (${queryLang.toUpperCase()})`}
                </button>
              </div>
              <div style={{ color: P.t1, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{q.use_case}</div>
              <div style={{ color: P.t2, fontSize: 11, marginBottom: 8 }}>{q.intent}</div>
              <div style={{
                background: '#0a1628', borderRadius: 4, padding: '8px 10px',
                fontSize: 11, color: '#cbd5e1', lineHeight: 1.5,
              }}>
                {queryLang === 'en' ? q.prompt_en : q.prompt_es}
              </div>
              {q.required_sources && (
                <div style={{ marginTop: 6, color: P.t3, fontSize: 10 }}>
                  <span style={{ color: P.gold }}>Required: </span>{q.required_sources}
                </div>
              )}
              {q.guardrail && (
                <div style={{ marginTop: 3, color: P.red, fontSize: 10 }}>
                  <span style={{ fontWeight: 700 }}>⚠ </span>{q.guardrail}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Vocabulary Tab ─────────────────────────────── */}
      {activeTab === 'vocab' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['ID', 'Cluster', 'English Term', 'Spanish Term', 'Aliases'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVocab.map(v => (
                <tr key={v.term_id}>
                  <td style={S.td}><span style={{ color: P.t3, fontSize: 10 }}>{v.term_id}</span></td>
                  <td style={S.td}><span style={S.badge(P.blue)}>{v.cluster}</span></td>
                  <td style={S.td}><strong style={{ color: P.t1, fontSize: 11 }}>{v.english_term}</strong></td>
                  <td style={S.td}><span style={{ color: P.teal, fontSize: 11 }}>{v.spanish_term}</span></td>
                  <td style={S.td}><span style={{ color: P.t3, fontSize: 10 }}>{v.aliases}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Field Providers Tab ────────────────────────── */}
      {activeTab === 'providers' && (
        <div>
          {['Tijuana', 'Nogales', 'Mexicali', 'Cross-border'].map(city => {
            const cityProviders = CB_PROVIDERS.filter(p => p.city === city);
            if (!cityProviders.length) return null;
            return (
              <div key={city}>
                <div style={{ color: P.gold, fontSize: 12, fontWeight: 700, margin: '14px 0 8px', borderBottom: `1px solid ${P.gold}33`, paddingBottom: 4 }}>
                  {city} ({cityProviders.length} providers)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 8 }}>
                  {cityProviders.map(p => (
                    <div key={p.provider_id} style={S.card}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: P.t3, fontSize: 10 }}>{p.provider_id}</span>
                        {p.veteran_specific === 'Yes' && <span style={S.badge(P.gold)}>VETERAN-SPECIFIC</span>}
                        {p.housing_signal === 'Yes' && <span style={S.badge(P.teal)}>HOUSING</span>}
                      </div>
                      <div style={{ color: P.t1, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: P.teal }}>{p.provider_name}</a>
                        ) : p.provider_name}
                      </div>
                      <div style={{ color: P.blue, fontSize: 10, marginBottom: 4 }}>{p.provider_type}</div>
                      <div style={{ color: P.t2, fontSize: 11 }}>{p.services_public_notes}</div>
                      {p.notes && <div style={{ color: P.t3, fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>{p.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Risk Controls Tab ──────────────────────────── */}
      {activeTab === 'risks' && (
        <div>
          <div style={{ color: P.t2, fontSize: 11, marginBottom: 12 }}>
            Project risk controls to keep research lawful, accurate, and defensible. All 10 risks are currently <span style={{ color: P.gold }}>Open</span> — requiring active monitoring.
          </div>
          {CB_RISKS.map(r => (
            <div key={r.risk_id} style={{ ...S.card, borderLeft: `3px solid ${RISK_COLOR[r.severity]}` }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <span style={{ color: P.t3, fontSize: 10 }}>{r.risk_id}</span>
                <span style={S.badge(RISK_COLOR[r.severity])}>{r.severity}</span>
                <span style={{ color: P.t3, fontSize: 10 }}>Likelihood: {r.likelihood}</span>
              </div>
              <div style={{ color: P.t1, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{r.risk}</div>
              <div style={{ color: P.t2, fontSize: 11 }}>
                <span style={{ color: P.teal }}>Mitigation: </span>{r.mitigation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
