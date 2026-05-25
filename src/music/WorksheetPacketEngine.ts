import type { EducationalEngravingProfile } from './AdaptiveEducationalEngravingEngine'
import type { PracticeGoal, PracticeLevel } from './GuidedPracticeEngine'

export type WorksheetExerciseType =
  | 'rhythm-reading'
  | 'pitch-reading'
  | 'scale-practice'
  | 'interval-identification'
  | 'chord-analysis'
  | 'phrase-analysis'
  | 'sight-reading'
  | 'blank-staff'
  | 'composition-prompt'
  | 'technique-grid'

export type WorksheetDifficulty =
  | 'introductory'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'professional'

export type WorksheetExercise = {
  id: string
  type: WorksheetExerciseType
  title: string
  instructions: string
  measureCount?: number
  points?: number
  estimatedMinutes?: number
  teachingFocus: string[]
}

export type WorksheetPacket = {
  id: string
  title: string
  level: PracticeLevel
  difficulty: WorksheetDifficulty
  goal: PracticeGoal
  engravingProfile: EducationalEngravingProfile
  exercises: WorksheetExercise[]
  totalEstimatedMinutes: number
  teacherNotes: string[]
  studentInstructions: string[]
  summary: string
}

function getDifficultyFromLevel(level: PracticeLevel): WorksheetDifficulty {
  switch (level) {
    case 'Beginner':
      return 'beginner'
    case 'Intermediate':
      return 'intermediate'
    case 'Advanced':
      return 'advanced'
    case 'Professional':
      return 'professional'
    default:
      return 'beginner'
  }
}

function buildExercise({
  id,
  type,
  title,
  instructions,
  measureCount,
  points,
  estimatedMinutes,
  teachingFocus,
}: WorksheetExercise): WorksheetExercise {
  return {
    id,
    type,
    title,
    instructions,
    measureCount,
    points,
    estimatedMinutes,
    teachingFocus,
  }
}

function getExerciseTemplates(goal: PracticeGoal): WorksheetExercise[] {
  switch (goal) {
    case 'Rhythm Accuracy':
      return [
        buildExercise({
          id: 'rhythm-grid-1',
          type: 'rhythm-reading',
          title: 'Subdivision Reading Grid',
          instructions: 'Count and clap the rhythms using the visible counting overlays.',
          measureCount: 8,
          points: 10,
          estimatedMinutes: 8,
          teachingFocus: ['subdivision', 'pulse', 'triplets'],
        }),
        buildExercise({
          id: 'rhythm-grid-2',
          type: 'sight-reading',
          title: 'Sight Reading Challenge',
          instructions: 'Perform the rhythm without stopping. Focus on steady pulse.',
          measureCount: 12,
          points: 15,
          estimatedMinutes: 10,
          teachingFocus: ['reading flow', 'pulse consistency'],
        }),
      ]

    case 'Pitch Literacy':
      return [
        buildExercise({
          id: 'pitch-lines-spaces',
          type: 'pitch-reading',
          title: 'Lines and Spaces',
          instructions: 'Identify note names and write the correct pitch labels.',
          measureCount: 6,
          points: 12,
          estimatedMinutes: 10,
          teachingFocus: ['staff reading', 'pitch identification'],
        }),
        buildExercise({
          id: 'pitch-patterns',
          type: 'sight-reading',
          title: 'Pitch Pattern Reading',
          instructions: 'Read and perform each melodic pattern.',
          measureCount: 8,
          points: 15,
          estimatedMinutes: 12,
          teachingFocus: ['melodic contour', 'pitch fluency'],
        }),
      ]

    case 'Scale Fluency':
      return [
        buildExercise({
          id: 'major-scales',
          type: 'scale-practice',
          title: 'Major Scale Practice',
          instructions: 'Perform the scale evenly with correct fingerings or stickings.',
          measureCount: 8,
          points: 10,
          estimatedMinutes: 12,
          teachingFocus: ['scale fluency', 'technique consistency'],
        }),
      ]

    case 'Harmony Understanding':
      return [
        buildExercise({
          id: 'roman-analysis',
          type: 'chord-analysis',
          title: 'Roman Numeral Analysis',
          instructions: 'Label each chord progression using Roman numerals.',
          measureCount: 8,
          points: 20,
          estimatedMinutes: 15,
          teachingFocus: ['functional harmony', 'cadence recognition'],
        }),
        buildExercise({
          id: 'phrase-analysis',
          type: 'phrase-analysis',
          title: 'Phrase and Cadence Analysis',
          instructions: 'Mark phrase endings and identify cadence types.',
          measureCount: 12,
          points: 20,
          estimatedMinutes: 15,
          teachingFocus: ['phrasing', 'musical form'],
        }),
      ]

    case 'Technique Builder':
      return [
        buildExercise({
          id: 'technique-grid',
          type: 'technique-grid',
          title: 'Technique Consistency Grid',
          instructions: 'Repeat each pattern with relaxed and controlled technique.',
          measureCount: 16,
          points: 15,
          estimatedMinutes: 15,
          teachingFocus: ['consistency', 'muscle memory', 'control'],
        }),
      ]

    default:
      return [
        buildExercise({
          id: 'blank-staff',
          type: 'blank-staff',
          title: 'Blank Staff Practice',
          instructions: 'Compose or notate your own musical example.',
          measureCount: 8,
          points: 10,
          estimatedMinutes: 10,
          teachingFocus: ['creativity', 'notation fluency'],
        }),
      ]
  }
}

