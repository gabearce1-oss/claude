# Living Oral-History Sources
## TSK — URGENT — Time-decay risk

Living sources expire. Document custody and archive letters can wait. First-generation testimony cannot.

## Primary Target — Carmelita Terango

- **Relation:** Daughter of Leonor Terminel. Oldest living niece of all Terminel siblings.
- **Why urgent:** First-generation oral testimony of Francisco L. Terminel and Aviana Sagasta, transmitted directly through Leonor (oldest of the four documented Francisco × Aviana children). The only living link to direct family memory of Francisco's behavior, Aviana's denial at the WF office, and the household-level economics of the San Javier years.
- **Recording target:** audio with informed consent. Video optional. Multi-session — do not try to extract the full account in one sitting.
- **Status:** not yet contacted (as of FINAL Intelligence Report, May 20 2026).

If there is a single action in the entire TE360 backlog that cannot wait, this is it.

## Audio-Consent Script (Spanish + English)

Read aloud at the start of the recording, with the recorder running. Get a verbal "sí, doy mi consentimiento" / "yes, I consent" on tape before any substantive question.

### Español

> "Hola, soy [nombre]. Estoy grabando esta conversación con [nombre del entrevistado], hoy [fecha], en [lugar]. El propósito de esta grabación es documentar la historia oral de la familia Terminel–Sagasta como parte de una investigación histórica y genealógica de la familia.
>
> La grabación se guardará en una carpeta privada con respaldo en tres ubicaciones y solo se compartirá con familiares directos y con archivistas profesionales para fines de investigación. No se publicará en línea sin su permiso explícito por escrito.
>
> Usted puede pedir que detengamos la grabación en cualquier momento. Puede pedir que borremos cualquier parte. Puede pedir que no usemos su nombre.
>
> ¿Da usted su consentimiento para grabar esta conversación? Por favor diga sí o no en voz alta."

### English

> "Hello, I'm [name]. I am recording this conversation with [interviewee name], today [date], at [location]. The purpose of this recording is to document the oral history of the Terminel–Sagasta family as part of a historical and genealogical investigation of the family.
>
> The recording will be stored in a private folder backed up in three locations and will only be shared with direct family members and professional archivists for research purposes. It will not be published online without your explicit written permission.
>
> You may ask us to stop recording at any time. You may ask us to delete any portion. You may ask us not to use your name.
>
> Do you give your consent to record this conversation? Please say yes or no out loud."

## Question Themes (do not lead — open-ended only)

1. **Family memory of Francisco.** "¿Qué recuerda usted que decía Leonor sobre su padre Francisco?" — Then let silence do the work.
2. **Family memory of Aviana.** "¿Qué le contaba Leonor sobre su madre, Aviana?" — Pay attention to any mention of *india*, *pima*, *opata*, tribal affiliation, language, dress, food, or where Aviana's own mother came from.
3. **The Wells Fargo episode.** "¿Mencionó alguna vez su mamá un viaje a una oficina, o un banco, o un lugar donde Aviana pidió dinero?" — Do not name Wells Fargo first. Let the witness produce the institution. If they don't, only then prompt with "¿podría haber sido Wells Fargo?"
4. **The cow.** "¿Recuerda usted una historia de que Aviana se fue con una vaca?" — corroborates the documented oral-history detail of Aviana leaving with one cow after the WF denial.
5. **Land and houses.** "¿Recuerda los nombres de los lugares donde vivían en San Javier, o nombres de ranchos, o de minas?"
6. **Other relatives.** "¿Quién más sabía estas historias? ¿Hay primos, hermanos, sobrinos que también las oyeron?"

## After the Interview — Same-Day Protocol

1. Move the audio file to the chain-of-custody folder. Filename: `oralhistory_carmelita_terango_YYYY-MM-DD_session1.m4a`
2. **SHA-256 hash** the audio file the same way you would a deed scan (see SHA-256 Chain-of-Custody Protocol). Append to `oralhistory_hashes_YYYY-MM-DD.txt`.
3. Back up to three locations.
4. Write a one-page **field note** within 24 hours: what was said, what was not said, what was reluctant, what was eager. The field note is for tone and context — the audio is for words.
5. **Do not transcribe yet.** Let the audio sit 48 hours, then transcribe. Transcripts written too fast tend to fill in gaps with assumption.
6. Enter as a TE360 evidence row:
   - `source_system`: `oral_history`
   - `storage_uri`: `[cloud URL]`
   - `sha256`: `[hash]`
   - `provenance_score`: 9/10 (first-generation testimony, direct family chain)
   - `authenticity_score`: 10/10 (recorded with consent)
   - `contamination_score`: 0
   - `review_status`: `verified_oral_history`

## Contact-Attempt Log

Keep a single plain-text file `living_sources_log.txt` with one row per contact attempt:

```
2026-MM-DD | Carmelita Terango | phone     | [number] | [outcome: voicemail / answered / no answer / scheduled]
2026-MM-DD | Carmelita Terango | in-person | [address] | [outcome]
2026-MM-DD | Carmelita Terango | letter    | [address] | [outcome]
```

If three attempts fail across two channels, route through a trusted intermediary (Gabriel or another family member) — do not escalate frequency on a single channel.

## Other Living Sources to Identify and Log

- Surviving cousins of Nela
- Any Porchas descendants in or near San Javier
- Any Sagasta descendants (the surname is rare in Sonora — trace whatever exists)
- Any older parishioners of Nuestra Señora de Guadalupe (Sahuaripa) — sometimes remember family stories from confessional or community
