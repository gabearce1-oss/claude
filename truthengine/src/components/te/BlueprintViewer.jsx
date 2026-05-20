import { useState } from "react";
import { P } from "../../lib/teData";

const GOVERNANCE_TAXONOMY = [
  { cls:"OPEN_PUBLIC_LOW_RISK",    meaning:"Official open data, catalog metadata, statistics, archival descriptions",         examples:"NARA Catalog API, LOC JSON, Census, BLS, INEGI, datos.gob.mx",          action:"Bulk/API ingest allowed",          color:"#2DD4BF" },
  { cls:"OPEN_PUBLIC_MEDIUM_RISK", meaning:"Public but may contain quasi-identifiers, case details, or operational sensitivity", examples:"FOIA portal metadata, EOIR court stats, USCIS adjudication, VA summaries",   action:"Ingest with row/field redaction",   color:"#F5B942" },
  { cls:"OPEN_PUBLIC_HIGH_RISK",   meaning:"Public but legally sensitive, stigmatizing, or easy to misuse",                   examples:"PACER docket data, NSOPW, some ICE enforcement, shelter directories",       action:"Metadata-only or analyst-gated",   color:"#ff7700" },
  { cls:"RESTRICTED_MANUAL",       meaning:"Access exists, but fees, licensing, authentication prevent bulk automation",       examples:"PACER document pulls, ProQuest, JSTOR, non-archival OMPF requests",        action:"Manual request lane only",         color:"#9D7BFF" },
  { cls:"PROHIBITED",              meaning:"Data collection method or use is out of scope",                                    examples:"WhatsApp group scraping, private Facebook, DMs, face recognition, mental-health inference", action:"Do not build",   color:"#ff0055" },
];