function getTeacherNotes(goal: PracticeGoal): string[] {
  switch (goal) {
    case 'Rhythm Accuracy':
      return [
        'Encourage verbal counting before performance.',
        'Focus on subdivision consistency rather than speed.',
      ]

    case 'Pitch Literacy':
      return [
        'Reduce note-name overlays gradually as confidence improves.',
        'Use staff-line progression settings for literacy growth.',
      ]

    case 'Harmony Understanding':
      return [
        'Discuss phrase tension and cadence function during analysis.',
        'Encourage students to sing harmonic movement aloud.',
      ]

    default:
      return [
        'Encourage consistent fundamentals and relaxed technique.',
      ]
  }
}

export function createWorksheetPacket({
  title,
  level,
  goal,
  engravingProfile,
}: {
  title?: string
  level: PracticeLevel
  goal: PracticeGoal
  engravingProfile: EducationalEngravingProfile
}): WorksheetPacket {
  const exercises = getExerciseTemplates(goal)
  const difficulty = getDifficultyFromLevel(level)
  const totalEstimatedMinutes = exercises.reduce(
    (sum, exercise) => sum + (exercise.estimatedMinutes ?? 0),
    0,
  )

  return {
    id: `worksheet-${goal.toLowerCase().replaceAll(' ', '-')}-${Date.now()}`,
    title: title ?? `${goal} Practice Packet`,
    level,
    difficulty,
    goal,
    engravingProfile,
    exercises,
    totalEstimatedMinutes,
    teacherNotes: getTeacherNotes(goal),
    studentInstructions: [
      'Complete each exercise carefully before moving forward.',
      'Focus on musical understanding, not only speed.',
      'Use playback and overlays when available.',
    ],
    summary: `${exercises.length} exercise(s) generated for ${goal} at ${difficulty} difficulty.`,
  }
}

export function estimateWorksheetPages(packet: WorksheetPacket): number {
  const measureTotal = packet.exercises.reduce(
    (sum, exercise) => sum + (exercise.measureCount ?? 0),
    0,
  )

  return Math.max(1, Math.ceil(measureTotal / 16))
}

export function describeWorksheetPacket(packet: WorksheetPacket): string {
  return `${packet.title}: ${packet.exercises.length} exercise(s), ${packet.totalEstimatedMinutes} estimated minutes, ${estimateWorksheetPages(packet)} page(s).`
}
