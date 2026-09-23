import type { StandardsAnchor } from './questionBank'

export type PromptIntent =
  | 'define' | 'explain' | 'identify' | 'compare' | 'why' | 'how'
  | 'demonstrate' | 'practice' | 'assess' | 'create'

export type StandardsConcept = {
  id: string
  label: string
  topic: string
  gradeMin: number
  gradeMax: number
  keywords: string[]
  prerequisites: string[]
  misconceptions: string[]
  standards: StandardsAnchor[]
  intents?: PromptIntent[]
}

export const DEFAULT_PROMPT_INTENTS: PromptIntent[] = [
  'define','explain','identify','compare','why','how','demonstrate','practice','assess','create'
]

const N = (domain: StandardsAnchor['domain'], rationale: string): StandardsAnchor =>
  ({ framework:'NCAS/NAfME', domain, rationale })
const T = (code: string, domain: StandardsAnchor['domain'], rationale: string): StandardsAnchor =>
  ({ framework:'Tennessee', code, domain, rationale })

// Concept graph v1. These nodes are curriculum concepts, not individual FAQ entries.
// As state packs are added, standards metadata can expand without duplicating the concept.
export const STANDARDS_CONCEPT_GRAPH: StandardsConcept[] = [
  { id:'steady-beat', label:'steady beat', topic:'Rhythm & Meter', gradeMin:0, gradeMax:8, keywords:['beat','pulse','steady beat'], prerequisites:[], misconceptions:['beat and rhythm are the same thing'], standards:[N('Perform','Demonstrate musical concepts in performance.'),T('K.GM.P1.A','Perform','Explore rhythm and movement concepts.')] },
  { id:'rhythm', label:'rhythm', topic:'Rhythm & Meter', gradeMin:0, gradeMax:8, keywords:['rhythm','long and short sounds'], prerequisites:['steady-beat'], misconceptions:['rhythm must always match the beat'], standards:[N('Create','Generate and organize rhythmic ideas.'),T('K.GM.P1.A','Perform','Explore rhythmic concepts.')] },
  { id:'note-values', label:'note values', topic:'Rhythm & Meter', gradeMin:1, gradeMax:8, keywords:['quarter note','half note','whole note','eighth note','note value','duration'], prerequisites:['steady-beat','rhythm'], misconceptions:['a quarter note always lasts one second','a whole note always fills every measure'], standards:[N('Perform','Read and perform rhythmic notation.'),T('2.GM.P1.D','Perform','Read and perform rhythmic patterns using standard notation.')] },
  { id:'rests', label:'rests', topic:'Rhythm & Meter', gradeMin:1, gradeMax:8, keywords:['rest','silence','quarter rest','half rest','whole rest'], prerequisites:['steady-beat','note-values'], misconceptions:['counting stops during a rest'], standards:[N('Perform','Interpret rhythmic notation including silence.'),T('2.GM.P1.D','Perform','Read and perform rhythmic patterns using standard notation.')] },
  { id:'measures', label:'measures and bar lines', topic:'Rhythm & Meter', gradeMin:2, gradeMax:8, keywords:['measure','bar','bar line'], prerequisites:['steady-beat'], misconceptions:['a bar line means the music stops'], standards:[N('Perform','Interpret structural concepts in notation.'),T('2.GM.P1.D','Perform','Read and perform standard notation.')] },
  { id:'time-signature', label:'time signatures', topic:'Rhythm & Meter', gradeMin:3, gradeMax:8, keywords:['time signature','4/4','3/4','2/4','6/8','meter'], prerequisites:['steady-beat','note-values','measures'], misconceptions:['the bottom number tells how many beats are in a measure','4/4 means four whole notes'], standards:[N('Perform','Analyze and interpret meter and musical structure.'),T('3.GM.P1.A','Perform','Apply music concepts when analyzing and interpreting music.')] },
  { id:'subdivision', label:'beat subdivision', topic:'Rhythm & Meter', gradeMin:3, gradeMax:8, keywords:['subdivision','eighth notes','sixteenth notes','and counting'], prerequisites:['steady-beat','note-values'], misconceptions:['subdivision changes the tempo'], standards:[N('Perform','Apply rhythmic concepts in performance.'),T('4.GM.P1.A','Perform','Apply music concepts when analyzing and interpreting music.')] },
  { id:'syncopation', label:'syncopation', topic:'Rhythm & Meter', gradeMin:5, gradeMax:8, keywords:['syncopation','offbeat','off beat','ties across beats'], prerequisites:['steady-beat','subdivision','time-signature'], misconceptions:['syncopation means playing fast','syncopation is random rhythm','every offbeat note is syncopated'], standards:[N('Perform','Analyze and perform increasingly complex rhythmic ideas.'),T('6.GM.P1','Perform','Apply rhythmic and expressive concepts in performance.')] },
  { id:'staff', label:'the musical staff', topic:'Notation', gradeMin:1, gradeMax:8, keywords:['staff','five lines','line notes','space notes'], prerequisites:[], misconceptions:['higher on the page always means louder'], standards:[N('Perform','Interpret standard notation.'),T('1.GM.P1.D','Perform','Read and perform iconic or standard notation.')] },
  { id:'pitch', label:'pitch', topic:'Pitch', gradeMin:0, gradeMax:8, keywords:['pitch','high note','low note','high and low'], prerequisites:[], misconceptions:['high pitch means loud'], standards:[N('Respond','Perceive and describe musical characteristics.'),T('K.GM.P1.A','Perform','Explore pitch as a music concept.')] },
  { id:'letter-names', label:'musical letter names', topic:'Pitch', gradeMin:2, gradeMax:8, keywords:['A B C D E F G','note names','letter names'], prerequisites:['pitch'], misconceptions:['music should have an H note'], standards:[N('Perform','Develop fluency with pitch notation.'),T('2.GM.P1.B','Perform','Demonstrate knowledge of music concepts.')] },
  { id:'treble-clef', label:'treble clef', topic:'Notation', gradeMin:2, gradeMax:8, keywords:['treble clef','G clef'], prerequisites:['staff','letter-names'], misconceptions:['the clef is just decoration'], standards:[N('Perform','Interpret pitch notation.'),T('2.GM.P1.D','Perform','Read and perform standard notation.')] },
  { id:'bass-clef', label:'bass clef', topic:'Notation', gradeMin:3, gradeMax:8, keywords:['bass clef','F clef'], prerequisites:['staff','letter-names'], misconceptions:['bass clef is only for bass instruments'], standards:[N('Perform','Interpret pitch notation.'),T('3.GM.P1.A','Perform','Apply music concepts in performance.')] },
  { id:'accidentals', label:'sharps, flats, and naturals', topic:'Scales & Keys', gradeMin:3, gradeMax:8, keywords:['sharp','flat','natural','accidental'], prerequisites:['letter-names'], misconceptions:['sharps and flats are always black piano keys'], standards:[N('Perform','Interpret pitch-altering notation.'),T('3.GM.P1.A','Perform','Apply pitch concepts in analysis and performance.')] },
  { id:'half-whole-steps', label:'half steps and whole steps', topic:'Scales & Keys', gradeMin:4, gradeMax:8, keywords:['half step','whole step','semitone','tone'], prerequisites:['accidentals'], misconceptions:['a half step means half of a note value'], standards:[N('Respond','Analyze relationships among pitches.'),T('4.GM.P1.A','Perform','Apply music concepts when analyzing music.')] },
  { id:'major-scale', label:'major scales', topic:'Scales & Keys', gradeMin:4, gradeMax:8, keywords:['major scale','scale pattern','whole whole half'], prerequisites:['half-whole-steps'], misconceptions:['major music is always happy'], standards:[N('Create','Organize melodic ideas using tonal patterns.'),T('4.GM.P1.A','Perform','Apply music concepts when analyzing and interpreting music.')] },
  { id:'key-signature', label:'key signatures', topic:'Scales & Keys', gradeMin:5, gradeMax:8, keywords:['key signature','key','sharps at beginning','flats at beginning'], prerequisites:['major-scale','accidentals'], misconceptions:['the key signature tells the tempo'], standards:[N('Perform','Interpret tonal notation.'),T('5.GM.P1.A','Perform','Apply music concepts and structure when interpreting music.')] },
  { id:'intervals', label:'intervals', topic:'Intervals', gradeMin:4, gradeMax:8, keywords:['interval','second','third','fourth','fifth','octave'], prerequisites:['letter-names'], misconceptions:['interval number counts only the notes between two pitches'], standards:[N('Respond','Analyze relationships among musical elements.'),T('4.GM.P1.A','Perform','Apply music concepts when analyzing music.')] },
  { id:'melody', label:'melody', topic:'Melody & Creating', gradeMin:0, gradeMax:8, keywords:['melody','tune','musical line'], prerequisites:['pitch','rhythm'], misconceptions:['melody must be sung'], standards:[N('Create','Generate and organize melodic ideas.'),T('K.GM.P1.A','Perform','Explore pitch, rhythm, and sequence.')] },
  { id:'chords', label:'chords', topic:'Harmony', gradeMin:4, gradeMax:8, keywords:['chord','harmony','notes together'], prerequisites:['pitch','intervals'], misconceptions:['any notes played together make the same kind of chord'], standards:[N('Create','Generate and organize harmonic ideas.'),T('5.GM.P1.A','Perform','Apply music concepts and structure when analyzing music.')] },
  { id:'triads', label:'triads', topic:'Harmony', gradeMin:5, gradeMax:8, keywords:['triad','major chord','minor chord','root third fifth'], prerequisites:['chords','intervals'], misconceptions:['every three-note group is a root-position triad'], standards:[N('Create','Organize harmonic ideas.'),T('5.GM.P1.A','Perform','Analyze and interpret music using musical concepts.')] },
  { id:'dynamics', label:'dynamics', topic:'Expression', gradeMin:0, gradeMax:8, keywords:['dynamics','forte','piano','loud','soft'], prerequisites:[], misconceptions:['piano always means the instrument'], standards:[N('Perform','Interpret expressive qualities.'),T('K.GM.P1.C','Perform','Demonstrate awareness of dynamics and tempo.')] },
  { id:'tempo', label:'tempo', topic:'Expression', gradeMin:0, gradeMax:8, keywords:['tempo','BPM','allegro','largo','fast','slow'], prerequisites:['steady-beat'], misconceptions:['tempo and rhythm are the same'], standards:[N('Perform','Interpret expressive qualities.'),T('K.GM.P1.C','Perform','Demonstrate awareness of dynamics and tempo.')] },
  { id:'articulation', label:'articulation', topic:'Expression', gradeMin:3, gradeMax:8, keywords:['articulation','staccato','legato','accent'], prerequisites:['note-values'], misconceptions:['staccato always means faster'], standards:[N('Perform','Interpret expressive and technical elements.'),T('3.GM.P1.C','Perform','Demonstrate and describe expressive qualities.')] },
  { id:'form', label:'musical form', topic:'Form', gradeMin:3, gradeMax:8, keywords:['form','ABA','AB','rondo','section'], prerequisites:['melody'], misconceptions:['form means the genre of a song'], standards:[N('Respond','Analyze musical structure and context.'),T('3.GM.P1.A','Perform','Analyze music using concepts and structure.')] },
  { id:'improvisation', label:'improvisation', topic:'Melody & Creating', gradeMin:2, gradeMax:8, keywords:['improv','improvisation','make music up'], prerequisites:['steady-beat','melody'], misconceptions:['improvisation means playing random notes'], standards:[N('Create','Generate musical ideas through improvisation.'),T('5.GM.Cr1.A','Create','Generate musical ideas within given structures.')] },
]

export function getConcept(id: string) {
  return STANDARDS_CONCEPT_GRAPH.find((concept) => concept.id === id)
}

export function getPrerequisitePath(id: string, seen = new Set<string>()): StandardsConcept[] {
  if (seen.has(id)) return []
  seen.add(id)
  const concept = getConcept(id)
  if (!concept) return []
  return [...concept.prerequisites.flatMap((p) => getPrerequisitePath(p, seen)), concept]
}

export function conceptsForGrade(grade: number) {
  return STANDARDS_CONCEPT_GRAPH.filter((c) => grade >= c.gradeMin && grade <= c.gradeMax)
}
