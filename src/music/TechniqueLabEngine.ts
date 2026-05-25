export type InstrumentFamily =
  | 'Brass'
  | 'Woodwind'
  | 'Strings'
  | 'Percussion'
  | 'Keyboard'
  | 'Voice'
  | 'Guitar/Fretted'
  | 'Marching Percussion'
  | 'Drum Set'

export type TechniqueDifficulty =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Professional'

export type TechniqueCategory =
  | 'Scales'
  | 'Arpeggios'
  | 'Sight Reading'
  | 'Rhythm'
  | 'Articulation'
  | 'Intervals'
  | 'Technique Builder'
  | 'Rudiments'

export type ScaleType =
  | 'Major'
  | 'Natural Minor'
  | 'Harmonic Minor'
  | 'Melodic Minor'
  | 'Pentatonic'
  | 'Blues'
  | 'Modes'
  | 'Chromatic'

export type TechniqueExerciseTemplate = {
  id: string
  title: string
  family: InstrumentFamily
  category: TechniqueCategory
  difficulty: TechniqueDifficulty
  scaleType?: ScaleType
  description: string
  focusAreas: string[]
  overlaysRecommended: string[]
}

export type TechniqueInstrumentDefinition = {
  family: InstrumentFamily
  instruments: string[]
  priorities: string[]
}

export const TECHNIQUE_INSTRUMENTS: TechniqueInstrumentDefinition[] = [
  {
    family: 'Brass',
    instruments: ['Trumpet', 'Trombone', 'French Horn', 'Tuba', 'Euphonium'],
    priorities: ['Range', 'Articulation', 'Lip Slurs', 'Breathing'],
  },
  {
    family: 'Woodwind',
    instruments: ['Flute', 'Clarinet', 'Saxophone', 'Oboe', 'Bassoon'],
    priorities: ['Finger Technique', 'Articulation', 'Register Control'],
  },
  {
    family: 'Strings',
    instruments: ['Violin', 'Viola', 'Cello', 'Bass'],
    priorities: ['Shifting', 'Intonation', 'Bow Control'],
  },
  {
    family: 'Percussion',
    instruments: ['Snare Drum', 'Marimba', 'Xylophone', 'Timpani'],
    priorities: ['Rhythm', 'Sticking', 'Grid Timing', 'Reading'],
  },
  {
    family: 'Keyboard',
    instruments: ['Piano', 'Organ'],
    priorities: ['Scales', 'Arpeggios', 'Voicings', 'Voice Leading'],
  },
  {
    family: 'Voice',
    instruments: ['Soprano', 'Alto', 'Tenor', 'Bass'],
    priorities: ['Pitch Matching', 'Intervals', 'Breath Support'],
  },
  {
    family: 'Guitar/Fretted',
    instruments: ['Guitar', 'Bass Guitar', 'Mandolin'],
    priorities: ['Position Shifts', 'Scale Shapes', 'Picking'],
  },
  {
    family: 'Marching Percussion',
    instruments: ['Snare', 'Tenors', 'Bass Drum', 'Front Ensemble'],
    priorities: ['Rudiments', 'Timing', 'Velocity', 'Consistency'],
  },
  {
    family: 'Drum Set',
    instruments: ['Drum Set'],
    priorities: ['Coordination', 'Groove', 'Independence'],
  },
]

export const TECHNIQUE_TEMPLATES: TechniqueExerciseTemplate[] = [
  {
    id: 'beginner-major-scale',
    title: 'Beginner Major Scale Builder',
    family: 'Keyboard',
    category: 'Scales',
    difficulty: 'Beginner',
    scaleType: 'Major',
    description: 'Simple one-octave major scale literacy and fluency.',
    focusAreas: ['Reading', 'Finger Familiarity', 'Steady Pulse'],
    overlaysRecommended: ['noteNames', 'countLabels'],
  },
  {
    id: 'intermediate-triplet-grid',
    title: 'Intermediate Triplet Grid',
    family: 'Percussion',
    category: 'Rhythm',
    difficulty: 'Intermediate',
    description: 'Triplet subdivision timing and rhythmic consistency.',
    focusAreas: ['Subdivision', 'Timing', 'Accent Control'],
    overlaysRecommended: ['countLabels', 'sticking'],
  },
  {
    id: 'professional-modal-cycle',
    title: 'Professional Modal Cycle',
    family: 'Woodwind',
    category: 'Scales',
    difficulty: 'Professional',
    scaleType: 'Modes',
    description: 'Advanced modal fluency and interval sequencing.',
    focusAreas: ['Modes', 'Intervals', 'Technique Endurance'],
    overlaysRecommended: ['solfege'],
  },
]

export function getInstrumentFamilies(): InstrumentFamily[] {
  return TECHNIQUE_INSTRUMENTS.map((entry) => entry.family)
}

export function getInstrumentsForFamily(family: InstrumentFamily): string[] {
  return TECHNIQUE_INSTRUMENTS.find((entry) => entry.family === family)?.instruments ?? []
}

export function getTechniquePriorities(family: InstrumentFamily): string[] {
  return TECHNIQUE_INSTRUMENTS.find((entry) => entry.family === family)?.priorities ?? []
}

export function getTemplatesForFamily(family: InstrumentFamily): TechniqueExerciseTemplate[] {
  return TECHNIQUE_TEMPLATES.filter((template) => template.family === family)
}

export function buildTechniquePrompt({
  family,
  instrument,
  category,
  difficulty,
  scaleType,
}: {
  family: InstrumentFamily
  instrument: string
  category: TechniqueCategory
  difficulty: TechniqueDifficulty
  scaleType?: ScaleType
}) {
  return `${difficulty} ${instrument} ${category}${scaleType ? ` using ${scaleType}` : ''}`
}
