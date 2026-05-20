-- Resolution queue for entity extraction from chunks
CREATE TABLE IF NOT EXISTS resolution_queue (
    resolution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID NOT NULL REFERENCES raw_object_part(part_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, failed
    extracted_entities JSONB,  -- person/org mention results
    organization_mentions JSONB,
    person_mentions JSONB,
    confidence_score FLOAT,
    processed_date TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_resolution_status ON resolution_queue(status);
CREATE INDEX idx_resolution_part ON resolution_queue(part_id);
CREATE INDEX idx_resolution_created ON resolution_queue(created_at);

-- OCR job tracking
CREATE TABLE IF NOT EXISTS ocr_job (
    ocr_job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_object_id UUID NOT NULL REFERENCES raw_object(raw_object_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, failed
    ocr_text_length INT,
    chunks_created INT,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ocr_job_status ON ocr_job(status);
CREATE INDEX idx_ocr_job_object ON ocr_job(raw_object_id);