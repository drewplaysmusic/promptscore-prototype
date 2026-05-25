export type StaffLineCount = 1 | 2 | 3 | 4 | 5

export type StaffAnchorNote = {
  pitch: string
  octave: number
  line: number
}

export type StaffProgressionStage = {
  lineCount: StaffLineCount
  anchorNotes: StaffAnchorNote[]
  description: string
  educationalFocus: string
}

const TREBLE_PROGRESSIONS: Record<StaffLineCount, StaffProgressionStage> = {
  1: {
    lineCount: 1,
    anchorNotes: [
      { pitch: 'E', octave: 4, line: 1 },
    ],
    description: 'Single-line rhythm literacy anchored to E.',
    educationalFocus: 'Pulse, subdivision, and first pitch association.',
  },
  2: {
    lineCount: 2,
    anchorNotes: [
      { pitch: 'E', octave: 4, line: 1 },
      { pitch: 'G', octave: 4, line: 2 },
    ],
    description: 'High/low awareness with directional movement.',
    educationalFocus: 'Interval direction and contour recognition.',
  },
  3: {
    lineCount: 3,
    anchorNotes: [
      { pitch: 'E', octave: 4, line: 1 },
      { pitch: 'G', octave: 4, line: 2 },
      { pitch: 'B', octave: 4, line: 3 },
    ],
    description: 'Three-line literacy with contour-based reading.',
    educationalFocus: 'Stepwise motion and visual interval familiarity.',
  },
  4: {
    lineCount: 4,
    anchorNotes: [
      { pitch: 'E', octave: 4, line: 1 },
      { pitch: 'G', octave: 4, line: 2 },
      { pitch: 'B', octave: 4, line: 3 },
      { pitch: 'D', octave: 5, line: 4 },
    ],
    description: 'Expanded staff literacy approaching full notation.',
    educationalFocus: 'Line/space recognition and interval reading.',
  },
  5: {
    lineCount: 5,
    anchorNotes: [
      { pitch: 'E', octave: 4, line: 1 },
      { pitch: 'G', octave: 4, line: 2 },
      { pitch: 'B', octave: 4, line: 3 },
      { pitch: 'D', octave: 5, line: 4 },
      { pitch: 'F', octave: 5, line: 5 },
    ],
    description: 'Full treble staff literacy progression.',
    educationalFocus: 'Traditional notation fluency and sight reading.',
  },
}

export function getStaffProgression(lineCount: StaffLineCount): StaffProgressionStage {
  return TREBLE_PROGRESSIONS[lineCount]
}

export function getAvailablePitchSet(lineCount: StaffLineCount): Array<{ pitch: string; octave: number }> {
  return TREBLE_PROGRESSIONS[lineCount].anchorNotes.map((note) => ({
    pitch: note.pitch,
    octave: note.octave,
  }))
}