const TOP_100 = [
  { n:1,  name:"NARA Catalog API",                cls:"OA",  url:"https://catalog.archives.gov/api/v1/" },
  { n:2,  name:"NARA veterans service records",   cls:"MR",  url:"https://www.archives.gov/veterans" },
  { n:3,  name:"NARA OMPF archival holdings",     cls:"MR",  url:"https://www.archives.gov/st-louis/military-personnel-archival" },
  { n:4,  name:"LOC loc.gov JSON/YAML API",       cls:"OA",  url:"https://www.loc.gov/apis/json-and-yaml/" },
  { n:5,  name:"LOC Chronicling America",         cls:"OA",  url:"https://www.loc.gov/apis/" },
  { n:6,  name:"LOC Linked Data Service",         cls:"OA",  url:"https://id.loc.gov/" },
  { n:7,  name:"LOC Text Services",               cls:"OA",  url:"https://www.loc.gov/apis/micro-services/text-services/" },
  { n:8,  name:"LOC Image Services",              cls:"OA",  url:"https://www.loc.gov/apis/micro-services/image-services/" },
  { n:9,  name:"LOC SRU",                         cls:"OA",  url:"https://www.loc.gov/standards/sru/" },
  { n:10, name:"Veterans History Project",        cls:"PSP", url:"https://www.loc.gov/programs/veterans-history-project/explore-the-collections/" },
  { n:11, name:"Congress.gov API",                cls:"OA",  url:"https://api.congress.gov/" },
  { n:12, name:"Census Data API",                 cls:"OA",  url:"https://api.census.gov/data.html" },
  { n:13, name:"Census Microdata API",            cls:"OA",  url:"https://api.census.gov/data.html" },
  { n:14, name:"BLS Public Data API",             cls:"OA",  url:"https://api.bls.gov/publicAPI/v2/" },
  { n:15, name:"USAspending API",                 cls:"OA",  url:"https://api.usaspending.gov/" },
  { n:16, name:"Data.gov Catalog API",            cls:"CM",  url:"https://catalog.data.gov" },
  { n:17, name:"api.data.gov gateway",            cls:"OA",  url:"https://api.data.gov/" },
  { n:18, name:"FOIA.gov public API",             cls:"OA",  url:"https://api.foia.gov/" },
  { n:19, name:"GovInfo API/Bulk",                cls:"BD",  url:"https://www.govinfo.gov/" },
  { n:20, name:"Federal Register API",            cls:"OA",  url:"https://www.federalregister.gov/api/v1/" },
  { n:21, name:"PACER service",                   cls:"MR",  url:"https://pacer.uscourts.gov/" },
  { n:22, name:"NSOPW",                           cls:"PSP", url:"https://www.nsopw.gov/" },
  { n:23, name:"ICE statistics/reports",          cls:"PSP", url:"https://www.ice.gov/statistics" },
  { n:24, name:"DHS OHSS immigration yearbook",   cls:"PSP", url:"https://ohss.dhs.gov/topics/immigration/yearbook" },
  { n:25, name:"DHS OHSS monthly enforcement",    cls:"PSP", url:"https://ohss.dhs.gov/topics/immigration/immigration-enforcement/monthly-tables" },
  { n:26, name:"USCIS immigration/citizenship data",cls:"PSP",url:"https://www.uscis.gov/tools/reports-and-studies/immigration-and-citizenship-data" },
  { n:27, name:"USCIS refugee processing data",   cls:"PSP", url:"https://www.uscis.gov/tools/reports-and-studies/refugee-processing-data" },
  { n:28, name:"CBP Public Data Portal",          cls:"PSP", url:"https://www.cbp.gov/newsroom/stats/cbp-public-data-portal" },
  { n:29, name:"CBP border enforcement statistics",cls:"PSP",url:"https://www.cbp.gov/newsroom/stats/nationwide-encounters" },
  { n:30, name:"EOIR statistics/report portal",   cls:"PSP", url:"https://www.justice.gov/eoir/statistics-and-reports" },
  { n:31, name:"EOIR workload/adjudication stats", cls:"PSP",url:"https://www.justice.gov/eoir/workload-and-adjudication-statistics" },
  { n:32, name:"VA NCVAS portal",                 cls:"PSP", url:"https://www.va.gov/vetdata/" },
  { n:33, name:"VA open data catalog",            cls:"PSP", url:"https://www.data.va.gov/" },
  { n:34, name:"DoD Public Data Listing",         cls:"BD",  url:"https://data.defense.gov/Public-Data-Listing/" },
  { n:35, name:"DoD Historical Office sources",   cls:"PSP", url:"https://history.defense.gov/" },
  { n:36, name:"Selective Service System",        cls:"MR",  url:"https://www.sss.gov/" },
  { n:37, name:"California Open Data",            cls:"PSP", url:"https://data.ca.gov/" },
  { n:38, name:"California State Geoportal",      cls:"PSP", url:"https://gis.data.ca.gov/" },
  { n:39, name:"Texas Open Data Portal",          cls:"PSP", url:"https://data.texas.gov/" },
  { n:40, name:"Arizona ADHS data portal",        cls:"PSP", url:"https://data.azdhs.gov/" },
  { n:41, name:"AZGeo Data hub",                  cls:"PSP", url:"https://azgeo-open-data-agic.hub.arcgis.com/" },
  { n:42, name:"OpenBooks Arizona",               cls:"PSP", url:"https://openbooks.az.gov/" },
  { n:43, name:"New Mexico Bureau of Geology",    cls:"PSP", url:"https://geoinfo.nmt.edu/" },
  { n:44, name:"Bernalillo County records/GIS",   cls:"PSP", url:"https://www.bernco.gov/" },
  { n:45, name:"San Diego Open Data",             cls:"PSP", url:"https://data.sandiego.gov/" },
  { n:46, name:"Los Angeles County Open Data",    cls:"PSP", url:"https://data.lacounty.gov/" },
  { n:47, name:"Phoenix Open Data",               cls:"PSP", url:"https://www.phoenixopendata.com/" },
  { n:48, name:"Tucson Open Data",                cls:"PSP", url:"https://gisdata.tucsonaz.gov/" },
  { n:49, name:"Open Data SA (San Antonio)",      cls:"PSP", url:"https://data.sanantonio.gov/" },
  { n:50, name:"Austin Open Data",                cls:"PSP", url:"https://data.austintexas.gov/" },
  { n:51, name:"Houston Open Data",               cls:"PSP", url:"https://data.houstontx.gov/" },
  { n:52, name:"El Paso Open Data",               cls:"PSP", url:"https://opendata.elpasotexas.gov/" },
  { n:53, name:"Austin asset inventory",          cls:"PSP", url:"https://data.austintexas.gov/stories/s/Open-Data-Asset-Inventory-Dashboard/f7dy-dbwi/" },
  { n:54, name:"San Antonio elections group",     cls:"PSP", url:"https://data.sanantonio.gov/group/elections-and-elected-officials" },
  { n:55, name:"INE Datos Abiertos",              cls:"PSP", url:"https://www.ine.mx/transparencia/datos-abiertos/" },
  { n:56, name:"INE conteos censales 2009-2024",  cls:"PSP", url:"https://www.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/" },
  { n:57, name:"INE cartografía electoral",       cls:"PSP", url:"https://cartografia.ine.mx/" },
  { n:58, name:"datos.gob.mx",                    cls:"CM",  url:"https://www.datos.gob.mx/" },
  { n:59, name:"Plataforma Nacional de Transparencia", cls:"PSP", url:"https://www.plataformadetransparencia.org.mx/" },
  { n:60, name:"PNT Consulta Pública",            cls:"PSP", url:"https://consultapublicamx.plataformadetransparencia.org.mx/vut-web/" },
  { n:61, name:"PNT datos abiertos",              cls:"PSP", url:"https://www.plataformadetransparencia.org.mx/datos-abiertos" },
  { n:62, name:"INEGI Indicators API",            cls:"OA",  url:"https://www.inegi.org.mx/servicios/api_indicadores.html" },
  { n:63, name:"Gobierno Abierto Baja California",cls:"PSP", url:"https://gobiernoabierto.bajacalifornia.gob.mx/" },
  { n:64, name:"Baja California budget open data",cls:"BD",  url:"https://www.bajacalifornia.gob.mx/monitorBC/TransparenciaPresupuestaria/PptoEgresosDA25" },
  { n:65, name:"Gobierno de Baja California portal",cls:"PSP",url:"https://www.bajacalifornia.gob.mx/" },
  { n:66, name:"Tijuana municipal portal",        cls:"PSP", url:"https://www.tijuana.gob.mx/" },
  { n:67, name:"Tijuana transparency portal",     cls:"PSP", url:"https://transparencia.tijuana.gob.mx/" },
  { n:68, name:"Tijuana migrant and refugee guide",cls:"BD", url:"https://www.tijuana.gob.mx/dependencias/SEDEBI/DMAM/GuiaParaPersonasMigrantesyRefugiadosenTijuana.pdf" },
  { n:69, name:"Mexicali transparency",           cls:"PSP", url:"https://www.mexicali.gob.mx/transparencia/" },
  { n:70, name:"Sonora transparency portal",      cls:"PSP", url:"https://transparencia.sonora.gob.mx/" },
  { n:71, name:"Sonora state portal/open-data",   cls:"PSP", url:"https://www.sonora.gob.mx/" },
  { n:72, name:"COMAR portal",                    cls:"PSP", url:"https://www.gob.mx/comar" },
  { n:73, name:"OMI shelter directory",           cls:"PSP", url:"https://omi.gob.mx/es/OMI/ApMMX" },
  { n:74, name:"CNDH migrant rights portal",      cls:"PSP", url:"https://www.cndh.org.mx/introduccion-atencion-a-migrantes" },
  { n:75, name:"CNDH estancias migratorias report",cls:"PSP",url:"https://www.cndh.org.mx/sites/default/files/documentos/2024-02/INFORME%20ESPECIAL%20ESTANCIAS%20MIGRATORIAS.pdf" },
  { n:76, name:"CNDH MPP report",                 cls:"PSP", url:"https://www.cndh.org.mx/documento/informe-especial-sobre-los-protocolos-de-proteccion-migrantes-mpp-programa-quedate-en" },
  { n:77, name:"AGN Repositorio Documental Digital",cls:"PSP",url:"https://repositorio.agn.gob.mx/" },
  { n:78, name:"AGN Guía General",                cls:"PSP", url:"https://guiageneral.agn.gob.mx/" },
  { n:79, name:"AGN SIGBIC",                      cls:"PSP", url:"https://biblioteca.agn.gob.mx/" },
  { n:80, name:"UABC institutional repository",   cls:"PSP", url:"https://repositorioinstitucional.uabc.mx/" },
  { n:81, name:"UABC DSpace browse/full metadata",cls:"PSP", url:"https://repositorioinstitucional.uabc.mx/handle/20.500.12930/3/browse?type=author" },
  { n:82, name:"El Colef repository",             cls:"PSP", url:"https://colef.repositorioinstitucional.mx/jspui?locale=es" },
  { n:83, name:"El Colef theses",                 cls:"PSP", url:"https://posgrado.colef.mx/tesis/" },
  { n:84, name:"UNAM institutional repository",   cls:"PSP", url:"https://repositorio.unam.mx/" },
  { n:85, name:"UNAM DGBSDI repository",          cls:"PSP", url:"https://ru.dgb.unam.mx/" },
  { n:86, name:"HNDM",                            cls:"PSP", url:"https://hndm.iib.unam.mx/" },
  { n:87, name:"Biblioteca Nacional de México",   cls:"PSP", url:"https://bnm.iib.unam.mx/" },
  { n:88, name:"Repositorio Nacional MX",         cls:"PSP", url:"https://biblioteca.colef.mx/basededatos/repositorio-nacional/" },
  { n:89, name:"RAND research reports",           cls:"PSP", url:"https://www.rand.org/pubs.html" },
  { n:90, name:"Pew datasets",                    cls:"PSP", url:"https://www.pewresearch.org/download-datasets/" },
  { n:91, name:"Crossref REST API",               cls:"OA",  url:"https://api.crossref.org/" },
  { n:92, name:"OpenAlex API",                    cls:"OA",  url:"https://api.openalex.org/" },
  { n:93, name:"OpenAlex snapshot/CLI",           cls:"BD",  url:"https://openalex.org/" },
  { n:94, name:"ORCID Public API",                cls:"OA",  url:"https://orcid.org/" },
  { n:95, name:"ROR API",                         cls:"OA",  url:"https://api.ror.org/organizations" },
  { n:96, name:"DataCite GraphQL API",            cls:"OA",  url:"https://api.datacite.org/graphql" },
  { n:97, name:"ProQuest Dissertations & Theses", cls:"MR",  url:"https://about.proquest.com/en/products-services/pqdtglobal/" },
  { n:98, name:"JSTOR content access",            cls:"MR",  url:"https://about.jstor.org/" },
  { n:99, name:"IOM human mobility/publications", cls:"PSP", url:"https://publications.iom.int/" },
  { n:100,name:"UNHCR Mexico public docs",        cls:"PSP", url:"https://www.unhcr.org/mx/" },
];

