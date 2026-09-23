import { getScalePitches, parsePitchText, pitchToMidi, type PitchValue, type ScaleMode } from './PitchEngine'

export type MusicIntent =
  | { type:'generate_scale'; tonic:PitchValue; scaleType:ScaleMode; direction:'ascending'|'descending'|'both'; octaves:number; rhythm:'quarter'|'eighth'|'half'|'whole'; clef:'treble'|'bass'|'alto'|'tenor'|'auto'; meter:string; bpm?:number; raw:string }
  | { type:'generate_chord'; root:PitchValue; quality:'major'|'minor'|'diminished'|'augmented'|'dominant7'|'major7'|'minor7'; arpeggio:boolean; direction:'ascending'|'descending'|'both'; octaves:number; rhythm:'quarter'|'eighth'|'half'|'whole'; meter:string; measures?:number; repetitions:number; raw:string }
  | { type:'generate_interval'; root:PitchValue; interval:string; direction:'above'|'below'; rhythm:'quarter'|'eighth'|'half'|'whole'; meter:string; measures?:number; repetitions:number; raw:string }
  | { type:'generate_progression'; tonic:PitchValue; mode:'major'|'natural minor'; degrees:number[]; labels:string[]; meter:string; raw:string }
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
  // Parse a musical root without treating the "b" in words such as "above"
  // as a flat accidental. Word boundaries do not work after "#" because # is
  // not a word character, so use explicit surrounding-character guards.
  const normalizedText = text
    .replace(/([a-g])\s*-?\s*flat/ig,'$1b')
    .replace(/([a-g])\s*-?\s*sharp/ig,'$1#')
  const rootMatch = normalizedText.match(/(?:^|[^A-Za-z])([A-Ga-g])([#b]?)(?=\s|$)/)
  const genericRoot = rootMatch ? parsePitchText(normalizeRoot(rootMatch[1],rootMatch[2]),4) : null
  const rhythm = /eighth/i.test(text) ? 'eighth' : /half\s+notes?/i.test(text) ? 'half' : /whole\s+notes?/i.test(text) ? 'whole' : 'quarter'
  const direction = /descending|down(?:ward)?/i.test(text) ? 'descending' : /both|up\s+and\s+down|ascending\s+and\s+descending/i.test(text) ? 'both' : 'ascending'
  const octaveMatch = text.match(/\b(one|two|three|1|2|3)\s+octaves?\b/i)
  const octaves = octaveMatch ? ({one:1,two:2,three:3}[octaveMatch[1].toLowerCase()] ?? Number(octaveMatch[1])) : 1
  const meter = text.match(/\b(\d+)\s*\/\s*(\d+)\b/)?.slice(1,3).join('/') ?? '4/4'
  const measureMatch = text.match(/\b(\d+)\s+measures?\b/i)
  const measures = measureMatch ? Number(measureMatch[1]) : undefined
  const repeatMatch = text.match(/\b(?:repeat|repeated|play|write)\s+(?:it\s+)?(\d+)\s+times?\b/i)
  const repetitions = repeatMatch ? Math.max(1, Number(repeatMatch[1])) : 1

  // Harmony shorthand: Roman numerals and ordinary numbers are interchangeable.
  // Examples: "ii V I in Eb", "2 5 1 in Eb", "1-4-5-1 in Bb".
  const progressionText = normalizedText.match(/(?:^|\s)((?:(?:vii|iii|vi|iv|ii|v|i|[1-7])(?:\s*[-–—>]\s*|\s+)){1,}(?:vii|iii|vi|iv|ii|v|i|[1-7]))(?=\s+(?:in|of)\s+|\s*$)/i)
  const progressionKey = normalizedText.match(/\b(?:in|of)\s+([A-Ga-g])([#b]?)\s*(major|minor)?\b/i)
  if (progressionText && progressionKey) {
    const tokens = progressionText[1].match(/vii|iii|vi|iv|ii|v|i|[1-7]/ig) ?? []
    const romanToDegree:Record<string,number> = {i:1,ii:2,iii:3,iv:4,v:5,vi:6,vii:7}
    const degrees = tokens.map(t => /^\d$/.test(t) ? Number(t) : romanToDegree[t.toLowerCase()])
    const tonic = parsePitchText(normalizeRoot(progressionKey[1],progressionKey[2]),4)
    if (tonic && degrees.length >= 2) return { type:'generate_progression', tonic, mode:/minor/i.test(progressionKey[3] ?? '')?'natural minor':'major', degrees, labels:tokens, meter, raw }
  }

  // Compact chord symbols: Cmaj7, Dm7, G7, F#dim, Bbaug, etc.
  const chordSymbol = normalizedText.match(/(?:^|\s)([A-Ga-g])([#b]?)(maj7|M7|m7|min7|dom7|dim|aug|maj|major|min|minor|m|7)(?=\s|$)/)
  if (chordSymbol) {
    const root = parsePitchText(normalizeRoot(chordSymbol[1],chordSymbol[2]),4)
    const suffix = chordSymbol[3]
    const quality = suffix === 'maj7' || suffix === 'M7' ? 'major7'
      : /^(m7|min7)$/i.test(suffix) ? 'minor7'
      : /^(7|dom7)$/i.test(suffix) ? 'dominant7'
      : /^dim$/i.test(suffix) ? 'diminished'
      : /^aug$/i.test(suffix) ? 'augmented'
      : /^(m|min|minor)$/i.test(suffix) ? 'minor'
      : 'major'
    if (root) return { type:'generate_chord', root, quality, arpeggio:/arpeggio/i.test(text), direction, octaves, rhythm, meter, measures, repetitions, raw }
  }

  if (/\b(chord|triad|arpeggio)\b/i.test(text) && genericRoot) {
    const quality = /minor\s*7|m7\b/i.test(text) ? 'minor7' : /major\s*7|maj7/i.test(text) ? 'major7' : /dominant\s*7|dom7|\b7th?\b/i.test(text) ? 'dominant7' : /diminished|dim\b/i.test(text) ? 'diminished' : /augmented|aug\b/i.test(text) ? 'augmented' : /minor|\bmin\b/i.test(text) ? 'minor' : 'major'
    return { type:'generate_chord', root:genericRoot, quality, arpeggio:/arpeggio/i.test(text), direction, octaves, rhythm, meter, measures, repetitions, raw }
  }

  if (/\b(interval|unison|second|third|fourth|fifth|sixth|seventh|octave|2nd|3rd|4th|5th|6th|7th|8ve)\b/i.test(text) && genericRoot) {
    const m=text.match(/\b(perfect|major|minor|augmented|diminished)?\s*(unison|second|third|fourth|fifth|sixth|seventh|octave|2nd|3rd|4th|5th|6th|7th|8ve)\b/i)
    if(m) return { type:'generate_interval', root:genericRoot, interval:[m[1],m[2]].filter(Boolean).join(' ').toLowerCase(), direction:/below|down/i.test(text)?'below':'above', rhythm, meter, measures, repetitions, raw }
  }
  const asksForScale = /\b(scale|mode)\b/i.test(text) || /\b[A-Ga-g](?:#|b|\s*(?:sharp|flat))?\s+(?:major|minor)\b/i.test(text)
  if (!asksForScale) return { type:'unknown', raw }

  const tonic = parseTonic(text)
  const scaleType = SCALE_ALIASES.find(([pattern])=>pattern.test(text))?.[1]
  if (!tonic || !scaleType) return { type:'unknown', raw }

  const clef = /bass\s+clef/i.test(text) ? 'bass' : /alto\s+clef/i.test(text) ? 'alto' : /tenor\s+clef/i.test(text) ? 'tenor' : /treble\s+clef/i.test(text) ? 'treble' : 'auto'
  const bpmText = text.match(/\b(?:at\s+)?(\d{2,3})\s*(?:bpm)?\b/i)?.[1]
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


const INTERVAL_SEMITONES: Record<string,number> = {
  'perfect unison':0, unison:0, 'minor second':1, 'major second':2, second:2, '2nd':2,
  'minor third':3, 'major third':4, third:4, '3rd':4, 'perfect fourth':5, fourth:5, '4th':5,
  'augmented fourth':6, 'diminished fifth':6, 'perfect fifth':7, fifth:7, '5th':7,
  'minor sixth':8, 'major sixth':9, sixth:9, '6th':9, 'minor seventh':10, 'major seventh':11, seventh:11, '7th':11,
  'perfect octave':12, octave:12, '8ve':12
}

export function resolveIntervalIntent(intent:Extract<MusicIntent,{type:'generate_interval'}>) {
  const semitones=INTERVAL_SEMITONES[intent.interval] ?? 7
  const targetMidi=pitchToMidi(intent.root)+(intent.direction==='below'?-semitones:semitones)
  return { ...intent, semitones, targetMidi }
}

export function enumerateTheoryObjectPromptExamples():string[] {
  const roots=['C','D','Eb','E','F','F#','G','Ab','A','Bb','B']
  const chords=['major chord','minor chord','major 7 chord','minor 7 chord','dominant 7 chord','diminished chord']
  const intervals=['major third','minor third','perfect fourth','perfect fifth','major sixth','octave']
  return [
    ...roots.flatMap(r=>chords.flatMap(q=>[`Show me a ${r} ${q}`,`Give me a ${r} ${q} arpeggio in eighth notes`])),
    ...roots.flatMap(r=>intervals.map(i=>`Show a ${i} above ${r}`))
  ]
}
