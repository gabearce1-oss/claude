-- Source registry: immutable record of all connected data families
CREATE TABLE IF NOT EXISTS source_family (
    source_family_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    country VARCHAR(3),  -- 'US', 'MX', 'INT'
    class VARCHAR(50) NOT NULL,  -- OPEN_PUBLIC_LOW_RISK, OPEN_PUBLIC_MEDIUM_RISK, etc.
    default_language VARCHAR(5) DEFAULT 'en',
    owner_org VARCHAR(255),
    legal_basis TEXT,
    documentation_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_class CHECK (class IN (
        'OPEN_PUBLIC_LOW_RISK',
        'OPEN_PUBLIC_MEDIUM_RISK',
        'OPEN_PUBLIC_HIGH_RISK',
        'RESTRICTED_MANUAL',
        'PROHIBITED'
    ))
);

CREATE INDEX idx_source_family_class ON source_family(class);
CREATE INDEX idx_source_family_country ON source_family(country);

-- Concrete endpoints for a source family
CREATE TABLE IF NOT EXISTS source_endpoint (
    endpoint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_family_id UUID NOT NULL REFERENCES source_family(source_family_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    base_url VARCHAR(512) NOT NULL,
    documentation_url VARCHAR(512),
    auth_type VARCHAR(50),  -- 'none', 'api_key', 'oauth2', 'basic'
    rate_limit_requests INT,
    rate_limit_period_seconds INT,
    update_frequency VARCHAR(50),  -- 'continuous', 'daily', 'weekly', 'manual', 'variable'
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_endpoint UNIQUE (source_family_id, base_url)
);

CREATE INDEX idx_endpoint_family ON source_endpoint(source_family_id);
CREATE INDEX idx_endpoint_url ON source_endpoint(base_url);

-- Crawl policies per source family
CREATE TABLE IF NOT EXISTS crawl_policy (
    policy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_family_id UUID NOT NULL REFERENCES source_family(source_family_id) ON DELETE CASCADE,
    crawler_class VARCHAR(50) NOT NULL,  -- api_crawler, bulk_downloader, ckan, socrata, etc.
    robots_allowed BOOLEAN DEFAULT TRUE,
    crawl_mode VARCHAR(50) NOT NULL DEFAULT 'discovery',  -- discovery, acquisition, maintenance
    backoff_seconds INT DEFAULT 5,
    max_retries INT DEFAULT 3,
    headless_required BOOLEAN DEFAULT FALSE,
    fallback_mode VARCHAR(50),  -- 'search_portal', 'browser', 'manual'
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_policy UNIQUE (source_family_id)
);

CREATE INDEX idx_policy_family ON crawl_policy(source_family_id);

-- Individual crawl jobs (execution units)
CREATE TABLE IF NOT EXISTS crawl_job (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_family_id UUID NOT NULL REFERENCES source_family(source_family_id) ON DELETE CASCADE,
    endpoint_id UUID REFERENCES source_endpoint(endpoint_id),
    started_at TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'queued',  -- queued, running, completed, failed, manual_required
    records_discovered INT DEFAULT 0,
    records_fetched INT DEFAULT 0,
    errors_count INT DEFAULT 0,
    cursor VARCHAR(512),  -- for paginated sources
    run_type VARCHAR(50) DEFAULT 'incremental',  -- incremental, full_refresh, backfill
    error_class VARCHAR(100),
    error_message TEXT,
    CONSTRAINT valid_status CHECK (status IN ('queued', 'running', 'completed', 'failed', 'manual_required'))
);

CREATE INDEX idx_job_family ON crawl_job(source_family_id);
CREATE INDEX idx_job_status ON crawl_job(status);
CREATE INDEX idx_job_created ON crawl_job(started_at DESC);

-- Sensitivity/access policies
CREATE TABLE IF NOT EXISTS access_policy (
    policy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensitivity_class VARCHAR(50) NOT NULL UNIQUE,
    allowed_roles TEXT[] DEFAULT ARRAY['analyst'],  -- analyst, researcher, admin
    export_rule VARCHAR(100) NOT NULL,  -- 'public', 'restricted', 'internal_only', 'prohibited'
    aggregation_rule VARCHAR(100),  -- 'person_anonymized', 'org_level', 'aggregate_only'
    min_k_anonymity INT DEFAULT 15,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO access_policy (sensitivity_class, allowed_roles, export_rule, aggregation_rule)
VALUES
    ('LOW', ARRAY['analyst', 'researcher', 'admin'], 'public', NULL),
    ('MEDIUM', ARRAY['analyst', 'admin'], 'restricted', 'org_level'),
    ('HIGH', ARRAY['admin'], 'internal_only', 'aggregate_only'),
    ('PROHIBITED', ARRAY[]::TEXT[], 'prohibited', NULL)
ON CONFLICT DO NOTHING;

-- Immutable audit trail
CREATE TABLE IF NOT EXISTS audit_event (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor VARCHAR(255),
    action VARCHAR(100),
    target_type VARCHAR(100),
    target_id UUID,
    event_ts TIMESTAMP DEFAULT NOW(),
    details JSONB,
    diff_json JSONB,
    CONSTRAINT valid_action CHECK (action IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'PUBLISH', 'REDACT', 'REVIEW'))
);

CREATE INDEX idx_audit_actor ON audit_event(actor);
CREATE INDEX idx_audit_time ON audit_event(event_ts DESC);
CREATE INDEX idx_audit_target ON audit_event(target_type, target_id);