const SCORED_TOP20 = [
  { rank:1,  source:"NARA Catalog API",          score:94, why:"Archival authority, machine-readable, broad historical depth" },
  { rank:2,  source:"LOC loc.gov JSON",           score:92, why:"Rich metadata, high-quality collections, low friction" },
  { rank:3,  source:"Congress.gov API",           score:90, why:"Strong provenance, machine-readable legislative trace" },
  { rank:4,  source:"Census Data API",            score:89, why:"Essential demographic baselines and geography" },
  { rank:5,  source:"INEGI Indicators API",       score:88, why:"Mexico-side statistical authority with geographic granularity" },
  { rank:6,  source:"Data.gov Catalog API",       score:87, why:"Discovery supernode for many U.S. families" },
  { rank:7,  source:"INE Datos Abiertos",         score:86, why:"Electoral and demographic context on the Mexico side" },
  { rank:8,  source:"USAspending API",            score:85, why:"Budget and program-link context" },
  { rank:9,  source:"BLS API",                   score:84, why:"Long-run labor context for veteran reintegration analysis" },
  { rank:10, source:"DHS OHSS Yearbook",          score:83, why:"Core immigration reference series" },
  { rank:11, source:"FOIA.gov API",               score:82, why:"Discovery for transparency and request-channel analysis" },
  { rank:12, source:"CBP Public Data Portal",     score:81, why:"Border-flow and encounter context" },
  { rank:13, source:"USCIS data portal",          score:80, why:"Adjudication and refugee process context" },
  { rank:14, source:"EOIR statistics",            score:79, why:"Immigration court trend context" },
  { rank:15, source:"AGN RDD",                   score:78, why:"Mexico archival depth" },
  { rank:16, source:"PNT",                       score:77, why:"Institution-level transparency discovery" },
  { rank:17, source:"VA NCVAS",                  score:76, why:"Veteran population and benefit context" },
  { rank:18, source:"UABC repository",            score:75, why:"Border-region scholarship and local dissertations" },
  { rank:19, source:"Crossref API",               score:74, why:"Scholarly metadata backbone" },
  { rank:20, source:"OpenAlex",                  score:73, why:"Excellent breadth, but source heterogeneity reduces rank slightly" },
];

const CRAWLER_CLASSES = [
  { cls:"api_crawler",               supports:["REST","GraphQL","JSON","XML"],                                  use_for:["nara","loc","congress","census","bls","usaspending","inegi","crossref","openalex"] },
  { cls:"bulk_downloader",           supports:["CSV","XLS","ZIP","JSONL","PDF batches"],                        use_for:["govinfo","dod_public_data","openalex_snapshot","state_portal_exports"] },
  { cls:"ckan_catalog_crawler",      supports:["dataset metadata","org lists","package discovery"],             use_for:["data_gov","some state portals","some Mexico portals"] },
  { cls:"socrata_odata_crawler",     supports:["OData","CSV export","view metadata"],                           use_for:["texas","austin","la_county","houston"] },
  { cls:"arcgis_hub_crawler",        supports:["feature services","item metadata","shapefiles"],                use_for:["azgeo","tucson","el_paso","many local GIS hubs"] },
  { cls:"dspace_repository_crawler", supports:["item pages","bitstreams","metadata pages"],                     use_for:["uabc","colef","many university repositories"] },
  { cls:"report_library_crawler",    supports:["html indexes","pdf series","date extraction"],                  use_for:["cndh","eoir","ohss","rand","pew","iom"] },
  { cls:"search_portal_crawler",     supports:["public query pages","result paging","metadata-only capture"],   use_for:["pnt","agn","hndm","nsopw metadata","pacer metadata lane"] },
  { cls:"browser_fallback_crawler",  supports:["403-aware discovery","headless fetch","screenshot-verified metadata"], use_for:["ice","some dhs pages","brittle portals"] },
];

const ETL_CLUSTERS = [
  { name:"Discovery",                 def:"Find candidate records and deltas from source families",                    algo:"sitemap diff, catalog pagination, RSS polling, cursor paging, link extraction",   output:"fetch handles",           color:"#4A9EFF" },
  { name:"Acquisition",              def:"Retrieve raw objects lawfully and reproducibly",                              algo:"API clients, bulk downloader, headless browser fallback, retry/backoff",          output:"immutable raw objects",   color:"#2DD4BF" },
  { name:"Structural normalization", def:"Parse formats into stable record shapes",                                     algo:"JSON/XML parsers, PDF text extraction, schema mappers, date parsing",             output:"normalized records",      color:"#9D7BFF" },
  { name:"Language & entity processing",def:"Preserve original language, generate bilingual indexable text, extract entity candidates", algo:"language ID, sentence alignment, translation memory, NER + regex", output:"translation units, candidate entities", color:"#F5B942" },
  { name:"Evidence synthesis",       def:"Convert records into atomic claims and connect them to snippets",             algo:"claim templates, relation extraction, confidence scoring",                         output:"claims, claim-evidence links", color:"#ff7700" },
  { name:"Governance & publication", def:"Detect conflicts, route review, redact, aggregate, publish",                 algo:"contradiction rules, review queue, k-anonymity checks, export filters",           output:"analyst-reviewed outputs",color:"#00cc88" },
];

