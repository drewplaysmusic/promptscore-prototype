export type StandardsAnchor = {
  framework: 'NCAS/NAfME' | 'Tennessee'
  code?: string
  domain: 'Create' | 'Perform' | 'Respond' | 'Connect'
  rationale: string
}

export type TheoryQuestion = {
  id: string
  canonicalQuestion: string
  aliases: string[]
  topic: string
  gradeMin: number
  gradeMax: number
  difficulty: 1 | 2 | 3
  shortAnswer: string
  explanation: string
  notationPrompt?: string
  standards: StandardsAnchor[]
  timesAsked: number
}

const N = (domain: StandardsAnchor['domain'], rationale: string): StandardsAnchor => ({ framework: 'NCAS/NAfME', domain, rationale })
const T = (code: string, domain: StandardsAnchor['domain'], rationale: string): StandardsAnchor => ({ framework: 'Tennessee', code, domain, rationale })

// Seed bank: deliberately small and high-confidence. The production bank can grow toward
// ~1,000 canonical questions while preserving these standards tags and aliases.
export const THEORY_QUESTION_BANK: TheoryQuestion[] = [
  { id:'notation-001', canonicalQuestion:'What is a musical staff?', aliases:['what are the five lines','why are there five lines in music','what is the staff'], topic:'Notation', gradeMin:1, gradeMax:8, difficulty:1, shortAnswer:'A staff is the set of five lines and four spaces where notes and other music symbols are written.', explanation:'Where a note sits on the staff helps show its pitch. Clefs tell us how to name those lines and spaces.', notationPrompt:'4 measure melody in C major using quarter notes', standards:[N('Perform','Interpret standard music notation in performance.'),T('1.GM.P1.D','Perform','Read and perform patterns using iconic or standard notation.')], timesAsked:0 },
  { id:'notation-002', canonicalQuestion:'What is a note?', aliases:['what do notes mean','what is a music note','what does a note tell you'], topic:'Notation', gradeMin:1, gradeMax:8, difficulty:1, shortAnswer:'A note is a symbol that tells a musician what pitch to make and, with its note value, how long to make it.', explanation:'The note’s position helps show pitch, while its shape helps show duration.', notationPrompt:'4 measure melody in C major using quarter and half notes', standards:[N('Perform','Use music concepts and notation to interpret music.'),T('2.GM.P1.D','Perform','Read and perform rhythmic patterns using standard notation.')], timesAsked:0 },
  { id:'rhythm-001', canonicalQuestion:'What is a beat?', aliases:['what is the pulse','what does beat mean','what am i tapping my foot to'], topic:'Rhythm & Meter', gradeMin:0, gradeMax:8, difficulty:1, shortAnswer:'The beat is the steady pulse you can tap, clap, or move to in music.', explanation:'Beats organize musical time. Rhythms can line up with the beat or move between beats.', notationPrompt:'4 measure rhythm in 4/4 with quarter notes', standards:[N('Perform','Demonstrate and apply musical concepts while performing.'),T('K.GM.P1.A','Perform','Explore and experience music concepts including rhythms and movement.')], timesAsked:0 },
  { id:'rhythm-002', canonicalQuestion:'What is rhythm?', aliases:['what does rhythm mean','what is a rhythm','how is rhythm different from beat'], topic:'Rhythm & Meter', gradeMin:0, gradeMax:8, difficulty:1, shortAnswer:'Rhythm is the pattern of long and short sounds and silences over the beat.', explanation:'The beat can stay steady while the rhythm changes. Rhythm is what gives words, notes, and rests their timing pattern.', notationPrompt:'4 measure rhythm with quarter notes eighth notes and rests in 4/4', standards:[N('Create','Generate and organize rhythmic musical ideas.'),T('K.GM.P1.A','Perform','Explore and experience rhythms as a music concept.')], timesAsked:0 },
  { id:'rhythm-003', canonicalQuestion:'What is a quarter note?', aliases:['how many beats is a quarter note','what does the black note mean','quarter note meaning'], topic:'Rhythm & Meter', gradeMin:1, gradeMax:8, difficulty:1, shortAnswer:'In common meters such as 4/4, a quarter note usually lasts for one beat.', explanation:'Its exact musical time depends on the meter and tempo, but beginners commonly learn it as one beat in 4/4.', notationPrompt:'2 measures of quarter notes in 4/4', standards:[N('Perform','Read and perform rhythmic notation.'),T('1.GM.P1.D','Perform','Read and perform rhythmic patterns using standard notation.')], timesAsked:0 },
  { id:'rhythm-004', canonicalQuestion:'What is an eighth note?', aliases:['how many beats is an eighth note','what are two connected notes','eighth note meaning'], topic:'Rhythm & Meter', gradeMin:2, gradeMax:8, difficulty:1, shortAnswer:'In 4/4, an eighth note usually lasts half of one beat, so two eighth notes fit in one quarter-note beat.', explanation:'Eighth notes are often counted “1-and-2-and” when the quarter note receives the beat.', notationPrompt:'2 measures of eighth notes in 4/4', standards:[N('Perform','Read and perform rhythmic notation.'),T('2.GM.P1.D','Perform','Read and perform rhythmic patterns using standard notation.')], timesAsked:0 },
  { id:'rhythm-005', canonicalQuestion:'What is a rest?', aliases:['what does a rest mean','why is there silence in music','what is the squiggly rest symbol'], topic:'Rhythm & Meter', gradeMin:1, gradeMax:8, difficulty:1, shortAnswer:'A rest is a written period of musical silence with a specific duration.', explanation:'Rests are part of rhythm. Musicians count through rests so the beat continues even when no sound is made.', notationPrompt:'4 measure rhythm with quarter notes and quarter rests', standards:[N('Perform','Interpret rhythmic notation including silence.'),T('2.GM.P1.D','Perform','Read and perform rhythmic patterns using standard notation.')], timesAsked:0 },
  { id:'meter-001', canonicalQuestion:'What is a time signature?', aliases:['what do the two numbers mean','what are the numbers at the beginning of music','what does 4/4 mean','what does 3/4 mean'], topic:'Rhythm & Meter', gradeMin:3, gradeMax:8, difficulty:1, shortAnswer:'A time signature shows how musical beats are organized into measures.', explanation:'In 4/4, the top number tells us there are four quarter-note beats in a measure. Other meters organize the pulse differently.', notationPrompt:'4 measures of quarter notes in 4/4', standards:[N('Perform','Analyze and interpret structural music concepts.'),T('3.GM.P1.A','Perform','Apply music concepts when selecting, analyzing, and interpreting music.')], timesAsked:0 },
  { id:'meter-002', canonicalQuestion:'What is a measure?', aliases:['what is a bar','why are there lines through the staff','what is a bar line'], topic:'Rhythm & Meter', gradeMin:2, gradeMax:8, difficulty:1, shortAnswer:'A measure, or bar, is a section of musical time separated by bar lines.', explanation:'The time signature tells you how beats are grouped inside each measure.', notationPrompt:'4 measure melody in C major using quarter notes', standards:[N('Perform','Use structural understanding to interpret notation.'),T('2.GM.P1.D','Perform','Read and perform patterns in standard notation.')], timesAsked:0 },
  { id:'pitch-001', canonicalQuestion:'What is pitch?', aliases:['what does high and low mean in music','what makes a note high or low','pitch meaning'], topic:'Pitch', gradeMin:0, gradeMax:8, difficulty:1, shortAnswer:'Pitch describes how high or low a sound is.', explanation:'Faster sound-wave vibration produces a higher pitch and slower vibration produces a lower pitch. Musicians organize pitches into notes, scales, and melodies.', notationPrompt:'4 measure ascending and descending C major melody', standards:[N('Respond','Perceive and describe musical characteristics.'),T('K.GM.P1.A','Perform','Explore and experience pitch as a music concept.')], timesAsked:0 },
  { id:'pitch-002', canonicalQuestion:'Why are the notes named A through G?', aliases:['why is there no h note','why does music stop at g','what are the music note names'], topic:'Pitch', gradeMin:2, gradeMax:8, difficulty:1, shortAnswer:'Western staff notation uses seven basic letter names: A, B, C, D, E, F, and G. After G, the pattern repeats at the next octave.', explanation:'Sharps and flats modify those seven letter names, giving us the additional pitches used in the chromatic system.', notationPrompt:'A B C D E F G A as quarter notes', standards:[N('Perform','Develop fluency with pitch notation.'),T('2.GM.P1.B','Perform','Demonstrate knowledge of music concepts in selected music.')], timesAsked:0 },
  { id:'clef-001', canonicalQuestion:'What is a treble clef?', aliases:['what is the curly symbol','what does treble clef mean','what is a g clef'], topic:'Notation', gradeMin:2, gradeMax:8, difficulty:1, shortAnswer:'The treble clef is a symbol that identifies the second line of the staff as G and helps us name the other pitches.', explanation:'It is also called the G clef. Many higher-pitched instruments and voices read treble clef.', notationPrompt:'4 measure melody in C major', standards:[N('Perform','Interpret pitch notation for performance.'),T('2.GM.P1.D','Perform','Read and perform using standard notation.')], timesAsked:0 },
  { id:'scale-001', canonicalQuestion:'What is a scale?', aliases:['what does scale mean in music','what are do re mi notes','why practice scales'], topic:'Scales & Keys', gradeMin:3, gradeMax:8, difficulty:1, shortAnswer:'A scale is an ordered group of pitches that forms a musical pitch collection.', explanation:'Major and minor scales are common examples. Scales help musicians understand keys, melodies, intervals, and harmony.', notationPrompt:'C major scale in quarter notes', standards:[N('Create','Organize pitch ideas into musical patterns.'),T('3.GM.P1.A','Perform','Apply music concepts in analysis and performance.')], timesAsked:0 },
  { id:'scale-002', canonicalQuestion:'What is a major scale?', aliases:['how does a major scale work','major scale pattern','why does major sound happy'], topic:'Scales & Keys', gradeMin:4, gradeMax:8, difficulty:2, shortAnswer:'A major scale is a seven-note scale built with the interval pattern whole, whole, half, whole, whole, whole, half.', explanation:'That pattern creates the familiar major-key sound. “Happy” can be a useful first association, but musical emotion also depends on tempo, rhythm, harmony, context, and performance.', notationPrompt:'C major scale in quarter notes', standards:[N('Create','Organize melodic ideas using tonal patterns.'),T('4.GM.P1.A','Perform','Apply music concepts when analyzing and interpreting music.')], timesAsked:0 },
  { id:'accidental-001', canonicalQuestion:'What is a sharp?', aliases:['what does hashtag mean in music','what does sharp do','what is the number sign next to a note'], topic:'Scales & Keys', gradeMin:3, gradeMax:8, difficulty:1, shortAnswer:'A sharp raises a written pitch by one half step in the usual chromatic system.', explanation:'For example, F-sharp is one half step higher than F.', notationPrompt:'F F# G as quarter notes', standards:[N('Perform','Interpret pitch-altering notation.'),T('3.GM.P1.A','Perform','Apply music concepts in analysis and performance.')], timesAsked:0 },
  { id:'accidental-002', canonicalQuestion:'What is a flat?', aliases:['what does b mean next to a note','what does flat do','why is there a little b in music'], topic:'Scales & Keys', gradeMin:3, gradeMax:8, difficulty:1, shortAnswer:'A flat lowers a written pitch by one half step in the usual chromatic system.', explanation:'For example, B-flat is one half step lower than B.', notationPrompt:'B Bb A as quarter notes', standards:[N('Perform','Interpret pitch-altering notation.'),T('3.GM.P1.A','Perform','Apply music concepts in analysis and performance.')], timesAsked:0 },
  { id:'interval-001', canonicalQuestion:'What is an interval?', aliases:['what is the distance between notes','how far apart are two notes','interval meaning music'], topic:'Intervals', gradeMin:4, gradeMax:8, difficulty:2, shortAnswer:'An interval is the musical distance between two pitches.', explanation:'Intervals can be described by number and quality, such as a major third or perfect fifth.', notationPrompt:'C E then C G as half notes', standards:[N('Respond','Analyze relationships among musical elements.'),T('4.GM.P1.A','Perform','Apply music concepts when analyzing music.')], timesAsked:0 },
  { id:'chord-001', canonicalQuestion:'What is a chord?', aliases:['what does chord mean','what are notes played together','how do chords work'], topic:'Harmony', gradeMin:4, gradeMax:8, difficulty:1, shortAnswer:'A chord is a group of pitches heard together as a harmonic unit.', explanation:'A basic triad contains three chord tones. Chords can support melodies and help create musical direction.', notationPrompt:'C major triad followed by F major and G major', standards:[N('Create','Generate and organize harmonic musical ideas.'),T('5.GM.P1.A','Perform','Apply music concepts and structure when analyzing and interpreting music.')], timesAsked:0 },
  { id:'chord-002', canonicalQuestion:'What is a triad?', aliases:['what is a three note chord','how do you build a triad','triad meaning'], topic:'Harmony', gradeMin:5, gradeMax:8, difficulty:2, shortAnswer:'A triad is a three-note chord built from a root, a third, and a fifth.', explanation:'Major, minor, diminished, and augmented triads differ because of the intervals between their chord tones.', notationPrompt:'C major triad followed by A minor triad', standards:[N('Create','Organize harmonic ideas.'),T('5.GM.P1.A','Perform','Analyze and interpret music using musical concepts.')], timesAsked:0 },
  { id:'expression-001', canonicalQuestion:'What are dynamics?', aliases:['what does loud and soft mean in music','what is forte','what is piano dynamic'], topic:'Expression', gradeMin:0, gradeMax:8, difficulty:1, shortAnswer:'Dynamics tell musicians about relative loudness and softness.', explanation:'Common markings include piano for soft and forte for loud. Dynamic changes help performers communicate expressive intent.', standards:[N('Perform','Interpret expressive qualities in performance.'),T('K.GM.P1.C','Perform','Demonstrate awareness of expressive qualities such as dynamics and tempo.')], timesAsked:0 },
  { id:'expression-002', canonicalQuestion:'What is tempo?', aliases:['what tells you how fast music goes','what does bpm mean','tempo meaning'], topic:'Expression', gradeMin:0, gradeMax:8, difficulty:1, shortAnswer:'Tempo is the speed of the musical beat.', explanation:'Tempo can be described with words such as largo or allegro, or measured in beats per minute (BPM).', standards:[N('Perform','Interpret expressive qualities in performance.'),T('K.GM.P1.C','Perform','Demonstrate awareness of expressive qualities such as dynamics and tempo.')], timesAsked:0 },
  { id:'expression-003', canonicalQuestion:'What is articulation?', aliases:['what is staccato','what is legato','how do i play notes short or smooth'], topic:'Expression', gradeMin:3, gradeMax:8, difficulty:2, shortAnswer:'Articulation describes how notes begin, connect, and end.', explanation:'For example, staccato generally means short and separated, while legato means smoothly connected.', standards:[N('Perform','Interpret expressive and technical elements.'),T('3.GM.P1.C','Perform','Demonstrate and describe expressive qualities in music.')], timesAsked:0 },
  { id:'form-001', canonicalQuestion:'What is musical form?', aliases:['what is form in music','how is a song organized','what does aba mean'], topic:'Form', gradeMin:3, gradeMax:8, difficulty:2, shortAnswer:'Musical form is the way sections and ideas are organized across a piece.', explanation:'Labels such as ABA describe repeated and contrasting sections. Recognizing form helps listeners and performers understand musical structure.', standards:[N('Respond','Analyze musical structure and context.'),T('3.GM.P1.A','Perform','Analyze selected music using music concepts and structure.')], timesAsked:0 },
  { id:'create-001', canonicalQuestion:'What is a melody?', aliases:['what is the tune','what does melody mean','is melody the part you sing'], topic:'Melody & Creating', gradeMin:0, gradeMax:8, difficulty:1, shortAnswer:'A melody is a sequence of pitches and rhythms heard as a musical line or tune.', explanation:'Melodies use pitch direction, rhythm, repetition, contrast, and phrase shape to create recognizable musical ideas.', notationPrompt:'4 measure simple melody in C major', standards:[N('Create','Generate and organize melodic musical ideas.'),T('K.GM.P1.A','Perform','Explore music concepts including pitch, rhythm, and sequence.')], timesAsked:0 },
  { id:'create-002', canonicalQuestion:'What is improvisation?', aliases:['what does improv mean in music','making music on the spot','how do musicians improvise'], topic:'Melody & Creating', gradeMin:2, gradeMax:8, difficulty:2, shortAnswer:'Improvisation is creating music in real time within chosen musical ideas, rules, or structures.', explanation:'Improvisers listen, make choices, and respond as they perform. Constraints such as a scale or rhythm can make improvisation easier to begin.', notationPrompt:'4 measure simple blues-style melody in C major', standards:[N('Create','Generate musical ideas through improvisation.'),T('5.GM.Cr1.A','Create','Generate rhythmic, melodic, and harmonic ideas within given structures.')], timesAsked:0 },
  { id:'respond-001', canonicalQuestion:'How can music show a mood or feeling?', aliases:['why does music sound happy or sad','how does music make you feel things','how does a composer create a mood'], topic:'Listening & Responding', gradeMin:1, gradeMax:8, difficulty:2, shortAnswer:'Musicians combine elements such as pitch, harmony, rhythm, tempo, dynamics, timbre, and articulation to shape expressive character.', explanation:'No single element guarantees one emotion. Meaning also depends on context, culture, personal experience, and performance choices.', standards:[N('Respond','Interpret how musical elements support expressive intent.'),T('2.GM.P1.C','Perform','Demonstrate understanding of expressive qualities and how creators use them to convey intent.')], timesAsked:0 },
]

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9#\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function tokens(text: string): Set<string> {
  const stop = new Set(['a','an','the','is','are','what','why','how','do','does','in','of','to','and','music','musical'])
  return new Set(normalize(text).split(' ').filter((x) => x.length > 1 && !stop.has(x)))
}

