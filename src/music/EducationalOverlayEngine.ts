export type EducationalOverlayType =
  | 'countLabels'
  | 'noteNames'
  | 'solfege'
  | 'intervalNames'
  | 'colorNotes'
  | 'sticking'

export type EducationalOverlayState = Record<EducationalOverlayType, boolean>

export type OverlayToken = {
  measure: number
  beat: number
  value: string
  overlay: EducationalOverlayType
}

export const DEFAULT_OVERLAY_STATE: EducationalOverlayState = {
  countLabels: true,
  noteNames: true,
  solfege: false,
  intervalNames: false,
  colorNotes: false,
  sticking: false,
}

const SOLFEGE_MAP: Record<string, string> = {
  C: 'Do',
  D: 'Re',
  E: 'Mi',
  F: 'Fa',
  G: 'Sol',
  A: 'La',
  B: 'Ti',
}

const COLOR_NOTE_MAP: Record<string, string> = {
  C: '#ef4444',
  D: '#f97316',
  E: '#eab308',
  F: '#22c55e',
  G: '#3b82f6',
  A: '#8b5cf6',
  B: '#ec4899',
}

export function getNoteNameOverlay(notes: any[]): OverlayToken[] {
  return notes.map((note) => ({
    measure: note.measure,
    beat: note.beat,
    value: `${note.pitch}${note.octave ?? ''}`,
    overlay: 'noteNames',
  }))
}

export function getCountOverlay(countsByMeasure: Record<number, string[]>): OverlayToken[] {
  const overlays: OverlayToken[] = []

  Object.entries(countsByMeasure).forEach(([measure, counts]) => {
    counts.forEach((count, index) => {
      overlays.push({
        measure: Number(measure),
        beat: index + 1,
        value: count,
        overlay: 'countLabels',
      })
    })
  })

  return overlays
}

export function getSolfegeOverlay(notes: any[]): OverlayToken[] {
  return notes.map((note) => ({
    measure: note.measure,
    beat: note.beat,
    value: SOLFEGE_MAP[note.pitch] ?? note.pitch,
    overlay: 'solfege',
  }))
}

export function getColorForPitch(pitch: string): string {
  return COLOR_NOTE_MAP[pitch] ?? '#111827'
}

export function buildEducationalOverlays({
  notes,
  countsByMeasure,
  enabled,
}: {
  notes: any[]
  countsByMeasure: Record<number, string[]>
  enabled: EducationalOverlayState
}) {
  return {
    noteNames: enabled.noteNames ? getNoteNameOverlay(notes) : [],
    countLabels: enabled.countLabels ? getCountOverlay(countsByMeasure) : [],
    solfege: enabled.solfege ? getSolfegeOverlay(notes) : [],
    intervalNames: [],
    colorNotes: enabled.colorNotes,
    sticking: [],
  }
}
