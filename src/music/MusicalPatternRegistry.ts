export type PatternCategory = 'blues'|'jazz-standard-form'|'popular-harmony'|'classical-form'|'cadence'|'phrase'|'sequence'|'contrapuntal'

export type MusicalPattern = {
  id:string
  name:string
  aliases:string[]
  category:PatternCategory
  description:string
  degrees?:number[]
  qualities?:Array<'major'|'minor'|'diminished'|'augmented'|'dominant7'|'major7'|'minor7'>
  sections?:Array<{label:string; degrees:number[]; qualities?:MusicalPattern['qualities']}>
  defaultMeter:string
  bars?:number
  educationalTags:string[]
}

const dom7 = (n:number) => Array.from({length:n},()=> 'dominant7' as const)

export const MUSICAL_PATTERNS:MusicalPattern[] = [
  {
    id:'twelve-bar-blues', name:'12-Bar Blues',
    aliases:['12 bar blues','12-bar blues','twelve bar blues','blues'],
    category:'blues',
    description:'Canonical twelve-bar I-IV-V blues form.',
    degrees:[1,1,1,1,4,4,1,1,5,4,1,5],
    qualities:dom7(12), defaultMeter:'4/4', bars:12,
    educationalTags:['blues','form','I-IV-V','dominant seventh']
  },
  {
    id:'rhythm-changes', name:'Rhythm Changes',
    aliases:['rhythm changes','rhythm change'],
    category:'jazz-standard-form',
    description:'Common 32-bar AABA Rhythm Changes framework. This is a practical default; historical tunes and performers use many substitutions.',
    sections:[
      {label:'A1',degrees:[1,6,2,5,1,6,2,5],qualities:['major7','minor7','minor7','dominant7','major7','minor7','minor7','dominant7']},
      {label:'A2',degrees:[1,6,2,5,1,6,2,5],qualities:['major7','minor7','minor7','dominant7','major7','minor7','minor7','dominant7']},
      {label:'B',degrees:[3,3,6,6,2,2,5,5],qualities:dom7(8)},
      {label:'A3',degrees:[1,6,2,5,1,6,2,5],qualities:['major7','minor7','minor7','dominant7','major7','minor7','minor7','dominant7']}
    ],
    defaultMeter:'4/4', bars:32,
    educationalTags:['jazz','AABA','32-bar form','turnaround','circle progression']
  }
]

export function findMusicalPattern(text:string):MusicalPattern|null {
  const normalized=text.toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ').trim()
  return MUSICAL_PATTERNS.find(p=>p.aliases.some(a=>normalized.includes(a))) ?? null
}

export function flattenPattern(pattern:MusicalPattern) {
  if (pattern.sections) return {
    degrees:pattern.sections.flatMap(s=>s.degrees),
    qualities:pattern.sections.flatMap(s=>s.qualities ?? s.degrees.map(()=>undefined)).filter(Boolean) as NonNullable<MusicalPattern['qualities']>,
    labels:pattern.sections.flatMap(s=>s.degrees.map(d=>String(d)))
  }
  return {degrees:pattern.degrees ?? [], qualities:pattern.qualities ?? [], labels:(pattern.degrees ?? []).map(String)}
}
