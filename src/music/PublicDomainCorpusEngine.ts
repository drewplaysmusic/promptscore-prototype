export type CorpusSourceType =
  | 'score-library'
  | 'folk-database'
  | 'hymnal'
  | 'method-book'
  | 'etude-collection'
  | 'chorale-corpus'
  | 'rudimental-archive'
  | 'user-import'

export type CorpusFormat =
  | 'MusicXML'
  | 'MIDI'
  | 'ABC'
  | 'MEI'
  | 'PDF'
  | 'Image'
  | 'Text'
  | 'Unknown'

export type CorpusRightsStatus =
  | 'public-domain'
  | 'creative-commons'
  | 'user-owned'
  | 'unknown-review-required'
  | 'restricted-do-not-ingest'

export type ExtractionTarget =
  | 'motif'
  | 'rhythm-pattern'
  | 'harmony-progression'
  | 'cadence'
  | 'phrase-structure'
  | 'counterpoint-pattern'
  | 'scale-exercise'
  | 'technique-pattern'
  | 'orchestration-pattern'
  | 'difficulty-signal'
  | 'style-fingerprint'

export type CorpusSourceDefinition = {
  id: string
  name: string
  type: CorpusSourceType
  description: string
  allowedFormats: CorpusFormat[]
  defaultRightsStatus: CorpusRightsStatus
  extractionTargets: ExtractionTarget[]
  notes: string
}

export type CorpusWorkMetadata = {
  id: string
  title: string
  composer?: string
  collection?: string
  sourceId: string
  format: CorpusFormat
  rightsStatus: CorpusRightsStatus
  year?: number
  instrumentation?: string[]
  tags: string[]
}

export type CorpusIngestionPlan = {
  source: CorpusSourceDefinition
  work: CorpusWorkMetadata
  safety: {
    allowedToIngest: boolean
    requiresReview: boolean
    reason: string
  }
  extractionTargets: ExtractionTarget[]
}

export const PUBLIC_DOMAIN_CORPUS_SOURCES: CorpusSourceDefinition[] = [
  {
    id: 'public-domain-score-library',
    name: 'Public Domain Score Library',
    type: 'score-library',
    description: 'Classical and historical score collections suitable for notation, harmony, phrase, and style analysis when public-domain status is verified.',
    allowedFormats: ['MusicXML', 'MIDI', 'PDF', 'Image', 'MEI'],
    defaultRightsStatus: 'unknown-review-required',
    extractionTargets: ['motif', 'harmony-progression', 'cadence', 'phrase-structure', 'counterpoint-pattern', 'style-fingerprint', 'difficulty-signal'],
    notes: 'Use only works with verified public-domain or properly licensed status.',
  },
  {
    id: 'folk-tune-corpus',
    name: 'Folk Tune Corpus',
    type: 'folk-database',
    description: 'Traditional melodies and tune collections for melody, mode, phrase, and rhythm learning.',
    allowedFormats: ['ABC', 'MusicXML', 'MIDI', 'Text'],
    defaultRightsStatus: 'unknown-review-required',
    extractionTargets: ['motif', 'rhythm-pattern', 'phrase-structure', 'style-fingerprint', 'difficulty-signal'],
    notes: 'Traditional/public-domain status still needs source-by-source review.',
  },
  {
    id: 'public-domain-hymnals',
    name: 'Public Domain Hymnals',
    type: 'hymnal',
    description: 'Hymn and chorale-style resources for harmony, voice leading, cadence, and classroom theory examples.',
    allowedFormats: ['MusicXML', 'MIDI', 'PDF', 'Image', 'Text'],
    defaultRightsStatus: 'unknown-review-required',
    extractionTargets: ['harmony-progression', 'cadence', 'phrase-structure', 'counterpoint-pattern', 'difficulty-signal'],
    notes: 'Useful for harmonic function and four-part writing examples when rights are verified.',
  },
  {
    id: 'method-book-archive',
    name: 'Public Domain Method Book Archive',
    type: 'method-book',
    description: 'Historical public-domain technique books and graded exercises for instrument-aware TechniqueLab generation.',
    allowedFormats: ['PDF', 'Image', 'Text', 'MusicXML'],
    defaultRightsStatus: 'unknown-review-required',
    extractionTargets: ['scale-exercise', 'technique-pattern', 'difficulty-signal', 'rhythm-pattern'],
    notes: 'Especially useful for scaffolding beginner-to-professional progression systems.',
  },
  {
    id: 'rudimental-archive',
    name: 'Rudimental Archive',
    type: 'rudimental-archive',
    description: 'Public-domain rudimental solos, exercises, and drum manuals for percussion literacy and sticking systems.',
    allowedFormats: ['PDF', 'Image', 'MusicXML', 'Text'],
    defaultRightsStatus: 'unknown-review-required',
    extractionTargets: ['rhythm-pattern', 'technique-pattern', 'difficulty-signal', 'style-fingerprint'],
    notes: 'Supports Percussion Brain, sticking overlays, rudiment builders, and marching percussion tools.',
  },
]

export function getCorpusSource(sourceId: string): CorpusSourceDefinition | undefined {
  return PUBLIC_DOMAIN_CORPUS_SOURCES.find((source) => source.id === sourceId)
}

export function getCorpusSourcesByType(type: CorpusSourceType): CorpusSourceDefinition[] {
  return PUBLIC_DOMAIN_CORPUS_SOURCES.filter((source) => source.type === type)
}

export function isRightsStatusIngestible(status: CorpusRightsStatus): boolean {
  return status === 'public-domain' || status === 'creative-commons' || status === 'user-owned'
}

export function buildCorpusIngestionPlan(work: CorpusWorkMetadata): CorpusIngestionPlan {
  const source = getCorpusSource(work.sourceId) ?? PUBLIC_DOMAIN_CORPUS_SOURCES[0]
  const allowedToIngest = isRightsStatusIngestible(work.rightsStatus)
  const requiresReview = work.rightsStatus === 'unknown-review-required'

  return {
    source,
    work,
    safety: {
      allowedToIngest,
      requiresReview,
      reason: allowedToIngest
        ? 'Rights status is compatible with ingestion.'
        : requiresReview
          ? 'Rights status must be reviewed before ingestion.'
          : 'Rights status is restricted and should not be ingested.',
    },
    extractionTargets: source.extractionTargets,
  }
}

export function describeExtractionTarget(target: ExtractionTarget): string {
  const descriptions: Record<ExtractionTarget, string> = {
    motif: 'Short reusable melodic idea or cell.',
    'rhythm-pattern': 'Reusable rhythm and subdivision pattern.',
    'harmony-progression': 'Chord progression or harmonic path.',
    cadence: 'Phrase-ending harmonic/melodic formula.',
    'phrase-structure': 'Question/answer, period, sentence, or phrase layout.',
    'counterpoint-pattern': 'Voice-leading or contrapuntal relationship.',
    'scale-exercise': 'Scale or mode practice pattern.',
    'technique-pattern': 'Instrument-specific technical motion or drill.',
    'orchestration-pattern': 'Instrumental texture or voicing approach.',
    'difficulty-signal': 'Feature used to estimate educational difficulty.',
    'style-fingerprint': 'Abstract style traits learned without copying source material.',
  }

  return descriptions[target]
}