const ROADMAP_PHASES = [
  { phase:"Foundation",          duration:"6 weeks",   pm:8,  deliverables:"source registry, schema, policy matrix, repo bootstrap, CI, n8n contract" },
  { phase:"Tier-one ingestion",  duration:"10 weeks",  pm:14, deliverables:"connectors for NARA, LOC, Congress, Census, BLS, USAspending, FOIA, INEGI, INE; object storage; raw capture" },
  { phase:"Evidence and search", duration:"10 weeks",  pm:18, deliverables:"normalization, claim extraction, citation engine, OpenSearch, pgvector, graph sync" },
  { phase:"Governance & analyst UX", duration:"8 weeks", pm:12, deliverables:"contradiction review, redaction, analyst UI, report templates, aggregate social module" },
  { phase:"Hardening & release", duration:"8 weeks",   pm:10, deliverables:"monitoring, load tests, security review, disaster recovery, documentation, training" },
];

const EXPANSION_FAMILIES = [
  { domain:"U.S. Federal",       target:165, clusters:["archives_and_memory: 22","legislative_and_regulatory: 18","demographics_and_labor: 22","immigration_and_border: 24","veterans_and_defense: 26","justice_and_courts: 20","spending_procurement_foia: 18","maps_geospatial: 15"], color:"#4A9EFF" },
  { domain:"U.S. State/Local",   target:210, clusters:["border_states_state_portals: 32","city_county_portals: 68","court_transparency_systems: 42","local_archives_libraries: 28","health_public_safety_dashboards: 22","geospatial_hubs: 18"], color:"#2DD4BF" },
  { domain:"Mexico Federal",     target:92,  clusters:["national_open_data_transparency: 20","electoral_and_cartographic: 14","statistics_and_geography: 16","migration_refugee_human_rights: 18","national_archives_libraries: 14","official_journals_normative: 10"], color:"#F5B942" },
  { domain:"Mexico State/Municipal",target:118,clusters:["baja_california: 34","sonora: 28","chihuahua: 12","tamaulipas: 12","cdmx_national_support: 16","municipal_transparency_gazettes: 16"], color:"#ff7700" },
  { domain:"Academic & Scholarly",target:84, clusters:["mexico_institutional_repositories: 28","us_institutional_repositories: 16","dissertations_and_theses: 14","open_scholarly_indexes: 10","think_tanks_policy_centers: 8","subject_specific_archives: 8"], color:"#9D7BFF" },
  { domain:"NGO / Media / Archives",target:73,clusters:["intergovernmental_mobility_sources: 16","human_rights_legal_aid_orgs: 18","shelter_directories_org_level: 12","regional_newspaper_archives: 15","investigative_nonprofit_repos: 12"], color:"#ff5500" },
];

const HIGH_RISK_HANDLING = [
  { type:"Restraining orders",        rule:"Fragmented/manual-or-restricted; no national-person crawl",                         rationale:"High misuse risk; court fragmentation; legal sensitivity" },
  { type:"Sex-offender registries",   rule:"Metadata-only, policy context only, no entity resolution",                          rationale:"Stigmatizing public data, high misuse potential" },
  { type:"PACER",                     rule:"Manual-or-restricted lane with cost controls",                                       rationale:"Fee-based and case-detail sensitive" },
  { type:"ICE detainee/locator data", rule:"Do not operationalize for person search",                                            rationale:"Human-rights and misuse risk" },
  { type:"Social media",              rule:"Aggregate public-only, no private, no DMs",                                         rationale:"Privacy and surveillance risk" },
  { type:"Shelter directories",       rule:"Organization-level only",                                                            rationale:"Resident privacy and safety" },
];

const CLS_COLOR = { OA:"#2DD4BF", BD:"#4A9EFF", CM:"#9D7BFF", PSP:"#F5B942", MR:"#ff7700" };

const TABS = [
  { id:"summary",    label:"📋 Executive Summary" },
  { id:"governance", label:"⚖️ Governance Taxonomy" },
  { id:"top100",     label:"📡 Top 100 Sources" },
  { id:"scoring",    label:"🏆 Priority Scoring" },
  { id:"crawlers",   label:"🕷️ Crawler Classes" },
  { id:"etl",        label:"⚙️ ETL Pipeline" },
  { id:"expansion",  label:"📦 700+ Expansion Plan" },
  { id:"highrisk",   label:"🚨 High-Risk Handling" },
  { id:"architecture",label:"🏗️ Architecture" },
  { id:"roadmap",    label:"🚀 Roadmap" },
];

