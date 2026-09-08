import React, { useMemo, useRef, useState } from 'react'
import ScoreRenderer from './ScoreRenderer'
import PromptScoreHarmonyWorkbench from './PromptScoreHarmonyWorkbench'
import { generateMusicBrainResult, type MusicBrainResult } from '../music/musicBrain'
import { playScoreNotes } from '../music/PlaybackEngine'

type View = 'home' | 'create' | 'learn' | 'teach' | 'studio'
type Difficulty = 'Easy' | 'Grade Level' | 'Challenge'

const COLORS = {
  ink: '#17223b',
  blue: '#2563eb',
  blueSoft: '#eaf3ff',
  green: '#0f9f82',
  greenSoft: '#e8f8f3',
  purple: '#7c3aed',
  purpleSoft: '#f1eaff',
  orange: '#f97316',
  orangeSoft: '#fff1e7',
  line: '#dde5ef',
  muted: '#60708a',
  paper: '#ffffff',
  bg: '#f6f9fc',
}

const cardStyle: React.CSSProperties = {
  background: COLORS.paper,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 18,
  boxShadow: '0 8px 28px rgba(28, 48, 78, 0.07)',
}

function icon(kind: View | 'daily' | 'library') {
  if (kind === 'home') return '⌂'
  if (kind === 'create') return '♫'
  if (kind === 'learn') return '◈'
  if (kind === 'teach') return '▦'
  if (kind === 'daily') return '☀'
  if (kind === 'studio') return '✦'
  return '▤'
}

function NavButton({ active, label, kind, onClick }: { active: boolean; label: string; kind: View | 'library'; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: '100%', border: 0, borderRadius: 12, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 11, background: active ? COLORS.blue : 'transparent', color: active ? '#fff' : COLORS.ink, fontWeight: 750, fontSize: 15, cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ width: 24, textAlign: 'center', fontSize: 18 }}>{icon(kind)}</span>{label}
    </button>
  )
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button disabled={disabled} onClick={onClick} style={{ border: 0, borderRadius: 12, padding: '12px 18px', background: disabled ? '#a8b6cb' : COLORS.blue, color: '#fff', fontWeight: 800, fontSize: 15, cursor: disabled ? 'not-allowed' : 'pointer' }}>{children}</button>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label style={{ display: 'grid', gap: 6, fontSize: 12, color: COLORS.muted, fontWeight: 750 }}>{label}{children}</label>
}

