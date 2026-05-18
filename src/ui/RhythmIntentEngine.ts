import type { DurationValue } from './musicBrain'

export type RhythmIntent = {
  rhythmPattern: DurationValue[]
  label: string
  summary: string
}

function includesAny(prompt: string, words: string[]): boolean {
  return words.some((word) => prompt.includes(word))
}

export function getRhythmIntent(promptText: string, fallbackPattern: DurationValue[]): RhythmIntent {
  const prompt = promptText.toLowerCase()
  const fallback = fallbackPattern.length > 0 ? fallbackPattern : ['Quarter']

  const wantsTriplets = includesAny(prompt, ['triplet', 'triplets', 'triplet eighth', 'swing'])
  const wantsSixteenths = includesAny(prompt, ['16th', 'sixteenth', 'sixteenths', '16ths', 'sixteenth notes'])
  const wantsSyncopation = includesAny(prompt, ['syncopated', 'syncopation', 'funk', 'offbeat', 'off beat'])
  const wantsDotted = includesAny(prompt, ['dotted', 'dotted rhythm', 'dotted rhythms'])
  const wantsBusy = includesAny(prompt, ['busy', 'dense', 'fast rhythm', 'rhythmic density', 'active rhythm'])
  const wantsSimple = includesAny(prompt, ['simple rhythm', 'easy rhythm', 'beginner rhythm', 'mostly quarters'])

  if (wantsSimple) {
    return {
      rhythmPattern: ['Quarter', 'Quarter', 'Half'],
      label: 'simple quarters and halves',
      summary: 'RhythmIntent: simplified quarter/half-note surface.',
    }
  }

  if (wantsTriplets && wantsSixteenths) {
    return {
      rhythmPattern: ['TripletEighth', 'TripletEighth', 'TripletEighth', '16th', '16th', 'Eighth', 'Quarter'],
      label: 'triplet plus sixteenth mix',
      summary: 'RhythmIntent: mixed triplet-eighth and sixteenth-note surface.',
    }
  }

  if (wantsTriplets) {
    return {
      rhythmPattern: ['TripletEighth', 'TripletEighth', 'TripletEighth', 'Quarter', 'TripletEighth', 'TripletEighth', 'TripletEighth', 'Quarter'],
      label: 'triplet eighth motion',
      summary: 'RhythmIntent: triplet-eighth grouped motion.',
    }
  }

  if (wantsSixteenths && wantsSyncopation) {
    return {
      rhythmPattern: ['16th', '16th', 'Eighth', '16th', '16th', 'Quarter', 'Eighth', '16th', '16th'],
      label: 'syncopated sixteenth groove',
      summary: 'RhythmIntent: syncopated sixteenth-note groove pattern.',
    }
  }

  if (wantsSixteenths || wantsBusy) {
    return {
      rhythmPattern: ['16th', '16th', '16th', '16th', 'Eighth', 'Eighth', 'Quarter', '16th', '16th', 'Eighth'],
      label: 'active sixteenth motion',
      summary: 'RhythmIntent: active sixteenth/eighth-note surface.',
    }
  }

  if (wantsSyncopation) {
    return {
      rhythmPattern: ['Eighth', 'Quarter', 'Eighth', 'Eighth', 'Eighth', 'Quarter'],
      label: 'syncopated eighth groove',
      summary: 'RhythmIntent: syncopated eighth-note groove pattern.',
    }
  }

  if (wantsDotted) {
    return {
      rhythmPattern: ['DottedQuarter', 'Eighth', 'Quarter', 'DottedEighth', '16th', 'Quarter'],
      label: 'dotted rhythm profile',
      summary: 'RhythmIntent: dotted-quarter and dotted-eighth rhythm profile.',
    }
  }

  return {
    rhythmPattern: fallback,
    label: 'style default rhythm',
    summary: 'RhythmIntent: using style default rhythm pattern.',
  }
}
