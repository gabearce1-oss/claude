import { useState, useMemo } from "react";
import { P } from "../../lib/teData";

const CLASS_COLORS = { OA: P.teal, MR: P.red, PSP: P.blue, CM: P.amber, BD: P.violet };
const CLASS_LABELS = { OA: "Official API", MR: "Manual/Restricted", PSP: "Public Search Portal", CM: "Catalog Metadata", BD: "Bulk Download" };
const RISK_COLORS = { L: P.teal, M: P.amber, H: P.red };

// Full 100-source table with all columns
const SOURCES = [
  { id:1, name:"NARA Catalog API", cls:"OA", base:"https://catalog.archives.gov/api/v1/", docs:"archives.gov/research/catalog/help/api", auth:"none", fmt:"JSON", limits:"not published", update:"variable", risk:"M", lang:"en", entities:"archival descriptions, authority records, OCR", fallback:"catalog search/export", tpl:"std-official", score:94, cluster:"archives_and_memory" },
  { id:2, name:"NARA Veterans Service Records", cls:"MR", base:"https://www.archives.gov/veterans", docs:"archives.gov/veterans/military-service-records", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"variable", risk:"H", lang:"en", entities:"service-record access rules", fallback:"SF-180 / eVetRecs / manual", tpl:"std-restricted", score:88, cluster:"veterans_and_defense" },
  { id:3, name:"NARA OMPF Archival Holdings", cls:"MR", base:"https://www.archives.gov/st-louis/military-personnel-archival", docs:"archives.gov/personnel-records-center/ompf-access-public", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"variable", risk:"H", lang:"en", entities:"personnel file access", fallback:"manual request", tpl:"std-restricted", score:87, cluster:"veterans_and_defense" },
  { id:4, name:"LOC JSON/YAML API", cls:"OA", base:"https://www.loc.gov/apis/json-and-yaml/", docs:"same", auth:"none", fmt:"JSON, YAML", limits:"rate-limited", update:"continuous", risk:"L", lang:"en", entities:"items, collections, images", fallback:"site search + sitemaps", tpl:"std-official", score:92, cluster:"archives_and_memory" },
  { id:5, name:"LOC Chronicling America", cls:"OA", base:"https://www.loc.gov/apis/", docs:"loc.gov/apis/additional-apis/chronicling-america-api/", auth:"none", fmt:"JSON, bulk OCR", limits:"rate-limited", update:"continuous", risk:"L", lang:"en", entities:"historic newspapers", fallback:"loc.gov / bulk datasets", tpl:"std-official", score:85, cluster:"archives_and_memory" },
  { id:6, name:"LOC Linked Data Service", cls:"OA", base:"https://id.loc.gov/", docs:"loc.gov/apis/additional-apis/linked-data-service/", auth:"none", fmt:"JSON-LD, RDF", limits:"not published", update:"continuous", risk:"L", lang:"en", entities:"names, subjects, authorities", fallback:"LOC JSON / MARC", tpl:"std-official", score:82, cluster:"archives_and_memory" },
  { id:7, name:"LOC Text Services", cls:"OA", base:"https://www.loc.gov/apis/micro-services/text-services/", docs:"same", auth:"none", fmt:"JSON", limits:"not published", update:"continuous", risk:"L", lang:"en", entities:"OCR text, coordinates", fallback:"bulk OCR", tpl:"std-official", score:79, cluster:"archives_and_memory" },
  { id:8, name:"LOC Image Services", cls:"OA", base:"https://www.loc.gov/apis/micro-services/image-services/", docs:"same", auth:"none", fmt:"IIIF, JSON", limits:"not published", update:"continuous", risk:"L", lang:"en", entities:"images, image metadata", fallback:"derivatives", tpl:"std-official", score:77, cluster:"archives_and_memory" },
  { id:9, name:"LOC SRU", cls:"OA", base:"https://www.loc.gov/standards/sru/", docs:"loc.gov/apis/additional-apis/search-retrieval-via-url/", auth:"none", fmt:"XML", limits:"not published", update:"continuous", risk:"L", lang:"en", entities:"search/retrieval records", fallback:"LOC JSON", tpl:"std-official", score:76, cluster:"archives_and_memory" },
  { id:10, name:"Veterans History Project", cls:"PSP", base:"https://www.loc.gov/programs/veterans-history-project/", docs:"loc.gov/programs/veterans-history-project/explore-the-collections/research-guides/", auth:"none", fmt:"HTML, media", limits:"n/a", update:"curated", risk:"M", lang:"en", entities:"oral histories", fallback:"manual export / LOC APIs", tpl:"std-portal", score:74, cluster:"veterans_and_defense" },
  { id:11, name:"Congress.gov API", cls:"OA", base:"https://api.congress.gov/", docs:"loc.gov/apis/additional-apis/congress-dot-gov-api/", auth:"api_key", fmt:"JSON, XML", limits:"5,000/hr", update:"daily+", risk:"L", lang:"en", entities:"bills, members, hearings", fallback:"govinfo/manual", tpl:"std-official", score:90, cluster:"legislative_and_regulatory" },
  { id:12, name:"Census Data API", cls:"OA", base:"https://api.census.gov/data.html", docs:"census.gov/data/developers.html", auth:"api_key", fmt:"JSON, CSV", limits:"not published", update:"release-based", risk:"L", lang:"en", entities:"demographics, geography", fallback:"bulk downloads", tpl:"std-official", score:89, cluster:"demographics_and_labor" },
  { id:13, name:"Census Microdata API", cls:"OA", base:"https://api.census.gov/data.html", docs:"census.gov/data/developers.html", auth:"api_key", fmt:"JSON, CSV", limits:"not published", update:"release-based", risk:"M", lang:"en", entities:"microdata aggregates", fallback:"PUMS downloads", tpl:"std-official", score:83, cluster:"demographics_and_labor" },
  { id:14, name:"BLS Public Data API", cls:"OA", base:"https://api.bls.gov/publicAPI/v2/", docs:"bls.gov/bls/api_features.htm", auth:"registered or unregistered", fmt:"JSON, XLSX", limits:"50 req/10 sec; 500/day registered", update:"schedule-based", risk:"L", lang:"en", entities:"labor series", fallback:"bulk tables", tpl:"std-official", score:84, cluster:"demographics_and_labor" },
  { id:15, name:"USAspending API", cls:"OA", base:"https://api.usaspending.gov/", docs:"api.usaspending.gov/docs/endpoints", auth:"none", fmt:"JSON", limits:"not published", update:"daily+", risk:"L", lang:"en", entities:"awards, accounts, agencies", fallback:"site exports", tpl:"std-official", score:85, cluster:"spending_procurement_foia" },
  { id:16, name:"Data.gov Catalog API", cls:"CM", base:"https://catalog.data.gov", docs:"resources.data.gov/catalog-api/", auth:"none", fmt:"JSON", limits:"not published", update:"continuous", risk:"L", lang:"en", entities:"dataset metadata", fallback:"site search", tpl:"std-official", score:87, cluster:"spending_procurement_foia" },
  { id:17, name:"api.data.gov Gateway", cls:"OA", base:"https://api.data.gov/", docs:"api.data.gov/docs/developer-manual/", auth:"api_key", fmt:"JSON", limits:"1,000/hr default", update:"continuous", risk:"L", lang:"en", entities:"federal API access", fallback:"agency native endpoints", tpl:"std-official", score:80, cluster:"spending_procurement_foia" },
  { id:18, name:"FOIA.gov API", cls:"OA", base:"https://api.foia.gov/", docs:"foia.gov/developer/", auth:"api_key", fmt:"JSON", limits:"not published", update:"continuous", risk:"M", lang:"en", entities:"agency components, forms", fallback:"portal search/manual", tpl:"std-official", score:82, cluster:"spending_procurement_foia" },
  { id:19, name:"GovInfo API/Bulk", cls:"BD", base:"https://www.govinfo.gov/", docs:"govinfo.gov/bulkdata", auth:"none", fmt:"XML, JSON, PDF, TXT", limits:"not published", update:"daily/release", risk:"L", lang:"en", entities:"statutes, CFR, reports", fallback:"sitemaps/search", tpl:"std-official", score:78, cluster:"legislative_and_regulatory" },
  { id:20, name:"Federal Register API", cls:"OA", base:"https://www.federalregister.gov/api/v1/", docs:"federalregister.gov/developers/api/v1", auth:"none", fmt:"JSON", limits:"not published", update:"daily", risk:"L", lang:"en", entities:"rules, notices, documents", fallback:"site search/RSS", tpl:"std-official", score:77, cluster:"legislative_and_regulatory" },
  { id:21, name:"PACER", cls:"MR", base:"https://pacer.uscourts.gov/", docs:"pacer.uscourts.gov/pacer-pricing-how-fees-work", auth:"account", fmt:"HTML, PDF, XML", limits:"$0.10/page", update:"continuous", risk:"H", lang:"en", entities:"dockets, opinions", fallback:"opinions free / fee exemptions", tpl:"std-restricted", score:70, cluster:"justice_and_courts" },
  { id:22, name:"NSOPW", cls:"PSP", base:"https://www.nsopw.gov/", docs:"same", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"H", lang:"en,es", entities:"federated registry search", fallback:"metadata only; no person ingest", tpl:"std-portal", score:40, cluster:"justice_and_courts" },
  { id:23, name:"ICE Statistics/Reports", cls:"PSP", base:"https://www.ice.gov/statistics", docs:"same", auth:"none", fmt:"HTML, PDF, XLS", limits:"403-prone", update:"monthly/annual", risk:"H", lang:"en", entities:"enforcement statistics", fallback:"search-backed fetch/manual", tpl:"std-report", score:72, cluster:"immigration_and_border" },
  { id:24, name:"DHS OHSS Yearbook", cls:"PSP", base:"https://ohss.dhs.gov/topics/immigration/yearbook", docs:"ohss.dhs.gov/topics/immigration", auth:"none", fmt:"HTML, PDF, XLS", limits:"n/a", update:"annual", risk:"M", lang:"en", entities:"immigration tables", fallback:"download tables", tpl:"std-report", score:83, cluster:"immigration_and_border" },
  { id:25, name:"DHS OHSS Monthly Enforcement", cls:"PSP", base:"https://ohss.dhs.gov/topics/immigration/immigration-enforcement/monthly-tables", docs:"same", auth:"none", fmt:"HTML, XLS", limits:"n/a", update:"monthly", risk:"M", lang:"en", entities:"enforcement/legal process", fallback:"download tables", tpl:"std-portal", score:80, cluster:"immigration_and_border" },
  { id:26, name:"USCIS Immigration Data", cls:"PSP", base:"https://www.uscis.gov/tools/reports-and-studies/immigration-and-citizenship-data", docs:"uscis.gov/tools/reports-and-studies/understanding-our-data", auth:"none", fmt:"HTML, CSV, XLS, PDF", limits:"n/a", update:"release-based", risk:"M", lang:"en", entities:"adjudications, forms, country", fallback:"historic reports/manual", tpl:"std-portal", score:80, cluster:"immigration_and_border" },
  { id:27, name:"USCIS Refugee Processing Data", cls:"PSP", base:"https://www.uscis.gov/tools/reports-and-studies/refugee-processing-data", docs:"uscis.gov/tools/reports-and-studies/refugee-processing-data/fy2024-refugee-processing-data", auth:"none", fmt:"HTML, XLS", limits:"n/a", update:"annual", risk:"M", lang:"en", entities:"refugee processing", fallback:"manual/download", tpl:"std-portal", score:75, cluster:"immigration_and_border" },
  { id:28, name:"CBP Public Data Portal", cls:"PSP", base:"https://www.cbp.gov/newsroom/stats/cbp-public-data-portal", docs:"cbp.gov/newsroom/stats", auth:"none", fmt:"CSV, XLS, HTML", limits:"n/a", update:"monthly", risk:"M", lang:"en", entities:"encounters, travel, trade", fallback:"docs library/manual", tpl:"std-portal", score:81, cluster:"immigration_and_border" },
  { id:29, name:"CBP Border Enforcement Stats", cls:"PSP", base:"https://www.cbp.gov/newsroom/stats/nationwide-encounters", docs:"cbp.gov/document/stats/southwest-land-border-encounters", auth:"none", fmt:"HTML, CSV, XLS", limits:"n/a", update:"monthly", risk:"M", lang:"en", entities:"encounters, recidivism", fallback:"docs library/manual", tpl:"std-portal", score:79, cluster:"immigration_and_border" },
  { id:30, name:"EOIR Statistics Portal", cls:"PSP", base:"https://www.justice.gov/eoir/statistics-and-reports", docs:"justice.gov/eoir/workload-and-adjudication-statistics", auth:"none", fmt:"HTML, PDF, XLS", limits:"n/a", update:"continuous", risk:"M", lang:"en", entities:"yearbooks, court stats", fallback:"manual download", tpl:"std-report", score:79, cluster:"justice_and_courts" },
  { id:31, name:"EOIR Workload/Adjudication Stats", cls:"PSP", base:"https://www.justice.gov/eoir/workload-and-adjudication-statistics", docs:"same", auth:"none", fmt:"HTML, PDF, XLS", limits:"n/a", update:"continuous", risk:"M", lang:"en", entities:"hearings, backlogs", fallback:"report downloads", tpl:"std-portal", score:78, cluster:"justice_and_courts" },
  { id:32, name:"VA NCVAS Portal", cls:"PSP", base:"https://www.va.gov/vetdata/", docs:"va.gov/vetdata/report.asp", auth:"none", fmt:"HTML, PDF, XLS", limits:"n/a", update:"annual", risk:"M", lang:"en", entities:"veteran population, benefit use", fallback:"VA data catalog", tpl:"std-portal", score:76, cluster:"veterans_and_defense" },
  { id:33, name:"VA Open Data Catalog", cls:"PSP", base:"https://www.data.va.gov/", docs:"datahub.va.gov/", auth:"none", fmt:"CSV, JSON, XLS", limits:"portal-specific", update:"continuous", risk:"M", lang:"en", entities:"VA datasets", fallback:"data.gov mirror", tpl:"std-portal", score:74, cluster:"veterans_and_defense" },
  { id:34, name:"DoD Public Data Listing", cls:"BD", base:"https://data.defense.gov/Public-Data-Listing/", docs:"data.defense.gov/Portals/62/Documents/dod.json.txt", auth:"none", fmt:"JSON, CSV, XLS, PDF", limits:"n/a", update:"variable", risk:"M", lang:"en", entities:"DoD public datasets", fallback:"HTML listing/manual", tpl:"std-official", score:72, cluster:"veterans_and_defense" },
  { id:35, name:"DoD Historical Office", cls:"PSP", base:"https://history.defense.gov/", docs:"history.defense.gov/Historical-Sources/National-Security-Strategy/", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"curated", risk:"L", lang:"en", entities:"oral histories, NSS", fallback:"manual harvest", tpl:"std-portal", score:65, cluster:"veterans_and_defense" },
  { id:36, name:"Selective Service System", cls:"MR", base:"https://www.sss.gov/", docs:"same", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"variable", risk:"H", lang:"en", entities:"registration rules/history", fallback:"manual only; no person scraping", tpl:"std-restricted", score:60, cluster:"veterans_and_defense" },
  { id:37, name:"California Open Data", cls:"PSP", base:"https://data.ca.gov/", docs:"data.ca.gov/about", auth:"none", fmt:"CSV, JSON, API", limits:"portal-specific", update:"continuous", risk:"L", lang:"en", entities:"state open data", fallback:"portal export", tpl:"std-portal", score:68, cluster:"us_state_local" },
  { id:38, name:"California State Geoportal", cls:"PSP", base:"https://gis.data.ca.gov/", docs:"data.ca.gov/pages/ca-state-geoportal", auth:"none", fmt:"GIS, CSV, JSON", limits:"portal-specific", update:"continuous", risk:"L", lang:"en", entities:"geospatial layers", fallback:"download packages", tpl:"std-portal", score:66, cluster:"maps_geospatial_and_facilities" },
  { id:39, name:"Texas Open Data Portal", cls:"PSP", base:"https://data.texas.gov/", docs:"data.texas.gov/stories/s/Welcome-to-the-Texas-Open-Data-Portal-2025/pgq4-7ntc", auth:"none", fmt:"CSV, JSON, OData", limits:"portal-specific", update:"continuous", risk:"L", lang:"en", entities:"state datasets", fallback:"OData/export", tpl:"std-portal", score:67, cluster:"us_state_local" },
  { id:40, name:"Arizona ADHS Data Portal", cls:"PSP", base:"https://data.azdhs.gov/", docs:"same", auth:"none", fmt:"CSV, JSON, GIS", limits:"portal-specific", update:"continuous", risk:"M", lang:"en", entities:"public health data", fallback:"manual export", tpl:"std-portal", score:64, cluster:"us_state_local" },
  { id:41, name:"AZGeo Data Hub", cls:"PSP", base:"https://azgeo-open-data-agic.hub.arcgis.com/", docs:"agic.az.gov/agic/geospatial-data-collections-and-resources", auth:"none", fmt:"GIS, GeoJSON, SHP", limits:"portal-specific", update:"continuous", risk:"L", lang:"en", entities:"state geospatial", fallback:"ArcGIS feature services", tpl:"std-portal", score:63, cluster:"maps_geospatial_and_facilities" },
  { id:42, name:"OpenBooks Arizona", cls:"PSP", base:"https://openbooks.az.gov/", docs:"same", auth:"none", fmt:"HTML, CSV", limits:"n/a", update:"transactional", risk:"L", lang:"en", entities:"state spending", fallback:"portal export", tpl:"std-portal", score:60, cluster:"us_state_local" },
  { id:43, name:"NM Bureau of Geology", cls:"PSP", base:"https://geoinfo.nmt.edu/", docs:"geoinfo.nmt.edu/publications/maps/geologic/state/home.cfm", auth:"none", fmt:"GIS, PDF, HTML", limits:"n/a", update:"variable", risk:"L", lang:"en", entities:"NM geospatial publications", fallback:"download packages", tpl:"std-portal", score:58, cluster:"maps_geospatial_and_facilities" },
  { id:44, name:"Bernalillo County GIS", cls:"PSP", base:"https://www.bernco.gov/", docs:"bernco.gov/planning/gis-overview/", auth:"none", fmt:"HTML, GIS, CSV", limits:"n/a", update:"variable", risk:"M", lang:"en", entities:"county records, GIS", fallback:"manual export", tpl:"std-portal", score:57, cluster:"maps_geospatial_and_facilities" },
  { id:45, name:"San Diego Open Data", cls:"PSP", base:"https://data.sandiego.gov/", docs:"data.sandiego.gov/datasets/", auth:"none", fmt:"CSV, JSON, GIS", limits:"portal-specific", update:"continuous", risk:"L", lang:"en", entities:"city datasets", fallback:"export/download", tpl:"std-portal", score:63, cluster:"us_state_local" },
  { id:46, name:"LA County Open Data", cls:"PSP", base:"https://data.lacounty.gov/", docs:"data.lacounty.gov/search?collection=appAndMap", auth:"none", fmt:"CSV, JSON, OData", limits:"portal-specific", update:"continuous", risk:"L", lang:"en", entities:"county datasets", fallback:"portal export", tpl:"std-portal", score:64, cluster:"us_state_local" },
  { id:47, name:"Phoenix Open Data", cls:"PSP", base:"https://www.phoenixopendata.com/", docs:"same", auth:"none", fmt:"CSV, JSON", limits:"portal-specific", update:"continuous", risk:"M", lang:"en", entities:"city data", fallback:"portal export", tpl:"std-portal", score:62, cluster:"us_state_local" },
  { id:48, name:"Tucson Open Data", cls:"PSP", base:"https://gisdata.tucsonaz.gov/", docs:"gisdata.tucsonaz.gov/search?groupIds=6b589f6c792a4d4789c1286a8b0c49cd", auth:"none", fmt:"GIS, CSV, GeoJSON", limits:"portal-specific", update:"continuous", risk:"M", lang:"en", entities:"city/county GIS", fallback:"ArcGIS feature services", tpl:"std-portal", score:61, cluster:"us_state_local" },
  { id:49, name:"Open Data SA", cls:"PSP", base:"https://data.sanantonio.gov/", docs:"data.sanantonio.gov/group", auth:"none", fmt:"CSV, JSON", limits:"portal-specific", update:"continuous", risk:"L", lang:"en", entities:"city datasets", fallback:"portal export", tpl:"std-portal", score:60, cluster:"us_state_local" },
  { id:50, name:"Austin Open Data", cls:"PSP", base:"https://data.austintexas.gov/", docs:"same", auth:"none", fmt:"CSV, JSON, OData", limits:"portal-specific", update:"continuous", risk:"L", lang:"en", entities:"city datasets", fallback:"OData/export", tpl:"std-portal", score:62, cluster:"us_state_local" },
  { id:51, name:"Houston Open Data", cls:"PSP", base:"https://data.houstontx.gov/", docs:"data.houstontx.gov/pages/terms-of-use", auth:"none", fmt:"CSV, JSON", limits:"portal-specific", update:"continuous", risk:"L", lang:"en", entities:"city datasets", fallback:"portal export", tpl:"std-portal", score:60, cluster:"us_state_local" },
  { id:52, name:"El Paso Open Data", cls:"PSP", base:"https://opendata.elpasotexas.gov/", docs:"opendata.elpasotexas.gov/items/b3caef6839ce4d63ac7896573474d172", auth:"none", fmt:"GIS, CSV, GeoJSON", limits:"portal-specific", update:"continuous", risk:"M", lang:"en", entities:"city geodata", fallback:"ArcGIS feature services", tpl:"std-portal", score:61, cluster:"us_state_local" },
  { id:53, name:"Austin Asset Inventory", cls:"PSP", base:"https://data.austintexas.gov/stories/s/Open-Data-Asset-Inventory-Dashboard/f7dy-dbwi/", docs:"data.austintexas.gov/", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"L", lang:"en", entities:"asset inventory metadata", fallback:"manual/export", tpl:"std-portal", score:55, cluster:"us_state_local" },
  { id:54, name:"San Antonio Elections Group", cls:"PSP", base:"https://data.sanantonio.gov/group/elections-and-elected-officials", docs:"data.sanantonio.gov/group/about/elections-and-elected-officials", auth:"none", fmt:"HTML, CSV", limits:"n/a", update:"continuous", risk:"L", lang:"en", entities:"elections data family", fallback:"manual/export", tpl:"std-portal", score:54, cluster:"us_state_local" },
  { id:55, name:"INE Datos Abiertos", cls:"PSP", base:"https://www.ine.mx/transparencia/datos-abiertos/", docs:"same", auth:"none", fmt:"CSV, XLS, HTML", limits:"n/a", update:"election-cycle", risk:"M", lang:"es", entities:"electoral stats", fallback:"manual download", tpl:"std-portal", score:86, cluster:"mexico_federal" },
  { id:56, name:"INE Conteos Censales", cls:"PSP", base:"https://www.ine.mx/transparencia/datos-abiertos/visualizacion-datos/conteos-censales-participacion/", docs:"same", auth:"none", fmt:"HTML, XLS, PDF", limits:"n/a", update:"cycle-based", risk:"M", lang:"es", entities:"participation, abstention", fallback:"manual download", tpl:"std-portal", score:82, cluster:"mexico_federal" },
  { id:57, name:"INE Cartografía Electoral", cls:"PSP", base:"https://cartografia.ine.mx/", docs:"ine.mx/transparencia/datos-abiertos/", auth:"none", fmt:"HTML, GIS", limits:"n/a", update:"variable", risk:"M", lang:"es", entities:"sections, districts", fallback:"manual export", tpl:"std-portal", score:79, cluster:"mexico_federal" },
  { id:58, name:"datos.gob.mx", cls:"CM", base:"https://www.datos.gob.mx/", docs:"same", auth:"none", fmt:"CSV, JSON, XLS, HTML", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"dataset metadata", fallback:"manual export", tpl:"std-official", score:75, cluster:"mexico_federal" },
  { id:59, name:"Plataforma Nacional de Transparencia", cls:"PSP", base:"https://www.plataformadetransparencia.org.mx/", docs:"consultapublicamx.plataformadetransparencia.org.mx/vut-web/", auth:"login optional", fmt:"HTML, CSV", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"public obligations", fallback:"manual query", tpl:"std-portal", score:77, cluster:"mexico_federal" },
  { id:60, name:"PNT Consulta Pública", cls:"PSP", base:"https://consultapublicamx.plataformadetransparencia.org.mx/vut-web/", docs:"plataformadetransparencia.org.mx/datos-abiertos", auth:"none", fmt:"HTML, CSV", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"disclosures", fallback:"manual export", tpl:"std-portal", score:76, cluster:"mexico_federal" },
  { id:61, name:"PNT Datos Abiertos", cls:"PSP", base:"https://www.plataformadetransparencia.org.mx/datos-abiertos", docs:"same", auth:"none", fmt:"CSV", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"transparency request stats", fallback:"manual export", tpl:"std-portal", score:74, cluster:"mexico_federal" },
  { id:62, name:"INEGI Indicators API", cls:"OA", base:"https://www.inegi.org.mx/servicios/api_indicadores.html", docs:"en.www.inegi.org.mx/servicios/api_indicadores.html", auth:"token", fmt:"JSON, XML, JSON-stat, PC-Axis", limits:"not published", update:"live/update", risk:"L", lang:"es,en", entities:"indicators, metadata, geo", fallback:"bulk tables", tpl:"std-official", score:88, cluster:"mexico_federal" },
  { id:63, name:"Gobierno Abierto Baja California", cls:"PSP", base:"https://gobiernoabierto.bajacalifornia.gob.mx/", docs:"same", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"state transparency", fallback:"manual harvest", tpl:"std-portal", score:62, cluster:"mexico_state_municipal" },
  { id:64, name:"Baja California Budget Open Data", cls:"BD", base:"https://www.bajacalifornia.gob.mx/monitorBC/TransparenciaPresupuestaria/", docs:"bajacalifornia.gob.mx/monitorBC/TransparenciaPresupuestaria/Ingresos", auth:"none", fmt:"XLS, HTML", limits:"n/a", update:"annual", risk:"L", lang:"es", entities:"budgets, revenue", fallback:"manual download", tpl:"std-official", score:64, cluster:"mexico_state_municipal" },
  { id:65, name:"Gobierno de Baja California", cls:"PSP", base:"https://www.bajacalifornia.gob.mx/", docs:"same", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"state services/docs", fallback:"search portal", tpl:"std-portal", score:61, cluster:"mexico_state_municipal" },
  { id:66, name:"Tijuana Municipal Portal", cls:"PSP", base:"https://www.tijuana.gob.mx/", docs:"tijuana.gob.mx/dependencias/cabildo/gaceta_municipal.aspx", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"municipal docs, gazette", fallback:"gazette/transparency", tpl:"std-portal", score:63, cluster:"mexico_state_municipal" },
  { id:67, name:"Tijuana Transparency Portal", cls:"PSP", base:"https://transparencia.tijuana.gob.mx/", docs:"same", auth:"none", fmt:"HTML, PDF, XLS", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"municipal transparency", fallback:"manual export", tpl:"std-portal", score:64, cluster:"mexico_state_municipal" },
  { id:68, name:"Tijuana Migrant/Refugee Guide", cls:"BD", base:"https://www.tijuana.gob.mx/dependencias/SEDEBI/DMAM/GuiaParaPersonasMigrantesyRefugiadosenTijuana.pdf", docs:"tijuana.gob.mx/", auth:"none", fmt:"PDF", limits:"n/a", update:"periodic", risk:"H", lang:"es", entities:"shelter/service directory", fallback:"organization-level only", tpl:"std-report", score:70, cluster:"mexico_state_municipal" },
  { id:69, name:"Mexicali Transparency", cls:"PSP", base:"https://www.mexicali.gob.mx/transparencia/", docs:"same", auth:"none", fmt:"HTML, PDF, XLS", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"municipal transparency", fallback:"manual export", tpl:"std-portal", score:61, cluster:"mexico_state_municipal" },
  { id:70, name:"Sonora Transparency Portal", cls:"PSP", base:"https://transparencia.sonora.gob.mx/", docs:"same", auth:"none", fmt:"HTML, CSV", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"state disclosures", fallback:"manual query", tpl:"std-portal", score:62, cluster:"mexico_state_municipal" },
  { id:71, name:"Sonora State Portal", cls:"PSP", base:"https://www.sonora.gob.mx/", docs:"oficialiamayor.sonora.gob.mx/", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"open-data links", fallback:"linked portals", tpl:"std-portal", score:58, cluster:"mexico_state_municipal" },
  { id:72, name:"COMAR Portal", cls:"PSP", base:"https://www.gob.mx/comar", docs:"gob.mx/comar/articulos/directorio-comar", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"refugee policy, offices", fallback:"manual capture", tpl:"std-portal", score:68, cluster:"mexico_federal" },
  { id:73, name:"OMI Shelter Directory", cls:"PSP", base:"https://omi.gob.mx/es/OMI/ApMMX", docs:"same", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"H", lang:"es", entities:"migrant shelters", fallback:"organization-level only", tpl:"std-portal", score:65, cluster:"mexico_federal" },
  { id:74, name:"CNDH Migrant Rights Portal", cls:"PSP", base:"https://www.cndh.org.mx/introduccion-atencion-a-migrantes", docs:"same", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"rights guidance, reports", fallback:"manual/report crawl", tpl:"std-portal", score:67, cluster:"mexico_federal" },
  { id:75, name:"CNDH Estancias Migratorias Report", cls:"PSP", base:"https://www.cndh.org.mx/sites/default/files/documentos/2024-02/INFORME%20ESPECIAL%20ESTANCIAS%20MIGRATORIAS.pdf", docs:"same", auth:"none", fmt:"PDF", limits:"n/a", update:"report-based", risk:"M", lang:"es", entities:"migrant detention report", fallback:"manual report crawl", tpl:"std-report", score:66, cluster:"mexico_federal" },
  { id:76, name:"CNDH MPP Report", cls:"PSP", base:"https://www.cndh.org.mx/documento/informe-especial-sobre-los-protocolos-de-proteccion-migrantes-mpp", docs:"same", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"report-based", risk:"M", lang:"es", entities:"MPP impact", fallback:"manual report crawl", tpl:"std-report", score:65, cluster:"mexico_federal" },
  { id:77, name:"AGN Repositorio Documental Digital", cls:"PSP", base:"https://repositorio.agn.gob.mx/", docs:"repositorio.agn.gob.mx/busqueda", auth:"none", fmt:"HTML, images, PDF", limits:"n/a", update:"continuous", risk:"M", lang:"es", entities:"archival docs, images", fallback:"manual search/harvest", tpl:"std-portal", score:78, cluster:"archives_and_memory" },
  { id:78, name:"AGN Guía General", cls:"PSP", base:"https://guiageneral.agn.gob.mx/", docs:"same", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"finding aids", fallback:"manual harvest", tpl:"std-portal", score:72, cluster:"archives_and_memory" },
  { id:79, name:"AGN SIGBIC", cls:"PSP", base:"https://biblioteca.agn.gob.mx/", docs:"same", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"catalog records", fallback:"manual query", tpl:"std-portal", score:70, cluster:"archives_and_memory" },
  { id:80, name:"UABC Institutional Repository", cls:"PSP", base:"https://repositorioinstitucional.uabc.mx/", docs:"repositorioinstitucional.uabc.mx/communities/507d8d75-ab9a-42b9-9d21-eccb10742f03", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"continuous", risk:"L", lang:"es,en", entities:"theses, articles", fallback:"DSpace crawl", tpl:"std-portal", score:75, cluster:"academic_and_scholarly" },
  { id:81, name:"UABC DSpace", cls:"PSP", base:"https://repositorioinstitucional.uabc.mx/handle/20.500.12930/3/browse?type=author", docs:"repositorioinstitucional.uabc.mx/entities/publication/...", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"L", lang:"es,en", entities:"DSpace metadata pages", fallback:"full-page crawl", tpl:"std-portal", score:73, cluster:"academic_and_scholarly" },
  { id:82, name:"El Colef Repository", cls:"PSP", base:"https://colef.repositorioinstitucional.mx/jspui?locale=es", docs:"colef.mx/", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"institutional research", fallback:"DSpace/manual", tpl:"std-portal", score:72, cluster:"academic_and_scholarly" },
  { id:83, name:"El Colef Theses", cls:"PSP", base:"https://posgrado.colef.mx/tesis/", docs:"biblioteca.colef.mx/basededatos/", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"border-studies theses", fallback:"manual harvest", tpl:"std-portal", score:70, cluster:"academic_and_scholarly" },
  { id:84, name:"UNAM Institutional Repository", cls:"PSP", base:"https://repositorio.unam.mx/", docs:"repositorio.unam.mx/contenidos?as=2&c=PldJ0Y&...", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"continuous", risk:"L", lang:"es,en", entities:"academic outputs", fallback:"repository crawl", tpl:"std-portal", score:71, cluster:"academic_and_scholarly" },
  { id:85, name:"UNAM DGBSDI Repository", cls:"PSP", base:"https://ru.dgb.unam.mx/", docs:"same", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"digital library, theses", fallback:"repository crawl", tpl:"std-portal", score:70, cluster:"academic_and_scholarly" },
  { id:86, name:"HNDM", cls:"PSP", base:"https://hndm.iib.unam.mx/", docs:"hndm.iib.unam.mx/consulta/busqueda", auth:"none", fmt:"images, HTML", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"historic newspapers", fallback:"manual search", tpl:"std-portal", score:69, cluster:"academic_and_scholarly" },
  { id:87, name:"Biblioteca Nacional de México", cls:"PSP", base:"https://bnm.iib.unam.mx/", docs:"bnm.iib.unam.mx/index.php/hemeroteca-nacional-de-mexico/", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"national bibliography, official periodicals", fallback:"manual catalog", tpl:"std-portal", score:67, cluster:"academic_and_scholarly" },
  { id:88, name:"Repositorio Nacional MX", cls:"PSP", base:"https://biblioteca.colef.mx/basededatos/repositorio-nacional/", docs:"same", auth:"none", fmt:"HTML", limits:"n/a", update:"continuous", risk:"L", lang:"es", entities:"open scholarly resources", fallback:"redirect/manual", tpl:"std-portal", score:65, cluster:"academic_and_scholarly" },
  { id:89, name:"RAND Research Reports", cls:"PSP", base:"https://www.rand.org/pubs.html", docs:"rand.org/", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"continuous", risk:"L", lang:"en", entities:"policy reports", fallback:"manual harvest", tpl:"std-report", score:68, cluster:"academic_and_scholarly" },
  { id:90, name:"Pew Datasets", cls:"PSP", base:"https://www.pewresearch.org/download-datasets/", docs:"pewresearch.org/", auth:"none", fmt:"SAV, CSV, XLS, PDF", limits:"n/a", update:"study-based", risk:"L", lang:"en", entities:"surveys, methods", fallback:"manual download", tpl:"std-portal", score:66, cluster:"academic_and_scholarly" },
  { id:91, name:"Crossref REST API", cls:"OA", base:"https://api.crossref.org/", docs:"crossref.org/documentation/retrieve-metadata/rest-api/", auth:"none", fmt:"JSON", limits:"polite-pool recommended", update:"continuous", risk:"L", lang:"en", entities:"scholarly metadata, DOIs", fallback:"snapshot/manual", tpl:"std-official", score:74, cluster:"academic_and_scholarly" },
  { id:92, name:"OpenAlex API", cls:"OA", base:"https://api.openalex.org/", docs:"developers.openalex.org/api-reference/introduction", auth:"api_key", fmt:"JSON", limits:"100 req/s; priced daily budget", update:"continuous", risk:"L", lang:"en", entities:"works, authors, funders", fallback:"snapshot/CLI", tpl:"std-official", score:73, cluster:"academic_and_scholarly" },
  { id:93, name:"OpenAlex Snapshot/CLI", cls:"BD", base:"https://openalex.org/", docs:"developers.openalex.org/download/openalex-cli", auth:"api_key optional", fmt:"JSONL, bulk files", limits:"free + paid tiers", update:"monthly", risk:"L", lang:"en", entities:"scholarly graph", fallback:"REST API", tpl:"std-official", score:71, cluster:"academic_and_scholarly" },
  { id:94, name:"ORCID Public API", cls:"OA", base:"https://orcid.org/", docs:"info.orcid.org/documentation/integration-and-api-faq/", auth:"public/member", fmt:"XML, JSON", limits:"scope-based", update:"continuous", risk:"M", lang:"en", entities:"researcher IDs", fallback:"public pages/manual", tpl:"std-official", score:68, cluster:"academic_and_scholarly" },
  { id:95, name:"ROR API", cls:"OA", base:"https://api.ror.org/organizations", docs:"ror.org/about/faqs/", auth:"none; client-ID trend", fmt:"JSON", limits:"new limits in 2026", update:"monthly+", risk:"L", lang:"en", entities:"org disambiguation", fallback:"Zenodo dump", tpl:"std-official", score:67, cluster:"academic_and_scholarly" },
  { id:96, name:"DataCite GraphQL API", cls:"OA", base:"https://api.datacite.org/graphql", docs:"support.datacite.org/docs/datacite-graphql-api-guide", auth:"mixed", fmt:"GraphQL, JSON", limits:"not published", update:"continuous", risk:"L", lang:"en", entities:"research objects, DOIs", fallback:"REST/docs/manual", tpl:"std-official", score:66, cluster:"academic_and_scholarly" },
  { id:97, name:"ProQuest Dissertations & Theses", cls:"MR", base:"https://about.proquest.com/en/products-services/pqdtglobal/", docs:"same", auth:"licensed", fmt:"PDF, metadata", limits:"license-bound", update:"continuous", risk:"M", lang:"en", entities:"dissertations", fallback:"library-mediated manual", tpl:"std-restricted", score:60, cluster:"academic_and_scholarly" },
  { id:98, name:"JSTOR Content Access", cls:"MR", base:"https://about.jstor.org/", docs:"about.jstor.org/oa-and-free/", auth:"licensed/mixed", fmt:"PDF, XML, metadata", limits:"license-bound", update:"continuous", risk:"M", lang:"en", entities:"journals, books", fallback:"human search/manual", tpl:"std-restricted", score:58, cluster:"academic_and_scholarly" },
  { id:99, name:"IOM Human Mobility/Publications", cls:"PSP", base:"https://publications.iom.int/", docs:"lac.iom.int/", auth:"none", fmt:"PDF, HTML", limits:"n/a", update:"report-based", risk:"M", lang:"en,es", entities:"mobility reports", fallback:"manual download", tpl:"std-report", score:67, cluster:"ngo_media_archives" },
  { id:100, name:"UNHCR Mexico Public Docs", cls:"PSP", base:"https://www.unhcr.org/mx/", docs:"acnur.org/mx/", auth:"none", fmt:"HTML, PDF", limits:"n/a", update:"continuous", risk:"M", lang:"es,en", entities:"protection, refugee ops", fallback:"manual harvest", tpl:"std-portal", score:65, cluster:"ngo_media_archives" },
];

