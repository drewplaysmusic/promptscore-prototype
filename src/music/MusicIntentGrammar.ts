import { getScalePitches, parsePitchText, type PitchValue, type ScaleMode } from './PitchEngine'

export type MusicIntent =
  | { type:'generate_scale'; tonic:PitchValue; scaleType:ScaleMode; direction:'ascending'|'descending'|'both'; octaves:number; rhythm:'quarter'|'eighth'|'half'|'whole'; clef:'treble'|'bass'|'alto'|'tenor'|'auto'; meter:string; bpm?:number; raw:string }
  | { type:'unknown'; raw:string }

const SCALE_ALIASES: Array<[RegExp, ScaleMode]> = [
  [/harmonic\s+minor/i,'harmonic minor'],
  [/melodic\s+minor/i,'melodic minor'],
  [/(natural\s+minor|minor\s+scale|\bminor\b)/i,'natural minor'],
  [/mixolydian/i,'mixolydian'], [/dorian/i,'dorian'], [/phrygian/i,'phrygian'],
  [/lydian/i,'lydian'], [/aeolian/i,'aeolian'], [/locrian/i,'locrian'],
  [/(major\s+scale|\bmajor\b)/i,'major'],
]

function normalizeRoot(letter:string, accidental?:string) {
  const a = accidental?.toLowerCase()
  if (!a) return letter.toUpperCase()
  if (a === '#' || a === 'sharp') return letter.toUpperCase() + '#'
  if (a === 'b' || a === 'flat') return letter.toUpperCase() + 'b'
  return letter.toUpperCase()
}

function parseTonic(text:string): PitchValue | null {
  // Accept A major, Bb major, B-flat major, fsharp major, "scale of C", etc.
  const spaced = text
    .replace(/([a-g])\s*-?\s*flat/ig,'$1b')
    .replace(/([a-g])\s*-?\s*sharp/ig,'$1#')
    .replace(/\b([a-g])(flat|sharp)\b/ig,(_,l,a)=>normalizeRoot(l,a))
  const beforeType = spaced.match(/(?:^|\s)([A-Ga-g])\s*([#b])?\s+(?:(?:natural|harmonic|melodic)\s+)?(?:major|minor|dorian|phrygian|lydian|mixolydian|aeolian|locrian)\b/)
  const afterOf = spaced.match(/(?:scale|mode)\s+(?:of|in)\s+([A-Ga-g])\s*([#b])?/)
  const match = beforeType || afterOf
  if (!match) return null
  return parsePitchText(normalizeRoot(match[1],match[2]),4)
}

export function parseMusicIntent(raw:string): MusicIntent {
  const text = raw.trim()
  const asksForScale = /\b(scale|mode)\b/i.test(text) || /\b[A-Ga-g](?:#|b|\s*(?:sharp|flat))?\s+(?:major|minor)\b/i.test(text)
  if (!asksForScale) return { type:'unknown', raw }

  const tonic = parseTonic(text)
  const scaleType = SCALE_ALIASES.find(([pattern])=>pattern.test(text))?.[1]
  if (!tonic || !scaleType) return { type:'unknown', raw }

  const direction = /descending|down(?:ward)?/i.test(text) ? 'descending'
    : /both|up\s+and\s+down|ascending\s+and\s+descending/i.test(text) ? 'both' : 'ascending'
  const octaveMatch = text.match(/\b(one|two|three|1|2|3)\s+octaves?\b/i)
  const octaves = octaveMatch ? ({one:1,two:2,three:3}[octaveMatch[1].toLowerCase()] ?? Number(octaveMatch[1])) : 1
  const rhythm = /eighth/i.test(text) ? 'eighth' : /half\\s+notes?/i.test(text) ? 'half' : /whole\\s+notes?/i.test(text) ? 'whole' : 'quarter'
  const clef = /bass\\s+clef/i.test(text) ? 'bass' : /alto\\s+clef/i.test(text) ? 'alto' : /tenor\\s+clef/i.test(text) ? 'tenor' : /treble\\s+clef/i.test(text) ? 'treble' : 'auto'
  const meter = text.match(/\\b(\\d+)\\s*\\/\\s*(\\d+)\\b/)?.slice(1,3).join('/') ?? '4/4'
  const bpmText = text.match(/\\b(?:at\\s+)?(\\d{2,3})\\s*(?:bpm)?\\b/i)?.[1]
  const bpm = bpmText ? Number(bpmText) : undefined

  return { type:'generate_scale', tonic, scaleType, direction, octaves, rhythm, clef, meter, bpm, raw }
}

export function resolveScaleIntent(intent: Extract<MusicIntent,{type:'generate_scale'}>) {
  const ascending = getScalePitches(intent.tonic,intent.scaleType,intent.octaves)
  const finalTonic = { ...intent.tonic, octave:intent.tonic.octave + intent.octaves }
  const completeAscending = [...ascending, finalTonic]
  const pitches = intent.direction === 'descending' ? [...completeAscending].reverse()
    : intent.direction === 'both' ? [...completeAscending, ...completeAscending.slice(0,-1).reverse()]
    : completeAscending
  return { ...intent, pitches }
}

// This is intentionally generated from grammar + parameters rather than stored as thousands
// of hard-coded prompts. These examples are useful for testing, autocomplete, and analytics.
export function enumerateScalePromptExamples(): string[] {
  const tonics = ['C','G','D','A','E','B','F#','C#','F','Bb','Eb','Ab','Db','Gb','Cb']
  const types = ['major','natural minor','harmonic minor','melodic minor','dorian','mixolydian']
  const frames = [
    (t:string,s:string)=>`Give me the ${t} ${s} scale`,
    (t:string,s:string)=>`Show me a ${t} ${s} scale`,
    (t:string,s:string)=>`What are the notes in ${t} ${s}?`,
    (t:string,s:string)=>`Play the ${t} ${s} scale`,
    (t:string,s:string)=>`Write ${t} ${s} in quarter notes`,
    (t:string,s:string)=>`Show ${t} ${s} descending`,
    (t:string,s:string)=>`Give me two octaves of ${t} ${s}`,
  ]
  return tonics.flatMap(t=>types.flatMap(s=>frames.map(f=>f(t,s))))
}
