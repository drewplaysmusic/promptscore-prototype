import React, { useEffect, useMemo, useState } from 'react'
import type { MusicMaskOutput } from '../music/MusicIntelligenceLayer'
import type { RenderCoordinate } from './VexFlowCoordinateBridge'

export type PlaybackCognitionEvent = {
  measure: number
  beat: number
  durationMs?: number
}

function getOutputsForCoordinate({
  coordinate,
  outputs,
}: {
  coordinate: RenderCoordinate
  outputs: MusicMaskOutput[]
}) {
  return outputs.filter((output) => {
    return output.anchor.measure === coordinate.measure
      && (output.anchor.beat === undefined || output.anchor.beat === coordinate.beat)
  })
}

export default function AnimatedPlaybackCognitionLayer({
  coordinates,
  outputs,
  isPlaying = true,
  bpm = 90,
}: {
  coordinates: RenderCoordinate[]
  outputs: MusicMaskOutput[]
  isPlaying?: boolean
  bpm?: number
}) {
  const orderedCoordinates = useMemo(() => {
    return coordinates
      .slice()
      .sort((a, b) => {
        if (a.measure !== b.measure) {
          return a.measure - b.measure
        }

        return (a.beat ?? 1) - (b.beat ?? 1)
      })
  }, [coordinates])

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!isPlaying || orderedCoordinates.length === 0) {
      return undefined
    }

    const beatDuration = (60 / bpm) * 1000

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        return (current + 1) % orderedCoordinates.length
      })
    }, beatDuration)

    return () => {
      window.clearInterval(interval)
    }
  }, [isPlaying, bpm, orderedCoordinates.length])

  const activeCoordinate = orderedCoordinates[activeIndex]

  return (
    <div style={{ border: '1px solid #d4d4d8', borderRadius: 18, background: '#ffffff', overflow: 'hidden' }}>
      <div style={{ padding: 18, borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#71717a', marginBottom: 4 }}>
          Animated Playback Cognition
        </div>

        <div style={{ fontSize: 13, color: '#52525b' }}>
          Playback-synchronized cognition masks, pulse tracking, and educational timing guidance.
        </div>
      </div>

      <div style={{ padding: 18, display: 'grid', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: isPlaying ? '#22c55e' : '#9ca3af',
                boxShadow: isPlaying ? '0 0 12px rgba(34,197,94,0.6)' : 'none',
              }}
            />

            <div style={{ fontWeight: 700 }}>
              {isPlaying ? 'Playback Active' : 'Playback Paused'}
            </div>
          </div>

          <div style={{ borderRadius: 999, border: '1px solid #d4d4d8', background: '#fafafa', padding: '6px 10px', fontSize: 13, fontWeight: 700 }}>
            {bpm} BPM
          </div>
        </div>

        <div style={{ position: 'relative', height: 260, borderRadius: 16, background: '#fcfcfd', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {[1, 2].map((staff) => (
            <div
              key={staff}
              style={{
                position: 'absolute',
                left: 24,
                right: 24,
                top: 48 + (staff - 1) * 110,
                height: 60,
              }}
            >
              {[0, 1, 2, 3, 4].map((line) => (
                <div
                  key={line}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: line * 12,
                    height: 1,
                    background: '#9ca3af',
                  }}
                />
              ))}
            </div>
          ))}

          {orderedCoordinates.map((coordinate, index) => {
            const active = index === activeIndex
            const relatedOutputs = getOutputsForCoordinate({
              coordinate,
              outputs,
            })

            return (
              <div key={coordinate.id}>
                <div
                  style={{
                    position: 'absolute',
                    left: coordinate.x,
                    top: coordinate.y,
                    width: active ? coordinate.width + 14 : coordinate.width,
                    height: active ? coordinate.height + 14 : coordinate.height,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    border: active
                      ? '3px solid #2563eb'
                      : '1px solid #111827',
                    background: active
                      ? '#dbeafe'
                      : '#ffffff',
                    boxShadow: active
                      ? '0 0 24px rgba(37,99,235,0.45)'
                      : 'none',
                    transition: 'all 120ms linear',
                    zIndex: active ? 30 : 10,
                  }}
                />

                {active && relatedOutputs.length > 0 ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: coordinate.x,
                      top: coordinate.y - 54,
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      zIndex: 40,
                    }}
                  >
                    {relatedOutputs.map((output) => (
                      <div
                        key={output.id}
                        style={{
                          borderRadius: 999,
                          background: '#111827',
                          color: '#ffffff',
                          padding: '5px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                        }}
                      >
                        {output.value}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        {activeCoordinate ? (
          <div style={{ borderRadius: 14, border: '1px solid #d4d4d8', background: '#fafafa', padding: 14, display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 800 }}>
              Active Playback Position
            </div>

            <div style={{ color: '#52525b' }}>
              Measure {activeCoordinate.measure} · Beat {activeCoordinate.beat ?? '-'}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {getOutputsForCoordinate({ coordinate: activeCoordinate, outputs }).map((output) => (
                <div
                  key={output.id}
                  style={{
                    borderRadius: 999,
                    border: '1px solid #d4d4d8',
                    background: '#ffffff',
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {output.label}: {output.value}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