function similarity(a: string, b: string): number {
  const A = tokens(a); const B = tokens(b)
  if (!A.size || !B.size) return 0
  let intersection = 0
  A.forEach((x) => { if (B.has(x)) intersection += 1 })
  return intersection / new Set([...A, ...B]).size
}

export function findTheoryQuestion(query: string): { question: TheoryQuestion; confidence: number } | null {
  const q = normalize(query)
  let best: { question: TheoryQuestion; confidence: number } | null = null
  THEORY_QUESTION_BANK.forEach((question) => {
    const candidates = [question.canonicalQuestion, ...question.aliases]
    candidates.forEach((candidate) => {
      const c = normalize(candidate)
      const confidence = q === c ? 1 : (q.includes(c) || c.includes(q)) && Math.min(q.length, c.length) > 8 ? 0.92 : similarity(q, c)
      if (!best || confidence > best.confidence) best = { question, confidence }
    })
  })
  return best && best.confidence >= 0.34 ? best : null
}

export type QuestionStreamEntry = {
  rawQuestion: string
  normalizedQuestion: string
  matchedQuestionId?: string
  confidence: number
  createdAt: string
}

const QUESTION_STREAM_KEY = 'promptscore-question-stream-v1'

export function recordQuestion(query: string, match: ReturnType<typeof findTheoryQuestion>): QuestionStreamEntry {
  const entry: QuestionStreamEntry = { rawQuestion: query, normalizedQuestion: normalize(query), matchedQuestionId: match?.question.id, confidence: match?.confidence ?? 0, createdAt: new Date().toISOString() }
  try {
    const previous = JSON.parse(localStorage.getItem(QUESTION_STREAM_KEY) || '[]') as QuestionStreamEntry[]
    localStorage.setItem(QUESTION_STREAM_KEY, JSON.stringify([...previous.slice(-499), entry]))
  } catch { /* localStorage may be unavailable */ }
  return entry
}
