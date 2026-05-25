export type MusicBrainId =
  | 'rhythm'
  | 'pitch-literacy'
  | 'harmony'
  | 'technique'
  | 'percussion'
  | 'ear-training'
  | 'theory'
  | 'expression'
  | 'game-practice'

export type MusicBrainCategory =
  | 'Literacy'
  | 'Performance'
  | 'Theory'
  | 'Technique'
  | 'Expression'
  | 'Assessment'

export type MusicMaskOutputType =
  | 'text-overlay'
  | 'color-overlay'
  | 'highlight-overlay'
  | 'analysis-label'
  | 'practice-prompt'
  | 'game-target'
  | 'playback-modifier'

export type MusicMaskAnchor = {
  measure?: number
  beat?: number
  noteId?: string
  staff?: number
  voice?: string
}

export type MusicMaskOutput = {
  id: string
  brainId: MusicBrainId
  type: MusicMaskOutputType
  label: string
  value: string
  anchor: MusicMaskAnchor
  priority: number
  visibleByDefault: boolean
}

export type MusicBrainDefinition = {
  id: MusicBrainId
  name: string
  category: MusicBrainCategory
  description: string
  defaultEnabled: boolean
  supportedOutputs: MusicMaskOutputType[]
  futureUses: string[]
}

export const MUSIC_BRAINS: MusicBrainDefinition[] = [
  {
    id: 'rhythm',
    name: 'Rhythm Brain',
    category: 'Literacy',
    description: 'Understands pulse, subdivision, counting, tuplets, rhythm difficulty, and timing literacy.',
    defaultEnabled: true,
    supportedOutputs: ['text-overlay', 'highlight-overlay', 'practice-prompt', 'game-target'],
    futureUses: ['count overlays', 'tapback games', 'rhythm accuracy scoring', 'adaptive subdivision hints'],
  },
  {
    id: 'pitch-literacy',
    name: 'Pitch Literacy Brain',
    category: 'Literacy',
    description: 'Controls progressive staff literacy, note names, pitch constraints, contour, and E-G-B-D-F expansion.',
    defaultEnabled: true,
    supportedOutputs: ['text-overlay', 'color-overlay', 'highlight-overlay', 'game-target'],
    futureUses: ['note-name games', 'staff expansion unlocks', 'pitch flashcards', 'adaptive note reveal'],
  },
  {
    id: 'harmony',
    name: 'Harmony Brain',
    category: 'Theory',
    description: 'Interprets chord symbols, Roman numerals, harmonic function, chord tones, and voice leading.',
    defaultEnabled: false,
    supportedOutputs: ['analysis-label', 'text-overlay', 'color-overlay', 'highlight-overlay'],
    futureUses: ['Roman numeral overlays', 'chord function labels', 'guide-tone highlighting', 'jazz harmony analysis'],
  },
  {
    id: 'technique',
    name: 'Technique Brain',
    category: 'Technique',
    description: 'Maps instrument family, scale systems, technical priorities, and difficulty progressions.',
    defaultEnabled: false,
    supportedOutputs: ['practice-prompt', 'text-overlay', 'game-target'],
    futureUses: ['scale packets', 'arpeggio drills', 'instrument-specific warmups', 'professional technique studies'],
  },
  {
    id: 'percussion',
    name: 'Percussion Brain',
    category: 'Performance',
    description: 'Understands sticking, rudiments, accents, grids, marching percussion, and rhythm-first notation.',
    defaultEnabled: false,
    supportedOutputs: ['text-overlay', 'highlight-overlay', 'practice-prompt', 'game-target'],
    futureUses: ['sticking overlays', 'rudiment builders', 'accent tap grids', 'quad/tenor mapping'],
  },
  {
    id: 'ear-training',
    name: 'Ear Training Brain',
    category: 'Assessment',
    description: 'Supports listening, interval recognition, playback challenges, and future student-response scoring.',
    defaultEnabled: false,
    supportedOutputs: ['practice-prompt', 'game-target', 'highlight-overlay'],
    futureUses: ['interval games', 'call-and-response', 'sing/play back', 'mistake reveal'],
  },
  {
    id: 'theory',
    name: 'Theory Brain',
    category: 'Theory',
    description: 'Labels scale degrees, intervals, cadences, forms, functions, and theoretical relationships.',
    defaultEnabled: false,
    supportedOutputs: ['analysis-label', 'text-overlay', 'highlight-overlay'],
    futureUses: ['AP theory labels', 'cadence detection', 'interval names', 'scale-degree overlays'],
  },
  {
    id: 'expression',
    name: 'Expression Brain',
    category: 'Expression',
    description: 'Handles dynamics, articulations, phrasing, tempo language, character, and musical shape.',
    defaultEnabled: false,
    supportedOutputs: ['text-overlay', 'playback-modifier', 'practice-prompt'],
    futureUses: ['dynamics', 'articulations', 'phrasing arcs', 'humanized playback'],
  },
  {
    id: 'game-practice',
    name: 'Game Practice Brain',
    category: 'Assessment',
    description: 'Turns musical masks into interactive tasks, challenges, progressions, and feedback loops.',
    defaultEnabled: false,
    supportedOutputs: ['game-target', 'practice-prompt', 'highlight-overlay'],
    futureUses: ['note ID games', 'rhythm tapback', 'streaks', 'adaptive levels'],
  },
]

export function getMusicBrain(id: MusicBrainId): MusicBrainDefinition | undefined {
  return MUSIC_BRAINS.find((brain) => brain.id === id)
}

export function getBrainsByCategory(category: MusicBrainCategory): MusicBrainDefinition[] {
  return MUSIC_BRAINS.filter((brain) => brain.category === category)
}

export function getDefaultEnabledBrainIds(): MusicBrainId[] {
  return MUSIC_BRAINS.filter((brain) => brain.defaultEnabled).map((brain) => brain.id)
}

export function createMaskOutput({
  brainId,
  type,
  label,
  value,
  anchor,
  priority = 1,
  visibleByDefault = true,
}: Omit<MusicMaskOutput, 'id'>): MusicMaskOutput {
  return {
    id: `${brainId}-${type}-${anchor.measure ?? 0}-${anchor.beat ?? 0}-${label}`,
    brainId,
    type,
    label,
    value,
    anchor,
    priority,
    visibleByDefault,
  }
}
