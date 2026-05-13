import React, { useMemo, useState } from 'react'
import {
  applyKeySignatureToPitch,
  createMelodyContour,
  describePitch,
  getChord,
  getChordVexKeys,
  getScalePitches,
  parsePitchText,
  pitchToMidi,
  pitchToVexKey,
  transposePitch,
  type ChordQuality,
  type KeySignatureValue,
  type PitchStep,
  type PitchValue,
  type ScaleMode,
} from './PitchEngine'

const STEPS: PitchStep[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const OCTAVES = [2, 3, 4, 5, 6]
const SCALE_MODES: ScaleMode[] = ['major', 'natural minor', 'harmonic minor', 'melodic minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian']
const CHORD_QUALITIES: ChordQuality[] = ['major', 'minor', 'diminished', 'augmented', 'dominant7', 'major7', 'minor7']
const KEY_SIGNATURES: KeySignatureValue[] = ['C major', 'G major', 'D major', 'A major', 'F major', 'Bb major', 'Eb major', 'A minor', 'E minor', 'D minor', 'G minor', 'C minor']

function Pill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #e4e4e7', borderRadius: 10, padding: 8, background: '#fafafa', fontSize: 11 }}>
      <div style={{ fontWeight: 800, color: '#18181b', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#3f3f46' }}>{value}</div>
    </div>
  )
}

export default function PitchEngineDebugPanel() {
  const [step, setStep] = useState<PitchStep>('C')
  const [octave, setOctave] = useState(4)
  const [typedPitch, setTypedPitch] = useState('C4')
  const [keySignature, setKeySignature] = useState<KeySignatureValue>('C major')
  const [scaleMode, setScaleMode] = useState<ScaleMode>('major')
  const [chordQuality, setChordQuality] = useState<ChordQuality>('major')

  const pitch: PitchValue = useMemo(() => ({ step, octave, accidental: null }), [step, octave])
  const parsedPitch = useMemo(() => parsePitchText(typedPitch, octave), [typedPitch, octave])
  const activePitch = parsedPitch ?? pitch
  const keyAwarePitch = applyKeySignatureToPitch(activePitch, keySignature)
  const scale = getScalePitches(keyAwarePitch, scaleMode, 2)
  const chord = getChord(keyAwarePitch, chordQuality)
  const melodyContour = createMelodyContour(keyAwarePitch, scaleMode, [0, 1, 2, 4, 3, 2, 1, 0], 2)

  return (
    <div style={{ marginTop: 16, border: '1px solid #d4d4d8', borderRadius: 14, background: '#ffffff', overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #e4e4e7', display: 'grid', gap: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#18181b', textTransform: 'uppercase' }}>PitchEngine Debug</div>
          <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Test octave-aware pitches, key signatures, scales, chords, and VexFlow keys.</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          <label style={{ display: 'grid', gap: 4, fontSize: 12, color: '#52525b' }}>
            Typed Pitch
            <input
              value={typedPitch}
              onChange={(event) => setTypedPitch(event.target.value)}
              placeholder="C4, F#5, Bb3"
              style={{ border: '1px solid #d4d4d8', borderRadius: 10, padding: '7px 10px' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 4, fontSize: 12, color: '#52525b' }}>
            Step
            <select value={step} onChange={(event) => setStep(event.target.value as PitchStep)} style={{ border: '1px solid #d4d4d8', borderRadius: 10, padding: '7px 10px' }}>
              {STEPS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 4, fontSize: 12, color: '#52525b' }}>
            Octave
            <select value={octave} onChange={(event) => setOctave(Number(event.target.value))} style={{ border: '1px solid #d4d4d8', borderRadius: 10, padding: '7px 10px' }}>
              {OCTAVES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 4, fontSize: 12, color: '#52525b' }}>
            Key
            <select value={keySignature} onChange={(event) => setKeySignature(event.target.value as KeySignatureValue)} style={{ border: '1px solid #d4d4d8', borderRadius: 10, padding: '7px 10px' }}>
              {KEY_SIGNATURES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div style={{ padding: 14, display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          <Pill label="Active Pitch" value={describePitch(activePitch)} />
          <Pill label="Key-Aware Pitch" value={describePitch(keyAwarePitch)} />
          <Pill label="MIDI" value={pitchToMidi(keyAwarePitch)} />
          <Pill label="VexFlow Key" value={pitchToVexKey(keyAwarePitch)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          <label style={{ display: 'grid', gap: 4, fontSize: 12, color: '#52525b' }}>
            Scale Mode
            <select value={scaleMode} onChange={(event) => setScaleMode(event.target.value as ScaleMode)} style={{ border: '1px solid #d4d4d8', borderRadius: 10, padding: '7px 10px' }}>
              {SCALE_MODES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 4, fontSize: 12, color: '#52525b' }}>
            Chord Quality
            <select value={chordQuality} onChange={(event) => setChordQuality(event.target.value as ChordQuality)} style={{ border: '1px solid #d4d4d8', borderRadius: 10, padding: '7px 10px' }}>
              {CHORD_QUALITIES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <Pill label="Scale Pitches" value={scale.map(describePitch).join(' · ')} />
          <Pill label="Chord Pitches" value={chord.pitches.map(describePitch).join(' · ')} />
          <Pill label="Chord VexFlow Keys" value={getChordVexKeys(chord).join(' · ')} />
          <Pill label="Simple Melody Contour" value={melodyContour.map(describePitch).join(' → ')} />
          <Pill label="Transpose +12" value={describePitch(transposePitch(keyAwarePitch, 12))} />
        </div>
      </div>
    </div>
  )
}
