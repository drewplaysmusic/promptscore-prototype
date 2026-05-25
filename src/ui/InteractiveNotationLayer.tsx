import React, { useMemo, useState } from 'react'
import type { MusicMaskOutput } from '../music/MusicIntelligenceLayer'
import type { RenderCoordinate } from './VexFlowCoordinateBridge'

export type InteractiveNotationSelection = {
  coordinateId: string
  measure: number
  beat?: number
  label: string
}

function buildTooltipContent({
  coordinate,
  outputs,
}: {
  coordinate: RenderCoordinate
  outputs: MusicMaskOutput[]
}) {
  const relatedOutputs = outputs.filter((output) => {
    return output.anchor.measure === coordinate.measure
      && (output.anchor.beat === undefined || output.anchor.beat === coordinate.beat)
  })

  return {
    title: `Measure ${coordinate.measure}${coordinate.beat ? ` · Beat ${coordinate.beat}` : ''}`,
    outputs: relatedOutputs,
  }
}

export default function InteractiveNotationLayer({
  coordinates,
  outputs,
}: {
  coordinates: RenderCoordinate[]
  outputs: MusicMaskOutput[]
}) {
  const [hoveredCoordinateId, setHoveredCoordinateId] = useState<string | null>(null)
  const [selectedCoordinate, setSelectedCoordinate] = useState<InteractiveNotationSelection | null>(null)

  const hoveredCoordinate = useMemo(() => {
    return coordinates.find((coordinate) => coordinate.id === hoveredCoordinateId)
  }, [coordinates, hoveredCoordinateId])

  const tooltip = useMemo(() => {
    if (!hoveredCoordinate) return null

    return buildTooltipContent({
      coordinate: hoveredCoordinate,
      outputs,
    })
  }, [hoveredCoordinate, outputs])

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 320 }}>
      <div
        style={{
          position: 'relative',
          border: '1px solid #d4d4d8',
          borderRadius: 18,
          background: '#ffffff',
          overflow: 'hidden',
          minHeight: 320,
        }}
      >
        <div style={{ padding: 18, borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', color: '#71717a', marginBottom: 4 }}>
            Interactive Notation Layer
          </div>

          <div style={{ fontSize: 13, color: '#52525b' }}>
            Hover and click notation space to inspect active musical cognition masks.
          </div>
        </div>

        <div style={{ position: 'relative', height: 250 }}>
          {[1, 2].map((staff) => (
            <div
              key={staff}
              style={{
                position: 'absolute',
                left: 24,
                right: 24,
                top: 40 + (staff - 1) * 110,
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

          {coordinates.map((coordinate) => {
            const isHovered = hoveredCoordinateId === coordinate.id
            const isSelected = selectedCoordinate?.coordinateId === coordinate.id

            return (
              <button
                key={coordinate.id}
                type="button"
                onMouseEnter={() => setHoveredCoordinateId(coordinate.id)}
                onMouseLeave={() => setHoveredCoordinateId(null)}
                onClick={() => setSelectedCoordinate({
                  coordinateId: coordinate.id,
                  measure: coordinate.measure,
                  beat: coordinate.beat,
                  label: `Measure ${coordinate.measure}${coordinate.beat ? ` · Beat ${coordinate.beat}` : ''}`,
                })}
                style={{
                  position: 'absolute',
                  left: coordinate.x,
                  top: coordinate.y,
                  width: coordinate.width,
                  height: coordinate.height,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  border: isSelected
                    ? '2px solid #7c3aed'
                    : isHovered
                      ? '2px solid #2563eb'
                      : '1px solid #111827',
                  background: isSelected
                    ? '#ede9fe'
                    : isHovered
                      ? '#dbeafe'
                      : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              />
            )
          })}

          {tooltip && hoveredCoordinate ? (
            <div
              style={{
                position: 'absolute',
                left: hoveredCoordinate.x + 20,
                top: hoveredCoordinate.y - 18,
                borderRadius: 14,
                background: '#111827',
                color: '#ffffff',
                padding: 12,
                width: 220,
                boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
                pointerEvents: 'none',
                zIndex: 40,
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 8 }}>
                {tooltip.title}
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                {tooltip.outputs.length > 0 ? tooltip.outputs.map((output) => (
                  <div
                    key={output.id}
                    style={{
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.08)',
                      padding: '6px 8px',
                    }}
                  >
                    <div style={{ fontSize: 11, opacity: 0.72, marginBottom: 2 }}>
                      {output.brainId}
                    </div>

                    <div style={{ fontWeight: 700 }}>
                      {output.label}: {output.value}
                    </div>
                  </div>
                )) : (
                  <div style={{ opacity: 0.7, fontSize: 13 }}>
                    No active masks attached.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {selectedCoordinate ? (
        <div
          style={{
            marginTop: 16,
            border: '1px solid #d4d4d8',
            borderRadius: 16,
            background: '#ffffff',
            padding: 16,
            display: 'grid',
            gap: 10,
          }}
        >
          <div style={{ fontWeight: 800 }}>
            Selected Musical Space
          </div>

          <div style={{ color: '#52525b' }}>
            {selectedCoordinate.label}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {outputs
              .filter((output) => output.anchor.measure === selectedCoordinate.measure)
              .map((output) => (
                <div
                  key={output.id}
                  style={{
                    borderRadius: 999,
                    border: '1px solid #d4d4d8',
                    background: '#fafafa',
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
  )
}
