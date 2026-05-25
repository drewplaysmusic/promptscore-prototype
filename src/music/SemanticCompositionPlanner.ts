import type {
  SemanticComplexity,
  SemanticIntent,
  SemanticMood,
  SemanticStyle,
  SemanticTexture,
} from './MusicSemanticEngine'

export type CompositionPhrasePlan = {
  id: string
  measures: number
  contour: 'rising' | 'falling' | 'arch' | 'wave' | 'static'
  tensionLevel: number
  cadenceType: 'authentic' | 'half' | 'plagal' | 'deceptive' | 'open'
  role: string
}

export type CompositionSectionPlan = {
  id: string
  label: string
  measures: number
  purpose: string
  energyLevel: number
}

export type CompositionHarmonyPlan = {
  tonalCenter: string
  harmonicRhythm: string
  cadenceFrequency: string
  harmonicColor: string
}

export type CompositionRhythmPlan = {
  density: string
  syncopationLevel: string
  tupletsAllowed: boolean
  grooveDescription: string
}

export type CompositionInstrumentationPlan = {
  ensembleType: string
  primaryVoices: string[]
  supportVoices: string[]
  textureRole: string
}

export type SemanticCompositionPlan = {
  id: string
  title: string
  semanticIntent: SemanticIntent
  estimatedMeasures: number
  suggestedForm: string
  sections: CompositionSectionPlan[]
  phrases: CompositionPhrasePlan[]
  harmony: CompositionHarmonyPlan
  rhythm: CompositionRhythmPlan
  instrumentation: CompositionInstrumentationPlan
  educationalConstraints: string[]
  planningNotes: string[]
  summary: string
}

function getMeasureEstimate(complexity: SemanticComplexity): number {
  switch (complexity) {
    case 'beginner':
      return 8
    case 'intermediate':
      return 16
    case 'advanced':
      return 32
    case 'professional':
      return 48
    default:
      return 16
  }
}

function getPhraseContour(mood: SemanticMood): CompositionPhrasePlan['contour'] {
  switch (mood) {
    case 'hopeful':
    case 'triumphant':
      return 'rising'

    case 'melancholy':
    case 'dark':
      return 'falling'

    case 'mysterious':
      return 'wave'

    case 'peaceful':
      return 'arch'

    default:
      return 'arch'
  }
}

function createSectionPlan({
  label,
  measures,
  purpose,
  energyLevel,
}: {
  label: string
  measures: number
  purpose: string
  energyLevel: number
}): CompositionSectionPlan {
  return {
    id: `section-${label.toLowerCase()}`,
    label,
    measures,
    purpose,
    energyLevel,
  }
}

function buildSections(intent: SemanticIntent): CompositionSectionPlan[] {
  const estimate = getMeasureEstimate(intent.complexity)

  if (intent.style === 'cinematic') {
    return [
      createSectionPlan({
        label: 'Intro',
        measures: Math.max(4, Math.floor(estimate * 0.2)),
        purpose: 'Atmospheric opening',
        energyLevel: 2,
      }),
      createSectionPlan({
        label: 'Build',
        measures: Math.max(4, Math.floor(estimate * 0.4)),
        purpose: 'Growing tension and development',
        energyLevel: 6,
      }),
      createSectionPlan({
        label: 'Climax',
        measures: Math.max(4, Math.floor(estimate * 0.25)),
        purpose: 'Peak musical intensity',
        energyLevel: 10,
      }),
      createSectionPlan({
        label: 'Release',
        measures: Math.max(2, Math.floor(estimate * 0.15)),
        purpose: 'Resolution and cooldown',
        energyLevel: 3,
      }),
    ]
  }

  if (intent.style === 'marching' || intent.style === 'percussion-focused') {
    return [
      createSectionPlan({
        label: 'Statement',
        measures: estimate / 4,
        purpose: 'Introduce rhythmic vocabulary',
        energyLevel: 5,
      }),
      createSectionPlan({
        label: 'Variation',
        measures: estimate / 4,
        purpose: 'Develop rhythmic material',
        energyLevel: 7,
      }),
      createSectionPlan({
        label: 'Feature',
        measures: estimate / 4,
        purpose: 'Highlight technical or groove material',
        energyLevel: 9,
      }),
      createSectionPlan({
        label: 'Finale',
        measures: estimate / 4,
        purpose: 'Strong ending statement',
        energyLevel: 10,
      }),
    ]
  }

  return [
    createSectionPlan({
      label: 'A',
      measures: estimate / 2,
      purpose: 'Primary musical idea',
      energyLevel: 5,
    }),
    createSectionPlan({
      label: 'B',
      measures: estimate / 2,
      purpose: 'Contrasting or developing material',
      energyLevel: 7,
    }),
  ]
}

