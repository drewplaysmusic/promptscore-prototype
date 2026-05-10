import { flattenRhythmTree, type RhythmNode, type RhythmTree } from './RhythmTree'

export type RhythmTreeDurationValue =
  | 'Whole'
  | 'DottedHalf'
  | 'Half'
  | 'DottedQuarter'
  | 'Quarter'
  | 'DottedEighth'
  | 'Eighth'
  | 'TripletEighth'
  | '16th'

export type RhythmTreeAccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null
export type RhythmTreePitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

export type RhythmTreeNoteEvent = {
  duration: RhythmTreeDurationValue
  accidental: RhythmTreeAccidentalValue
  isRest: boolean
  pitch: RhythmTreePitchValue
  measure: number
  beat: number
  tupletGroupId?: string
  ratioLabel?: string
  beamGroupId?: string
  bracketGroupId?: string
  startTick?: number
  endTick?: number
  startX?: number
  endX?: number
}

export type RhythmTreeToNoteOptions = {
  pitch?: RhythmTreePitchValue
  accidental?: RhythmTreeAccidentalValue
  measure?: number
  ticksPerMeasure?: number
  xScale?: number
}

const DEFAULT_TICKS_PER_MEASURE = 1920
const DEFAULT_X_SCALE = 880

function getDurationForNode(node: RhythmNode): RhythmTreeDurationValue {
  const ratioActual = node.ratio?.actual

  if (ratioActual === 3) return 'TripletEighth'
  if (ratioActual && ratioActual > 3) return '16th'

  if (node.durationRatio >= 0.999) return 'Whole'
  if (node.durationRatio >= 0.749) return 'DottedHalf'
  if (node.durationRatio >= 0.499) return 'Half'
  if (node.durationRatio >= 0.374) return 'DottedQuarter'
  if (node.durationRatio >= 0.249) return 'Quarter'
  if (node.durationRatio >= 0.187) return 'DottedEighth'
  if (node.durationRatio >= 0.124) return 'Eighth'
  return '16th'
}

function getRatioLabel(node: RhythmNode): string | undefined {
  if (!node.ratio) return undefined
  return `${node.ratio.actual}`
}

function getRepeatedRegionKey(node: RhythmNode): string {
  const beatMatch = node.id.match(/(.+)-note-\d+$/)
  if (beatMatch) return beatMatch[1]
  const nestedMatch = node.id.match(/nested-(\d+)-\d+/)
  if (nestedMatch) return `nested-${nestedMatch[1]}`
  return node.id
}

function getRatioGroupId(node: RhythmNode, measure: number): string | undefined {
  if (!node.ratio) return undefined
  return `rhythm-tree-m${measure}-${node.ratio.label}-${getRepeatedRegionKey(node)}`
}

export function rhythmTreeToNoteEvents(
  tree: RhythmTree,
  options: RhythmTreeToNoteOptions = {},
): RhythmTreeNoteEvent[] {
  const measure = options.measure ?? 1
  const pitch = options.pitch ?? 'C'
  const accidental = options.accidental ?? null
  const ticksPerMeasure = options.ticksPerMeasure ?? DEFAULT_TICKS_PER_MEASURE
  const xScale = options.xScale ?? DEFAULT_X_SCALE
  const leaves = flattenRhythmTree(tree)

  return leaves.map((leaf) => {
    const groupId = getRatioGroupId(leaf, measure)
    const startTick = Math.round(leaf.startRatio * ticksPerMeasure)
    const endTick = Math.round(leaf.endRatio * ticksPerMeasure)

    return {
      duration: getDurationForNode(leaf),
      accidental,
      isRest: false,
      pitch,
      measure,
      beat: 1 + leaf.startRatio * 4,
      startTick,
      endTick,
      startX: leaf.startRatio * xScale,
      endX: leaf.endRatio * xScale,
      beamGroupId: groupId,
      tupletGroupId: groupId,
      bracketGroupId: groupId,
      ratioLabel: getRatioLabel(leaf),
    }
  })
}

export function summarizeRhythmTreeNoteEvents(events: RhythmTreeNoteEvent[]): string {
  const ratioLabels = Array.from(new Set(events.map((event) => event.ratioLabel).filter(Boolean)))
  const ratioSummary = ratioLabels.length > 0 ? ` Tuplet labels: ${ratioLabels.join(', ')}.` : ''
  return `${events.length} note event(s) generated from RhythmTree.${ratioSummary}`
}
