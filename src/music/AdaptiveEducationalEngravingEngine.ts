import type { AdaptiveRevealLevel } from './AdaptiveRevealEngine'
import type { MeasureLayoutDensity } from './MeasureTimelineLayoutEngine'

export type EducationalEngravingLevel =
  | 'early-beginner'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'professional'

export type EducationalEngravingGoal =
  | 'rhythm-literacy'
  | 'pitch-literacy'
  | 'sight-reading'
  | 'technique-practice'
  | 'theory-analysis'
  | 'performance-score'
  | 'worksheet'
  | 'accessibility'

export type EducationalEngravingProfile = {
  id: string
  level: EducationalEngravingLevel
  goal: EducationalEngravingGoal
  measureDensity: MeasureLayoutDensity
  measuresPerSystem: number
  notationScale: number
  staffLineCount?: 1 | 2 | 3 | 4 | 5
  showNoteNames: boolean
  showCountLabels: boolean
  showPhraseArcs: boolean
  showHarmonyMasks: boolean
  showExpressionTranslations: boolean
  showFingeringsOrStickings: boolean
  adaptiveRevealLevel: AdaptiveRevealLevel
  spacing: {
    noteSpacingMultiplier: number
    systemSpacingMultiplier: number
    overlaySpacingMultiplier: number
  }
  accessibility: {
    highContrast: boolean
    enlargedNotation: boolean
    simplifiedVisualDensity: boolean
  }
  teachingDescription: string
}

function getDefaultStaffLineCount(level: EducationalEngravingLevel): 1 | 2 | 3 | 4 | 5 {
  switch (level) {
    case 'early-beginner':
      return 1
    case 'beginner':
      return 2
    case 'intermediate':
      return 3
    case 'advanced':
      return 5
    case 'professional':
      return 5
    default:
      return 1
  }
}

function getAdaptiveRevealLevel(level: EducationalEngravingLevel): AdaptiveRevealLevel {
  switch (level) {
    case 'early-beginner':
      return 'guided'
    case 'beginner':
      return 'guided'
    case 'intermediate':
      return 'assisted'
    case 'advanced':
      return 'independent'
    case 'professional':
      return 'mastery'
    default:
      return 'guided'
  }
}

function getMeasureDensity(level: EducationalEngravingLevel, goal: EducationalEngravingGoal): MeasureLayoutDensity {
  if (goal === 'worksheet' || goal === 'accessibility') return 'spacious'

  switch (level) {
    case 'early-beginner':
      return 'spacious'
    case 'beginner':
      return 'spacious'
    case 'intermediate':
      return 'balanced'
    case 'advanced':
      return 'compact'
    case 'professional':
      return 'professional'
    default:
      return 'balanced'
  }
}

function getMeasuresPerSystem(density: MeasureLayoutDensity): number {
  switch (density) {
    case 'spacious':
      return 2
    case 'balanced':
      return 3
    case 'compact':
      return 4
    case 'professional':
      return 4
    default:
      return 3
  }
}

function getNotationScale(level: EducationalEngravingLevel, goal: EducationalEngravingGoal): number {
  if (goal === 'accessibility') return 1.45
  if (goal === 'worksheet') return 1.22

  switch (level) {
    case 'early-beginner':
      return 1.42
    case 'beginner':
      return 1.3
    case 'intermediate':
      return 1.12
    case 'advanced':
      return 1
    case 'professional':
      return 0.92
    default:
      return 1
  }
}

function getTeachingDescription(level: EducationalEngravingLevel, goal: EducationalEngravingGoal): string {
  return `${level} engraving profile optimized for ${goal}. Layout adapts spacing, overlays, reveal level, and visual density to support learning.`
}

export function createEducationalEngravingProfile({
  level,
  goal,
}: {
  level: EducationalEngravingLevel
  goal: EducationalEngravingGoal
}): EducationalEngravingProfile {
  const measureDensity = getMeasureDensity(level, goal)
  const adaptiveRevealLevel = getAdaptiveRevealLevel(level)
  const notationScale = getNotationScale(level, goal)

  const showLearningSupport = level === 'early-beginner' || level === 'beginner'
  const showIntermediateSupport = level === 'intermediate'

  return {
    id: `engraving-${level}-${goal}`,
    level,
    goal,
    measureDensity,
    measuresPerSystem: getMeasuresPerSystem(measureDensity),
    notationScale,
    staffLineCount: goal === 'pitch-literacy' || goal === 'rhythm-literacy'
      ? getDefaultStaffLineCount(level)
      : undefined,
    showNoteNames: showLearningSupport || goal === 'pitch-literacy',
    showCountLabels: showLearningSupport || showIntermediateSupport || goal === 'rhythm-literacy',
    showPhraseArcs: showLearningSupport || showIntermediateSupport || goal === 'sight-reading',
    showHarmonyMasks: goal === 'theory-analysis',
    showExpressionTranslations: showLearningSupport || goal === 'worksheet',
    showFingeringsOrStickings: goal === 'technique-practice',
    adaptiveRevealLevel,
    spacing: {
      noteSpacingMultiplier: level === 'early-beginner' ? 1.6 : level === 'beginner' ? 1.38 : level === 'intermediate' ? 1.15 : 1,
      systemSpacingMultiplier: goal === 'worksheet' ? 1.35 : level === 'early-beginner' ? 1.3 : 1,
      overlaySpacingMultiplier: showLearningSupport ? 1.45 : showIntermediateSupport ? 1.18 : 1,
    },
    accessibility: {
      highContrast: goal === 'accessibility',
      enlargedNotation: goal === 'accessibility' || level === 'early-beginner',
      simplifiedVisualDensity: showLearningSupport || goal === 'accessibility',
    },
    teachingDescription: getTeachingDescription(level, goal),
  }
}

export function getRecommendedEngravingProfiles(): EducationalEngravingProfile[] {
  return [
    createEducationalEngravingProfile({ level: 'early-beginner', goal: 'rhythm-literacy' }),
    createEducationalEngravingProfile({ level: 'beginner', goal: 'pitch-literacy' }),
    createEducationalEngravingProfile({ level: 'intermediate', goal: 'sight-reading' }),
    createEducationalEngravingProfile({ level: 'advanced', goal: 'technique-practice' }),
    createEducationalEngravingProfile({ level: 'professional', goal: 'performance-score' }),
    createEducationalEngravingProfile({ level: 'beginner', goal: 'worksheet' }),
  ]
}

export function describeEducationalEngravingProfile(profile: EducationalEngravingProfile): string {
  const activeSupports = [
    profile.showNoteNames ? 'note names' : null,
    profile.showCountLabels ? 'counts' : null,
    profile.showPhraseArcs ? 'phrase arcs' : null,
    profile.showHarmonyMasks ? 'harmony masks' : null,
    profile.showExpressionTranslations ? 'expression translations' : null,
    profile.showFingeringsOrStickings ? 'fingerings/stickings' : null,
  ].filter(Boolean).join(', ')

  return `${profile.level} / ${profile.goal}: ${profile.measureDensity} layout, ${profile.measuresPerSystem} measures per system, ${profile.notationScale}x scale, support layers: ${activeSupports || 'minimal'}.`
}
