import type { NoteEvent, TimeSignatureValue } from './musicBrain'

export type GroupableNoteEvent = NoteEvent & {
  beamGroupId?: string
  tupletGroupId?: string
  bracketGroupId?: string
  ratioLabel?: string
}

function getMeasureBeats(timeSignature: TimeSignatureValue): number {
  if (timeSignature === '3/4') return 3
  if (timeSignature === '2/4') return 2
  if (timeSignature === '6/8') return 3
  return 4
}

function isBeamable(note: GroupableNoteEvent): boolean {
  return !note.isRest && (note.duration === 'Eighth' || note.duration === '16th' || note.duration === 'TripletEighth')
}

function isTriplet(note: GroupableNoteEvent): boolean {
  return note.duration === 'TripletEighth'
}

function beatBucketFor(note: GroupableNoteEvent, timeSignature: TimeSignatureValue): number {
  if (timeSignature === '6/8') return Math.floor((note.beat - 1) / 1.5)
  return Math.floor(note.beat - 1)
}

function shouldStartNewBeamGroup(previous: GroupableNoteEvent | null, current: GroupableNoteEvent, timeSignature: TimeSignatureValue): boolean {
  if (!previous) return true
  if (!isBeamable(previous) || !isBeamable(current)) return true
  if (previous.measure !== current.measure) return true
  if (isTriplet(previous) || isTriplet(current)) return true
  if (beatBucketFor(previous, timeSignature) !== beatBucketFor(current, timeSignature)) return true
  return false
}

export function applyRhythmGrouping(notes: GroupableNoteEvent[], timeSignature: TimeSignatureValue): GroupableNoteEvent[] {
  const measureBeats = getMeasureBeats(timeSignature)
  const sorted = [...notes].sort((a, b) => (a.measure - b.measure) || (a.beat - b.beat))
  let beamGroupCounter = 0
  let tripletGroupCounter = 0
  let previousBeamable: GroupableNoteEvent | null = null
  let currentBeamGroupId = ''
  const tripletCountsByMeasureBeat = new Map<string, number>()

  return sorted.map((note) => {
    const next: GroupableNoteEvent = { ...note }

    if (!isBeamable(next)) {
      previousBeamable = null
      currentBeamGroupId = ''
      return next
    }

    if (isTriplet(next)) {
      const tripletKey = `${next.measure}-${Math.floor((next.beat - 1) * 1000)}`
      const localCount = tripletCountsByMeasureBeat.get(tripletKey) ?? 0
      const groupNumber = Math.floor(localCount / 3)
      const id = `triplet-m${next.measure}-b${Math.max(1, Math.min(measureBeats, Math.floor(next.beat)))}-${groupNumber || tripletGroupCounter}`
      tripletCountsByMeasureBeat.set(tripletKey, localCount + 1)
      if (localCount % 3 === 0) tripletGroupCounter += 1
      next.tupletGroupId = id
      next.bracketGroupId = id
      next.beamGroupId = id
      next.ratioLabel = '3:2'
      previousBeamable = null
      currentBeamGroupId = ''
      return next
    }

    if (shouldStartNewBeamGroup(previousBeamable, next, timeSignature)) {
      currentBeamGroupId = `beam-m${next.measure}-b${beatBucketFor(next, timeSignature) + 1}-${beamGroupCounter}`
      beamGroupCounter += 1
    }

    next.beamGroupId = currentBeamGroupId
    previousBeamable = next
    return next
  })
}
