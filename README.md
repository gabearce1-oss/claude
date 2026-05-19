# Claude - Cluster Report Framework

Automation-optimized framework for producing Omega/Hybrid Cluster Reports with Claude AI.

## What's here

- **[cluster-report-framework.md](cluster-report-framework.md)** — The complete framework: XML prompt template, variable reference, example report, pipeline dataset samples, and visual aids. Single file, ready to use.

## Quick start

1. Open `cluster-report-framework.md`.
2. Copy the XML block from **Section 2** (the `<CLUSTER_REPORT_PROMPT>` template).
3. Replace all `{{PLACEHOLDER}}` variables with your chapter data (see **Section 3** for types and valid values).
4. Feed the completed XML to Claude.
5. Claude outputs: **(A)** a human-readable Cluster Report and **(B)** CSV/JSON pipeline datasets.

## Pipelines fed

| Pipeline | Format | Description |
|----------|--------|-------------|
| Vector | JSON | Sentence/span embeddings for semantic clustering |
| NIPS + Social Physics | JSON | Interaction network with agency and turn-control metrics |
| Predictive + Sentiment | JSON | VADER-based sentiment traces by scene and speaker |
| Metrics | CSV | All benchmark metrics with pass/fail status |
