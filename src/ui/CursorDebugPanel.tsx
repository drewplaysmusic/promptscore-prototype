import React, { useMemo, useState } from 'react'
import {
  createMusicCursor,
  describeCursor,
  getDurationTicks,
  placeDurationsFromCursor,
  type CursorDurationValue,
  type CursorTimeSignatureValue,
} from './MusicCursor'

type CursorPitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

type CursorScoreEvent = {
  duration: CursorDurationValue
  pitch: CursorPitchValue
  measure: number
  beat: number
}

const DURATIONS: CursorDurationValue[] = [
  'Whole',
  'DottedHalf',
  'Half',
  'DottedQuarter',
  'Quarter',
  'DottedEighth',
  'Eighth',
  'TripletEighth',
  '16th',
]

const PITCHES: CursorPitchValue[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

function formatTick(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

export default function CursorDebugPanel({
  onSendToScore,
}: {
  onSendToScore?: (events: CursorScoreEvent[]) => void
}) {
  const [timeSignature, setTimeSignature] = useState<CursorTimeSignatureValue>('4/4')
  const [selectedDuration, setSelectedDuration] = useState<CursorDurationValue>('Quarter')
  const [selectedPitch, setSelectedPitch] = useState<CursorPitchValue>('C')
  const [durations, setDurations] = useState<CursorDurationValue[]>([])
  const [liveSendEnabled, setLiveSendEnabled] = useState(false)

  const cursor = useMemo(() => createMusicCursor({ timeSignature }), [timeSignature])
  const placed = useMemo(() => placeDurationsFromCursor(cursor, durations), [cursor, durations])
  const activeCursor = placed.nextCursor
  const selectedTicks = getDurationTicks(selectedDuration, cursor.ticksPerQuarter)

  function getScoreEvents(nextDurations = durations): CursorScoreEvent[] {
    const nextPlaced = placeDurationsFromCursor(cursor, nextDurations)
    return nextPlaced.events.map((event) => ({
      duration: event.duration,
      pitch: selectedPitch,
      measure: event.measure,
      beat: event.beat,
    }))
  }

  function sendToScore(nextDurations = durations) {
    onSendToScore?.(getScoreEvents(nextDurations))
  }

  function addDuration(duration = selectedDuration) {
    setDurations((current) => {
      const nextDurations = [...current, duration]
      if (liveSendEnabled) sendToScore(nextDurations)
      return nextDurations
    })
  }

  function undoLast() {
    setDurations((current) => {
      const nextDurations = current.slice(0, -1)
      if (liveSendEnabled) sendToScore(nextDurations)
      return nextDurations
    })
  }

  function clearAll() {
    setDurations([])
    if (liveSendEnabled) onSendToScore?.([])
  }

  return (
    <div
      style={{
        marginTop: 16,
        border: '1px solid #d4d4d8',
        borderRadius: 14,
        background: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid #e4e4e7',
          display: 'grid',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#18181b', textTransform: 'uppercase' }}>
              MusicCursor Debug
            </div>
            <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
              {describeCursor(activeCursor)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <select
              value={timeSignature}
              onChange={(event) => setTimeSignature(event.target.value as CursorTimeSignatureValue)}
              style={{ border: '1px solid #d4d4d8', borderRadius: 10, padding: '7px 10px', background: '#fafafa' }}
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="2/4">2/4</option>
              <option value="6/8">6/8</option>
            </select>

            <button type="button" onClick={undoLast}>Undo</button>
            <button type="button" onClick={clearAll}>Clear</button>
            <button type="button" onClick={() => sendToScore()}>Send To Score</button>
            <button
              type="button"
              onClick={() => {
                setLiveSendEnabled((enabled) => {
                  const nextEnabled = !enabled
                  if (!enabled) sendToScore()
                  return nextEnabled
                })
              }}
              style={{
                border: liveSendEnabled ? '1px solid #111827' : '1px solid #d4d4d8',
                background: liveSendEnabled ? '#111827' : '#fafafa',
                color: liveSendEnabled ? '#ffffff' : '#111827',
                borderRadius: 10,
                padding: '7px 10px',
                fontWeight: 800,
              }}
            >
              Live Send: {liveSendEnabled ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          <div style={{ border: '1px solid #e4e4e7', borderRadius: 10, padding: 8, background: '#fafafa', fontSize: 11 }}>
            <div style={{ fontWeight: 800, color: '#18181b' }}>Selected Duration</div>
            <div>{selectedDuration}</div>
            <div>{formatTick(selectedTicks)} ticks</div>
          </div>
          <div style={{ border: '1px solid #e4e4e7', borderRadius: 10, padding: 8, background: '#fafafa', fontSize: 11 }}>
            <div style={{ fontWeight: 800, color: '#18181b' }}>Selected Pitch</div>
            <div>{selectedPitch}</div>
          </div>
          <div style={{ border: '1px solid #e4e4e7', borderRadius: 10, padding: 8, background: '#fafafa', fontSize: 11 }}>
            <div style={{ fontWeight: 800, color: '#18181b' }}>Events</div>
            <div>{placed.events.length}</div>
          </div>
          <div style={{ border: '1px solid #e4e4e7', borderRadius: 10, padding: 8, background: '#fafafa', fontSize: 11 }}>
            <div style={{ fontWeight: 800, color: '#18181b' }}>Next Insertion</div>
            <div>m{activeCursor.measure}</div>
            <div>beat {activeCursor.beat.toFixed(3)}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 14, display: 'grid', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#52525b', textTransform: 'uppercase', marginBottom: 8 }}>
            Duration Input
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DURATIONS.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => setSelectedDuration(duration)}
                style={{
                  border: selectedDuration === duration ? '2px solid #18181b' : '1px solid #d4d4d8',
                  borderRadius: 999,
                  padding: '7px 10px',
                  background: selectedDuration === duration ? '#f4f4f5' : '#ffffff',
                  fontWeight: selectedDuration === duration ? 800 : 500,
                }}
              >
                {duration}
              </button>
            ))}
            <button type="button" onClick={() => addDuration()} style={{ borderRadius: 999, padding: '7px 12px', fontWeight: 800 }}>
              Add {selectedDuration}
            </button>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#52525b', textTransform: 'uppercase', marginBottom: 8 }}>
            Pitch Selector Placeholder
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PITCHES.map((pitch) => (
              <button
                key={pitch}
                type="button"
                onClick={() => setSelectedPitch(pitch)}
                style={{
                  border: selectedPitch === pitch ? '2px solid #18181b' : '1px solid #d4d4d8',
                  borderRadius: 999,
                  padding: '7px 10px',
                  background: selectedPitch === pitch ? '#f4f4f5' : '#ffffff',
                  fontWeight: selectedPitch === pitch ? 800 : 500,
                }}
              >
                {pitch}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#52525b', textTransform: 'uppercase', marginBottom: 8 }}>
            Cursor Timeline
          </div>
          <div
            style={{
              position: 'relative',
              height: 90,
              border: '1px solid #e4e4e7',
              borderRadius: 12,
              background: 'linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)',
              overflow: 'hidden',
            }}
          >
            {Array.from({ length: 5 }, (_, index) => {
              const left = index * 25
              return (
                <div
                  key={`beat-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: '#cbd5e1',
                  }}
                >
                  {index < 4 ? (
                    <div style={{ fontSize: 10, color: '#64748b', marginLeft: 4, marginTop: 4 }}>
                      {index + 1}
                    </div>
                  ) : null}
                </div>
              )
            })}

            {placed.events.map((event, index) => {
              const left = (event.startTick / cursor.ticksPerMeasure) * 100
              const width = Math.max(1, (event.durationTicks / cursor.ticksPerMeasure) * 100)
              return (
                <div
                  key={`event-${index}-${event.measure}-${event.startTick}`}
                  title={`${event.duration}: m${event.measure} beat ${event.beat.toFixed(3)}`}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    top: event.measure === activeCursor.measure ? 28 : 42,
                    width: `${width}%`,
                    minWidth: 8,
                    height: 24,
                    border: '1px solid #a1a1aa',
                    borderRadius: 7,
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#3f3f46',
                    boxSizing: 'border-box',
                  }}
                >
                  {index + 1}
                </div>
              )
            })}

            <div
              style={{
                position: 'absolute',
                left: `${(activeCursor.tick / activeCursor.ticksPerMeasure) * 100}%`,
                top: 14,
                bottom: 14,
                width: 2,
                background: '#18181b',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          {placed.events.slice(-6).map((event, index) => (
            <div
              key={`recent-${index}-${event.measure}-${event.startTick}`}
              style={{ border: '1px solid #e4e4e7', borderRadius: 10, padding: 8, background: '#fafafa', fontSize: 11, color: '#52525b' }}
            >
              <div style={{ fontWeight: 800, color: '#18181b' }}>{event.duration}</div>
              <div>m{event.measure} beat {event.beat.toFixed(3)}</div>
              <div>{formatTick(event.startTick)} → {formatTick(event.endTick)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
