import React, { useMemo, useState } from 'react'
import {
  createEqualDivisionTree,
  createNestedNineletTree,
  createQuarterDivisionTree,
  createRatioTree,
  describeRhythmTree,
  flattenRhythmTree,
  type RhythmTree,
} from './RhythmTree'

type RhythmTreePreset = 'quarters' | 'eighths' | 'triplets' | 'quintuplets' | 'septuplets' | 'ninelets'

function buildPresetTree(preset: RhythmTreePreset): RhythmTree {
  if (preset === 'eighths') return createEqualDivisionTree(8, 'eighth')
  if (preset === 'triplets') return createRatioTree(3, 2, 'triplet-3:2')
  if (preset === 'quintuplets') return createRatioTree(5, 4, 'quintuplet-5:4')
  if (preset === 'septuplets') return createRatioTree(7, 4, 'septuplet-7:4')
  if (preset === 'ninelets') return createNestedNineletTree()
  return createQuarterDivisionTree()
}

function formatRatio(value: number): string {
  return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
}

export default function RhythmTreeDebugPanel() {
  const [preset, setPreset] = useState<RhythmTreePreset>('quarters')
  const tree = useMemo(() => buildPresetTree(preset), [preset])
  const leaves = useMemo(() => flattenRhythmTree(tree), [tree])

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#18181b', textTransform: 'uppercase' }}>
            RhythmTree Debug
          </div>
          <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>
            {describeRhythmTree(tree)}
          </div>
        </div>

        <select
          value={preset}
          onChange={(event) => setPreset(event.target.value as RhythmTreePreset)}
          style={{
            border: '1px solid #d4d4d8',
            borderRadius: 10,
            padding: '7px 10px',
            background: '#fafafa',
            fontSize: 13,
          }}
        >
          <option value="quarters">Quarters</option>
          <option value="eighths">Eighths</option>
          <option value="triplets">Triplets 3:2</option>
          <option value="quintuplets">Quintuplets 5:4</option>
          <option value="septuplets">Septuplets 7:4</option>
          <option value="ninelets">Nested Ninelets</option>
        </select>
      </div>

      <div style={{ padding: 14 }}>
        <div
          style={{
            position: 'relative',
            height: 76,
            border: '1px solid #e4e4e7',
            borderRadius: 12,
            background: 'linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 37,
              height: 1,
              background: '#d4d4d8',
            }}
          />

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <div
              key={`pulse-${ratio}`}
              style={{
                position: 'absolute',
                left: `${ratio * 100}%`,
                top: 0,
                bottom: 0,
                width: 1,
                background: '#cbd5e1',
              }}
            >
              <div style={{ fontSize: 10, color: '#64748b', marginLeft: 4, marginTop: 4 }}>
                {formatRatio(ratio)}
              </div>
            </div>
          ))}

          {leaves.map((leaf, index) => {
            const left = leaf.startRatio * 100
            const width = Math.max(0.8, leaf.durationRatio * 100)

            return (
              <div
                key={leaf.id}
                title={`${leaf.id}: ${formatRatio(leaf.startRatio)} → ${formatRatio(leaf.endRatio)}`}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  top: 24,
                  width: `${width}%`,
                  minWidth: 8,
                  height: 28,
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
        </div>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          {leaves.map((leaf, index) => (
            <div
              key={`cell-${leaf.id}`}
              style={{
                border: '1px solid #e4e4e7',
                borderRadius: 10,
                padding: 8,
                background: '#fafafa',
                fontSize: 11,
                color: '#52525b',
              }}
            >
              <div style={{ fontWeight: 800, color: '#18181b' }}>Event {index + 1}</div>
              <div>{formatRatio(leaf.startRatio)} → {formatRatio(leaf.endRatio)}</div>
              <div>dur {formatRatio(leaf.durationRatio)}</div>
              {leaf.ratio ? <div>{leaf.ratio.label}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
