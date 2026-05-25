export type OrchestrationEnsembleType =
  | 'solo-piano'
  | 'string-quartet'
  | 'full-orchestra'
  | 'concert-band'
  | 'jazz-combo'
  | 'marching-battery'
  | 'front-ensemble'
  | 'custom'

export type InstrumentPlaybackFamily =
  | 'keyboard'
  | 'strings'
  | 'woodwinds'
  | 'brass'
  | 'percussion'
  | 'voice'
  | 'guitar'
  | 'synth'

export type PlaybackSoundSource =
  | 'web-audio-basic'
  | 'soundfont'
  | 'sample-library'
  | 'external-midi'
  | 'future-ai-renderer'

export type OrchestrationTrackRole =
  | 'melody'
  | 'harmony'
  | 'bass'
  | 'countermelody'
  | 'rhythm'
  | 'texture'
  | 'percussion'
  | 'doubling'

export type OrchestrationInstrumentTrack = {
  id: string
  instrumentName: string
  family: InstrumentPlaybackFamily
  role: OrchestrationTrackRole
  midiProgram?: number
  preferredClef?: 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion'
  soundSource: PlaybackSoundSource
  volume: number
  pan: number
}

export type OrchestrationPlaybackPlan = {
  id: string
  ensembleType: OrchestrationEnsembleType
  title: string
  tracks: OrchestrationInstrumentTrack[]
  summary: string
  futureRendererHooks: string[]
}

function createTrack({
  id,
  instrumentName,
  family,
  role,
  midiProgram,
  preferredClef = 'treble',
  soundSource = 'web-audio-basic',
  volume = 0.85,
  pan = 0,
}: Partial<OrchestrationInstrumentTrack> & {
  id: string
  instrumentName: string
  family: InstrumentPlaybackFamily
  role: OrchestrationTrackRole
}): OrchestrationInstrumentTrack {
  return {
    id,
    instrumentName,
    family,
    role,
    midiProgram,
    preferredClef,
    soundSource,
    volume,
    pan,
  }
}

