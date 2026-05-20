# PDF Processing Pipeline

End-to-end pipeline for extracting, chunking, and resolving entities from PDF documents.

## Architecture

```
Raw PDF Upload
    ↓
PDFProcessor Worker (Tesseract OCR)
    ↓
Text Chunking (raw_object_part table)
    ↓
EntityResolver Worker (spaCy NER)
    ↓
Entity Assertions & Links
    ↓
Analyst Review Queue (resolution_queue → n8n)
```

## Setup

### 1. Initialize Database

```bash
psql research_db < schemas/database_schema.sql
psql research_db < schemas/resolution_queue_schema.sql
```

### 2. Run Workers

```bash
docker-compose up -d postgres pdf_processor entity_resolver
```

Or locally:

```bash
# Terminal 1: PDF Processor
DATABASE_URL="postgresql://..." python orchestrator/pdf_processor.py

# Terminal 2: Entity Resolver
DATABASE_URL="postgresql://..." python orchestrator/entity_resolver.py
```

## Workflow

### Step 1: PDF Upload & OCR (pdf_processor.py)

- **Trigger**: `raw_object.status = 'pending_ocr'`
- **Process**:
  1. Fetch pending PDFs from `raw_object` table
  2. Convert PDF → images using `pdf2image`
  3. Extract text via Tesseract OCR
  4. Chunk text by sentences with overlap
  5. Store chunks in `raw_object_part` table
  6. Queue for entity resolution

**Tables Modified**:
- `raw_object`: status → `ocr_complete`, ocr_text_length stored
- `raw_object_part`: new chunks inserted
- `resolution_queue`: chunks queued for entity extraction

### Step 2: Entity Extraction (entity_resolver.py)

- **Trigger**: `resolution_queue.status = 'pending'`
- **Process**:
  1. Fetch pending chunks
  2. Run spaCy NER to extract PERSON/ORG mentions
  3. For mentions with confidence ≥ 0.7:
     - Find or create `entity` record
     - Create `entity_assertion` linking to mention
     - Store in `claim_evidence` for audit trail
  4. Store results in `resolution_queue`

**Tables Modified**:
- `resolution_queue`: person_mentions/organization_mentions JSON, status → `completed`
- `entity`: new entities created
- `entity_assertion`: mention assertions added
- `claim_evidence`: evidence linkage created

### Step 3: Analyst Review (n8n webhook)

- **Trigger**: High-contradiction entities or high-sensitivity mentions
- **Process**:
  1. n8n webhook receives `contradiction.detected` event
  2. Open analyst review ticket in CHC workflow
  3. Analyst reviews evidence chain and confirms/rejects

## Configuration

### Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/research_db
LOG_LEVEL=INFO

# PDF Processor
CHUNK_SIZE=500              # Tokens per chunk
CHUNK_OVERLAP=50            # Token overlap between chunks
MIN_CHUNK_LENGTH=50         # Minimum chunk size to store

# Entity Resolver
SPACY_MODEL=en_core_web_sm  # spaCy NER model
```

## Performance Notes

- **OCR**: ~30-60 seconds per page (CPU-bound)
- **Chunking**: ~0.1 seconds per 1000 tokens
- **NER**: ~0.05 seconds per chunk (GPU-accelerated if available)
- **Batch processing**: 10-20 items per cycle to avoid memory bloat

## Monitoring

### View Pending Work

```sql
-- Pending OCR jobs
SELECT COUNT(*) as pending_ocr 
FROM raw_object 
WHERE status = 'pending_ocr';

-- Pending entity resolutions
SELECT COUNT(*) as pending_entities 
FROM resolution_queue 
WHERE status = 'pending';

-- Failed jobs
SELECT id, error_message, updated_date 
FROM raw_object 
WHERE status = 'ocr_failed' 
ORDER BY updated_date DESC LIMIT 10;
```

### View Results

```sql
-- All person mentions
SELECT DISTINCT person_mentions->>0->>'text' as person 
FROM resolution_queue 
WHERE person_mentions IS NOT NULL;

-- High-confidence org entities
SELECT COUNT(*), o.text 
FROM resolution_queue rq, 
     jsonb_array_elements(organization_mentions) o 
WHERE (o->>'confidence')::float >= 0.8 
GROUP BY o.text;
```

## Error Handling

### Retry Failed OCR

```sql
UPDATE raw_object 
SET status = 'pending_ocr' 
WHERE id = '...' AND status = 'ocr_failed';
```

### Retry Failed Resolutions

```sql
UPDATE resolution_queue 
SET status = 'pending' 
WHERE status = 'failed' 
  AND updated_at < NOW() - INTERVAL '1 hour';
```

## Integration with n8n

The pipeline emits events to n8n webhooks for analyst routing:

```json
{
  "event_type": "contradiction.detected",
  "payload": {
    "entity_id": "...",
    "dimension": "person_name",
    "assertion_count": 3,
    "severity": "high"
  }
}
```

n8n workflows then:
1. Open analyst review tickets
2. Route to appropriate reviewer
3. Set urgency based on sensitivity
4. Generate evidence summary

## Future Enhancements

- [ ] GPU-accelerated OCR (NVIDIA CUDA)
- [ ] Fine-tuned NER for veteran/military domain
- [ ] Semantic chunking (vs. sentence-based)
- [ ] Automatic contradiction detection
- [ ] Language detection & translation pipeline
- [ ] Vector embeddings for semantic search