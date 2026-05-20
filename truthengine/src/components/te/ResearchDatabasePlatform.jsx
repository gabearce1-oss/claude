import { useState } from "react";
import { P } from "../../lib/teData";
import EvidenceLogTab from "./EvidenceLogTab";
import SemanticSearchPanel from "./SemanticSearchPanel";
import KnowledgeGraphVisualizer from "./KnowledgeGraphVisualizer";
import ChronologicalTimeline from "./ChronologicalTimeline";

// ── Data from workbook + system spec ────────────────────────────

const PRIORITY_APIS = [
  { source:"Data.gov CKAN",              country:"U.S.", connector:"Catalog metadata API",    why:"Discovery spine for federal datasets",              priority:"High",   access:"public-open"    },
  { source:"NARA Catalog API",           country:"U.S.", connector:"Official API",            why:"Archival metadata, authorities, digitized records", priority:"High",   access:"public-open"    },
  { source:"Library of Congress JSON",   country:"U.S.", connector:"Official API",            why:"Collections, items, searches, media metadata",     priority:"High",   access:"public-open"    },
  { source:"Congress.gov API",           country:"U.S.", connector:"Official API",            why:"Bills, hearings, committee reports",                priority:"High",   access:"public-open"    },
  { source:"Census API",                 country:"U.S.", connector:"Official API",            why:"Demographics and geography baselines",              priority:"High",   access:"public-open"    },
  { source:"OpenAlex",                   country:"INT",  connector:"REST API",                why:"Open scholarly graph, 250M+ works",                priority:"High",   access:"public-open"    },
  { source:"PACER (CourtListener)",      country:"U.S.", connector:"API / bulk data",         why:"Federal docket metadata, public court records",     priority:"High",   access:"licensed"       },
  { source:"EPA ECHO",                   country:"U.S.", connector:"REST API",                why:"Enforcement and compliance public data",            priority:"Medium", access:"public-open"    },
  { source:"Mexico INAI / transparencia",country:"MX",  connector:"Search portal + FOIA",   why:"Federal transparency requests (MX equiv.)",         priority:"High",   access:"public-open"    },
  { source:"BNE / UNAM catalog",         country:"MX",  connector:"OAI-PMH / search",        why:"Mexican national bibliography + UNAM holdings",    priority:"High",   access:"public-open"    },
];

const MORTALITY_SOURCES = [
  { region:"Los Angeles",                   cls:"Medical examiner + county death records + library obituary guides",                          note:"LA County ME case search + library obituary/vital-record guides." },
  { region:"El Paso",                       cls:"Medical examiner + county clerk death indexes",                                               note:"Pair county ME resources with clerk index/search workflows."     },
  { region:"Nogales / Santa Cruz–Pima",     cls:"Medical examiner + AZ obituary/library + Sonora civil registry",                             note:"Pima County coverage for Santa Cruz plus Sonora defunción workflows." },
  { region:"Mexicali / Tijuana",            cls:"SEMEFO + Registro Civil + hemeroteca/newspaper archives",                                    note:"Baja California forensic/civil registry plus archive layers."    },
  { region:"National / Research",           cls:"Military obituaries + genealogy indexes + library obituary guides",                          note:"Triangulation only; never sole proof."                           },
];

const RISK_GOVERNANCE = [
  { area:"PTSD / symptom detection",        rule:"Do not infer diagnosis or symptoms from social media or public traces."                      },
  { area:"Social media",                    rule:"Aggregate discourse only; no private groups, DMs, or person-level trauma profiling."         },
  { area:"Shelters / refugee centers",      rule:"Track organization/program data only — not residents."                                       },
  { area:"Restraining orders",              rule:"Fragmented jurisdictional data; manual review or metadata-only."                             },
  { area:"Sex-offender registries",         rule:"Narrow public-reference use only; no stigmatizing bulk joins."                               },
];

const SW_GEOGRAPHY = [
  { geo:"Los Angeles County",            phase1:true,  rationale:"Large Hispanic population; strong ME and library obituary infrastructure."   },
  { geo:"El Paso County",                phase1:true,  rationale:"Border county with county-level ME and death-index pathways."                },
  { geo:"Nogales / Santa Cruz AZ",       phase1:true,  rationale:"Cross-border relevance; pair with Sonora civil-registry workflows."          },
  { geo:"Tijuana",                       phase1:true,  rationale:"Border-region forensic and shelter-organization relevance."                  },
  { geo:"Mexicali",                      phase1:true,  rationale:"SEMEFO and Baja California state-system relevance."                          },
];

const TRAUMA_FIELDS = [
  { field:"Combat exposure evidence",                  use:"YES",  note:"Document from service records, awards, unit histories, sworn statements."    },
  { field:"Clinician-authored PTSD diagnosis",         use:"YES*", note:"Only if lawfully obtained and permissioned."                                 },
  { field:"VA disability / service-connected ref.",    use:"YES",  note:"Track as documented evidence, not inference."                                },
  { field:"Social-media behavior or code-switching",   use:"NO",   note:"Not valid for diagnosis or symptom detection."                               },
  { field:"Housing instability / job loss",            use:"NO",   note:"Too nonspecific; use only as social-context metadata."                       },
];