export const ENSEMBLE_PLAYBACK_PRESETS: Record<OrchestrationEnsembleType, OrchestrationPlaybackPlan> = {
  'solo-piano': {
    id: 'solo-piano',
    ensembleType: 'solo-piano',
    title: 'Solo Piano',
    tracks: [
      createTrack({ id: 'piano-rh', instrumentName: 'Piano Right Hand', family: 'keyboard', role: 'melody', midiProgram: 1, preferredClef: 'treble', pan: 0.08 }),
      createTrack({ id: 'piano-lh', instrumentName: 'Piano Left Hand', family: 'keyboard', role: 'bass', midiProgram: 1, preferredClef: 'bass', pan: -0.08 }),
    ],
    summary: 'Two-hand piano playback routing with melody and bass/accompaniment roles.',
    futureRendererHooks: ['grand-staff-routing', 'pedal-layer', 'humanized-piano-performance'],
  },
  'string-quartet': {
    id: 'string-quartet',
    ensembleType: 'string-quartet',
    title: 'String Quartet',
    tracks: [
      createTrack({ id: 'violin-1', instrumentName: 'Violin I', family: 'strings', role: 'melody', midiProgram: 41, preferredClef: 'treble', pan: -0.35 }),
      createTrack({ id: 'violin-2', instrumentName: 'Violin II', family: 'strings', role: 'countermelody', midiProgram: 41, preferredClef: 'treble', pan: -0.12 }),
      createTrack({ id: 'viola', instrumentName: 'Viola', family: 'strings', role: 'harmony', midiProgram: 42, preferredClef: 'alto', pan: 0.12 }),
      createTrack({ id: 'cello', instrumentName: 'Cello', family: 'strings', role: 'bass', midiProgram: 43, preferredClef: 'bass', pan: 0.35 }),
    ],
    summary: 'Four-part chamber string routing for melody, inner voices, and bass support.',
    futureRendererHooks: ['bowing-layer', 'divisi-routing', 'phrase-arc-shaping'],
  },
  'full-orchestra': {
    id: 'full-orchestra',
    ensembleType: 'full-orchestra',
    title: 'Full Orchestra',
    tracks: [
      createTrack({ id: 'flutes', instrumentName: 'Flutes', family: 'woodwinds', role: 'texture', midiProgram: 74, pan: -0.45 }),
      createTrack({ id: 'clarinets', instrumentName: 'Clarinets', family: 'woodwinds', role: 'countermelody', midiProgram: 72, pan: -0.22 }),
      createTrack({ id: 'horns', instrumentName: 'Horns', family: 'brass', role: 'harmony', midiProgram: 61, pan: 0.22 }),
      createTrack({ id: 'trumpets', instrumentName: 'Trumpets', family: 'brass', role: 'melody', midiProgram: 57, pan: 0.42 }),
      createTrack({ id: 'violins', instrumentName: 'Violins', family: 'strings', role: 'melody', midiProgram: 49, pan: -0.32 }),
      createTrack({ id: 'violas', instrumentName: 'Violas', family: 'strings', role: 'harmony', midiProgram: 42, pan: -0.05 }),
      createTrack({ id: 'cellos-basses', instrumentName: 'Cellos/Basses', family: 'strings', role: 'bass', midiProgram: 43, preferredClef: 'bass', pan: 0.24 }),
      createTrack({ id: 'timpani', instrumentName: 'Timpani', family: 'percussion', role: 'percussion', midiProgram: 48, preferredClef: 'percussion', pan: 0 }),
    ],
    summary: 'Large ensemble routing scaffold for orchestral sketch playback and future AI rendering.',
    futureRendererHooks: ['section-balancing', 'orchestration-brain-routing', 'sample-library-rendering', 'future-ai-audio-renderer'],
  },
  'concert-band': {
    id: 'concert-band',
    ensembleType: 'concert-band',
    title: 'Concert Band',
    tracks: [
      createTrack({ id: 'flutes', instrumentName: 'Flutes', family: 'woodwinds', role: 'melody', midiProgram: 74, pan: -0.4 }),
      createTrack({ id: 'clarinets', instrumentName: 'Clarinets', family: 'woodwinds', role: 'harmony', midiProgram: 72, pan: -0.18 }),
      createTrack({ id: 'saxes', instrumentName: 'Saxophones', family: 'woodwinds', role: 'countermelody', midiProgram: 66, pan: 0.1 }),
      createTrack({ id: 'trumpets', instrumentName: 'Trumpets', family: 'brass', role: 'melody', midiProgram: 57, pan: 0.28 }),
      createTrack({ id: 'low-brass', instrumentName: 'Low Brass', family: 'brass', role: 'bass', midiProgram: 58, preferredClef: 'bass', pan: 0.42 }),
      createTrack({ id: 'percussion', instrumentName: 'Percussion', family: 'percussion', role: 'percussion', preferredClef: 'percussion', pan: 0 }),
    ],
    summary: 'Concert band routing for educational arrangements and classroom playback.',
    futureRendererHooks: ['transposition-support', 'part-generation', 'band-balance-model'],
  },
  'jazz-combo': {
    id: 'jazz-combo',
    ensembleType: 'jazz-combo',
    title: 'Jazz Combo',
    tracks: [
      createTrack({ id: 'lead', instrumentName: 'Lead Horn', family: 'brass', role: 'melody', midiProgram: 57, pan: -0.18 }),
      createTrack({ id: 'piano', instrumentName: 'Piano', family: 'keyboard', role: 'harmony', midiProgram: 1, pan: 0.12 }),
      createTrack({ id: 'bass', instrumentName: 'Upright Bass', family: 'strings', role: 'bass', midiProgram: 33, preferredClef: 'bass', pan: 0.28 }),
      createTrack({ id: 'drums', instrumentName: 'Drum Set', family: 'percussion', role: 'rhythm', preferredClef: 'percussion', pan: 0 }),
    ],
    summary: 'Jazz combo routing for lead line, comping, bass, and groove playback.',
    futureRendererHooks: ['swing-feel-engine', 'comping-generator', 'walking-bass-generator'],
  },
  'marching-battery': {
    id: 'marching-battery',
    ensembleType: 'marching-battery',
    title: 'Marching Battery',
    tracks: [
      createTrack({ id: 'snareline', instrumentName: 'Snare Line', family: 'percussion', role: 'rhythm', preferredClef: 'percussion', pan: -0.25 }),
      createTrack({ id: 'tenors', instrumentName: 'Tenors', family: 'percussion', role: 'texture', preferredClef: 'percussion', pan: 0 }),
      createTrack({ id: 'basses', instrumentName: 'Bass Drums', family: 'percussion', role: 'bass', preferredClef: 'percussion', pan: 0.25 }),
      createTrack({ id: 'cymbals', instrumentName: 'Cymbals', family: 'percussion', role: 'percussion', preferredClef: 'percussion', pan: 0.4 }),
    ],
    summary: 'Marching percussion battery playback routing for rudiments, grids, and ensemble timing.',
    futureRendererHooks: ['sticking-layer', 'split-part-routing', 'tenor-map-rendering', 'rudiment-engine'],
  },
  'front-ensemble': {
    id: 'front-ensemble',
    ensembleType: 'front-ensemble',
    title: 'Front Ensemble',
    tracks: [
      createTrack({ id: 'marimba-1', instrumentName: 'Marimba 1', family: 'percussion', role: 'melody', midiProgram: 13, pan: -0.28 }),
      createTrack({ id: 'marimba-2', instrumentName: 'Marimba 2', family: 'percussion', role: 'harmony', midiProgram: 13, pan: -0.08 }),
      createTrack({ id: 'vibes', instrumentName: 'Vibraphone', family: 'percussion', role: 'texture', midiProgram: 12, pan: 0.16 }),
      createTrack({ id: 'synth', instrumentName: 'Synth', family: 'synth', role: 'texture', midiProgram: 89, pan: 0.32 }),
    ],
    summary: 'Front ensemble routing for mallet percussion, synth texture, and layered harmonic playback.',
    futureRendererHooks: ['mallet-technique-routing', 'four-mallet-voicing', 'electronics-layer'],
  },
  custom: {
    id: 'custom',
    ensembleType: 'custom',
    title: 'Custom Ensemble',
    tracks: [],
    summary: 'User-defined orchestration playback routing.',
    futureRendererHooks: ['custom-track-builder', 'instrument-library-selection'],
  },
}