function ScoreCard({ result, title, onPlay }: { result: MusicBrainResult | null; title: string; onPlay: () => void }) {
  return (
    <div style={{ ...cardStyle, padding: 20, minHeight: 360 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
        <div><div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>PromptScore</div><h2 style={{ margin: '4px 0 2px', fontSize: 24, color: COLORS.ink }}>{title}</h2>{result && <div style={{ color: COLORS.muted, fontSize: 14 }}>{result.keySignature} · {result.timeSignature}</div>}</div>
        <button onClick={onPlay} disabled={!result?.notes.length} style={{ width: 46, height: 46, borderRadius: 999, border: 0, background: result?.notes.length ? COLORS.blue : '#c8d3e2', color: '#fff', fontSize: 18, cursor: result?.notes.length ? 'pointer' : 'default' }}>▶</button>
      </div>
      {result ? <ScoreRenderer notes={result.notes as any} timeSignature={result.timeSignature as any} keySignature={result.keySignature as any} harmonyProgression={result.harmony.progression} /> : <div style={{ display: 'grid', placeItems: 'center', minHeight: 280, color: COLORS.muted, textAlign: 'center' }}>Generate music and the score will appear here.</div>}
    </div>
  )
}

export default function PromptScoreClassroomApp() {
  const [view, setView] = useState<View>('home')
  const [prompt, setPrompt] = useState('Write an 8 measure melody in D minor with quarter and eighth notes')
  const [result, setResult] = useState<MusicBrainResult | null>(null)
  const [learnQuestion, setLearnQuestion] = useState('Explain secondary dominants with a simple example')
  const [learnAnswer, setLearnAnswer] = useState('')
  const [teachTopic, setTeachTopic] = useState('Rhythm warmup')
  const [grade, setGrade] = useState('7')
  const [difficulty, setDifficulty] = useState<Difficulty>('Grade Level')
  const [measures, setMeasures] = useState('4')
  const [studentCopy, setStudentCopy] = useState<MusicBrainResult | null>(null)
  const playbackRef = useRef<ReturnType<typeof playScoreNotes> | null>(null)

  const classroomPrompt = useMemo(() => {
    const difficultyText = difficulty === 'Easy' ? 'simple quarter notes and half notes' : difficulty === 'Challenge' ? 'eighth notes, rests, syncopation and some sixteenth notes' : 'quarter notes, eighth notes and quarter rests'
    return `${measures} measure ${teachTopic.toLowerCase()} for grade ${grade} students in 4/4 using ${difficultyText}`
  }, [teachTopic, grade, difficulty, measures])

  function generate(text = prompt) {
    const next = generateMusicBrainResult(text, { duration: 'Quarter', accidental: null, timeSignature: '4/4' })
    setResult(next)
    return next
  }

  function play(activeResult: MusicBrainResult | null) {
    if (!activeResult?.notes.length) return
    playbackRef.current?.stop()
    playbackRef.current = playScoreNotes(activeResult.notes as any, { tempo: 92, timeSignature: activeResult.timeSignature as any })
  }

  function runLesson() {
    const q = learnQuestion.toLowerCase()
    let answer = 'PromptScore can turn this concept into a short musical example, then let the student hear and inspect it.'
    let musicPrompt = '4 measure melody in C major using quarter notes'
    if (q.includes('secondary dominant')) {
      answer = 'A secondary dominant is a dominant chord that temporarily points to a chord other than the home tonic. In C major, D7 can act as V/V because it strongly points to G.'
      musicPrompt = '4 measure melody in C major with harmony progression ii V I and a strong G arrival'
    } else if (q.includes('syncop')) {
      answer = 'Syncopation gives emphasis to normally weaker parts of the beat. Hear the example, then clap the pulse while the notes push across it.'
      musicPrompt = '4 measure rhythm with eighth notes rests and syncopation in 4/4'
    } else if (q.includes('scale')) {
      answer = 'A scale is an ordered collection of pitches. PromptScore can generate the scale itself, then vary rhythm and direction for practice.'
      musicPrompt = 'C major scale in quarter notes'
    }
    setLearnAnswer(answer)
    setResult(generate(musicPrompt))
  }

  function buildClassroomActivity() {
    const next = generateMusicBrainResult(classroomPrompt, { duration: 'Quarter', accidental: null, timeSignature: '4/4' })
    setStudentCopy(next)
  }

  if (view === 'studio') return <div><button onClick={() => setView('home')} style={{ position: 'fixed', zIndex: 20, top: 12, left: 12, border: 0, borderRadius: 10, padding: '9px 12px', background: COLORS.blue, color: '#fff', fontWeight: 800 }}>← Classroom</button><PromptScoreHarmonyWorkbench /></div>

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.ink, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <header style={{ height: 72, background: '#fff', borderBottom: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: COLORS.blue, color: '#fff', fontSize: 23 }}>♫</div><div><div style={{ fontSize: 23, fontWeight: 900, letterSpacing: '-.03em' }}>PromptScore</div><div style={{ color: COLORS.muted, fontSize: 11, letterSpacing: '.17em' }}>MUSIC FOR EVERY MIND.</div></div></div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontWeight: 750, fontSize: 14 }}><span>Create</span><span>Learn</span><span>Teach</span><button onClick={() => setView('studio')} style={{ border: `1px solid ${COLORS.line}`, background: '#fff', borderRadius: 10, padding: '8px 12px', fontWeight: 800, color: COLORS.ink, cursor: 'pointer' }}>Open Studio</button><div style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 999, background: COLORS.blueSoft, color: COLORS.blue, fontWeight: 900 }}>DJ</div></div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '210px minmax(0, 1fr)', minHeight: 'calc(100vh - 72px)' }}>
        <aside style={{ background: '#fff', borderRight: `1px solid ${COLORS.line}`, padding: 18, display: 'grid', alignContent: 'start', gap: 5 }}>
          <NavButton active={view === 'home'} label="Home" kind="home" onClick={() => setView('home')} />
          <NavButton active={view === 'create'} label="Create" kind="create" onClick={() => setView('create')} />
          <NavButton active={view === 'learn'} label="Learn" kind="learn" onClick={() => setView('learn')} />
          <NavButton active={view === 'teach'} label="Teach" kind="teach" onClick={() => setView('teach')} />
          <div style={{ height: 1, background: COLORS.line, margin: '12px 4px' }} />
          <NavButton active={false} label="Full Studio" kind="studio" onClick={() => setView('studio')} />
          <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: COLORS.blueSoft, color: COLORS.ink }}><div style={{ color: COLORS.blue, fontWeight: 900, fontSize: 13 }}>Classroom Alpha</div><div style={{ fontSize: 12, lineHeight: 1.45, marginTop: 5, color: COLORS.muted }}>A simpler front door powered by the existing PromptScore music engine.</div></div>
        </aside>

        <main style={{ padding: '34px clamp(24px, 4vw, 64px) 70px', overflow: 'hidden' }}>
          {view === 'home' && <>
            <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(360px, .8fr)', gap: 34, alignItems: 'center', maxWidth: 1280, margin: '0 auto' }}>
              <div><h1 style={{ fontSize: 'clamp(42px, 5vw, 68px)', lineHeight: .98, margin: 0, letterSpacing: '-.055em' }}>Turn ideas into <span style={{ color: COLORS.blue }}>music.</span></h1><p style={{ color: COLORS.muted, fontSize: 20, margin: '18px 0 26px' }}>Simple tools. Real learning. For every classroom.</p><div style={{ display: 'flex', gap: 12 }}><PrimaryButton onClick={() => setView('teach')}>Make a classroom activity</PrimaryButton><button onClick={() => setView('create')} style={{ border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: '12px 18px', background: '#fff', fontWeight: 800, color: COLORS.ink }}>Create music</button></div></div>
              <div style={{ ...cardStyle, padding: 20 }}><div style={{ fontWeight: 900, marginBottom: 8 }}>Try PromptScore</div><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ width: '100%', minHeight: 84, resize: 'vertical', boxSizing: 'border-box', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12, font: 'inherit' }} /><div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}><PrimaryButton onClick={() => { generate(); setView('create') }}>Generate music</PrimaryButton></div></div>
            </section>

            <section style={{ maxWidth: 1280, margin: '38px auto 0', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
              {[
                ['create', 'Create', 'Describe it. Generate it. Edit it. Hear it.', COLORS.blueSoft, COLORS.blue],
                ['learn', 'Learn', 'Explore theory with musical examples and instant help.', COLORS.greenSoft, COLORS.green],
                ['teach', 'Teach', 'Make exercises and classroom-ready material in seconds.', COLORS.purpleSoft, COLORS.purple],
              ].map(([kind, title, copy, bg, accent]) => <button key={title} onClick={() => setView(kind as View)} style={{ border: 0, borderRadius: 20, background: bg, padding: 24, textAlign: 'left', minHeight: 190, cursor: 'pointer', color: COLORS.ink }}><div style={{ width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 12, background: '#fff', color: accent, fontSize: 22 }}>{icon(kind as View)}</div><h3 style={{ fontSize: 24, margin: '18px 0 8px' }}>{title}</h3><div style={{ color: COLORS.muted, lineHeight: 1.5 }}>{copy}</div></button>)}
            </section>

            <section style={{ maxWidth: 1280, margin: '36px auto 0' }}><h2 style={{ fontSize: 22 }}>Popular in classrooms</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 12 }}>{['Rhythm warmups', 'Sight-reading', 'Scale practice', 'Theory examples', 'Lesson starters'].map((x) => <div key={x} style={{ ...cardStyle, boxShadow: 'none', padding: '16px 14px', fontWeight: 750, fontSize: 14 }}>{x}</div>)}</div></section>
          </>}

          {view === 'create' && <section style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ marginBottom: 22 }}><div style={{ color: COLORS.blue, fontWeight: 900 }}>CREATE</div><h1 style={{ fontSize: 38, margin: '5px 0 8px' }}>Describe the music you want.</h1><p style={{ margin: 0, color: COLORS.muted }}>The existing PromptScore music brain turns natural language into playable notation.</p></div>
            <div style={{ ...cardStyle, padding: 18, marginBottom: 20 }}><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} style={{ width: '100%', minHeight: 92, boxSizing: 'border-box', border: 0, outline: 0, resize: 'vertical', font: 'inherit', fontSize: 17 }} /><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>{['C major scale in quarter notes', '8 measure jazz melody in F major', '4 measure rhythm with eighth notes and rests'].map((x) => <button key={x} onClick={() => setPrompt(x)} style={{ border: `1px solid ${COLORS.line}`, background: '#fff', borderRadius: 999, padding: '8px 11px', color: COLORS.muted, cursor: 'pointer' }}>{x}</button>)}<div style={{ marginLeft: 'auto' }}><PrimaryButton onClick={() => generate()}>Generate</PrimaryButton></div></div></div>
            <ScoreCard result={result} title={result ? 'Generated score' : 'Your score'} onPlay={() => play(result)} />
          </section>}

          {view === 'learn' && <section style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ color: COLORS.green, fontWeight: 900 }}>LEARN</div><h1 style={{ fontSize: 38, margin: '5px 0 8px' }}>Ask. Hear. Understand.</h1><p style={{ color: COLORS.muted, marginTop: 0 }}>A student-friendly tutor grounded in actual musical examples.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, .8fr) minmax(0, 1.2fr)', gap: 20, alignItems: 'start' }}>
              <div style={{ ...cardStyle, padding: 20 }}><Field label="Ask a music question"><textarea value={learnQuestion} onChange={(e) => setLearnQuestion(e.target.value)} style={{ minHeight: 110, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12, font: 'inherit', resize: 'vertical' }} /></Field><div style={{ marginTop: 12 }}><PrimaryButton onClick={runLesson}>Explain with music</PrimaryButton></div>{learnAnswer && <div style={{ marginTop: 18, background: COLORS.greenSoft, borderRadius: 14, padding: 16, lineHeight: 1.55 }}><strong>Simple explanation</strong><div style={{ marginTop: 6, color: '#355166' }}>{learnAnswer}</div></div>}<div style={{ marginTop: 18, color: COLORS.muted, fontSize: 13 }}>Try: “What is syncopation?” · “Show me a major scale.” · “Explain secondary dominants.”</div></div>
              <ScoreCard result={result} title="Musical example" onPlay={() => play(result)} />
            </div>
          </section>}

          {view === 'teach' && <section style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ color: COLORS.purple, fontWeight: 900 }}>TEACH</div><h1 style={{ fontSize: 38, margin: '5px 0 8px' }}>Less prep. More music.</h1><p style={{ color: COLORS.muted, marginTop: 0 }}>Generate differentiated classroom material with the same underlying music engine.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '360px minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
              <div style={{ ...cardStyle, padding: 20, display: 'grid', gap: 14 }}>
                <Field label="Activity"><select value={teachTopic} onChange={(e) => setTeachTopic(e.target.value)} style={{ padding: 11, borderRadius: 10, border: `1px solid ${COLORS.line}` }}><option>Rhythm warmup</option><option>Sight-reading exercise</option><option>Scale practice</option><option>Melody starter</option></select></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><Field label="Grade"><select value={grade} onChange={(e) => setGrade(e.target.value)} style={{ padding: 11, borderRadius: 10, border: `1px solid ${COLORS.line}` }}>{['4','5','6','7','8','9-12'].map((g) => <option key={g}>{g}</option>)}</select></Field><Field label="Measures"><select value={measures} onChange={(e) => setMeasures(e.target.value)} style={{ padding: 11, borderRadius: 10, border: `1px solid ${COLORS.line}` }}>{['2','4','8','16'].map((m) => <option key={m}>{m}</option>)}</select></Field></div>
                <Field label="Difficulty"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>{(['Easy','Grade Level','Challenge'] as Difficulty[]).map((d) => <button key={d} onClick={() => setDifficulty(d)} style={{ border: `1px solid ${difficulty === d ? COLORS.purple : COLORS.line}`, background: difficulty === d ? COLORS.purpleSoft : '#fff', borderRadius: 9, padding: '9px 5px', color: difficulty === d ? COLORS.purple : COLORS.muted, fontWeight: 800, fontSize: 11 }}>{d}</button>)}</div></Field>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 12, color: COLORS.muted, fontSize: 12, lineHeight: 1.5 }}><strong style={{ color: COLORS.ink }}>Prompt preview</strong><br />{classroomPrompt}</div>
                <PrimaryButton onClick={buildClassroomActivity}>Generate activity</PrimaryButton>
              </div>
              <div><ScoreCard result={studentCopy} title={`${teachTopic} · Grade ${grade}`} onPlay={() => play(studentCopy)} />{studentCopy && <div style={{ display: 'flex', gap: 10, marginTop: 12 }}><button onClick={() => setDifficulty('Easy')} style={{ border: `1px solid ${COLORS.line}`, borderRadius: 10, background: '#fff', padding: '10px 13px', fontWeight: 750 }}>Make easier</button><button onClick={() => setDifficulty('Challenge')} style={{ border: `1px solid ${COLORS.line}`, borderRadius: 10, background: '#fff', padding: '10px 13px', fontWeight: 750 }}>Add challenge</button><button onClick={buildClassroomActivity} style={{ border: `1px solid ${COLORS.line}`, borderRadius: 10, background: '#fff', padding: '10px 13px', fontWeight: 750 }}>New version</button></div>}</div>
            </div>
          </section>}
        </main>
      </div>
    </div>
  )
}
