import React, { useMemo, useState } from 'react'
import ScoreRenderer from './ScoreRenderer'
import { playScoreNotes } from '../music/PlaybackEngine'
import {
  generateRhythmExercise,
  getDefaultRhythmOptions,
  type RhythmDifficulty,
  type RhythmExerciseLength,
  type RhythmOptionKey,
} from '../music/RhythmExerciseGenerator'
import {
  getStaffProgression,
  type StaffLineCount,
} from '../music/RhythmStaffProgression'
import type { TimeSignatureValue } from '../music/musicBrain'

const STAFF_LINE_OPTIONS: StaffLineCount[] = [1, 2, 3, 4, 5]
const DIFFICULTIES: RhythmDifficulty[] = ['beginner', 'intermediate', 'advanced']
const LENGTHS: RhythmExerciseLength[] = [4, 8, 16]
const TIME_SIGNATURES: TimeSignatureValue[] = ['4/4', '3/4', '2/4', '6/8']
const RHYTHM_TOGGLES: Array<{ key: RhythmOptionKey; label: string }> = [
  { key: 'quarters', label: 'Quarter Notes' },
  { key: 'eighths', label: 'Eighth Notes' },
  { key: 'rests', label: 'Rests' },
  { key: 'triplets', label: 'Triplets' },
  { key: 'dotted', label: 'Dotted Rhythms' },
  { key: 'sixteenths', label: '16ths' },
]

export default function RhythmLabWorkbench() {
  const [difficulty, setDifficulty] = useState<RhythmDifficulty>('beginner')
  const [measureCount, setMeasureCount] = useState<RhythmExerciseLength>(8)
  const [timeSignature, setTimeSignature] = useState<TimeSignatureValue>('4/4')
  const [tempo, setTempo] = useState(84)
  const [staffLineCount, setStaffLineCount] = useState<StaffLineCount>(1)
  const [allowed, setAllowed] = useState(getDefaultRhythmOptions('beginner'))

  const [exercise, setExercise] = useState(() => generateRhythmExercise({
    difficulty: 'beginner',
    measureCount: 8,
    timeSignature: '4/4',
    allowed: getDefaultRhythmOptions('beginner'),
  }))

  const progression = useMemo(() => getStaffProgression(staffLineCount), [staffLineCount])

  function handleDifficultyChange(nextDifficulty: RhythmDifficulty) {
    setDifficulty(nextDifficulty)
    setAllowed(getDefaultRhythmOptions(nextDifficulty))
  }

  function handleToggle(key: RhythmOptionKey) {
    setAllowed((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  function handleGenerate() {
    setExercise(generateRhythmExercise({
      difficulty,
      measureCount,
      timeSignature,
      allowed,
    }))
  }

  function handlePlayback() {
    playScoreNotes(exercise.notes, {
      tempo,
      timeSignature,
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18, padding: 20, minHeight: '100vh', background: '#f4f4f5', fontFamily: 'Inter, Arial, sans-serif' }}>
      <aside style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
        <div style={{ border: '1px solid #d4d4d8', borderRadius: 14, background: '#ffffff', padding: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>RhythmLab</div>
          <div style={{ fontSize: 14, color: '#52525b', lineHeight: 1.5 }}>
            AI-generated rhythm literacy and notation progression.
          </div>
        </div>

        <div style={{ border: '1px solid #d4d4d8', borderRadius: 14, background: '#ffffff', padding: 16, display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a' }}>Exercise Settings</div>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => handleDifficultyChange(event.target.value as RhythmDifficulty)}>
              {DIFFICULTIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Measures</span>
            <select value={measureCount} onChange={(event) => setMeasureCount(Number(event.target.value) as RhythmExerciseLength)}>
              {LENGTHS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Meter</span>
            <select value={timeSignature} onChange={(event) => setTimeSignature(event.target.value as TimeSignatureValue)}>
              {TIME_SIGNATURES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Tempo</span>
            <input type="range" min="40" max="180" value={tempo} onChange={(event) => setTempo(Number(event.target.value))} />
            <div>{tempo} BPM</div>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Staff Lines</span>
            <select value={staffLineCount} onChange={(event) => setStaffLineCount(Number(event.target.value) as StaffLineCount)}>
              {STAFF_LINE_OPTIONS.map((count) => <option key={count} value={count}>{count} Line{count > 1 ? 's' : ''}</option>)}
            </select>
          </label>

          <div style={{ border: '1px solid #e4e4e7', borderRadius: 12, background: '#fafafa', padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Pitch Literacy Progression</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {progression.anchorNotes.map((note) => (
                <div key={`${note.pitch}${note.octave}`} style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#ffffff', padding: '6px 10px', fontSize: 13 }}>
                  {note.pitch}{note.octave}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#52525b', marginBottom: 6 }}>{progression.description}</div>
            <div style={{ fontSize: 12, color: '#71717a' }}>{progression.educationalFocus}</div>
          </div>
        </div>

        <div style={{ border: '1px solid #d4d4d8', borderRadius: 14, background: '#ffffff', padding: 16, display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#71717a' }}>Allowed Rhythms</div>

          {RHYTHM_TOGGLES.map((toggle) => (
            <label key={toggle.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" checked={allowed[toggle.key]} onChange={() => handleToggle(toggle.key)} />
              <span>{toggle.label}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleGenerate} style={{ flex: 1, border: '1px solid #111827', background: '#111827', color: '#ffffff', borderRadius: 12, padding: '12px 14px', fontWeight: 700, cursor: 'pointer' }}>
            Generate Exercise
          </button>

          <button onClick={handlePlayback} style={{ border: '1px solid #d4d4d8', background: '#ffffff', borderRadius: 12, padding: '12px 16px', cursor: 'pointer' }}>
            ▶ Play
          </button>
        </div>
      </aside>

      <main style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
        <div style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{exercise.title}</div>
              <div style={{ color: '#52525b', fontSize: 14 }}>{exercise.summary}</div>
            </div>

            <div style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#fafafa', padding: '8px 12px', fontSize: 13 }}>
              {staffLineCount} Line{staffLineCount > 1 ? 's' : ''} · Bottom Line = E
            </div>
          </div>

          <div style={{ border: '1px dashed #cbd5e1', borderRadius: 14, padding: 12, overflow: 'hidden' }}>
            <ScoreRenderer
              notes={exercise.notes as any}
              timeSignature={timeSignature}
              keySignature={'C major' as any}
              showRhythmStaff
              rhythmStaffLineCount={staffLineCount}
              rhythmStaffAnchor="E"
            />
          </div>
        </div>

        <div style={{ border: '1px solid #d4d4d8', borderRadius: 16, background: '#ffffff', padding: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Counting Overlay</div>

          <div style={{ display: 'grid', gap: 10 }}>
            {Object.entries(exercise.countsByMeasure).map(([measure, counts]) => (
              <div key={measure} style={{ border: '1px solid #e4e4e7', borderRadius: 12, background: '#fafafa', padding: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Measure {measure}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {counts.map((count, index) => (
                    <div key={`${measure}-${index}`} style={{ border: '1px solid #d4d4d8', borderRadius: 999, background: '#ffffff', padding: '6px 10px', fontSize: 13 }}>
                      {count}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
