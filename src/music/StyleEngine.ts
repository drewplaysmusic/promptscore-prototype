import type { DurationValue } from './musicBrain'
import type { PromptDensity, PromptStyleTag } from './PromptIntentEngine'

export type StylePlan = {
  style: PromptStyleTag
  rhythmPattern: DurationValue[]
  contour: number[]
  cadenceDegrees: number[]
  phraseLength: number
  leapFrequency: 'low' | 'medium' | 'high'
  summary: string
}

const DEFAULT_STYLE_PLAN: StylePlan = {
  style: 'unknown',
  rhythmPattern: ['Quarter', 'Eighth', 'Eighth', 'Quarter'],
  contour: [0, 1, 2, 4, 3, 2, 1, 0],
  cadenceDegrees: [4, 1, 0],
  phraseLength: 4,
  leapFrequency: 'low',
  summary: 'general stepwise melody with simple cadence behavior',
}

const STYLE_PLANS: Record<PromptStyleTag, StylePlan> = {
  unknown: DEFAULT_STYLE_PLAN,
  beginner: {
    style: 'beginner',
    rhythmPattern: ['Quarter', 'Quarter', 'Half'],
    contour: [0, 1, 2, 1, 0, 2, 1, 0],
    cadenceDegrees: [2, 1, 0],
    phraseLength: 4,
    leapFrequency: 'low',
    summary: 'beginner melody using mostly steps, repeated notes, and clear tonic endings',
  },
  mozart: {
    style: 'mozart',
    rhythmPattern: ['16th', '16th', 'Eighth', 'Quarter', 'Eighth', 'Quarter'],
    contour: [0, 1, 2, 4, 3, 2, 1, 0, 2, 4, 5, 4, 2, 1, 0],
    cadenceDegrees: [4, 2, 1, 0],
    phraseLength: 4,
    leapFrequency: 'medium',
    summary: 'classical/Mozart-like phrase with balanced question-answer contour and active rhythmic motion',
  },
  classical: {
    style: 'classical',
    rhythmPattern: ['Eighth', 'Eighth', '16th', '16th', 'Quarter', 'Quarter'],
    contour: [0, 1, 2, 4, 3, 2, 1, 0, 2, 4, 3, 2, 1, 0],
    cadenceDegrees: [4, 2, 1, 0],
    phraseLength: 4,
    leapFrequency: 'medium',
    summary: 'balanced classical phrase with active subdivision and cadence focus',
  },
  folk: {
    style: 'folk',
    rhythmPattern: ['Quarter', 'Eighth', 'Eighth', 'Quarter', 'Quarter'],
    contour: [0, 2, 1, 0, 3, 2, 1, 0, 4, 3, 2, 0],
    cadenceDegrees: [3, 2, 1, 0],
    phraseLength: 4,
    leapFrequency: 'low',
    summary: 'folk-like singable melody with repeated tonic returns and simple phrase endings',
  },
  country: {
    style: 'country',
    rhythmPattern: ['16th', '16th', 'Eighth', 'Quarter', 'Eighth', 'Quarter'],
    contour: [0, 2, 4, 2, 0, 2, 3, 2, 0, 1, 2, 0],
    cadenceDegrees: [4, 2, 1, 0],
    phraseLength: 4,
    leapFrequency: 'medium',
    summary: 'country-like melodic turn with pickup-style rhythmic motion and tonic returns',
  },
  jazz: {
    style: 'jazz',
    rhythmPattern: ['TripletEighth', 'TripletEighth', 'TripletEighth', 'Quarter', 'Eighth', 'Quarter'],
    contour: [0, 2, 4, 5, 3, 4, 6, 5, 3, 2, 0],
    cadenceDegrees: [6, 4, 2, 0],
    phraseLength: 4,
    leapFrequency: 'high',
    summary: 'jazz-like angular contour with syncopated triplet subdivision and skips',
  },
  pop: {
    style: 'pop',
    rhythmPattern: ['Quarter', 'Eighth', 'Eighth', '16th', '16th', 'Quarter'],
    contour: [0, 0, 2, 2, 4, 3, 2, 1, 0],
    cadenceDegrees: [4, 2, 1, 0],
    phraseLength: 4,
    leapFrequency: 'medium',
    summary: 'pop-like repeated hook contour with mixed subdivision and clear phrase resolution',
  },
  march: {
    style: 'march',
    rhythmPattern: ['Eighth', 'Eighth', 'Quarter', 'Quarter', 'Quarter'],
    contour: [0, 2, 4, 2, 0, 4, 3, 2, 1, 0],
    cadenceDegrees: [4, 2, 1, 0],
    phraseLength: 4,
    leapFrequency: 'medium',
    summary: 'march-like rhythmic drive with strong pulse and subdivision support',
  },
}

function applyDensity(plan: StylePlan, density: PromptDensity): StylePlan {
  if (density === 'simple') {
    return {
      ...plan,
      rhythmPattern: ['Quarter', 'Quarter', 'Half'],
      contour: plan.contour.map((degree) => Math.min(degree, 4)),
      leapFrequency: 'low',
      summary: `${plan.summary}; simplified for easier reading`,
    }
  }

  if (density === 'busy') {
    return {
      ...plan,
      rhythmPattern: ['16th', '16th', 'Eighth', '16th', '16th', 'Eighth', 'Quarter'],
      summary: `${plan.summary}; busier rhythmic surface with sixteenth-note activity`,
    }
  }

  return plan
}

export function getStylePlan(style: PromptStyleTag, density: PromptDensity): StylePlan {
  return applyDensity(STYLE_PLANS[style] ?? DEFAULT_STYLE_PLAN, density)
}

export function getStyleScaleDegree(
  plan: StylePlan,
  eventIndex: number,
  eventCount: number,
  measureIndex: number,
  measureCount: number,
): number {
  const isFinalMeasure = measureIndex === measureCount - 1
  const remainingEvents = eventCount - eventIndex

  if (isFinalMeasure && remainingEvents <= plan.cadenceDegrees.length) {
    const cadenceIndex = plan.cadenceDegrees.length - remainingEvents
    return plan.cadenceDegrees[Math.max(0, cadenceIndex)]
  }

  const phrasePosition = measureIndex % plan.phraseLength
  const phraseEnding = phrasePosition === plan.phraseLength - 1

  if (phraseEnding && remainingEvents > plan.cadenceDegrees.length) {
    return eventIndex % 2 === 0 ? 4 : 0
  }

  return plan.contour[eventIndex % plan.contour.length]
}
