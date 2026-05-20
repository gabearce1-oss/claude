-- Core evidence tables
CREATE TABLE IF NOT EXISTS raw_object (
    raw_object_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES crawl_job(job_id) ON DELETE CASCADE,
    source_family_id UUID NOT NULL REFERENCES source_family(source_family_id),
    request_url VARCHAR(2048),
    http_status_code INT,
    content_type VARCHAR(100),
    payload_sha256 VARCHAR(64) NOT NULL UNIQUE,
    payload_size_bytes BIGINT,
    payload BYTEA,
    etag VARCHAR(255),
    last_modified TIMESTAMP,
    fetched_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (http_status_code IS NULL OR (http_status_code >= 200 AND http_status_code < 600))
);

CREATE INDEX idx_raw_sha256 ON raw_object(payload_sha256);
CREATE INDEX idx_raw_url ON raw_object(request_url);
CREATE INDEX idx_raw_family ON raw_object(source_family_id);

-- OCR/chunked text for large objects
CREATE TABLE IF NOT EXISTS raw_object_part (
    part_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_object_id UUID NOT NULL REFERENCES raw_object(raw_object_id) ON DELETE CASCADE,
    part_no INT,
    text TEXT,
    byte_range INT8RANGE,
    checksum VARCHAR(64),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_part_object ON raw_object_part(raw_object_id);
CREATE INDEX idx_part_text ON raw_object_part USING GIN(to_tsvector('english', text));

-- Normalized canonical records
CREATE TABLE IF NOT EXISTS normalized_record (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_family_id UUID NOT NULL REFERENCES source_family(source_family_id),
    raw_object_id UUID REFERENCES raw_object(raw_object_id),
    source_record_id VARCHAR(255),
    record_type VARCHAR(100),  -- legislation, legal_decision, news, archive, report, etc.
    title VARCHAR(512),
    summary TEXT,
    language VARCHAR(5),
    publish_date DATE,
    canonical_url VARCHAR(2048) NOT NULL,
    source_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_record UNIQUE (source_family_id, source_record_id)
);

CREATE INDEX idx_record_family ON normalized_record(source_family_id);
CREATE INDEX idx_record_url ON normalized_record(canonical_url);
CREATE INDEX idx_record_type ON normalized_record(record_type);
CREATE INDEX idx_record_date ON normalized_record(publish_date DESC);

-- Attached files or derivatives
CREATE TABLE IF NOT EXISTS attachment (
    attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES normalized_record(record_id) ON DELETE CASCADE,
    file_url VARCHAR(2048),
    media_type VARCHAR(100),
    file_hash VARCHAR(64),
    local_object_key VARCHAR(512),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attachment_record ON attachment(record_id);
CREATE INDEX idx_attachment_hash ON attachment(file_hash);

-- Bilingual text units with translation metadata
CREATE TABLE IF NOT EXISTS translation_unit (
    translation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES normalized_record(record_id) ON DELETE CASCADE,
    original_lang VARCHAR(5),
    translated_lang VARCHAR(5),
    original_text TEXT,
    translated_text TEXT,
    translation_engine VARCHAR(100),  -- 'human', 'openai', 'google', 'deepl'
    confidence FLOAT,
    segment_id VARCHAR(255),  -- links back to original sentence/paragraph
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_translation_record ON translation_unit(record_id);
CREATE INDEX idx_translation_search ON translation_unit USING GIN(to_tsvector('spanish', original_text));

-- Atomic extracted claims
CREATE TABLE IF NOT EXISTS claim (
    claim_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES normalized_record(record_id) ON DELETE CASCADE,
    claim_type VARCHAR(100),  -- service_record, casualty_report, legal_order, etc.
    subject_str VARCHAR(512),
    predicate VARCHAR(255),
    object_str VARCHAR(512),
    polarity VARCHAR(20) DEFAULT 'positive',  -- positive, negative, uncertain
    temporal_scope VARCHAR(100),
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_claim_record ON claim(record_id);
CREATE INDEX idx_claim_type ON claim(claim_type);
CREATE INDEX idx_claim_subject ON claim(subject_str);

-- Links claims to specific text evidence
CREATE TABLE IF NOT EXISTS claim_evidence (
    claim_evidence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claim(claim_id) ON DELETE CASCADE,
    raw_object_part_id UUID REFERENCES raw_object_part(part_id),
    excerpt TEXT,
    char_start INT,
    char_end INT,
    evidence_score FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_claim_evidence_claim ON claim_evidence(claim_id);
CREATE INDEX idx_claim_evidence_part ON claim_evidence(raw_object_part_id);

-- Reusable bibliographic objects
CREATE TABLE IF NOT EXISTS citation (
    citation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES normalized_record(record_id),
    publisher VARCHAR(255),
    title VARCHAR(512),
    publication_date DATE,
    source_url VARCHAR(2048),
    access_date DATE,
    template_name VARCHAR(100),  -- std-official, std-report, std-portal, std-restricted
    citation_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_citation_record ON citation(record_id);
CREATE INDEX idx_citation_url ON citation(source_url);

-- Resolved entities across sources
CREATE TABLE IF NOT EXISTS entity (
    entity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50),  -- person, organization, agency, place, etc.
    canonical_name VARCHAR(512),
    canonical_country VARCHAR(3),
    status VARCHAR(50) DEFAULT 'unreviewed',  -- unreviewed, verified, disputed, merged
    sensitivity_class VARCHAR(50),
    review_state VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_entity_type ON entity(entity_type);
CREATE INDEX idx_entity_name ON entity(canonical_name);
CREATE INDEX idx_entity_status ON entity(status);

-- Entity aliases and alternate names
CREATE TABLE IF NOT EXISTS entity_alias (
    alias_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entity(entity_id) ON DELETE CASCADE,
    alias_text VARCHAR(512),
    language VARCHAR(5),
    transliteration VARCHAR(512),
    source_count INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alias_entity ON entity_alias(entity_id);
CREATE INDEX idx_alias_text ON entity_alias USING GIN(to_tsvector('english', alias_text));

-- Evidence-backed entity assertions
CREATE TABLE IF NOT EXISTS entity_assertion (
    assertion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entity(entity_id) ON DELETE CASCADE,
    claim_id UUID REFERENCES claim(claim_id),
    assertion_type VARCHAR(100),  -- service_branch, birth_year, nationality, removal_date, etc.
    value_text VARCHAR(512),
    confidence FLOAT,
    review_state VARCHAR(50) DEFAULT 'unreviewed',  -- unreviewed, verified, disputed
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assertion_entity ON entity_assertion(entity_id);
CREATE INDEX idx_assertion_type ON entity_assertion(assertion_type);
CREATE INDEX idx_assertion_state ON entity_assertion(review_state);

-- Graph edges
CREATE TABLE IF NOT EXISTS entity_link (
    link_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id UUID NOT NULL REFERENCES entity(entity_id) ON DELETE CASCADE,
    target_entity_id UUID NOT NULL REFERENCES entity(entity_id) ON DELETE CASCADE,
    relationship_type VARCHAR(100),  -- served_with, removed_by, cited_by, etc.
    start_date DATE,
    end_date DATE,
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_link_source ON entity_link(source_entity_id);
CREATE INDEX idx_link_target ON entity_link(target_entity_id);
CREATE INDEX idx_link_type ON entity_link(relationship_type);

-- Explicit contradictions
CREATE TABLE IF NOT EXISTS contradiction_case (
    contradiction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension VARCHAR(100),  -- birth_year, service_branch, removal_date, etc.
    group_key VARCHAR(255),  -- entity + dimension hash
    assertion_ids UUID[],
    status VARCHAR(50) DEFAULT 'open',
    resolution_note TEXT,
    reviewer VARCHAR(255),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contradiction_status ON contradiction_case(status);
CREATE INDEX idx_contradiction_dimension ON contradiction_case(dimension);

-- Analyst review workflow
CREATE TABLE IF NOT EXISTS analyst_review (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contradiction_id UUID REFERENCES contradiction_case(contradiction_id),
    claim_id UUID REFERENCES claim(claim_id),
    entity_assertion_id UUID REFERENCES entity_assertion(assertion_id),
    reviewer VARCHAR(255),
    verdict VARCHAR(50),  -- approve, reject, request_more_evidence, escalate
    rationale TEXT,
    reviewed_at TIMESTAMP,
    escalation_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_review_reviewer ON analyst_review(reviewer);
CREATE INDEX idx_review_verdict ON analyst_review(verdict);
CREATE INDEX idx_review_created ON analyst_review(reviewed_at DESC);

-- Published analytical outputs
CREATE TABLE IF NOT EXISTS report_package (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100),
    generated_at TIMESTAMP DEFAULT NOW(),
    scope_note TEXT,
    artifact_uri VARCHAR(512),
    created_by VARCHAR(255),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP
);

CREATE INDEX idx_report_published ON report_package(is_published);
CREATE INDEX idx_report_type ON report_package(report_type);