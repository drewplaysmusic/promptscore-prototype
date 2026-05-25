export type SemanticMood =
  | 'dark'
  | 'hopeful'
  | 'peaceful'
  | 'tense'
  | 'energetic'
  | 'triumphant'
  | 'melancholy'
  | 'playful'
  | 'mysterious'

export type SemanticStyle =
  | 'orchestral'
  | 'jazz'
  | 'minimalist'
  | 'cinematic'
  | 'marching'
  | 'folk'
  | 'ambient'
  | 'classical'
  | 'educational'
  | 'percussion-focused'

export type SemanticComplexity =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'professional'

export type SemanticTexture =
  | 'sparse'
  | 'layered'
  | 'dense'
  | 'rhythmic'
  | 'lyrical'
  | 'homophonic'
  | 'contrapuntal'

export type SemanticIntent = {
  rawPrompt: string
  mood: SemanticMood
  style: SemanticStyle
  complexity: SemanticComplexity
  texture: SemanticTexture
  suggestedTempo: number
  suggestedForm: string
  orchestrationHint: string
  phraseShapeHint: string
  harmonyHint: string
  rhythmHint: string
  educationalConstraints: string[]
  generationNotes: string[]
}

const MOOD_KEYWORDS: Array<{ mood: SemanticMood; words: string[] }> = [
  { mood: 'dark', words: ['dark', 'brooding', 'ominous', 'shadow', 'heavy'] },
  { mood: 'hopeful', words: ['hopeful', 'uplifting', 'bright', 'optimistic'] },
  { mood: 'peaceful', words: ['peaceful', 'calm', 'gentle', 'quiet', 'soft'] },
  { mood: 'tense', words: ['tense', 'suspense', 'anxious', 'pressure'] },
  { mood: 'energetic', words: ['energetic', 'fast', 'driving', 'active'] },
  { mood: 'triumphant', words: ['triumphant', 'heroic', 'victory', 'bold'] },
  { mood: 'melancholy', words: ['sad', 'melancholy', 'lonely', 'wistful'] },
  { mood: 'playful', words: ['playful', 'fun', 'quirky', 'light'] },
  { mood: 'mysterious', words: ['mysterious', 'strange', 'nocturne', 'moon'] },
]

const STYLE_KEYWORDS: Array<{ style: SemanticStyle; words: string[] }> = [
  { style: 'orchestral', words: ['orchestra', 'orchestral', 'symphonic'] },
  { style: 'jazz', words: ['jazz', 'swing', 'bebop', 'fusion'] },
  { style: 'minimalist', words: ['minimalist', 'minimal', 'repetitive', 'ostinato'] },
  { style: 'cinematic', words: ['cinematic', 'film', 'score', 'trailer'] },
  { style: 'marching', words: ['marching', 'drumline', 'battery', 'wgi'] },
  { style: 'folk', words: ['folk', 'appalachian', 'country', 'traditional'] },
  { style: 'ambient', words: ['ambient', 'atmospheric', 'texture'] },
  { style: 'classical', words: ['classical', 'mozart', 'bach', 'beethoven'] },
  { style: 'educational', words: ['student', 'lesson', 'beginner', 'worksheet', 'school'] },
  { style: 'percussion-focused', words: ['snare', 'marimba', 'rudiment', 'percussion'] },
]

function findKeywordMatch<T>(
  prompt: string,
  entries: Array<{ words: string[] } & T>,
  field: keyof T,
  fallback: T[keyof T],
): T[keyof T] {
  const lower = prompt.toLowerCase()
  const match = entries.find((entry) => entry.words.some((word) => lower.includes(word)))
  return match ? match[field] : fallback
}

function inferComplexity(prompt: string): SemanticComplexity {
  const lower = prompt.toLowerCase()

  if (lower.includes('professional') || lower.includes('advanced college') || lower.includes('virtuosic')) return 'professional'
  if (lower.includes('advanced')) return 'advanced'
  if (lower.includes('intermediate')) return 'intermediate'
  if (lower.includes('beginner') || lower.includes('easy') || lower.includes('student')) return 'beginner'

  return 'intermediate'
}

function inferTexture(prompt: string, style: SemanticStyle): SemanticTexture {
  const lower = prompt.toLowerCase()

  if (lower.includes('dense')) return 'dense'
  if (lower.includes('sparse') || lower.includes('simple')) return 'sparse'
  if (lower.includes('layered')) return 'layered'
  if (lower.includes('rhythmic') || style === 'marching' || style === 'percussion-focused') return 'rhythmic'
  if (lower.includes('lyrical') || lower.includes('songlike')) return 'lyrical'
  if (lower.includes('counterpoint')) return 'contrapuntal'

  return style === 'jazz' ? 'layered' : 'homophonic'
}

function getTempoForMood(mood: SemanticMood, style: SemanticStyle): number {
  if (style === 'marching') return 120
  if (style === 'jazz') return 132

  switch (mood) {
    case 'peaceful': return 72
    case 'melancholy': return 76
    case 'dark': return 84
    case 'tense': return 104
    case 'energetic': return 132
    case 'triumphant': return 126
    case 'playful': return 116
    default: return 96
  }
}