const CLUSTERS = {
  archives_and_memory: { label: "Archives & Memory", color: P.violet },
  veterans_and_defense: { label: "Veterans & Defense", color: P.gold },
  legislative_and_regulatory: { label: "Legislative & Regulatory", color: P.blue },
  demographics_and_labor: { label: "Demographics & Labor", color: P.teal },
  immigration_and_border: { label: "Immigration & Border", color: P.red },
  spending_procurement_foia: { label: "Spending & FOIA", color: P.amber },
  justice_and_courts: { label: "Justice & Courts", color: "#06B6D4" },
  maps_geospatial_and_facilities: { label: "Geospatial", color: "#8B5CF6" },
  us_state_local: { label: "US State/Local", color: P.blue },
  mexico_federal: { label: "Mexico Federal", color: "#EF4444" },
  mexico_state_municipal: { label: "Mexico State/Municipal", color: P.amber },
  academic_and_scholarly: { label: "Academic & Scholarly", color: P.teal },
  ngo_media_archives: { label: "NGO & Media", color: P.violet },
};

const FAMILY_PLAN = [
  { region: "US Federal", target: 165, color: P.blue },
  { region: "US State/Local", target: 210, color: P.teal },
  { region: "Mexico Federal", target: 92, color: P.red },
  { region: "Mexico State/Municipal", target: 118, color: P.amber },
  { region: "Academic & Scholarly", target: 84, color: P.violet },
  { region: "NGO & Media/Archives", target: 73, color: P.gold },
];