const TOP_100_SOURCES = [
  // Federal / National
  { id:"S001", category:"Federal",   name:"NARA — Archival Research Catalog",          country:"U.S.", access:"public-open",    ingest:"API",           priority:1  },
  { id:"S002", category:"Federal",   name:"Library of Congress — Digital Collections", country:"U.S.", access:"public-open",    ingest:"API",           priority:1  },
  { id:"S003", category:"Federal",   name:"Data.gov CKAN Catalog",                     country:"U.S.", access:"public-open",    ingest:"API",           priority:1  },
  { id:"S004", category:"Federal",   name:"Congress.gov — Bills & Hearings",           country:"U.S.", access:"public-open",    ingest:"API",           priority:1  },
  { id:"S005", category:"Federal",   name:"U.S. Census Bureau API",                    country:"U.S.", access:"public-open",    ingest:"API",           priority:1  },
  { id:"S006", category:"Federal",   name:"PACER via CourtListener",                   country:"U.S.", access:"licensed",       ingest:"API/bulk",      priority:1  },
  { id:"S007", category:"Federal",   name:"ICE ERO — FOIA Reading Room",               country:"U.S.", access:"FOIA-derived",   ingest:"Manual/PDF",    priority:1  },
  { id:"S008", category:"Federal",   name:"VA BIRLS — FOIA Extract",                   country:"U.S.", access:"FOIA-derived",   ingest:"Manual",        priority:1  },
  { id:"S009", category:"Federal",   name:"DHS Inspector General Reports",             country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:1  },
  { id:"S010", category:"Federal",   name:"GAO Reports (gao.gov)",                     country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:1  },
  { id:"S011", category:"Federal",   name:"CRS Reports (everycrsreport.com)",          country:"U.S.", access:"public-open",    ingest:"HTML",          priority:1  },
  { id:"S012", category:"Federal",   name:"DCAS — Vietnam Conflict Extract",           country:"U.S.", access:"public-open",    ingest:"Bulk CSV",      priority:1  },
  { id:"S013", category:"Federal",   name:"Selective Service System — RG 147",         country:"U.S.", access:"FOIA-derived",   ingest:"Manual",        priority:1  },
  { id:"S014", category:"Federal",   name:"DMDC — FOIA Extract",                       country:"U.S.", access:"FOIA-derived",   ingest:"Manual",        priority:1  },
  { id:"S015", category:"Federal",   name:"USCIS N-644 Application Records",           country:"U.S.", access:"FOIA-derived",   ingest:"Manual",        priority:1  },
  { id:"S016", category:"Federal",   name:"EPA ECHO API",                              country:"U.S.", access:"public-open",    ingest:"API",           priority:3  },
  { id:"S017", category:"Federal",   name:"DOJ — FOIA Reading Room",                   country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S018", category:"Federal",   name:"CBP Manifests — FOIA Derived",             country:"U.S.", access:"FOIA-derived",   ingest:"Manual",        priority:2  },
  { id:"S019", category:"Federal",   name:"State Dept — Consular Reports of Death",   country:"U.S.", access:"FOIA-derived",   ingest:"Manual",        priority:2  },
  { id:"S020", category:"Federal",   name:"HHS — Refugee Resettlement Data",          country:"U.S.", access:"public-open",    ingest:"Bulk CSV",      priority:2  },
  // Mexico Public
  { id:"S021", category:"Mexico",    name:"INAI / Plataforma de Transparencia",        country:"MX",   access:"public-open",    ingest:"Search portal", priority:1  },
  { id:"S022", category:"Mexico",    name:"UNAM — Repositorio Institucional",          country:"MX",   access:"public-open",    ingest:"OAI-PMH",       priority:1  },
  { id:"S023", category:"Mexico",    name:"UABC — Research Publications",              country:"MX",   access:"public-open",    ingest:"HTML/PDF",      priority:1  },
  { id:"S024", category:"Mexico",    name:"SRE — Consular Death Records (Actas)",      country:"MX",   access:"FOIA-derived",   ingest:"Manual",        priority:1  },
  { id:"S025", category:"Mexico",    name:"SEDENA — Public Service Records",           country:"MX",   access:"restricted",     ingest:"Manual only",   priority:2  },
  { id:"S026", category:"Mexico",    name:"SEMEFO — Baja California",                  country:"MX",   access:"public-open",    ingest:"Search portal", priority:1  },
  { id:"S027", category:"Mexico",    name:"Registro Civil — BC Defunciones",           country:"MX",   access:"public-open",    ingest:"Manual",        priority:1  },
  { id:"S028", category:"Mexico",    name:"HNDM — Newspaper Archive UNAM",             country:"MX",   access:"public-open",    ingest:"Search/HTML",   priority:2  },
  { id:"S029", category:"Mexico",    name:"CNDH — Human Rights Reports",               country:"MX",   access:"public-open",    ingest:"HTML/PDF",      priority:1  },
  { id:"S030", category:"Mexico",    name:"INE — Electoral Registry Metadata",         country:"MX",   access:"metadata-only",  ingest:"Manual",        priority:3  },
  // Academic / Think Tank
  { id:"S031", category:"Academic",  name:"OpenAlex — Scholarly Graph",                country:"INT",  access:"public-open",    ingest:"API",           priority:1  },
  { id:"S032", category:"Academic",  name:"RAND Corporation Reports",                  country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:1  },
  { id:"S033", category:"Academic",  name:"Pew Research — Immigration Studies",        country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:1  },
  { id:"S034", category:"Academic",  name:"ProQuest Dissertations & Theses",           country:"INT",  access:"licensed",       ingest:"API (licensed)",priority:2  },
  { id:"S035", category:"Academic",  name:"JSTOR — Open Access Content",               country:"INT",  access:"licensed",       ingest:"API (licensed)",priority:2  },
  { id:"S036", category:"Academic",  name:"SSRN Preprints",                            country:"INT",  access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S037", category:"Academic",  name:"Migration Policy Institute",                country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:1  },
  { id:"S038", category:"Academic",  name:"American Immigration Council",              country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:1  },
  { id:"S039", category:"Academic",  name:"National Immigration Law Center",           country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S040", category:"Academic",  name:"UC San Diego — Chicano Studies Lib.",       country:"U.S.", access:"public-open",    ingest:"Catalog/HTML",  priority:2  },
  { id:"S041", category:"Academic",  name:"SDSU — Special Collections",                country:"U.S.", access:"public-open",    ingest:"Catalog/HTML",  priority:2  },
  { id:"S042", category:"Academic",  name:"UCLA — Chicano Studies Research Center",   country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S043", category:"Academic",  name:"Texas A&M — TAMIU Border Studies",         country:"U.S.", access:"public-open",    ingest:"HTML",          priority:3  },
  { id:"S044", category:"Academic",  name:"UT El Paso — Digital Archives",            country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  // NGO / Border Organizations
  { id:"S045", category:"NGO",       name:"Deported Veterans Support House (Tijuana)", country:"MX",  access:"public-open",    ingest:"HTML/manual",   priority:1  },
  { id:"S046", category:"NGO",       name:"Unified U.S. Deported Veterans",           country:"MX",   access:"public-open",    ingest:"HTML/manual",   priority:1  },
  { id:"S047", category:"NGO",       name:"American Friends Service Committee",        country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S048", category:"NGO",       name:"CLINIC — Catholic Legal Imm. Network",    country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S049", category:"NGO",       name:"ACLU — Immigrants' Rights Project",        country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S050", category:"NGO",       name:"Human Rights Watch — MX/US Reports",       country:"INT",  access:"public-open",    ingest:"HTML/PDF",      priority:1  },
  { id:"S051", category:"NGO",       name:"Amnesty International — Border Reports",   country:"INT",  access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S052", category:"NGO",       name:"Borderlinks — Nogales Shelter Network",    country:"U.S.", access:"public-open",    ingest:"HTML/manual",   priority:3  },
  { id:"S053", category:"NGO",       name:"Al Otro Lado — Legal Aid Tijuana",         country:"MX",   access:"public-open",    ingest:"HTML/manual",   priority:2  },
  { id:"S054", category:"NGO",       name:"Kino Border Initiative",                   country:"MX",   access:"public-open",    ingest:"HTML/PDF",      priority:3  },
  // State / Local
  { id:"S055", category:"State",     name:"CA DOJ — Open Justice Portal",             country:"U.S.", access:"public-open",    ingest:"API/bulk",      priority:2  },
  { id:"S056", category:"State",     name:"TX OAG — Open Records Portal",             country:"U.S.", access:"public-open",    ingest:"HTML/manual",   priority:2  },
  { id:"S057", category:"State",     name:"AZ DPS — Public Data",                     country:"U.S.", access:"public-open",    ingest:"HTML",          priority:3  },
  { id:"S058", category:"State",     name:"LA County Medical Examiner",               country:"U.S.", access:"public-open",    ingest:"Search portal", priority:1  },
  { id:"S059", category:"State",     name:"El Paso County Clerk — Death Index",       country:"U.S.", access:"public-open",    ingest:"Search portal", priority:1  },
  { id:"S060", category:"State",     name:"Pima County ME (Tucson)",                  country:"U.S.", access:"public-open",    ingest:"Search portal", priority:1  },
  // Media / Archive
  { id:"S061", category:"Media",     name:"ProPublica DataStore",                     country:"U.S.", access:"public-open",    ingest:"API/bulk",      priority:2  },
  { id:"S062", category:"Media",     name:"Internet Archive — Wayback Machine",       country:"INT",  access:"public-open",    ingest:"API",           priority:2  },
  { id:"S063", category:"Media",     name:"Newspapers.com (licensed)",                country:"INT",  access:"licensed",       ingest:"Search (lic.)", priority:2  },
  { id:"S064", category:"Media",     name:"Chronicling America — LoC Historic Papers",country:"U.S.", access:"public-open",    ingest:"API",           priority:2  },
  { id:"S065", category:"Media",     name:"El Fronterizo Archive (BC newspaper)",     country:"MX",   access:"public-open",    ingest:"Manual",        priority:2  },
  // Law / Policy
  { id:"S066", category:"Legal",     name:"HeinOnline — Law Reviews (licensed)",      country:"U.S.", access:"licensed",       ingest:"API (lic.)",    priority:2  },
  { id:"S067", category:"Legal",     name:"Casetext / Google Scholar Case Law",       country:"U.S.", access:"public-open",    ingest:"HTML",          priority:2  },
  { id:"S068", category:"Legal",     name:"EOIR — Immigration Court Data (DOJ)",      country:"U.S.", access:"public-open",    ingest:"Bulk CSV",      priority:1  },
  { id:"S069", category:"Legal",     name:"BIA Precedent Decisions",                  country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S070", category:"Legal",     name:"TRAC Immigration Reports",                 country:"U.S.", access:"public-open",    ingest:"HTML/CSV",      priority:1  },
  // Mortality / Obituary
  { id:"S071", category:"Mortality", name:"Social Security Death Index (FamilySearch)",country:"U.S.", access:"public-open",   ingest:"Search portal", priority:2  },
  { id:"S072", category:"Mortality", name:"Ancestry.com Military Records (licensed)", country:"U.S.", access:"licensed",       ingest:"API (lic.)",    priority:2  },
  { id:"S073", category:"Mortality", name:"FindAGrave — Public Profiles",             country:"U.S.", access:"public-open",    ingest:"Search portal", priority:3  },
  { id:"S074", category:"Mortality", name:"Baja California Registro Civil",           country:"MX",   access:"public-open",    ingest:"Manual",        priority:1  },
  { id:"S075", category:"Mortality", name:"Sonora Civil Registry — Defunciones",      country:"MX",   access:"public-open",    ingest:"Manual",        priority:2  },
  // Discourse (aggregate only)
  { id:"S076", category:"Discourse", name:"Internet Archive TV News Captions",        country:"INT",  access:"public-open",    ingest:"API",           priority:3  },
  { id:"S077", category:"Discourse", name:"GDELT Project — News Events",              country:"INT",  access:"public-open",    ingest:"API/bulk",      priority:2  },
  { id:"S078", category:"Discourse", name:"Reddit — Public Subreddits (aggregate)",   country:"INT",  access:"public-open",    ingest:"API (agg.)",    priority:3  },
  { id:"S079", category:"Discourse", name:"Twitter/X — Public Search (aggregate)",    country:"INT",  access:"restricted",     ingest:"API (limited)", priority:4  },
  { id:"S080", category:"Discourse", name:"YouTube — Public Captions (aggregate)",    country:"INT",  access:"public-open",    ingest:"API (agg.)",    priority:3  },
  // Additional high-value
  { id:"S081", category:"Federal",   name:"NARA AAD — Vietnam DCAS Online",           country:"U.S.", access:"public-open",    ingest:"Search/HTML",   priority:1  },
  { id:"S082", category:"Federal",   name:"Vietnam Veterans Memorial Fund DB",        country:"U.S.", access:"public-open",    ingest:"Search",        priority:1  },
  { id:"S083", category:"Federal",   name:"Pentagon — Valor Decoration Records",      country:"U.S.", access:"FOIA-derived",   ingest:"Manual",        priority:2  },
  { id:"S084", category:"Academic",  name:"Chicano Studies Internet Resource CTR",    country:"U.S.", access:"public-open",    ingest:"HTML",          priority:2  },
  { id:"S085", category:"Academic",  name:"Border Studies Journal (UTEP)",            country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S086", category:"Mexico",    name:"Colegio de la Frontera Norte (COLEF)",     country:"MX",   access:"public-open",    ingest:"HTML/PDF",      priority:1  },
  { id:"S087", category:"Mexico",    name:"El Colegio de México — Publications",      country:"MX",   access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S088", category:"Legal",     name:"ILRC — Immigrant Legal Resource Center",   country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S089", category:"Legal",     name:"National Immigration Project (NLG)",       country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S090", category:"NGO",       name:"Vietnam Veterans of America",              country:"U.S.", access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S091", category:"Federal",   name:"SSA — Death Master File (public portion)", country:"U.S.", access:"public-open",    ingest:"Bulk CSV",      priority:2  },
  { id:"S092", category:"Federal",   name:"BLS — Occupational / Demographics Data",  country:"U.S.", access:"public-open",    ingest:"API",           priority:3  },
  { id:"S093", category:"Academic",  name:"Journal of Military History (open issues)",country:"INT",  access:"public-open",    ingest:"HTML/PDF",      priority:2  },
  { id:"S094", category:"Academic",  name:"Latin American Research Review",           country:"INT",  access:"licensed",       ingest:"API (lic.)",    priority:2  },
  { id:"S095", category:"Media",     name:"Texas Observer Archive",                   country:"U.S.", access:"public-open",    ingest:"HTML",          priority:2  },
  { id:"S096", category:"Media",     name:"Proceso — Mexico News Archive",            country:"MX",   access:"public-open",    ingest:"HTML",          priority:2  },
  { id:"S097", category:"State",     name:"NM State Records Center — Archives",       country:"U.S.", access:"public-open",    ingest:"Manual",        priority:3  },
  { id:"S098", category:"State",     name:"Colorado State Archives",                  country:"U.S.", access:"public-open",    ingest:"Manual",        priority:3  },
  { id:"S099", category:"Federal",   name:"HHS — ORR Refugee Population Data",        country:"U.S.", access:"public-open",    ingest:"Bulk CSV",      priority:3  },
  { id:"S100", category:"Federal",   name:"EOIR — Removal Order Public Data",         country:"U.S.", access:"public-open",    ingest:"Bulk CSV",      priority:1  },
];

const PIPELINE_CLUSTERS = [
  { id:1, name:"Raw Data Intake",          icon:"📥", color:"#4A9EFF", items:["API connectors","RSS crawlers","FOIA reading rooms","Bulk file ingestion (PDF, HTML, CSV, JSON, XML)","Source URL + checksum preservation","OCR (when necessary only)"] },
  { id:2, name:"Normalization / Cleaning", icon:"🧹", color:"#2DD4BF", items:["Deduplication","Metadata extraction","Language detection","ES↔EN translation pipeline","Date & place normalization","Source credibility scoring","Document quality scoring"] },
  { id:3, name:"Entity Resolution / KG",   icon:"🕸️", color:"#9D7BFF", items:["Person / org / agency entities","Relationship edges (served_in, removed_by, cited_by…)","Archive collection nodes","Legal matter & event nodes","Graph: Neo4j or equivalent","Confidence-weighted edges"] },
  { id:4, name:"Analytics",               icon:"📊", color:"#F5B942", items:["Descriptive statistics","SPSS-ready exports","Vector embeddings (pgvector)","Topic modeling (LDA / BERTopic)","Temporal trend analysis","Geospatial mapping","Contradiction detection","Evidence gap analysis"] },
  { id:5, name:"Analyst Workbench",        icon:"🔬", color:"#ff7700", items:["Human-in-the-loop review","Claim verification workflow","Entity merge review","Timeline reconstruction","Export to case memo / evidentiary report","Full audit log per action"] },
  { id:6, name:"Reporting / Search",       icon:"🖥️", color:"#00cc88", items:["Executive dashboard","Faceted + semantic search","Multilingual ES/EN queries","Map + timeline views","Source credibility overlay","Literature review generator","Policy brief generator","Data provenance panel"] },
];

const DB_SCHEMA = [
  { table:"sources",            pk:"source_id (UUID)",    key_fields:"name, type, jurisdiction, url, access_policy, credibility_score, update_freq", sensitivity:"Low",    retention:"Permanent"   },
  { table:"crawls",             pk:"crawl_id (UUID)",     key_fields:"source_id, started_at, status, records_fetched, checksum, parser_used",        sensitivity:"Low",    retention:"2 years"     },
  { table:"documents",          pk:"doc_id (UUID)",       key_fields:"source_id, url, title, lang, ingest_date, sha256, translation_status, confidence", sensitivity:"Medium", retention:"10 years"  },
  { table:"document_chunks",    pk:"chunk_id (UUID)",     key_fields:"doc_id, chunk_index, text, embedding (vector), token_count",                    sensitivity:"Medium", retention:"10 years"    },
  { table:"entities",           pk:"entity_id (UUID)",    key_fields:"type, canonical_name, aliases[], confidence, review_status",                    sensitivity:"High",   retention:"Permanent"   },
  { table:"relationships",      pk:"rel_id (UUID)",       key_fields:"from_entity, to_entity, rel_type, confidence, source_doc, analyst_reviewed",    sensitivity:"High",   retention:"Permanent"   },
  { table:"evidence_log",       pk:"evidence_id (UUID)",  key_fields:"case_id, doc_id, excerpt, analyst_id, action, timestamp, sha256",               sensitivity:"High",   retention:"Permanent"   },
  { table:"audit_log",          pk:"audit_id (UUID)",     key_fields:"user_id, action, table_affected, record_id, timestamp, ip_hash",                sensitivity:"High",   retention:"7 years"     },
  { table:"foia_requests",      pk:"foia_id (UUID)",      key_fields:"agency, subject, filed_date, status, days_overdue, response_url",               sensitivity:"Medium", retention:"Permanent"   },
  { table:"organizations",      pk:"org_id (UUID)",       key_fields:"name, mission, services[], geography, contact_public, program_capacity",        sensitivity:"Low",    retention:"Permanent"   },
  { table:"literature_sources", pk:"lit_id (UUID)",       key_fields:"authors, title, year, doi, abstract, tags[], open_access",                      sensitivity:"Low",    retention:"Permanent"   },
  { table:"risk_flags",         pk:"flag_id (UUID)",      key_fields:"record_id, table_name, flag_type, severity, reviewed_by, resolution",           sensitivity:"High",   retention:"7 years"     },
];

const NOEM_CONTRADICTION_SOURCE = {
  sept2_2025: {
    date: "Sept 2, 2025",
    from: "DHS Secretary Kristi Noem",
    to: "Rep. Seth Moulton (MA-06)",
    statement: "Regarding your question on the number of veterans that have been removed since January 20, 2025, ICE has removed eight veterans.",
    source: "Official DHS letter",
    evidenceType: "Cabinet-level written statement",
  },
  dec11_2025: {
    date: "Dec 11, 2025",
    hearing: "House Homeland Security Committee",
    statement: "DHS have NOT deported U.S. citizens or military veterans.",
    followup: "Same day, Rep. Moulton publicly released the Sept 2 letter, exposing direct contradiction.",
    source: "Congressional testimony + press release",
    evidenceType: "Cabinet-level Congressional testimony",
  },
  assessment: "Courtroom-quality contradictory statements. Strongest single institutional-accountability finding of March-April 2026 cycle.",
};

const ROADMAP = [
  { phase:1, name:"MVP — Authoritative Sources",   duration:"0–3 mo",  color:"#2DD4BF", items:["Top 20 federal APIs wired","DCAS/NARA/Census/EOIR bulk ingest","Mexico INAI + COLEF + CNDH ingestion","Core DB schema live (Postgres + pgvector)","Basic faceted search (keyword)","FOIA tracker integrated"] },
  { phase:2, name:"Expansion — Courts & Academic", duration:"3–6 mo",  color:"#4A9EFF", items:["CourtListener/PACER connector","OpenAlex + SSRN + ProQuest (licensed)","State ME death-index pipelines","Mortality/obituary source integration","Entity resolution layer (NLP)","ES↔EN translation pipeline"] },
  { phase:3, name:"Hardening — Analytics & KG",    duration:"6–9 mo",  color:"#9D7BFF", items:["Neo4j knowledge graph build","Vector semantic search (pgvector)","Topic modeling (BERTopic)","Contradiction detection logic","SPSS-ready export endpoints","Evidence scoring + gap analysis"] },
  { phase:4, name:"Analyst Workflows",             duration:"9–12 mo", color:"#F5B942", items:["Analyst workbench UI","Human-in-the-loop review queues","Case memo export","Evidentiary report builder","Full audit log enforcement","Multi-analyst conflict resolution"] },
  { phase:5, name:"Reporting & Dashboard",         duration:"12–18 mo",color:"#ff7700", items:["Executive dashboard","Multilingual semantic search","Timeline + geospatial map UI","Literature review generator","Policy brief auto-generator","CHC briefing module integration"] },
];

const ACCESS_COLORS = {
  "public-open":   "#2DD4BF",
  "licensed":      "#4A9EFF",
  "FOIA-derived":  "#F5B942",
  "restricted":    "#ff5500",
  "metadata-only": "#9D7BFF",
  "manual-only":   "#ff7700",
};

const INGEST_COLORS = {
  "API":           "#2DD4BF",
  "API/bulk":      "#2DD4BF",
  "Bulk CSV":      "#4A9EFF",
  "HTML/PDF":      "#9D7BFF",
  "Manual":        "#ff7700",
  "Manual/PDF":    "#ff7700",
  "manual only":   "#ff7700",
  "Search portal": "#F5B942",
  "OAI-PMH":       "#4A9EFF",
};

const TABS = [
  { id:"overview",    label:"🏠 Overview"              },
  { id:"sources",     label:"📡 Top 100 Sources"       },
  { id:"pipeline",    label:"⚙️ 6-Cluster Pipeline"    },
  { id:"schema",      label:"🗄️ Database Schema"       },
  { id:"governance",  label:"🛡️ Risk & Governance"     },
  { id:"geography",   label:"🗺️ Phase 1 Geography"     },
  { id:"roadmap",     label:"🚀 Roadmap"               },
  { id:"trauma",      label:"⚕️ Trauma Evidence Rules"  },
  { id:"mortality",   label:"💀 Mortality Sources"     },
  { id:"evidencelog", label:"🔏 Evidence Log"           },
  { id:"semantic",    label:"🧠 Semantic Search"         },
  { id:"kgraph",      label:"🕸️ Knowledge Graph"        },
  { id:"timeline",    label:"📅 Chronological Timeline" },
];

const CATS = ["All","Federal","Mexico","Academic","NGO","Legal","State","Media","Discourse","Mortality"];
const ACCESS_TYPES = ["All","public-open","licensed","FOIA-derived","restricted","metadata-only"];
const INGEST_TYPES = ["All","API","Bulk CSV","HTML/PDF","Manual","Search portal"];

export default function ResearchDatabasePlatform() {
  const [tab, setTab]               = useState("overview");
  const [evidenceRecords, setEvidenceRecords] = useState([]);
  const [catFilter, setCatFilter]   = useState("All");
  const [accessFilter, setAccessFilter] = useState("All");
  const [ingestFilter, setIngestFilter] = useState("All");
  const [search, setSearch]         = useState("");
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [expandedSchema, setExpandedSchema]   = useState(null);

  const filteredSources = TOP_100_SOURCES.filter(s => {
    if (catFilter !== "All" && s.category !== catFilter) return false;
    if (accessFilter !== "All" && s.access !== accessFilter) return false;
    if (ingestFilter !== "All" && !s.ingest.toLowerCase().startsWith(ingestFilter.toLowerCase())) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.country.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const catCounts = CATS.reduce((acc, c) => {
    acc[c] = c === "All" ? TOP_100_SOURCES.length : TOP_100_SOURCES.filter(s => s.category === c).length;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily:"'IBM Plex Mono',monospace", color:P.t1 }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(90deg,${P.card},#0D1525)`, border:`2px solid ${P.gold}40`, borderRadius:12, padding:"14px 20px", marginBottom:14 }}>
        <div style={{ fontSize:7, color:P.gold, letterSpacing:3, fontWeight:800, marginBottom:4 }}>
          🔬 RESEARCH DATABASE PLATFORM · PUBLIC RECORDS ARCHITECTURE · AUMER FOUNDATION
        </div>
        <div style={{ fontSize:14, fontWeight:800, color:P.t1, marginBottom:6 }}>
          Deported U.S. Military Personnel — Mexican Nationality — Vietnam Era to Present
        </div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {[
            ["100+","Priority Sources",P.gold],
            ["700+","Phase 2–3 Target",P.blue],
            ["6","Pipeline Clusters",P.teal],
            ["12","DB Tables",P.violet],
            ["5","Roadmap Phases",P.amber],
          ].map(([v,l,c]) => (
            <div key={l} style={{ textAlign:"center", minWidth:70 }}>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, fontWeight:800, color:c }}>{v}</div>
              <div style={{ fontSize:7, color:P.t4 }}>{l}</div>
            </div>
          ))}
          <div style={{ marginLeft:"auto", background:`${P.red}10`, border:`1px solid ${P.red}30`, borderRadius:8, padding:"6px 12px", fontSize:7, color:P.red, lineHeight:1.8 }}>
            ⚠ LAWFUL PUBLIC-INTEREST RESEARCH ONLY<br/>
            No people-hunting · No PTSD inference · No private data collection<br/>
            No shelter resident tracking · No harassment automation
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, marginBottom:14, overflowX:"auto", paddingBottom:2, flexWrap:"wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:"6px 12px", background: tab === t.id ? `${P.gold}18` : "transparent",
              border: `1px solid ${tab === t.id ? P.gold : P.b}`,
              color: tab === t.id ? P.gold : P.t4, borderRadius:20, fontSize:8, fontWeight: tab === t.id ? 800 : 600,
              cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {/* Mission */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px", gridColumn:"1 / -1" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.gold, marginBottom:8 }}>📋 Platform Mission & Scope</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:10 }}>
              {[
                { icon:"📜", t:"Public Records Research",     d:"Federal, state, Mexican public records; FOIA-derived extracts; archival metadata." },
                { icon:"📚", t:"Historical & Policy Analysis", d:"Vietnam era through present; immigration law; removal policy; reintegration context." },
                { icon:"🌎", t:"Cross-Border Archival",        d:"U.S. NARA, Mexico SRE, Registro Civil, SEMEFO, UNAM, COLEF, hemeroteca archives." },
                { icon:"🔬", t:"Literature Review",            d:"OpenAlex, ProQuest, JSTOR, SSRN, Chicano Studies, migration and border journals." },
                { icon:"🗂️",  t:"Structured Evidence Logging",  d:"SHA-256 provenance, analyst attribution, citation-ready excerpts, audit trail." },
                { icon:"📈", t:"Aggregate Trend Analysis",     d:"SPSS exports, vector embeddings, topic modeling, temporal/network/geospatial analysis." },
              ].map(({ icon, t, d }) => (
                <div key={t} style={{ background:"#080D18", borderRadius:7, padding:"10px 12px", border:`1px solid ${P.b}` }}>
                  <div style={{ fontSize:14, marginBottom:4 }}>{icon}</div>
                  <div style={{ fontSize:8, fontWeight:800, color:P.t1, marginBottom:3 }}>{t}</div>
                  <div style={{ fontSize:7, color:P.t3, lineHeight:1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Source category breakdown */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.blue, marginBottom:8 }}>📡 Top-100 Source Breakdown</div>
            {CATS.filter(c => c !== "All").map(c => {
              const cnt = catCounts[c]; const pct = Math.round((cnt/100)*100);
              const col = { Federal:"#4A9EFF", Mexico:"#2DD4BF", Academic:"#9D7BFF", NGO:"#2DD4BF",
                            Legal:"#F5B942", State:"#ff7700", Media:"#ff5500", Discourse:"#ff0055", Mortality:"#ff9900" }[c] || P.gold;
              return (
                <div key={c} style={{ marginBottom:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:7, marginBottom:2 }}>
                    <span style={{ color:P.t3 }}>{c}</span>
                    <span style={{ color:col, fontWeight:700 }}>{cnt}</span>
                  </div>
                  <div style={{ background:"#030508", borderRadius:3, height:5, overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:3, transition:"width 1s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Access type breakdown */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.teal, marginBottom:8 }}>🔑 Access Classification</div>
            {Object.entries(ACCESS_COLORS).map(([type, color]) => {
              const cnt = TOP_100_SOURCES.filter(s => s.access === type).length;
              return (
                <div key={type} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:`1px solid ${P.b}20` }}>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color }} />
                    <span style={{ fontSize:7, color:P.t3 }}>{type}</span>
                  </div>
                  <span style={{ fontSize:9, fontWeight:800, color, fontFamily:"'IBM Plex Mono',monospace" }}>{cnt}</span>
                </div>
              );
            })}
          </div>

          {/* Priority APIs from workbook */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px", gridColumn:"1 / -1" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.violet, marginBottom:8 }}>⚡ Workbook Priority APIs</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {["Source","Country","Connector","Why It Matters","Priority"].map(h => (
                      <th key={h} style={{ padding:"5px 10px", background:"#080D18", fontSize:7, fontWeight:800, color:P.violet, textAlign:"left", borderBottom:`1px solid ${P.b}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRIORITY_APIS.map((r,i) => (
                    <tr key={i} style={{ background: i%2===0 ? "transparent" : "#080D1820" }}>
                      <td style={{ padding:"4px 10px", fontSize:8, color:P.t2, borderBottom:`1px solid ${P.b}15` }}>{r.source}</td>
                      <td style={{ padding:"4px 10px", fontSize:7, color:P.t4, borderBottom:`1px solid ${P.b}15` }}>{r.country}</td>
                      <td style={{ padding:"4px 10px", fontSize:7, color:P.teal, borderBottom:`1px solid ${P.b}15` }}>{r.connector}</td>
                      <td style={{ padding:"4px 10px", fontSize:7, color:P.t3, borderBottom:`1px solid ${P.b}15` }}>{r.why}</td>
                      <td style={{ padding:"4px 10px", borderBottom:`1px solid ${P.b}15` }}>
                        <span style={{ fontSize:7, background: r.priority==="High"?`${P.gold}15`:`${P.b}`, color: r.priority==="High"?P.gold:P.t4, borderRadius:3, padding:"1px 6px", fontWeight:700 }}>{r.priority}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP 100 SOURCES ── */}
      {tab === "sources" && (
        <div>
          {/* Filters */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"10px 14px", marginBottom:12, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sources..."
              style={{ fontFamily:"inherit", fontSize:9, background:"#080D18", border:`1px solid ${P.b}`, borderRadius:5, padding:"4px 10px", color:P.t1, outline:"none", flex:1, minWidth:120 }} />
            {[["Category",catFilter,setCatFilter,CATS],["Access",accessFilter,setAccessFilter,ACCESS_TYPES],["Ingest",ingestFilter,setIngestFilter,INGEST_TYPES]].map(([label,val,set,opts]) => (
              <div key={label} style={{ display:"flex", gap:3, alignItems:"center" }}>
                <span style={{ fontSize:7, color:P.t4 }}>{label}:</span>
                <select value={val} onChange={e => set(e.target.value)}
                  style={{ fontFamily:"inherit", fontSize:8, background:"#080D18", border:`1px solid ${P.b}`, borderRadius:5, padding:"3px 6px", color:P.t2, outline:"none" }}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <span style={{ fontSize:7, color:P.t4 }}>{filteredSources.length} sources</span>
          </div>

          {/* Source table */}
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {["#","ID","Source","Country","Category","Access","Ingest","Priority"].map(h => (
                      <th key={h} style={{ padding:"6px 10px", background:"#080D18", fontSize:7, fontWeight:800, color:P.gold, textAlign:"left", borderBottom:`1px solid ${P.b}`, whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSources.map((s,i) => {
                    const ac = ACCESS_COLORS[s.access] || P.t4;
                    const ic = Object.entries(INGEST_COLORS).find(([k]) => s.ingest.startsWith(k))?.[1] || P.t4;
                    return (
                      <tr key={s.id} style={{ background: i%2===0 ? "transparent" : "#080D1820" }}>
                        <td style={{ padding:"4px 8px", fontSize:7, color:P.t4, borderBottom:`1px solid ${P.b}15` }}>{i+1}</td>
                        <td style={{ padding:"4px 8px", fontSize:7, color:P.t4, fontFamily:"'IBM Plex Mono',monospace", borderBottom:`1px solid ${P.b}15` }}>{s.id}</td>
                        <td style={{ padding:"4px 8px", fontSize:8, color:P.t1, borderBottom:`1px solid ${P.b}15`, maxWidth:260, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.name}</td>
                        <td style={{ padding:"4px 8px", fontSize:7, color:P.t4, borderBottom:`1px solid ${P.b}15` }}>{s.country}</td>
                        <td style={{ padding:"4px 8px", borderBottom:`1px solid ${P.b}15` }}>
                          <span style={{ fontSize:7, color:P.t3 }}>{s.category}</span>
                        </td>
                        <td style={{ padding:"4px 8px", borderBottom:`1px solid ${P.b}15` }}>
                          <span style={{ fontSize:6, background:`${ac}15`, color:ac, borderRadius:3, padding:"1px 5px", fontWeight:700, whiteSpace:"nowrap" }}>{s.access}</span>
                        </td>
                        <td style={{ padding:"4px 8px", borderBottom:`1px solid ${P.b}15` }}>
                          <span style={{ fontSize:6, background:`${ic}15`, color:ic, borderRadius:3, padding:"1px 5px", whiteSpace:"nowrap" }}>{s.ingest}</span>
                        </td>
                        <td style={{ padding:"4px 8px", borderBottom:`1px solid ${P.b}15` }}>
                          <span style={{ fontSize:8, fontWeight:800, color: s.priority===1?P.red:s.priority===2?P.amber:P.t4 }}>P{s.priority}</span>
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

      {/* ── 6-CLUSTER PIPELINE ── */}
      {tab === "pipeline" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12 }}>
          {PIPELINE_CLUSTERS.map(cl => (
            <div key={cl.id} onClick={() => setExpandedCluster(expandedCluster===cl.id ? null : cl.id)}
              style={{ background:P.card, border:`2px solid ${expandedCluster===cl.id ? cl.color : cl.color+"30"}`,
                borderTop:`4px solid ${cl.color}`, borderRadius:10, padding:"14px 16px", cursor:"pointer",
                boxShadow: expandedCluster===cl.id ? `0 0 18px ${cl.color}25` : "none", transition:"all .15s" }}>
              <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:22 }}>{cl.icon}</span>
                <div>
                  <div style={{ fontSize:8, fontWeight:800, color:P.t4, letterSpacing:2 }}>CLUSTER {cl.id}</div>
                  <div style={{ fontSize:10, fontWeight:800, color:cl.color }}>{cl.name}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {cl.items.map((item,i) => (
                  <div key={i} style={{ display:"flex", gap:6, alignItems:"flex-start", fontSize:7, color:P.t3, lineHeight:1.5 }}>
                    <span style={{ color:cl.color, flexShrink:0 }}>▸</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Flow diagram */}
          <div style={{ gridColumn:"1 / -1", background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.t1, marginBottom:10 }}>⚡ Pipeline Data Flow</div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              {PIPELINE_CLUSTERS.map((cl,i) => (
                <div key={cl.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ background:`${cl.color}15`, border:`1px solid ${cl.color}40`, borderRadius:8,
                    padding:"8px 14px", textAlign:"center", minWidth:90 }}>
                    <div style={{ fontSize:12 }}>{cl.icon}</div>
                    <div style={{ fontSize:7, fontWeight:800, color:cl.color, marginTop:2 }}>C{cl.id}</div>
                    <div style={{ fontSize:6, color:P.t4 }}>{cl.name.split(" ")[0]}</div>
                  </div>
                  {i < PIPELINE_CLUSTERS.length-1 && (
                    <div style={{ fontSize:14, color:P.t4 }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DATABASE SCHEMA ── */}
      {tab === "schema" && (
        <div>
          <div style={{ background:`${P.blue}08`, border:`1px solid ${P.blue}25`, borderRadius:10, padding:"10px 14px", marginBottom:12, fontSize:8, color:P.t3, lineHeight:1.7 }}>
            <strong style={{ color:P.blue }}>Hybrid architecture:</strong> PostgreSQL (structured) + pgvector (embeddings) + Neo4j (knowledge graph) + OpenSearch (full-text) + Object storage (raw files) + Job queue (ETL orchestration)
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:10 }}>
            {DB_SCHEMA.map(t => (
              <div key={t.table} onClick={() => setExpandedSchema(expandedSchema===t.table ? null : t.table)}
                style={{ background:P.card, border:`1px solid ${expandedSchema===t.table ? P.violet : P.b}`,
                  borderLeft:`4px solid ${t.sensitivity==="High"?P.red:t.sensitivity==="Medium"?P.amber:P.teal}`,
                  borderRadius:10, padding:"12px 14px", cursor:"pointer", transition:"all .12s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:800, color:P.t1, fontFamily:"'IBM Plex Mono',monospace" }}>{t.table}</span>
                  <span style={{ fontSize:6, background:`${t.sensitivity==="High"?P.red:t.sensitivity==="Medium"?P.amber:P.teal}15`,
                    color:t.sensitivity==="High"?P.red:t.sensitivity==="Medium"?P.amber:P.teal,
                    borderRadius:3, padding:"1px 5px", fontWeight:700 }}>{t.sensitivity}</span>
                </div>
                <div style={{ fontSize:7, color:P.t4, marginBottom:4 }}><strong>PK:</strong> {t.pk}</div>
                {expandedSchema === t.table && (
                  <>
                    <div style={{ fontSize:7, color:P.t3, marginBottom:4, lineHeight:1.6 }}><strong style={{ color:P.t2 }}>Fields:</strong> {t.key_fields}</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      <span style={{ fontSize:6, background:`${P.blue}12`, color:P.blue, borderRadius:3, padding:"1px 6px" }}>Retention: {t.retention}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NOEM CONTRADICTION ── */}
      {tab === "governance" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:`${P.gold}10`, border:`2px solid ${P.gold}30`, borderRadius:10, padding:"14px 16px", gridColumn:"1 / -1" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.gold, marginBottom:8 }}>📄 DHS SECRETARY CONTRADICTORY STATEMENTS — Institutional Accountability Evidence</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div style={{ background:P.card, borderRadius:8, padding:10, borderLeft:`3px solid ${P.gold}` }}>
                <div style={{ fontSize:8, fontWeight:800, color:P.gold, marginBottom:6 }}>{NOEM_CONTRADICTION_SOURCE.sept2_2025.date}</div>
                <div style={{ fontSize:7, color:P.t3, marginBottom:6, lineHeight:1.6 }}>{NOEM_CONTRADICTION_SOURCE.sept2_2025.statement}</div>
                <div style={{ fontSize:6, color:P.t4 }}>From: DHS Sec. Kristi Noem, To: Rep. Seth Moulton (MA-06)</div>
              </div>
              <div style={{ background:P.card, borderRadius:8, padding:10, borderLeft:`3px solid ${P.red}` }}>
                <div style={{ fontSize:8, fontWeight:800, color:P.red, marginBottom:6 }}>{NOEM_CONTRADICTION_SOURCE.dec11_2025.date}</div>
                <div style={{ fontSize:7, color:P.t3, marginBottom:6, lineHeight:1.6 }}>{NOEM_CONTRADICTION_SOURCE.dec11_2025.statement}</div>
                <div style={{ fontSize:6, color:P.t4 }}>Before: House Homeland Security Committee. Same day: Moulton released Sept 2 letter publicly.</div>
              </div>
            </div>
            <div style={{ background:`${P.red}15`, border:`1px solid ${P.red}30`, borderRadius:8, padding:10 }}>
              <div style={{ fontSize:8, fontWeight:800, color:P.red, marginBottom:4 }}>⚖️ Assessment</div>
              <div style={{ fontSize:7, color:P.t2, lineHeight:1.6 }}>Courtroom-quality contradictory statements from sitting Cabinet secretary. Documented government dishonesty regarding veteran deportations. <strong>Strongest single institutional-accountability finding of March-April 2026 cycle.</strong> Recommend as primary exhibit in CHC briefing "Accountability Void" section.</div>
            </div>
          </div>

          <div style={{ background:`${P.red}08`, border:`2px solid ${P.red}30`, borderRadius:10, padding:"14px 16px", gridColumn:"1 / -1" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.red, marginBottom:8 }}>🚫 PROHIBITED ACTIONS — Absolute Rules</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:8 }}>
              {[
                "Do NOT build a people-hunting engine",
                "Do NOT infer PTSD, mental health, or criminal propensity from social media",
                "Do NOT scrape private data or bypass authentication",
                "Do NOT collect non-public personal data",
                "Do NOT track shelter residents, migrants, or vulnerable persons",
                "Do NOT automate harm, targeting, enforcement, or harassment",
                "Do NOT use face recognition or contact graphs from private platforms",
                "Do NOT scrape private groups, DMs, or non-public forums",
                "Do NOT build ethnicity prediction models",
                "Do NOT collect WhatsApp unless clearly public and lawfully obtained",
              ].map((r,i) => (
                <div key={i} style={{ display:"flex", gap:6, alignItems:"flex-start", fontSize:7, color:P.t2, lineHeight:1.5 }}>
                  <span style={{ color:P.red, fontWeight:800, flexShrink:0 }}>✕</span>{r}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"8px 14px", borderBottom:`1px solid ${P.b}`, background:`${P.amber}10` }}>
              <span style={{ fontSize:9, fontWeight:800, color:P.amber }}>⚠ Risk Governance Rules (from workbook)</span>
            </div>
            <div style={{ padding:"10px 14px" }}>
              {RISK_GOVERNANCE.map((r,i) => (
                <div key={i} style={{ padding:"7px 0", borderBottom:`1px solid ${P.b}20` }}>
                  <div style={{ fontSize:8, fontWeight:800, color:P.amber, marginBottom:2 }}>{r.area}</div>
                  <div style={{ fontSize:7, color:P.t3, lineHeight:1.6 }}>{r.rule}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"8px 14px", borderBottom:`1px solid ${P.b}`, background:`${P.teal}10` }}>
              <span style={{ fontSize:9, fontWeight:800, color:P.teal }}>✓ Source Governance Labels</span>
            </div>
            <div style={{ padding:"10px 14px" }}>
              {Object.entries(ACCESS_COLORS).map(([label,color]) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:`1px solid ${P.b}20` }}>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />
                    <span style={{ fontSize:7, fontWeight:700, color }}>{label}</span>
                  </div>
                  <span style={{ fontSize:6, color:P.t4, textAlign:"right" }}>
                    {label==="public-open"   && "Bulk ingest allowed"}
                    {label==="licensed"      && "Requires institutional agreement"}
                    {label==="FOIA-derived"  && "Obtained via FOIA; cite request"}
                    {label==="restricted"    && "Metadata or manual review only"}
                    {label==="metadata-only" && "No full-text ingest"}
                    {label==="manual-only"   && "Human review required"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.blue, marginBottom:8 }}>🔒 Privacy-by-Design Controls</div>
            {[
              ["Provenance",    "Every record: source URL, retrieval date, SHA-256, parser, analyst"],
              ["Data minimization", "Aggregate discourse; no person-level social profiling"],
              ["Consent",       "Only public / lawfully licensed records ingested"],
              ["Retention",     "High-sensitivity tables: 7-year max; evidence: permanent"],
              ["Access control","Role-based; analyst actions logged with IP hash"],
              ["Jurisdictional","U.S. Privacy Act + Mexico Ley Federal de Datos Personales"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", gap:10, padding:"5px 0", borderBottom:`1px solid ${P.b}20` }}>
                <span style={{ fontSize:7, fontWeight:800, color:P.blue, minWidth:90, flexShrink:0 }}>{k}</span>
                <span style={{ fontSize:7, color:P.t3, lineHeight:1.5 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GEOGRAPHY ── */}
      {tab === "geography" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"8px 14px", borderBottom:`1px solid ${P.b}`, background:`${P.teal}10` }}>
              <span style={{ fontSize:9, fontWeight:800, color:P.teal }}>🗺️ Phase 1 Priority Geographies (from workbook)</span>
            </div>
            <div style={{ padding:"10px 14px" }}>
              {SW_GEOGRAPHY.map((g,i) => (
                <div key={i} style={{ padding:"8px 10px", marginBottom:6, background:"#080D18", borderRadius:7,
                  border:`1px solid ${g.phase1 ? P.teal+"40" : P.b}`, borderLeft:`4px solid ${g.phase1 ? P.teal : P.b}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:9, fontWeight:800, color: g.phase1 ? P.teal : P.t3 }}>{g.geo}</span>
                    {g.phase1 && <span style={{ fontSize:6, background:`${P.teal}15`, color:P.teal, borderRadius:3, padding:"1px 6px", fontWeight:700 }}>PHASE 1</span>}
                  </div>
                  <div style={{ fontSize:7, color:P.t4, lineHeight:1.5 }}>{g.rationale}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.gold, marginBottom:8 }}>⚙️ Connector Strategy by Source Class</div>
            {[
              { cls:"Federal APIs (US)",     strategy:"Direct REST/CKAN API — automated, versioned connectors",                    update:"Daily–weekly"     },
              { cls:"FOIA Extracts",         strategy:"Manual intake → hash → PDF parser → analyst review queue",                 update:"Per response"     },
              { cls:"Mexico Public Portals", strategy:"Search portal + OAI-PMH + manual PDF download",                            update:"Weekly–monthly"   },
              { cls:"Academic Databases",    strategy:"Licensed API (OpenAlex free; ProQuest/JSTOR licensed)",                    update:"Weekly"           },
              { cls:"NGO / Border Orgs",     strategy:"HTML crawler (public site only) + manual report intake",                   update:"Monthly"          },
              { cls:"State/Local ME/Clerk",  strategy:"Search portal → structured extraction → manual validation",                update:"Case-by-case"     },
              { cls:"Discourse (aggregate)", strategy:"GDELT API + public RSS + IA TV captions — topic/trend level only",         update:"Weekly"           },
            ].map((r,i) => (
              <div key={i} style={{ padding:"6px 0", borderBottom:`1px solid ${P.b}20` }}>
                <div style={{ fontSize:8, fontWeight:800, color:P.gold, marginBottom:2 }}>{r.cls}</div>
                <div style={{ fontSize:7, color:P.t3, lineHeight:1.5 }}>{r.strategy}</div>
                <div style={{ fontSize:6, color:P.t4, marginTop:2 }}>Update: {r.update}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ROADMAP ── */}
      {tab === "roadmap" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {ROADMAP.map(p => (
            <div key={p.phase} style={{ background:P.card, border:`1px solid ${p.color}30`, borderLeft:`5px solid ${p.color}`, borderRadius:10, padding:"14px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, flexWrap:"wrap", gap:8 }}>
                <div>
                  <div style={{ fontSize:7, color:p.color, letterSpacing:2, fontWeight:800, marginBottom:3 }}>PHASE {p.phase} · {p.duration}</div>
                  <div style={{ fontSize:11, fontWeight:800, color:p.color }}>{p.name}</div>
                </div>
                <div style={{ background:`${p.color}15`, border:`1px solid ${p.color}30`, borderRadius:20, padding:"3px 12px", fontSize:8, fontWeight:700, color:p.color }}>{p.duration}</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:6 }}>
                {p.items.map((item,i) => (
                  <div key={i} style={{ display:"flex", gap:6, alignItems:"flex-start", fontSize:7, color:P.t3, lineHeight:1.5 }}>
                    <span style={{ color:p.color, flexShrink:0 }}>✓</span>{item}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ background:`${P.gold}08`, border:`1px solid ${P.gold}25`, borderRadius:10, padding:"12px 16px", fontSize:7, color:P.t3, lineHeight:1.8 }}>
            <strong style={{ color:P.gold }}>Architect's note:</strong> Start with a Top-100 source registry, not 700 on day one. A staged build avoids a "magnificent junkyard." Phase 1 authoritative federal + Mexican public + academic + NGO sources form a solid spine. Phase 2 adds court/open-data connectors; Phase 3 adds carefully governed discourse analysis. Stability and legal clarity take precedence over breadth.
          </div>
        </div>
      )}

      {/* ── TRAUMA EVIDENCE ── */}
      {tab === "trauma" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"8px 14px", borderBottom:`1px solid ${P.b}`, background:`${P.violet}10` }}>
              <span style={{ fontSize:9, fontWeight:800, color:P.violet }}>⚕️ Trauma Evidence Field Rules (from workbook)</span>
            </div>
            <div style={{ padding:"10px 14px" }}>
              {TRAUMA_FIELDS.map((f,i) => (
                <div key={i} style={{ padding:"8px 10px", marginBottom:6, background:"#080D18", borderRadius:7,
                  border:`1px solid ${f.use.startsWith("YES") ? P.teal+"30" : P.red+"30"}`,
                  borderLeft:`4px solid ${f.use.startsWith("YES") ? P.teal : P.red}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:8, fontWeight:700, color:P.t1 }}>{f.field}</span>
                    <span style={{ fontSize:7, fontWeight:800, color: f.use.startsWith("YES") ? P.teal : P.red,
                      background: f.use.startsWith("YES") ? `${P.teal}15` : `${P.red}15`, borderRadius:3, padding:"1px 6px" }}>{f.use}</span>
                  </div>
                  <div style={{ fontSize:7, color:P.t4, lineHeight:1.5 }}>{f.note}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.blue, marginBottom:8 }}>📊 Analytics Plan</div>
            {[
              { method:"SPSS-ready exports",        def:"Structured CSV/SAV with variable labels; reproducible codebook per export.",      status:"Defined"   },
              { method:"Vector embeddings",          def:"pgvector (Postgres extension); text-embedding-3-small or equivalent; cosine sim.", status:"Defined"   },
              { method:"Topic modeling",             def:"BERTopic or LDA on document chunks; Spanish/English bilingual corpus.",           status:"Defined"   },
              { method:"Temporal trend analysis",    def:"Time-series aggregation by year/quarter; ICE data + literature publication date.", status:"Defined"   },
              { method:"Network analysis",           def:"Neo4j graph; centrality, shortest path, community detection on entity graph.",    status:"Defined"   },
              { method:"Contradiction detection",    def:"Confidence-weighted comparison of claim fields across source types.",             status:"Defined"   },
              { method:"Evidence gap analysis",      def:"Source coverage matrix; flag entity nodes with < N confirming sources.",          status:"Defined"   },
              { method:"Geospatial mapping",         def:"PostGIS + Leaflet; deportation hot zones, veteran clusters, corridor polygons.", status:"Defined"   },
              { method:"\"Quantum analytics\"",      def:"NOT DEFINED — term has no operational meaning here. Do not use.",                 status:"⚠ Rejected" },
              { method:"\"Tradecraft\"",             def:"Undefined without specification. Use specific methods listed above instead.",     status:"⚠ Rejected" },
            ].map((a,i) => (
              <div key={i} style={{ padding:"6px 0", borderBottom:`1px solid ${P.b}20` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <span style={{ fontSize:8, fontWeight:700, color: a.status.includes("⚠") ? P.red : P.gold }}>{a.method}</span>
                  <span style={{ fontSize:6, background: a.status.includes("⚠") ? `${P.red}15` : `${P.teal}15`,
                    color: a.status.includes("⚠") ? P.red : P.teal, borderRadius:3, padding:"1px 6px", fontWeight:700 }}>{a.status}</span>
                </div>
                <div style={{ fontSize:7, color:P.t4, lineHeight:1.5 }}>{a.def}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MORTALITY SOURCES ── */}
      {tab === "mortality" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, overflow:"hidden" }}>
            <div style={{ padding:"8px 14px", borderBottom:`1px solid ${P.b}`, background:"#ff990010" }}>
              <span style={{ fontSize:9, fontWeight:800, color:"#ff9900" }}>💀 Mortality / Obituary Sources (from workbook)</span>
            </div>
            <div style={{ padding:"10px 14px" }}>
              {MORTALITY_SOURCES.map((m,i) => (
                <div key={i} style={{ padding:"8px 10px", marginBottom:6, background:"#080D18", borderRadius:7, border:`1px solid ${P.b}`, borderLeft:`4px solid #ff9900` }}>
                  <div style={{ fontSize:8, fontWeight:800, color:"#ff9900", marginBottom:3 }}>{m.region}</div>
                  <div style={{ fontSize:7, color:P.t2, marginBottom:4, lineHeight:1.5 }}>{m.cls}</div>
                  <div style={{ fontSize:6, color:P.t4, lineHeight:1.5 }}>→ {m.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:P.card, border:`1px solid ${P.b}`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:9, fontWeight:800, color:P.blue, marginBottom:8 }}>🔎 Evidence Provenance Requirements</div>
            <div style={{ fontSize:7, color:P.t4, marginBottom:10, lineHeight:1.6 }}>
              Every ingested record must preserve all of the following fields:
            </div>
            {[
              ["source_name",        "Full name of source"],
              ["source_type",        "API / bulk / manual / portal / FOIA"],
              ["source_jurisdiction","U.S. Federal / State / Mexico / International"],
              ["source_url",         "Permanent URL or accession identifier"],
              ["retrieval_datetime", "ISO 8601 timestamp"],
              ["sha256",             "Document hash (SHA-256)"],
              ["ingest_method",      "Connector / crawler / manual"],
              ["parser_used",        "Parser name + version"],
              ["translation_status", "original / machine / human-reviewed"],
              ["confidence_score",   "0.0–1.0 per source type rules"],
              ["analyst_review",     "pending / reviewed / verified / disputed"],
              ["citation_excerpt",   "Citation-ready excerpt (≤ 500 chars)"],
              ["access_class",       "public-open / licensed / FOIA-derived / restricted"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", gap:8, padding:"4px 0", borderBottom:`1px solid ${P.b}15` }}>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:P.teal, minWidth:130, flexShrink:0 }}>{k}</span>
                <span style={{ fontSize:7, color:P.t3 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EVIDENCE LOG ── */}
      {tab === "evidencelog" && <EvidenceLogTab onRecordsChange={setEvidenceRecords} />}

      {/* ── SEMANTIC SEARCH ── */}
      {tab === "semantic" && <SemanticSearchPanel />}

      {/* ── KNOWLEDGE GRAPH ── */}
      {tab === "kgraph" && <KnowledgeGraphVisualizer evidenceRecords={evidenceRecords} />}

      {/* ── CHRONOLOGICAL TIMELINE ── */}
      {tab === "timeline" && <ChronologicalTimeline evidenceRecords={evidenceRecords} />}

    </div>
  );
}