function buildPhrasePlans(intent: SemanticIntent): CompositionPhrasePlan[] {
  const contour = getPhraseContour(intent.mood)

  return Array.from({ length: intent.complexity === 'professional' ? 6 : 4 }, (_, index) => ({
    id: `phrase-${index + 1}`,
    measures: intent.complexity === 'beginner' ? 2 : 4,
    contour,
    tensionLevel: Math.min(10, 3 + index * 2),
    cadenceType: index === 3 ? 'authentic' : index % 2 === 0 ? 'half' : 'open',
    role: index === 0
      ? 'opening statement'
      : index === 3
        ? 'arrival/cadence'
        : 'development',
  }))
}

function buildHarmonyPlan(intent: SemanticIntent): CompositionHarmonyPlan {
  return {
    tonalCenter: intent.mood === 'dark' || intent.mood === 'melancholy' ? 'minor' : 'major/modal',
    harmonicRhythm: intent.complexity === 'beginner' ? 'slow harmonic rhythm' : 'moderate harmonic rhythm',
    cadenceFrequency: intent.complexity === 'professional' ? 'variable cadential pacing' : 'predictable phrase cadences',
    harmonicColor: intent.harmonyHint,
  }
}

function buildRhythmPlan(intent: SemanticIntent): CompositionRhythmPlan {
  return {
    density: intent.texture,
    syncopationLevel: intent.complexity === 'beginner' ? 'minimal' : intent.style === 'jazz' ? 'high' : 'moderate',
    tupletsAllowed: intent.complexity === 'advanced' || intent.complexity === 'professional',
    grooveDescription: intent.rhythmHint,
  }
}

function buildInstrumentationPlan(intent: SemanticIntent): CompositionInstrumentationPlan {
  switch (intent.style) {
    case 'orchestral':
      return {
        ensembleType: 'orchestra',
        primaryVoices: ['strings', 'woodwinds'],
        supportVoices: ['brass', 'percussion'],
        textureRole: 'layered orchestral texture',
      }

    case 'marching':
      return {
        ensembleType: 'marching ensemble',
        primaryVoices: ['battery percussion'],
        supportVoices: ['front ensemble'],
        textureRole: 'rhythmic propulsion',
      }

    case 'percussion-focused':
      return {
        ensembleType: 'percussion ensemble',
        primaryVoices: ['snare', 'marimba'],
        supportVoices: ['accessory percussion'],
        textureRole: 'percussive layering',
      }

    case 'jazz':
      return {
        ensembleType: 'jazz combo',
        primaryVoices: ['lead instrument', 'piano'],
        supportVoices: ['bass', 'drums'],
        textureRole: 'groove and interaction',
      }

    default:
      return {
        ensembleType: 'flex ensemble',
        primaryVoices: ['melody voice'],
        supportVoices: ['harmonic accompaniment'],
        textureRole: 'balanced support texture',
      }
  }
}

export function createSemanticCompositionPlan({
  title,
  intent,
}: {
  title?: string
  intent: SemanticIntent
}): SemanticCompositionPlan {
  const sections = buildSections(intent)
  const phrases = buildPhrasePlans(intent)
  const estimatedMeasures = sections.reduce((sum, section) => sum + section.measures, 0)

  return {
    id: `semantic-plan-${Date.now()}`,
    title: title ?? `${intent.mood} ${intent.style} composition`,
    semanticIntent: intent,
    estimatedMeasures,
    suggestedForm: intent.suggestedForm,
    sections,
    phrases,
    harmony: buildHarmonyPlan(intent),
    rhythm: buildRhythmPlan(intent),
    instrumentation: buildInstrumentationPlan(intent),
    educationalConstraints: intent.educationalConstraints,
    planningNotes: [
      'Translate this plan into phrase arcs, harmonic pacing, orchestration routing, and engraving decisions.',
      'Maintain semantic consistency between mood, texture, harmony, and phrase shape.',
      'Keep generated material editable and pedagogically explainable.',
    ],
    summary: `${estimatedMeasures} estimated measure(s) planned using ${intent.style} ${intent.mood} semantic intent.`,
  }
}

export function describeCompositionPlan(plan: SemanticCompositionPlan): string {
  return `${plan.title}: ${plan.sections.length} section(s), ${plan.phrases.length} phrase plan(s), ${plan.instrumentation.ensembleType} instrumentation.`
}