export function getOrchestrationPlaybackPlan(
  ensembleType: OrchestrationEnsembleType,
): OrchestrationPlaybackPlan {
  return ENSEMBLE_PLAYBACK_PRESETS[ensembleType] ?? ENSEMBLE_PLAYBACK_PRESETS['solo-piano']
}

export function routeNoteToTrack({
  note,
  plan,
}: {
  note: any
  plan: OrchestrationPlaybackPlan
}): OrchestrationInstrumentTrack | undefined {
  if (!plan.tracks.length) return undefined

  if (note.voiceType === 'bass') {
    return plan.tracks.find((track) => track.role === 'bass') ?? plan.tracks[0]
  }

  if (note.voiceType === 'accompaniment') {
    return plan.tracks.find((track) => track.role === 'harmony') ?? plan.tracks[0]
  }

  if (note.voiceType === 'percussion') {
    return plan.tracks.find((track) => track.family === 'percussion') ?? plan.tracks[0]
  }

  return plan.tracks.find((track) => track.role === 'melody') ?? plan.tracks[0]
}

export function buildTrackRoutingSummary({
  notes,
  plan,
}: {
  notes: any[]
  plan: OrchestrationPlaybackPlan
}) {
  const counts: Record<string, number> = {}

  notes.forEach((note) => {
    const track = routeNoteToTrack({ note, plan })
    if (!track) return
    counts[track.id] = (counts[track.id] ?? 0) + 1
  })

  return counts
}