const CRAWLER_CLASSES = [
  { name: "api_crawler", label: "API Crawler", supports: "REST, GraphQL, JSON, XML", use_for: "NARA, LOC, Congress, Census, BLS, USAspending, INEGI, Crossref, OpenAlex", color: P.teal },
  { name: "bulk_downloader", label: "Bulk Downloader", supports: "CSV, XLS, ZIP, JSONL, PDF batches", use_for: "GovInfo, DoD, OpenAlex snapshot, state portal exports", color: P.blue },
  { name: "ckan_catalog_crawler", label: "CKAN Catalog", supports: "Dataset metadata, org lists, package discovery", use_for: "data.gov, some state portals, Mexico portals", color: P.violet },
  { name: "socrata_odata_crawler", label: "Socrata/OData", supports: "OData, CSV export, view metadata", use_for: "Texas, Austin, LA County, Houston", color: P.amber },
  { name: "arcgis_hub_crawler", label: "ArcGIS Hub", supports: "Feature services, item metadata, shapefiles", use_for: "AZGeo, Tucson, El Paso, local GIS hubs", color: P.gold },
  { name: "dspace_repository_crawler", label: "DSpace Repository", supports: "Item pages, bitstreams, metadata pages", use_for: "UABC, El Colef, university repositories", color: P.teal },
  { name: "report_library_crawler", label: "Report Library", supports: "HTML indexes, PDF series, date extraction", use_for: "CNDH, EOIR, OHSS, RAND, Pew, IOM", color: P.red },
  { name: "search_portal_crawler", label: "Search Portal", supports: "Public query pages, result paging, metadata-only", use_for: "PNT, AGN, HNDM, NSOPW metadata, PACER metadata", color: P.blue },
  { name: "browser_fallback_crawler", label: "Browser Fallback", supports: "403-aware discovery, headless fetch, screenshot-verified", use_for: "ICE, DHS brittle portals", color: P.red },
];

