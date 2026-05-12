import {
  createEqualDivisionTree,
  createNestedNineletTree,
  createQuarterDivisionTree,
  createRatioTree,
  createRepeatedRatioTree,
  flattenRhythmTree,
  type RhythmTree,
} from './RhythmTree'
import {
  rhythmTreeToNoteEvents,
  summarizeRhythmTreeNoteEvents,
  type RhythmTreeNoteEvent,
  type RhythmTreePitchValue,
} from './RhythmTreeToNoteEvents'

export type RhythmIntentKind =
  | 'quarters'
  | 'eighths'
  | 'sixteenths'
  | 'triplets'
  | 'quintuplets'
  | 'sextuplets'
  | 'septuplets'
  | 'ninelets'
  | 'unknown'

export type RhythmIntent = {
  kind: RhythmIntentKind
  label: string
  confidence: number
  actual?: number
  normal?: number
  nested?: boolean
}

export type RhythmFunnelResult = {
  intent: RhythmIntent
  tree: RhythmTree
  notes: RhythmTreeNoteEvent[]
  valid: boolean
  warnings: string[]
  summary: string
}

function normalizePrompt(prompt: string): string {
  return prompt.toLowerCase().replace(/[,.;]/g, ' ').replace(/\s+/g, ' ').trim()
}

function detectPitch(prompt: string): RhythmTreePitchValue {
  const match = prompt.match(/\b(?:in|key of)\s+([a-g])\b/)
  const candidate = match?.[1]?.toUpperCase()
  if (candidate === 'C' || candidate === 'D' || candidate === 'E' || candidate === 'F' || candidate === 'G' || candidate === 'A' || candidate === 'B') {
    return candidate
  }
  return 'C'
}

function detectMeasureCount(prompt: string): number {
  const match = prompt.match(/(\d+)\s*(measure|measures|bar|bars)/)
  if (!match) return 1

  const parsed = Number(match[1])
  if (!Number.isFinite(parsed)) return 1

  return Math.min(Math.max(parsed, 1), 32)
}

export function detectRhythmIntent(prompt: string): RhythmIntent {
  const normalized = normalizePrompt(prompt)
  const ratioMatch = normalized.match(/\b(\d+)\s*(?:over|:)\s*(\d+)\b/)

  if (normalized.includes('ninelet') || normalized.includes('9let') || normalized.includes('subdivide triplet')) {
    return { kind: 'ninelets', label: 'nested ninelets', confidence: 0.95, actual: 9, normal: 8, nested: true }
  }

  if (ratioMatch) {
    const actual = Number(ratioMatch[1])
    const normal = Number(ratioMatch[2])

    if (actual === 3) return { kind: 'triplets', label: `${actual}:${normal}`, confidence: 0.95, actual, normal }
    if (actual === 5) return { kind: 'quintuplets', label: `${actual}:${normal}`, confidence: 0.95, actual, normal }
    if (actual === 6) return { kind: 'sextuplets', label: `${actual}:${normal}`, confidence: 0.95, actual, normal }
    if (actual === 7) return { kind: 'septuplets', label: `${actual}:${normal}`, confidence: 0.95, actual, normal }
    if (actual === 9) return { kind: 'ninelets', label: `${actual}:${normal}`, confidence: 0.95, actual, normal }
  }

  if (normalized.includes('triplet')) {
    return { kind: 'triplets', label: 'triplets 3:2', confidence: 0.9, actual: 3, normal: 2 }
  }

  if (normalized.includes('quintuplet') || normalized.includes('fivelet')) {
    return { kind: 'quintuplets', label: 'quintuplets 5:4', confidence: 0.9, actual: 5, normal: 4 }
  }

  if (normalized.includes('sextuplet') || normalized.includes('sixlet')) {
    return { kind: 'sextuplets', label: 'sextuplets 6:4', confidence: 0.9, actual: 6, normal: 4 }
  }

  if (normalized.includes('septuplet') || normalized.includes('sevenlet')) {
  return { kind: 'septuplets', label: 'septuplets 7:4', confidence: 0.9, actual: 7, normal: 4 }
}

if (normalized.includes('sixteenth') || normalized.includes('16th') || normalized.includes('16ths')) {
  return { kind: 'sixteenths', label: 'sixteenth notes', confidence: 0.82 }
}

  if (normalized.includes('eighth') || normalized.includes('8th')) {
    return { kind: 'eighths', label: 'eighth notes', confidence: 0.75 }
  }

  if (normalized.includes('quarter')) {
  return { kind: 'quarters', label: 'quarter notes', confidence: 0.75 }
}

return { kind: 'quarters', label: 'default quarter notes', confidence: 0.35 }
}