export default function BlueprintViewer() {
  const [tab, setTab] = useState("summary");
  const [srcSearch, setSrcSearch] = useState("");
  const [clsFilter, setClsFilter] = useState("All");

  const filteredSrc = TOP_100.filter(s => {
    if (clsFilter !== "All" && s.cls !== clsFilter) return false;
    if (srcSearch && !s.name.toLowerCase().includes(srcSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ fontFamily:"'IBM Plex Mono',monospace", color:P.t1 }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,#0D1525,#080D18)`, border:`2px solid ${P.gold}40`, borderRadius:12, padding:"14px 20px", marginBottom:12 }}>
        <div style={{ fontSize:7, color:P.gold, letterSpacing:3, fontWeight:800, marginBottom:4 }}>
          📄 LAWFUL PUBLIC-INTEREST RESEARCH DATABASE BLUEPRINT · 37-PAGE FULL DOCUMENT
        </div>
        <div style={{ fontSize:13, fontWeight:800, color:P.t1, marginBottom:6 }}>
          Deported U.S. Military Personnel of Mexican Nationality — Production-Grade Evidence System
        </div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          {[["100","Priority Sources","#4A9EFF"],["742","Target Source Families","#2DD4BF"],["5","Governance Classes","#F5B942"],["6","ETL Clusters","#9D7BFF"],["5","Delivery Phases","#ff7700"],["42","Person-Months Est.","#ff0055"]].map(([v,l,c]) => (
            <div key={l} style={{ textAlign:"center", minWidth:70 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:c }}>{v}</div>
              <div style={{ fontSize:6, color:P.t4 }}>{l}</div>
            </div>
          ))}
          <div style={{ marginLeft:"auto", background:`${P.red}10`, border:`1px solid ${P.red}30`, borderRadius:8, padding:"6px 10px", fontSize:6, color:P.red, lineHeight:1.8 }}>
            ⚠ EVIDENCE SYSTEM — NOT SURVEILLANCE SYSTEM<br/>
            No people-hunting · No PTSD inference · No private data<br/>
            No shelter resident tracking · No harassment automation
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, marginBottom:12, flexWrap:"wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:"5px 11px", background: tab===t.id?`${P.gold}18`:"transparent",
              border:`1px solid ${tab===t.id?P.gold:P.b}`, color: tab===t.id?P.gold:P.t4,
              borderRadius:20, fontSize:8, fontWeight: tab===t.id?800:600, cursor:"pointer",
              fontFamily:"inherit", whiteSpace:"nowrap", transition:"all .12s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── EXECUTIVE SUMMARY ── */}
      {tab === "summary" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px", gridColumn:"1 / -1" }}>
            <div style={{ fontSize:10, fontWeight:800, color:P.gold, marginBottom:8 }}>📋 Executive Summary</div>
            <div style={{ fontSize:8, color:P.t2, lineHeight:1.8 }}>
              This platform is feasible, but only if it is built as an <strong style={{color:P.gold}}>evidence system, not a surveillance system</strong>. The strongest production design is a hybrid of machine-ingested official data, manually reviewed high-context records, and a strict claim-evidence-citation layer.
            </div>
            <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:8 }}>
              {[
                { icon:"📜", t:"Core Source Spine", d:"NARA, Library of Congress, U.S. Census Bureau, BLS, Congressional records + Mexico: INE, INEGI, AGN, UABC, COLEF" },
                { icon:"⚖️", t:"Lawful Scope", d:"Population-level public-interest research on deported/removed U.S. military personnel of Mexican nationality, Vietnam era to present" },
                { icon:"🚫", t:"Forbidden Scope", d:"Active tracking, doxxing, private-account scraping, shelter-resident identification, mental-health inference, private-message collection" },
                { icon:"⚡", t:"5 Core Imperatives", d:"1) Ingest official APIs first 2) High-level crawlers for public portals only 3) Relational evidence store + search + graph 4) GitHub CI/CD 5) n8n as event router, not data store" },
                { icon:"🔑", t:"Key Clarifications", d:"INE canonical (not IFE) · NARA 62-year rule computed dynamically · PACER = manual-or-restricted · NSOPW = policy context only, no person-resolution" },
                { icon:"🌎", t:"Target: 742 Source Families", d:"'Family' = stable source groupings, not individual datasets. Data.gov = 525,000 datasets. datos.gob.mx = 6,351 databases. Scaling problem is connector governance, not source scarcity." },
              ].map(({icon,t,d}) => (
                <div key={t} style={{ background:"#080D18", border:`1px solid ${P.b}`, borderRadius:7, padding:"10px 12px" }}>
                  <div style={{ fontSize:14, marginBottom:3 }}>{icon}</div>
                  <div style={{ fontSize:8, fontWeight:800, color:P.gold, marginBottom:3 }}>{t}</div>
                  <div style={{ fontSize:7, color:P.t3, lineHeight:1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence scoring formula */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.violet, marginBottom:8 }}>🧮 Claim Confidence Formula</div>
            <div style={{ background:"#030508", borderRadius:7, padding:"10px 12px", fontSize:8, color:"#B8CCE8", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.8 }}>
              {`claim_confidence =\n  0.25 × source_authority\n+ 0.20 × extraction_quality\n+ 0.15 × citation_completeness\n+ 0.15 × corroboration_count\n+ 0.10 × temporal_specificity\n+ 0.10 × entity_resolution_quality\n+ 0.05 × analyst_bonus\n- 0.15 × contradiction_penalty\n- 0.10 × sensitivity_penalty_if_unreviewed`}
            </div>
            <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:3 }}>
              {[["0.90–1.00","publication-safe","#2DD4BF"],["0.75–0.89","analyst review recommended","#F5B942"],["0.60–0.74","internal exploratory only","#ff7700"],["< 0.60","do not publish as factual assertion","#ff0055"]].map(([r,l,c]) => (
                <div key={r} style={{ display:"flex", gap:8, alignItems:"center", fontSize:7 }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontWeight:800, color:c, minWidth:70 }}>{r}</span>
                  <span style={{ color:P.t3 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dedup scoring */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.blue, marginBottom:8 }}>🔁 Deduplication Scoring</div>
            <div style={{ background:"#030508", borderRadius:7, padding:"10px 12px", fontSize:8, color:"#B8CCE8", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.8 }}>
              {`dedupe_score =\n  0.40 × id_match\n+ 0.20 × title_similarity\n+ 0.10 × date_overlap\n+ 0.10 × source_proximity\n+ 0.10 × named_entity_overlap\n+ 0.10 × document_hash_family\n\nmerge if score >= 0.92\nqueue analyst review if 0.75 <= score < 0.92`}
            </div>
            <div style={{ marginTop:8, fontSize:7, color:P.t4, lineHeight:1.8 }}>
              7 dedup rules: exact SHA-256 · near-duplicate (SimHash) · scholarly DOI/Handle/ORCID · person-assertion overlaps · shelter/service org name+city · court case number+date · bilingual aligned pair
            </div>
          </div>

          {/* Priority scoring formula */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px", gridColumn:"1 / -1" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.amber, marginBottom:8 }}>🎯 Source Priority Scoring Formula (0–100)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={{ background:"#030508", borderRadius:7, padding:"10px 12px", fontSize:8, color:"#B8CCE8", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.8 }}>
                {`priority_score_100 =\n  24 × authority\n+ 20 × topical_relevance\n+ 14 × machine_readability\n+ 10 × historical_depth\n+ 10 × citation_strength\n+  8 × update_value\n+  8 × interoperability\n+  6 × cost_efficiency\n- 10 × privacy_risk\n- 10 × legal_friction`}
              </div>
              <div style={{ fontSize:7, color:P.t3, lineHeight:1.8 }}>
                Each component normalized to 0–1, then scaled to 100-point score.<br/><br/>
                <strong style={{color:P.amber}}>Top scorer: NARA Catalog API = 94/100</strong><br/>
                Authority (max): archival provenance<br/>
                Machine readability: REST API with documented schema<br/>
                Historical depth: Vietnam era → present<br/>
                Privacy risk: low (institutional metadata)<br/>
                Legal friction: low (public access, no FOIA required)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GOVERNANCE TAXONOMY ── */}
      {tab === "governance" && (
        <div>
          <div style={{ background:`${P.amber}08`, border:`1px solid ${P.amber}25`, borderRadius:8, padding:"8px 12px", marginBottom:12, fontSize:7, color:P.t3, lineHeight:1.7 }}>
            This taxonomy lines up with the NIST privacy and AI risk frameworks and FTC warnings about large-scale behavioral surveillance. Consistent with PACER's fee model, NSOPW's public-safety framing, and DOJ disclosure limits.
          </div>
          {GOVERNANCE_TAXONOMY.map((g,i) => (
            <div key={i} style={{ background:P.card, border:`1px solid ${g.color}30`, borderLeft:`5px solid ${g.color}`, borderRadius:8, padding:"12px 16px", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6, flexWrap:"wrap", gap:8 }}>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:800, color:g.color }}>{g.cls}</div>
                <span style={{ fontSize:7, background:`${g.color}18`, color:g.color, border:`1px solid ${g.color}30`, borderRadius:4, padding:"2px 8px", fontWeight:700 }}>{g.action}</span>
              </div>
              <div style={{ fontSize:8, color:P.t2, marginBottom:4, lineHeight:1.5 }}>{g.meaning}</div>
              <div style={{ fontSize:7, color:P.t4, fontStyle:"italic" }}>Examples: {g.examples}</div>
            </div>
          ))}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px", marginTop:12 }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.red, marginBottom:8 }}>🚫 Absolute Prohibitions</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:6 }}>
              {["Do NOT build a people-hunting engine","Do NOT infer PTSD or mental health from social media","Do NOT scrape private data or bypass authentication","Do NOT track shelter residents, migrants, or vulnerable persons","Do NOT automate harm, targeting, enforcement, or harassment","Do NOT use face recognition or private-platform contact graphs","Do NOT collect WhatsApp unless clearly public and lawfully obtained","Do NOT build ethnicity prediction models"].map((r,i) => (
                <div key={i} style={{ display:"flex", gap:6, alignItems:"flex-start", fontSize:7, color:P.t2, lineHeight:1.5 }}>
                  <span style={{ color:P.red, fontWeight:800, flexShrink:0 }}>✕</span>{r}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TOP 100 SOURCES ── */}
      {tab === "top100" && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:10, flexWrap:"wrap", alignItems:"center" }}>
            <input value={srcSearch} onChange={e => setSrcSearch(e.target.value)} placeholder="Search sources..."
              style={{ fontFamily:"inherit", fontSize:9, background:"#080D18", border:`1px solid ${P.b}`, borderRadius:5, padding:"4px 10px", color:P.t1, outline:"none", flex:1, minWidth:120 }} />
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {["All","OA","BD","CM","PSP","MR"].map(c => (
                <button key={c} onClick={() => setClsFilter(c)}
                  style={{ padding:"3px 9px", fontSize:7, fontWeight:700, cursor:"pointer",
                    background: clsFilter===c?`${CLS_COLOR[c]||P.gold}20`:"transparent",
                    border:`1px solid ${clsFilter===c?(CLS_COLOR[c]||P.gold):P.b}`,
                    color: clsFilter===c?(CLS_COLOR[c]||P.gold):P.t4, borderRadius:20, fontFamily:"inherit" }}>
                  {c}
                </button>
              ))}
            </div>
            <span style={{ fontSize:7, color:P.t4 }}>{filteredSrc.length} sources</span>
          </div>
          <div style={{ fontSize:7, color:P.t4, marginBottom:8 }}>
            OA=OFFICIAL_API · BD=BULK_DOWNLOAD · CM=CATALOG_METADATA_API · PSP=PUBLIC_SEARCH_PORTAL · MR=MANUAL_OR_RESTRICTED
          </div>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {["#","Source","Class","URL"].map(h => (
                      <th key={h} style={{ padding:"6px 10px", background:"#080D18", fontSize:7, fontWeight:800, color:P.gold, textAlign:"left", borderBottom:`1px solid ${P.b}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSrc.map((s,i) => {
                    const c = CLS_COLOR[s.cls] || P.t4;
                    return (
                      <tr key={s.n} style={{ background: i%2===0?"transparent":"#080D1820" }}>
                        <td style={{ padding:"4px 8px", fontSize:7, color:P.t4, borderBottom:`1px solid ${P.b}15`, fontFamily:"'IBM Plex Mono',monospace" }}>{s.n}</td>
                        <td style={{ padding:"4px 8px", fontSize:8, color:P.t1, borderBottom:`1px solid ${P.b}15`, maxWidth:260 }}>{s.name}</td>
                        <td style={{ padding:"4px 8px", borderBottom:`1px solid ${P.b}15` }}>
                          <span style={{ fontSize:6, background:`${c}15`, color:c, borderRadius:3, padding:"1px 6px", fontWeight:700, whiteSpace:"nowrap" }}>{s.cls}</span>
                        </td>
                        <td style={{ padding:"4px 8px", borderBottom:`1px solid ${P.b}15` }}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize:6, color:P.teal, textDecoration:"none", opacity:.8 }}>{s.url.replace("https://","")}</a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PRIORITY SCORING TOP 20 ── */}
      {tab === "scoring" && (
        <div>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"8px 14px", borderBottom:`1px solid ${P.b}`, background:`${P.gold}10` }}>
              <span style={{ fontSize:9, fontWeight:800, color:P.gold }}>🏆 Sample Scored Top 20 Sources</span>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {["Rank","Source","Score","Why It Ranks High"].map(h => (
                      <th key={h} style={{ padding:"6px 10px", background:"#080D18", fontSize:7, fontWeight:800, color:P.gold, textAlign:"left", borderBottom:`1px solid ${P.b}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SCORED_TOP20.map((s,i) => {
                    const c = s.score>=90?P.gold:s.score>=85?P.teal:s.score>=80?P.blue:P.amber;
                    return (
                      <tr key={i} style={{ background: i%2===0?"transparent":"#080D1820" }}>
                        <td style={{ padding:"5px 10px", fontSize:8, fontWeight:800, color:P.t4, borderBottom:`1px solid ${P.b}15` }}>#{s.rank}</td>
                        <td style={{ padding:"5px 10px", fontSize:8, color:P.t1, borderBottom:`1px solid ${P.b}15` }}>{s.source}</td>
                        <td style={{ padding:"5px 10px", borderBottom:`1px solid ${P.b}15` }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ background:"#030508", borderRadius:3, height:6, width:60, overflow:"hidden" }}>
                              <div style={{ width:`${s.score}%`, height:"100%", background:c, borderRadius:3 }}/>
                            </div>
                            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:800, color:c }}>{s.score}</span>
                          </div>
                        </td>
                        <td style={{ padding:"5px 10px", fontSize:7, color:P.t3, borderBottom:`1px solid ${P.b}15` }}>{s.why}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── CRAWLER CLASSES ── */}
      {tab === "crawlers" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:10 }}>
          {CRAWLER_CLASSES.map((c,i) => (
            <div key={i} style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:800, color:P.blue, marginBottom:6 }}>{c.cls}</div>
              <div style={{ marginBottom:6 }}>
                <div style={{ fontSize:6, color:P.t4, letterSpacing:1, marginBottom:3 }}>SUPPORTS</div>
                <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                  {c.supports.map(s => <span key={s} style={{ fontSize:6, background:`${P.blue}12`, color:P.blue, borderRadius:3, padding:"1px 5px" }}>{s}</span>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize:6, color:P.t4, letterSpacing:1, marginBottom:3 }}>USE FOR</div>
                <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
                  {c.use_for.map(u => <span key={u} style={{ fontSize:6, background:`${P.teal}12`, color:P.teal, borderRadius:3, padding:"1px 5px" }}>{u}</span>)}
                </div>
              </div>
            </div>
          ))}
          <div style={{ background:`${P.gold}08`, border:`1px solid ${P.gold}25`, borderRadius:10, padding:"12px 14px", gridColumn:"1 / -1" }}>
            <div style={{ fontSize:8, fontWeight:800, color:P.gold, marginBottom:6 }}>💡 Design Principle</div>
            <div style={{ fontSize:7, color:P.t3, lineHeight:1.7 }}>
              The crawler tier should NOT be "one crawler per site." It should be <strong style={{color:P.gold}}>"one crawler per source pattern,"</strong> then bind that crawler to many families. This is how 742 source families become manageable — reusable connector patterns (CKAN, Socrata/OData, ArcGIS Hub, DSpace, OJS, government report libraries, court search systems) each cover dozens of sources.
            </div>
          </div>
        </div>
      )}

      {/* ── ETL PIPELINE ── */}
      {tab === "etl" && (
        <div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:14, background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px" }}>
            {ETL_CLUSTERS.map((cl,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ background:`${cl.color}15`, border:`1px solid ${cl.color}40`, borderRadius:8, padding:"6px 12px", textAlign:"center", minWidth:80 }}>
                  <div style={{ fontSize:7, fontWeight:800, color:cl.color }}>C{i+1}</div>
                  <div style={{ fontSize:6, color:P.t4 }}>{cl.name.split(" ")[0]}</div>
                </div>
                {i < ETL_CLUSTERS.length-1 && <div style={{ fontSize:14, color:P.t4 }}>→</div>}
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:10 }}>
            {ETL_CLUSTERS.map((cl,i) => (
              <div key={i} style={{ background:P.card, border:`2px solid ${cl.color}30`, borderTop:`4px solid ${cl.color}`, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:8, fontWeight:800, color:P.t4, letterSpacing:2, marginBottom:2 }}>CLUSTER {i+1}</div>
                <div style={{ fontSize:10, fontWeight:800, color:cl.color, marginBottom:6 }}>{cl.name}</div>
                <div style={{ fontSize:7, color:P.t2, marginBottom:6, lineHeight:1.5 }}>{cl.def}</div>
                <div style={{ fontSize:6, color:P.t4, marginBottom:4 }}>ALGORITHMS: {cl.algo}</div>
                <div style={{ fontSize:7, background:`${cl.color}12`, border:`1px solid ${cl.color}25`, borderRadius:4, padding:"3px 8px", color:cl.color, fontWeight:700 }}>OUTPUT: {cl.output}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 700+ EXPANSION PLAN ── */}
      {tab === "expansion" && (
        <div>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:800, color:P.t1, marginBottom:3 }}>Total Target: 742 Source Families</div>
                <div style={{ fontSize:7, color:P.t4 }}>Scale by connector pattern, not individual datasets — CKAN, Socrata/OData, ArcGIS Hub, DSpace, OJS, court portals, bilingual archive portals</div>
              </div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:36, fontWeight:800, color:P.gold }}>742</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:10 }}>
            {EXPANSION_FAMILIES.map((f,i) => (
              <div key={i} style={{ background:P.card, border:`1px solid ${f.color}25`, borderLeft:`4px solid ${f.color}`, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:f.color }}>{f.domain}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:f.color }}>{f.target}</div>
                </div>
                {f.clusters.map((c,j) => (
                  <div key={j} style={{ display:"flex", gap:6, alignItems:"center", padding:"2px 0", fontSize:7, color:P.t3 }}>
                    <span style={{ color:f.color }}>▸</span>{c}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HIGH-RISK HANDLING ── */}
      {tab === "highrisk" && (
        <div>
          {HIGH_RISK_HANDLING.map((h,i) => (
            <div key={i} style={{ background:P.card, border:`1px solid ${P.amber}25`, borderLeft:`4px solid ${P.amber}`, borderRadius:8, padding:"12px 14px", marginBottom:8 }}>
              <div style={{ fontSize:10, fontWeight:800, color:P.amber, marginBottom:4 }}>{h.type}</div>
              <div style={{ fontSize:8, color:P.t2, marginBottom:3 }}>Rule: {h.rule}</div>
              <div style={{ fontSize:7, color:P.t4 }}>Rationale: {h.rationale}</div>
            </div>
          ))}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px", marginTop:4 }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.blue, marginBottom:8 }}>📊 Social Discourse Sampling Rules</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <div style={{ fontSize:7, color:P.teal, fontWeight:700, marginBottom:4 }}>✅ ALLOWED</div>
                {["Collect only clearly public content from approved APIs, RSS, public webpages","Analyze only at aggregate level","Report topic prevalence, language drift, sentiment buckets — cohorts not individuals","Require k >= 50 posts AND u >= 15 distinct public authors per bucket before showing any chart"].map((r,i) => (
                  <div key={i} style={{ fontSize:7, color:P.t3, padding:"2px 0", borderBottom:`1px solid ${P.b}20`, lineHeight:1.5 }}>✓ {r}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:7, color:P.red, fontWeight:700, marginBottom:4 }}>🚫 PROHIBITED</div>
                {["Scraping private groups, DMs, closed forums, WhatsApp","Collecting private-account follower graphs","Identifying shelter residents or inferring occupancy","Inferring mental health, substance use, criminal propensity","Face recognition, voice matching, or device-level tracking"].map((r,i) => (
                  <div key={i} style={{ fontSize:7, color:P.t3, padding:"2px 0", borderBottom:`1px solid ${P.b}20`, lineHeight:1.5 }}>✕ {r}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ARCHITECTURE ── */}
      {tab === "architecture" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px", gridColumn:"1 / -1" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.blue, marginBottom:8 }}>🏗️ Recommended Production Stack</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:8 }}>
              {[
                ["🗄️","System of Record","Postgres — relational evidence and workflow state","#4A9EFF"],
                ["🔍","Vector Similarity","pgvector inside Postgres — bilingual embedding search on snippets and claims","#2DD4BF"],
                ["🔎","Keyword/Full-Text","OpenSearch — analyst search, faceting, multi-field retrieval","#9D7BFF"],
                ["📦","Object Storage","S3-compatible — raw files, PDFs, OCR exports, screenshots, frozen snapshots","#F5B942"],
                ["🕸️","Graph","Neo4j — explicit relationship exploration, NOT sole source of truth","#ff7700"],
                ["⚙️","Orchestration","Airflow or Prefect for scheduled ingestion; Redis + Celery/Dramatiq for worker queues","#00cc88"],
                ["🌐","Browser Fallback","Playwright for public portals that need scripted navigation","#ff0055"],
                ["🔄","CI/CD","GitHub Actions — environment secrets and protected deployments","#4A9EFF"],
                ["📡","Operator Automation","n8n at qt360.app.n8n.cloud — event intake, ticketing, notifications, report routing (NOT a data store)","#2DD4BF"],
              ].map(([icon,name,desc,color]) => (
                <div key={name} style={{ background:"#080D18", border:`1px solid ${color}20`, borderRadius:7, padding:"10px 12px" }}>
                  <div style={{ fontSize:14, marginBottom:3 }}>{icon}</div>
                  <div style={{ fontSize:8, fontWeight:800, color, marginBottom:2 }}>{name}</div>
                  <div style={{ fontSize:7, color:P.t3, lineHeight:1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.teal, marginBottom:8 }}>📡 n8n Integration Contract</div>
            <div style={{ background:"#030508", borderRadius:7, padding:"10px 12px", fontSize:7, color:"#B8CCE8", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.8 }}>
              {`endpoint_base:\n  https://qt360.app.n8n.cloud/\n\nflows:\n- source_registry_changed\n- connector_run_completed\n- analyst_review_required\n- contradiction_case_opened\n- daily_digest_ready\n\ntransport:\n  method: POST\n  auth: HMAC signature + IP allowlist\n  response: 200 ack (async processing)\n\nrules:\n- use_production_webhook_url_only\n- never hardcode secrets in repo\n- validate JSON schema before send\n- include event_id for idempotency\n- retry with exponential backoff on 429/5xx`}
            </div>
          </div>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.violet, marginBottom:8 }}>📁 Repo Skeleton</div>
            <div style={{ background:"#030508", borderRadius:7, padding:"10px 12px", fontSize:6, color:"#B8CCE8", fontFamily:"'IBM Plex Mono',monospace", lineHeight:1.8 }}>
              {`research-db/\n├── configs/\n│   ├── top_100_priority_sources.yaml\n│   ├── expanded_700_source_families.yaml\n│   ├── crawl_policies.yaml\n│   └── sensitivity_policies.yaml\n├── schemas/\n│   ├── source_registry_schema.sql\n│   ├── database_schema.sql\n│   └── graph_constraints.cypher\n├── connectors/\n│   ├── connector_interface.py\n│   └── sample_connectors/ [nara, loc, census, congress, bls, inegi, ine]\n├── crawlers/ [api, bulk, ckan, socrata, arcgis, dspace, report, search, browser]\n├── orchestrator/ [ingestion, event_bus, retry, contradiction_router]\n├── analytics/ [dedupe, translation, entity_resolution, claim_extraction, confidence_scoring, contradiction_detection, aggregate_social]\n├── templates/ [evidence_log, analyst_review, citations]\n├── integrations/ [github/, n8n/]\n├── .github/workflows/ [ci, connector_tests, release]\n└── docs/ [architecture, governance, source_onboarding, analyst_playbook]`}
            </div>
          </div>
        </div>
      )}

      {/* ── ROADMAP ── */}
      {tab === "roadmap" && (
        <div>
          {ROADMAP_PHASES.map((p,i) => {
            const colors = ["#2DD4BF","#4A9EFF","#9D7BFF","#F5B942","#ff7700"];
            const c = colors[i];
            return (
              <div key={i} style={{ background:P.card, border:`1px solid ${c}30`, borderLeft:`5px solid ${c}`, borderRadius:10, padding:"14px 18px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:7, color:c, letterSpacing:2, fontWeight:800, marginBottom:2 }}>PHASE {i+1} · {p.duration} · {p.pm} person-months</div>
                    <div style={{ fontSize:11, fontWeight:800, color:c }}>{p.phase}</div>
                  </div>
                  <div style={{ background:`${c}15`, border:`1px solid ${c}30`, borderRadius:20, padding:"3px 12px", fontSize:8, fontWeight:700, color:c }}>{p.pm} PM</div>
                </div>
                <div style={{ fontSize:7, color:P.t3, lineHeight:1.7 }}>{p.deliverables}</div>
              </div>
            );
          })}
          <div style={{ background:`${P.gold}08`, border:`1px solid ${P.gold}25`, borderRadius:10, padding:"12px 16px" }}>
            <div style={{ fontSize:8, fontWeight:800, color:P.gold, marginBottom:4 }}>📊 Total Estimate</div>
            <div style={{ fontSize:8, color:P.t2, lineHeight:1.7 }}>
              <strong style={{color:P.gold}}>42 person-months</strong> over ~9–10 calendar months with a lean cross-functional team.<br/>
              Budget note: Add a dedicated bilingual archivist/research librarian and privacy counsel review at end of Foundation and before Release.
            </div>
            <div style={{ marginTop:8, fontSize:7, color:P.t4, lineHeight:1.7, borderTop:`1px solid ${P.b}`, paddingTop:8 }}>
              <strong style={{color:P.amber}}>Architect's note:</strong> Start with a Top-100 source registry, not 742 on day one. A staged build avoids a "magnificent junkyard." Phase 1 authoritative federal + Mexican public + academic + NGO sources form a solid spine. Stability and legal clarity take precedence over breadth. Anything that drifts toward resident tracking, person-level social listening, or undefined "advanced analytics" should be cut — not romanticized.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}