const ROADMAP = [
  { phase: "Foundation", duration: "6 weeks", pm: 8, items: "Source registry, schema, policy matrix, repo bootstrap, CI, n8n contract", color: P.blue },
  { phase: "Tier-One Ingestion", duration: "10 weeks", pm: 14, items: "NARA, LOC, Congress, Census, BLS, USAspending, FOIA, INEGI, INE connectors; object storage; raw capture", color: P.teal },
  { phase: "Evidence & Search", duration: "10 weeks", pm: 18, items: "Normalization, claim extraction, citation engine, OpenSearch, pgvector, graph sync", color: P.gold },
  { phase: "Governance & Analyst UX", duration: "8 weeks", pm: 12, items: "Contradiction review, redaction, analyst UI, report templates, aggregate social module", color: P.amber },
  { phase: "Hardening & Release", duration: "8 weeks", pm: 10, items: "Monitoring, load tests, security review, disaster recovery, documentation, training", color: P.violet },
];

const TABS = ["Registry", "Crawlers", "Family Plan", "Roadmap", "Score Top 20"];

const COL_HEADERS = ["#", "Source", "Class", "Auth", "Format", "Limits", "Update", "Risk", "Lang", "Score", "Cluster"];

export default function SourceRegistryDashboard() {
  const [activeTab, setActiveTab] = useState("Registry");
  const [filterCls, setFilterCls] = useState("ALL");
  const [filterCluster, setFilterCluster] = useState("ALL");
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState(null);

  const filtered = useMemo(() => {
    return SOURCES.filter(s => {
      const clsOk = filterCls === "ALL" || s.cls === filterCls;
      const clusterOk = filterCluster === "ALL" || s.cluster === filterCluster;
      const riskOk = filterRisk === "ALL" || s.risk === filterRisk;
      const searchOk = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.entities?.toLowerCase().includes(search.toLowerCase());
      return clsOk && clusterOk && riskOk && searchOk;
    });
  }, [filterCls, filterCluster, filterRisk, search]);

  const top20 = useMemo(() => [...SOURCES].sort((a, b) => b.score - a.score).slice(0, 20), []);

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: P.t1, padding: "24px 28px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: P.gold, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>
          RESEARCH DB · SOURCE REGISTRY & EXPANSION PLAN
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: P.t1, margin: 0 }}>Source Registry Dashboard</h1>
        <p style={{ fontSize: 10, color: P.t3, marginTop: 6, lineHeight: 1.6 }}>
          100-source verified catalog · 742-family target · 9 crawler classes · Evidence-first pipeline architecture
        </p>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 22 }}>
        {[
          { v: "100", l: "Verified Sources", c: P.teal },
          { v: "742", l: "Target Families", c: P.gold },
          { v: "9", l: "Crawler Classes", c: P.blue },
          { v: "42", l: "Person-Months", c: P.amber },
          { v: "5", l: "Phases", c: P.violet },
          { v: "~10mo", l: "Timeline", c: P.red },
        ].map(k => (
          <div key={k.l} style={{ border: `1px solid ${k.c}40`, borderTop: `3px solid ${k.c}`,
            background: `${k.c}10`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.c }}>{k.v}</div>
            <div style={{ fontSize: 8, color: P.t3, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.1em" }}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, borderBottom: `1px solid ${P.b}`, paddingBottom: 12 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: "7px 16px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
              background: activeTab === t ? `${P.gold}22` : "transparent",
              border: `1px solid ${activeTab === t ? P.gold : P.b}`,
              color: activeTab === t ? P.gold : P.t3, borderRadius: 6, cursor: "pointer",
              fontFamily: "'IBM Plex Mono', monospace" }}>
            {t}
          </button>
        ))}
      </div>

      {/* REGISTRY TAB */}
      {activeTab === "Registry" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or entities..."
              style={{ padding: "6px 12px", background: P.card, border: `1px solid ${P.b}`, borderRadius: 6,
                color: P.t1, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", outline: "none", width: 220 }} />
            {["ALL", "OA", "MR", "PSP", "CM", "BD"].map(c => (
              <button key={c} onClick={() => setFilterCls(c)}
                style={{ padding: "5px 10px", fontSize: 9, fontWeight: 700,
                  background: filterCls === c ? (CLASS_COLORS[c] || P.gold) + "22" : "transparent",
                  border: `1px solid ${filterCls === c ? (CLASS_COLORS[c] || P.gold) : P.b}`,
                  color: filterCls === c ? (CLASS_COLORS[c] || P.gold) : P.t3, borderRadius: 5, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace" }}>
                {c}
              </button>
            ))}
            {["ALL", "L", "M", "H"].map(r => (
              <button key={r} onClick={() => setFilterRisk(r)}
                style={{ padding: "5px 10px", fontSize: 9, fontWeight: 700,
                  background: filterRisk === r ? (RISK_COLORS[r] || P.gold) + "22" : "transparent",
                  border: `1px solid ${filterRisk === r ? (RISK_COLORS[r] || P.gold) : P.b}`,
                  color: filterRisk === r ? (RISK_COLORS[r] || P.gold) : P.t3, borderRadius: 5, cursor: "pointer",
                  fontFamily: "'IBM Plex Mono', monospace" }}>
                Risk:{r}
              </button>
            ))}
            <span style={{ fontSize: 9, color: P.t4, marginLeft: "auto" }}>{filtered.length} of 100 sources</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${P.gold}` }}>
                  {COL_HEADERS.map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 8, fontWeight: 800,
                      color: P.gold, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const clr = CLUSTERS[s.cluster]?.color || P.t3;
                  const isSelected = selectedSource?.id === s.id;
                  return (
                    <tr key={s.id} onClick={() => setSelectedSource(isSelected ? null : s)}
                      style={{ borderBottom: `1px solid ${P.b}30`,
                        background: isSelected ? `${P.gold}10` : i % 2 === 0 ? P.card : "transparent",
                        cursor: "pointer", transition: "background 0.1s" }}>
                      <td style={{ padding: "7px 10px", color: P.t4, fontSize: 9 }}>{s.id}</td>
                      <td style={{ padding: "7px 10px", color: P.t1, fontWeight: 700, maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</td>
                      <td style={{ padding: "7px 10px" }}>
                        <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 6px",
                          background: `${CLASS_COLORS[s.cls]}20`, border: `1px solid ${CLASS_COLORS[s.cls]}50`,
                          borderRadius: 4, color: CLASS_COLORS[s.cls] }}>{s.cls}</span>
                      </td>
                      <td style={{ padding: "7px 10px", color: P.t3, fontSize: 9, maxWidth: 90, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.auth}</td>
                      <td style={{ padding: "7px 10px", color: P.t3, fontSize: 9, maxWidth: 110, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.fmt}</td>
                      <td style={{ padding: "7px 10px", color: P.t4, fontSize: 9, maxWidth: 110, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.limits}</td>
                      <td style={{ padding: "7px 10px", color: P.t4, fontSize: 9, whiteSpace: "nowrap" }}>{s.update}</td>
                      <td style={{ padding: "7px 10px" }}>
                        <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 6px",
                          background: `${RISK_COLORS[s.risk]}20`, border: `1px solid ${RISK_COLORS[s.risk]}50`,
                          borderRadius: 4, color: RISK_COLORS[s.risk] }}>{s.risk}</span>
                      </td>
                      <td style={{ padding: "7px 10px", color: P.t3, fontSize: 9 }}>{s.lang}</td>
                      <td style={{ padding: "7px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 36, height: 4, background: P.b, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${s.score}%`, height: "100%",
                              background: s.score >= 85 ? P.teal : s.score >= 70 ? P.gold : P.red, borderRadius: 2 }} />
                          </div>
                          <span style={{ color: P.t2, fontWeight: 800, fontSize: 10 }}>{s.score}</span>
                        </div>
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <span style={{ fontSize: 8, padding: "2px 6px", background: `${clr}15`,
                          border: `1px solid ${clr}35`, borderRadius: 4, color: clr, whiteSpace: "nowrap" }}>
                          {CLUSTERS[s.cluster]?.label || s.cluster}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded detail panel */}
          {selectedSource && (
            <div style={{ marginTop: 16, padding: "18px 22px", border: `1px solid ${CLASS_COLORS[selectedSource.cls]}50`,
              borderTop: `3px solid ${CLASS_COLORS[selectedSource.cls]}`, background: P.card, borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: P.t1 }}>#{selectedSource.id} · {selectedSource.name}</div>
                <button onClick={() => setSelectedSource(null)}
                  style={{ background: "transparent", border: "none", color: P.t4, cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, fontSize: 10 }}>
                <div><span style={{ color: P.t4 }}>Class: </span><span style={{ color: CLASS_COLORS[selectedSource.cls], fontWeight: 700 }}>{CLASS_LABELS[selectedSource.cls]}</span></div>
                <div><span style={{ color: P.t4 }}>Auth: </span><span style={{ color: P.t2 }}>{selectedSource.auth}</span></div>
                <div><span style={{ color: P.t4 }}>Score: </span><span style={{ color: P.gold, fontWeight: 800 }}>{selectedSource.score}/100</span></div>
                <div><span style={{ color: P.t4 }}>Format: </span><span style={{ color: P.t2 }}>{selectedSource.fmt}</span></div>
                <div><span style={{ color: P.t4 }}>Rate Limits: </span><span style={{ color: P.t2 }}>{selectedSource.limits}</span></div>
                <div><span style={{ color: P.t4 }}>Update: </span><span style={{ color: P.t2 }}>{selectedSource.update}</span></div>
                <div><span style={{ color: P.t4 }}>Risk: </span><span style={{ color: RISK_COLORS[selectedSource.risk], fontWeight: 700 }}>{selectedSource.risk === "H" ? "HIGH" : selectedSource.risk === "M" ? "MEDIUM" : "LOW"}</span></div>
                <div><span style={{ color: P.t4 }}>Language: </span><span style={{ color: P.t2 }}>{selectedSource.lang}</span></div>
                <div><span style={{ color: P.t4 }}>Template: </span><span style={{ color: P.teal }}>{selectedSource.tpl}</span></div>
                <div style={{ gridColumn: "span 3" }}><span style={{ color: P.t4 }}>Entities: </span><span style={{ color: P.t2 }}>{selectedSource.entities}</span></div>
                <div style={{ gridColumn: "span 3" }}><span style={{ color: P.t4 }}>Fallback: </span><span style={{ color: P.t2 }}>{selectedSource.fallback}</span></div>
                <div style={{ gridColumn: "span 3" }}><span style={{ color: P.t4 }}>Base URL: </span>
                  <a href={selectedSource.base} target="_blank" rel="noreferrer"
                    style={{ color: P.blue, fontSize: 9, wordBreak: "break-all" }}>{selectedSource.base}</a>
                </div>
                <div style={{ gridColumn: "span 3" }}><span style={{ color: P.t4 }}>Cluster: </span>
                  <span style={{ color: CLUSTERS[selectedSource.cluster]?.color }}>{CLUSTERS[selectedSource.cluster]?.label}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRAWLERS TAB */}
      {activeTab === "Crawlers" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {CRAWLER_CLASSES.map(c => (
            <div key={c.name} style={{ border: `1px solid ${c.color}35`, borderLeft: `4px solid ${c.color}`,
              background: P.card, borderRadius: 10, padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: c.color, marginBottom: 8 }}>{c.label}</div>
              <div style={{ marginBottom: 8, fontSize: 10, color: P.t3 }}>
                <span style={{ color: P.t4, fontSize: 9 }}>SUPPORTS: </span>{c.supports}
              </div>
              <div style={{ fontSize: 10, color: P.t2 }}>
                <span style={{ color: P.t4, fontSize: 9 }}>USE FOR: </span>{c.use_for}
              </div>
              <div style={{ marginTop: 10, fontSize: 8, padding: "4px 8px",
                background: `${c.color}12`, border: `1px solid ${c.color}25`, borderRadius: 5,
                color: c.color, fontWeight: 700, letterSpacing: "0.12em" }}>
                {c.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAMILY PLAN TAB */}
      {activeTab === "Family Plan" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
            {FAMILY_PLAN.map(f => (
              <div key={f.region} style={{ border: `1px solid ${f.color}40`, borderTop: `3px solid ${f.color}`,
                background: P.card, borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: f.color }}>{f.target}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.t1, marginTop: 4 }}>{f.region}</div>
                <div style={{ marginTop: 10, width: "100%", height: 6, background: P.b, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(f.target / 742) * 100}%`, height: "100%", background: f.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 9, color: P.t4, marginTop: 4 }}>{Math.round((f.target / 742) * 100)}% of 742 target</div>
              </div>
            ))}
          </div>

          <div style={{ border: `1px solid ${P.gold}30`, borderTop: `3px solid ${P.gold}`, background: P.card, borderRadius: 10, padding: "20px 22px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: P.gold, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Expansion Principle
            </div>
            <p style={{ fontSize: 11, color: P.t2, lineHeight: 1.7, margin: 0 }}>
              A 700+ source-family target is best achieved by expanding by <strong style={{ color: P.t1 }}>family, not by chasing every individual dataset.</strong> The right unit of scale is the reusable connector pattern: CKAN/portal catalogs, Socrata/OData, ArcGIS Hub, DSpace, OJS repositories, government report libraries, court search systems, and bilingual archive/search portals. The production question is how to normalize and govern it — not raw volume.
            </p>
            <div style={{ marginTop: 14, padding: "10px 14px", background: `${P.red}10`, border: `1px solid ${P.red}30`, borderRadius: 7 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: P.red, marginBottom: 6 }}>HIGH-RISK SOURCE HANDLING</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 9, color: P.t3 }}>
                {[
                  ["Restraining orders", "Fragmented/manual only — no national person crawl"],
                  ["Sex-offender registries", "Metadata only, no entity resolution"],
                  ["PACER", "Manual-restricted lane with cost controls"],
                  ["ICE detainee data", "Do not operationalize for person search"],
                  ["Social media", "Aggregate public-only — no private, no DMs"],
                  ["Shelter directories", "Organization-level only — resident privacy"],
                ].map(([src, rule]) => (
                  <div key={src} style={{ padding: "6px 8px", background: P.bg, borderRadius: 5 }}>
                    <div style={{ fontWeight: 700, color: P.t2, marginBottom: 2 }}>{src}</div>
                    <div style={{ color: P.t4 }}>{rule}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROADMAP TAB */}
      {activeTab === "Roadmap" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ROADMAP.map((phase, i) => (
            <div key={phase.phase} style={{ border: `1px solid ${phase.color}40`, borderLeft: `5px solid ${phase.color}`,
              background: P.card, borderRadius: 10, padding: "18px 22px", display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, textAlign: "center", minWidth: 60 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: phase.color }}>{i + 1}</div>
                <div style={{ fontSize: 8, color: P.t4, textTransform: "uppercase" }}>Phase</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: P.t1, marginBottom: 4 }}>{phase.phase}</div>
                <div style={{ fontSize: 10, color: P.t3, marginBottom: 10 }}>{phase.items}</div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ fontSize: 9 }}><span style={{ color: P.t4 }}>Duration: </span><span style={{ color: phase.color, fontWeight: 700 }}>{phase.duration}</span></div>
                  <div style={{ fontSize: 9 }}><span style={{ color: P.t4 }}>Person-months: </span><span style={{ color: phase.color, fontWeight: 700 }}>{phase.pm}</span></div>
                </div>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ width: 80, height: 6, background: P.b, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{ width: `${(phase.pm / 42) * 100}%`, height: "100%", background: phase.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 8, color: P.t4 }}>{phase.pm}/42 pm</div>
              </div>
            </div>
          ))}
          <div style={{ padding: "14px 18px", border: `1px solid ${P.gold}30`, background: `${P.gold}08`, borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: P.gold, fontWeight: 800 }}>Total: 42 person-months · ~9–10 calendar months</div>
            <div style={{ fontSize: 9, color: P.t4, marginTop: 4 }}>Lean cross-functional team. Add bilingual archivist/research librarian + privacy counsel review at Foundation and Release gates.</div>
          </div>
        </div>
      )}

      {/* SCORE TOP 20 TAB */}
      {activeTab === "Score Top 20" && (
        <div>
          <div style={{ fontSize: 9, color: P.t4, marginBottom: 14, lineHeight: 1.7 }}>
            Priority score (0–100) = 24×authority + 20×topical_relevance + 14×machine_readability + 10×historical_depth + 10×citation_strength + 8×update_value + 8×interoperability + 6×cost_efficiency − 10×privacy_risk − 10×legal_friction
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {top20.map((s, i) => {
              const clr = i < 3 ? P.gold : i < 10 ? P.teal : P.blue;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                  border: `1px solid ${clr}25`, borderLeft: `4px solid ${clr}`, background: P.card, borderRadius: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${clr}20`,
                    border: `1px solid ${clr}50`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, color: clr, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: P.t1 }}>{s.name}</div>
                    <div style={{ fontSize: 9, color: P.t4, marginTop: 2 }}>
                      {CLUSTERS[s.cluster]?.label} · Auth: {s.auth} · {s.fmt} · Update: {s.update}
                    </div>
                  </div>
                  <span style={{ fontSize: 8, padding: "2px 7px", background: `${CLASS_COLORS[s.cls]}20`,
                    border: `1px solid ${CLASS_COLORS[s.cls]}50`, borderRadius: 4, color: CLASS_COLORS[s.cls] }}>{s.cls}</span>
                  <div style={{ textAlign: "right", minWidth: 80 }}>
                    <div style={{ width: 80, height: 6, background: P.b, borderRadius: 3, overflow: "hidden", marginBottom: 3 }}>
                      <div style={{ width: `${s.score}%`, height: "100%", background: clr, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: clr }}>{s.score}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}