export function buildRhythmTreeFromIntent(intent: RhythmIntent): RhythmTree {
 if (intent.kind === 'sixteenths') return createEqualDivisionTree(16, 'sixteenth') 
if (intent.kind === 'eighths') return createEqualDivisionTree(8, 'eighth')
  if (intent.kind === 'triplets') return createRepeatedRatioTree({ actual: intent.actual ?? 3, normal: intent.normal ?? 2, repeatCount: 4, label: `triplet-${intent.actual ?? 3}:${intent.normal ?? 2}` })
  if (intent.kind === 'quintuplets') return createRepeatedRatioTree({ actual: intent.actual ?? 5, normal: intent.normal ?? 4, repeatCount: 4, label: `quintuplet-${intent.actual ?? 5}:${intent.normal ?? 4}` })
  if (intent.kind === 'sextuplets') return createRepeatedRatioTree({ actual: intent.actual ?? 6, normal: intent.normal ?? 4, repeatCount: 4, label: `sextuplet-${intent.actual ?? 6}:${intent.normal ?? 4}` })
  if (intent.kind === 'septuplets') return createRepeatedRatioTree({ actual: intent.actual ?? 7, normal: intent.normal ?? 4, repeatCount: 4, label: `septuplet-${intent.actual ?? 7}:${intent.normal ?? 4}` })
  if (intent.kind === 'ninelets') {
    return intent.nested
      ? createNestedNineletTree()
      : createRepeatedRatioTree({ actual: intent.actual ?? 9, normal: intent.normal ?? 8, repeatCount: 4, label: `ninelet-${intent.actual ?? 9}:${intent.normal ?? 8}` })
  }
  return createQuarterDivisionTree()
}

export function validateRhythmTree(tree: RhythmTree): string[] {
  const warnings: string[] = []
  const leaves = flattenRhythmTree(tree)

  if (leaves.length === 0) warnings.push('RhythmTree has no playable note leaves.')

  leaves.forEach((leaf) => {
    if (leaf.startRatio < 0 || leaf.endRatio > 1) warnings.push(`${leaf.id} extends outside the measure.`)
    if (leaf.endRatio <= leaf.startRatio) warnings.push(`${leaf.id} has invalid duration.`)
  })

  const sortedLeaves = [...leaves].sort((a, b) => a.startRatio - b.startRatio)
  sortedLeaves.forEach((leaf, index) => {
    const next = sortedLeaves[index + 1]
    if (!next) return
    if (leaf.endRatio > next.startRatio + 0.0001) warnings.push(`${leaf.id} overlaps ${next.id}.`)
  })

  return warnings
}

export function runRhythmFunnel(prompt: string): RhythmFunnelResult {
  const normalized = normalizePrompt(prompt)
  const pitch = detectPitch(normalized)
  const measureCount = detectMeasureCount(normalized)
  const intent = detectRhythmIntent(normalized)
  const tree = buildRhythmTreeFromIntent(intent)
  const warnings = validateRhythmTree(tree)
  const notes: RhythmTreeNoteEvent[] = []

  for (let measure = 1; measure <= measureCount; measure += 1) {
    notes.push(...rhythmTreeToNoteEvents(tree, { pitch, measure }))
  }

  const noteSummary = summarizeRhythmTreeNoteEvents(notes)

  return {
    intent,
    tree,
    notes,
    valid: warnings.length === 0,
    warnings,
    summary: `RhythmFunnel detected ${intent.label} across ${measureCount} measure(s) with ${Math.round(intent.confidence * 100)}% confidence. ${noteSummary}`,
  }
}
