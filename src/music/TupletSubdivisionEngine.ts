export type TupletKind =
  | 'triplet'
  | 'quintuplet'
  | 'sextuplet'
  | 'septuplet'

export type TupletRatio = {
  actualNotes: number
  normalNotes: number
  label: string
}

export type TupletSubdivisionUnit = {
  id: string
  kind: TupletKind
  measure: number
  beat: number
  indexInGroup: number
  ratio: TupletRatio
  duration: string
  beamGroupId: string
  tupletGroupId: string
  bracketGroupId: string
}

export type TupletGroup = {
  id: string
  kind: TupletKind
  measure: number
  beat: number
  ratio: TupletRatio
  units: TupletSubdivisionUnit[]
  teachingLabel: string
  countingSyllables: string[]
}

export type TupletAnalysis = {
  groups: TupletGroup[]
  summary: string
  warnings: string[]
}

export function getTupletRatio(kind: TupletKind): TupletRatio {
  switch (kind) {
    case 'triplet':
      return { actualNotes: 3, normalNotes: 2, label: '3:2' }

    case 'quintuplet':
      return { actualNotes: 5, normalNotes: 4, label: '5:4' }

    case 'sextuplet':
      return { actualNotes: 6, normalNotes: 4, label: '6:4' }

    case 'septuplet':
      return { actualNotes: 7, normalNotes: 4, label: '7:4' }

    default:
      return { actualNotes: 3, normalNotes: 2, label: '3:2' }
  }
}

export function getTupletCountingSyllables(kind: TupletKind, beatLabel = '1'): string[] {
  switch (kind) {
    case 'triplet':
      return [beatLabel, 'trip', 'let']

    case 'quintuplet':
      return [beatLabel, 'ta', 'ka', 'di', 'mi']

    case 'sextuplet':
      return [beatLabel, 'ta', 'la', '+', 'ta', 'la']

    case 'septuplet':
      return [beatLabel, 'ta', 'ka', 'di', 'mi', 'ta', 'ka']

    default:
      return [beatLabel, 'trip', 'let']
  }
}

export function createTupletGroup({
  kind,
  measure,
  beat,
  duration = 'TripletEighth',
}: {
  kind: TupletKind
  measure: number
  beat: number
  duration?: string
}): TupletGroup {
  const ratio = getTupletRatio(kind)
  const id = `${kind}-${measure}-${beat}`
  const countingSyllables = getTupletCountingSyllables(kind, String(Math.floor(beat)))

  const units: TupletSubdivisionUnit[] = Array.from({ length: ratio.actualNotes }, (_, index) => ({
    id: `${id}-unit-${index + 1}`,
    kind,
    measure,
    beat,
    indexInGroup: index,
    ratio,
    duration,
    beamGroupId: id,
    tupletGroupId: id,
    bracketGroupId: id,
  }))

  return {
    id,
    kind,
    measure,
    beat,
    ratio,
    units,
    teachingLabel: `${ratio.label} ${kind}`,
    countingSyllables,
  }
}

export function tagNotesWithTupletGroups<T extends { duration: string; measure: number; beat: number }>(
  notes: T[],
): Array<T & { tupletGroupId?: string; beamGroupId?: string; bracketGroupId?: string; ratioLabel?: string }> {
  const counters = new Map<string, number>()

  return notes.map((note) => {
    if (note.duration !== 'TripletEighth') return note

    const beatBucket = Math.floor(note.beat)
    const key = `triplet-${note.measure}-${beatBucket}`
    const count = counters.get(key) ?? 0
    counters.set(key, count + 1)

    const groupNumber = Math.floor(count / 3)
    const groupId = `${key}-${groupNumber}`

    return {
      ...note,
      tupletGroupId: groupId,
      beamGroupId: groupId,
      bracketGroupId: groupId,
      ratioLabel: '3:2',
    }
  })
}

export function analyzeTuplets<T extends { duration: string; measure: number; beat: number }>(
  notes: T[],
): TupletAnalysis {
  const groupMap = new Map<string, TupletGroup>()
  const warnings: string[] = []

  notes.forEach((note) => {
    if (note.duration !== 'TripletEighth') return

    const beatBucket = Math.floor(note.beat)
    const id = `triplet-${note.measure}-${beatBucket}`

    if (!groupMap.has(id)) {
      groupMap.set(id, createTupletGroup({
        kind: 'triplet',
        measure: note.measure,
        beat: beatBucket,
      }))
    }
  })

  const groups = Array.from(groupMap.values())

  groups.forEach((group) => {
    const actualCount = notes.filter((note) => note.duration === 'TripletEighth'
      && note.measure === group.measure
      && Math.floor(note.beat) === group.beat).length

    if (actualCount % group.ratio.actualNotes !== 0) {
      warnings.push(`Measure ${group.measure}, beat ${group.beat} has incomplete ${group.kind} grouping.`)
    }
  })

  return {
    groups,
    warnings,
    summary: `${groups.length} tuplet group(s) analyzed with ${warnings.length} warning(s).`,
  }
}
