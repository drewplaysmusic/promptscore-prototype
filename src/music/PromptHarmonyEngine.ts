import { generateHarmonyPlan, type HarmonyPlan, type RomanNumeral } from './harmonyBrain'
import type { PromptIntent } from './PromptIntentEngine'

function mapPromptStyleToHarmonyStyle(style: PromptIntent['style']) {
  if (style === 'mozart') return 'classical'
  if (style === 'beginner') return 'plain'
  if (style === 'unknown') return 'plain'
  return style
}

function mapPromptModeToScaleSystem(mode: PromptIntent['mode']) {
  return mode === 'minor' ? 'natural minor' : 'major'
}

export type PromptHarmonyResult = {
  harmony: HarmonyPlan
  progressionByMeasure: RomanNumeral[]
  summary: string
}

export function generatePromptHarmony(intent: PromptIntent): PromptHarmonyResult {
  const harmony = generateHarmonyPlan(
    intent.rawPrompt,
    mapPromptStyleToHarmonyStyle(intent.style),
    mapPromptModeToScaleSystem(intent.mode),
  )

  const progressionByMeasure = Array.from({ length: intent.measureCount }, (_, index) => {
    if (harmony.progression.length === 0) return 'none' as RomanNumeral
    return harmony.progression[index % harmony.progression.length]
  })

  return {
    harmony,
    progressionByMeasure,
    summary: `${harmony.label}: ${progressionByMeasure.join(' → ')}`,
  }
}