function getFormHint(style: SemanticStyle, complexity: SemanticComplexity): string {
  if (style === 'jazz') return 'head-solos-head or 12-bar blues form'
  if (style === 'marching' || style === 'percussion-focused') return 'grid-based phrase blocks with repeated variation'
  if (style === 'cinematic') return 'intro-build-climax-release form'
  if (complexity === 'beginner') return 'short binary form'
  if (complexity === 'professional') return 'multi-section through-composed form'
  return 'ternary or verse/chorus form'
}

function getOrchestrationHint(style: SemanticStyle): string {
  switch (style) {
    case 'orchestral': return 'full orchestra with strings carrying phrase shape and brass/woodwinds adding color'
    case 'jazz': return 'lead instrument with piano, bass, and drums'
    case 'marching': return 'battery percussion with optional front ensemble support'
    case 'percussion-focused': return 'snare/mallet percussion first, with sticking and grid support'
    case 'folk': return 'melody-forward acoustic texture with simple harmonic support'
    case 'ambient': return 'sustained pads, sparse attacks, and atmospheric layering'
    default: return 'flexible chamber ensemble or piano sketch'
  }
}

function getPhraseShapeHint(mood: SemanticMood): string {
  switch (mood) {
    case 'hopeful': return 'rising phrase arcs with gentle release'
    case 'dark': return 'falling or arch-shaped phrases with heavier cadences'
    case 'tense': return 'short fragments building toward unresolved tension'
    case 'triumphant': return 'broad rising arcs with strong arrivals'
    case 'melancholy': return 'descending lyrical arcs with delayed resolution'
    default: return 'balanced question-answer phrase structure'
  }
}

function getHarmonyHint(mood: SemanticMood, style: SemanticStyle): string {
  if (style === 'jazz') return 'seventh chords, ii-V-I motion, optional extensions'
  if (mood === 'dark' || mood === 'melancholy') return 'minor mode, modal mixture, slower harmonic rhythm'
  if (mood === 'hopeful' || mood === 'triumphant') return 'major-mode motion with strong dominant-tonic arrivals'
  if (mood === 'mysterious') return 'modal harmony, open fifths, ambiguous cadences'
  return 'functional harmony with clear phrase cadences'
}

function getRhythmHint(style: SemanticStyle, complexity: SemanticComplexity): string {
  if (style === 'marching' || style === 'percussion-focused') return 'subdivision-focused grids, accents, and repeated rhythmic cells'
  if (style === 'jazz') return 'syncopation and swing-aware rhythmic placement'
  if (complexity === 'beginner') return 'quarter/eighth-note rhythm with limited syncopation'
  if (complexity === 'professional') return 'mixed subdivisions, tuplets, and phrase-level rhythmic contrast'
  return 'balanced rhythm using eighth notes, rests, and occasional syncopation'
}

function getEducationalConstraints(complexity: SemanticComplexity): string[] {
  switch (complexity) {
    case 'beginner':
      return ['limit range', 'use simple rhythms', 'enable note names/count overlays', 'short phrases']
    case 'intermediate':
      return ['moderate range', 'controlled syncopation', 'selective overlays', 'clear phrase endings']
    case 'advanced':
      return ['expanded range', 'complex rhythms allowed', 'reduced overlays', 'phrase interpretation expected']
    case 'professional':
      return ['full range', 'advanced rhythms', 'minimal overlays', 'interpretive freedom']
    default:
      return []
  }
}

export function interpretSemanticPrompt(rawPrompt: string): SemanticIntent {
  const mood = findKeywordMatch(rawPrompt, MOOD_KEYWORDS, 'mood', 'hopeful') as SemanticMood
  const style = findKeywordMatch(rawPrompt, STYLE_KEYWORDS, 'style', 'educational') as SemanticStyle
  const complexity = inferComplexity(rawPrompt)
  const texture = inferTexture(rawPrompt, style)
  const suggestedTempo = getTempoForMood(mood, style)

  return {
    rawPrompt,
    mood,
    style,
    complexity,
    texture,
    suggestedTempo,
    suggestedForm: getFormHint(style, complexity),
    orchestrationHint: getOrchestrationHint(style),
    phraseShapeHint: getPhraseShapeHint(mood),
    harmonyHint: getHarmonyHint(mood, style),
    rhythmHint: getRhythmHint(style, complexity),
    educationalConstraints: getEducationalConstraints(complexity),
    generationNotes: [
      'Use semantic intent as planning data, not direct copying.',
      'Route style/mood into phrase, harmony, rhythm, orchestration, and engraving engines.',
      'Keep output editable, explainable, and educationally scaffolded.',
    ],
  }
}

export function describeSemanticIntent(intent: SemanticIntent): string {
  return `${intent.complexity} ${intent.style} idea with ${intent.mood} mood, ${intent.texture} texture, around ${intent.suggestedTempo} BPM.`
}
