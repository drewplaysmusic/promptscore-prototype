export type RhythmNodeType = 'measure' | 'division' | 'note'

export type RhythmRatio = {
  actual: number
  normal: number
  label: string
}

export type RhythmNode = {
  id: string
  type: RhythmNodeType
  startRatio: number
  endRatio: number
  durationRatio: number
  ratio?: RhythmRatio
  children?: RhythmNode[]
}

export type RhythmTree = {
  measureCount: number
  root: RhythmNode
}

function createId(prefix: string, index: number): string {
  return `${prefix}-${index}`
}

function createRhythmNode({
  id,
  type,
  startRatio,
  endRatio,
  ratio,
  children,
}: {
  id: string
  type: RhythmNodeType
  startRatio: number
  endRatio: number
  ratio?: RhythmRatio
  children?: RhythmNode[]
}): RhythmNode {
  return {
    id,
    type,
    startRatio,
    endRatio,
    durationRatio: endRatio - startRatio,
    ratio,
    children,
  }
}

export function createEmptyMeasureTree(): RhythmTree {
  return {
    measureCount: 1,
    root: createRhythmNode({
      id: 'measure-1',
      type: 'measure',
      startRatio: 0,
      endRatio: 1,
      children: [],
    }),
  }
}

export function createEqualDivisionTree(divisions: number, label = 'division'): RhythmTree {
  const safeDivisions = Math.max(1, divisions)
  const divisionSize = 1 / safeDivisions

  const children = Array.from({ length: safeDivisions }, (_, index) => {
    const startRatio = index * divisionSize
    const endRatio = startRatio + divisionSize

    return createRhythmNode({
      id: createId(label, index + 1),
      type: 'note',
      startRatio,
      endRatio,
    })
  })

  return {
    measureCount: 1,
    root: createRhythmNode({
      id: 'measure-1',
      type: 'measure',
      startRatio: 0,
      endRatio: 1,
      children,
    }),
  }
}

export function createQuarterDivisionTree(): RhythmTree {
  return createEqualDivisionTree(4, 'quarter')
}

export function createRatioTree(actual: number, normal: number, label = `${actual}:${normal}`): RhythmTree {
  const safeActual = Math.max(1, actual)
  const ratio: RhythmRatio = {
    actual: safeActual,
    normal: Math.max(1, normal),
    label,
  }
  const divisionSize = 1 / safeActual

  const children = Array.from({ length: safeActual }, (_, index) => {
    const startRatio = index * divisionSize
    const endRatio = startRatio + divisionSize

    return createRhythmNode({
      id: `${label}-note-${index + 1}`,
      type: 'note',
      startRatio,
      endRatio,
      ratio,
    })
  })

  return {
    measureCount: 1,
    root: createRhythmNode({
      id: 'measure-1',
      type: 'measure',
      startRatio: 0,
      endRatio: 1,
      children,
    }),
  }
}

export function createRepeatedRatioTree({
  actual,
  normal,
  repeatCount = 4,
  label = `${actual}:${normal}`,
}: {
  actual: number
  normal: number
  repeatCount?: number
  label?: string
}): RhythmTree {
  const safeActual = Math.max(1, actual)
  const safeRepeatCount = Math.max(1, repeatCount)
  const ratio: RhythmRatio = {
    actual: safeActual,
    normal: Math.max(1, normal),
    label,
  }
  const regionSize = 1 / safeRepeatCount

  const children = Array.from({ length: safeRepeatCount }, (_, regionIndex) => {
    const regionStart = regionIndex * regionSize
    const regionEnd = regionStart + regionSize
    const noteSize = regionSize / safeActual

    const regionChildren = Array.from({ length: safeActual }, (_, noteIndex) => {
      const startRatio = regionStart + noteIndex * noteSize
      const endRatio = startRatio + noteSize

      return createRhythmNode({
        id: `${label}-beat-${regionIndex + 1}-note-${noteIndex + 1}`,
        type: 'note',
        startRatio,
        endRatio,
        ratio,
      })
    })

    return createRhythmNode({
      id: `${label}-beat-${regionIndex + 1}`,
      type: 'division',
      startRatio: regionStart,
      endRatio: regionEnd,
      ratio,
      children: regionChildren,
    })
  })

  return {
    measureCount: 1,
    root: createRhythmNode({
      id: 'measure-1',
      type: 'measure',
      startRatio: 0,
      endRatio: 1,
      children,
    }),
  }
}

export function createTripletTree(): RhythmTree {
  return createRepeatedRatioTree({ actual: 3, normal: 2, repeatCount: 4, label: 'triplet-3:2' })
}

export function createNestedRatioTree({
  outerActual,
  outerNormal,
  innerActual,
  innerNormal,
}: {
  outerActual: number
  outerNormal: number
  innerActual: number
  innerNormal: number
}): RhythmTree {
  const safeOuterActual = Math.max(1, outerActual)
  const safeInnerActual = Math.max(1, innerActual)
  const outerRatio: RhythmRatio = {
    actual: safeOuterActual,
    normal: Math.max(1, outerNormal),
    label: `${safeOuterActual}:${Math.max(1, outerNormal)}`,
  }
  const innerRatio: RhythmRatio = {
    actual: safeInnerActual,
    normal: Math.max(1, innerNormal),
    label: `${safeInnerActual}:${Math.max(1, innerNormal)}`,
  }

  const outerSize = 1 / safeOuterActual

  const outerChildren = Array.from({ length: safeOuterActual }, (_, outerIndex) => {
    const outerStart = outerIndex * outerSize
    const outerEnd = outerStart + outerSize
    const innerSize = outerSize / safeInnerActual

    const innerChildren = Array.from({ length: safeInnerActual }, (_, innerIndex) => {
      const innerStart = outerStart + innerIndex * innerSize
      const innerEnd = innerStart + innerSize

      return createRhythmNode({
        id: `nested-${outerIndex + 1}-${innerIndex + 1}`,
        type: 'note',
        startRatio: innerStart,
        endRatio: innerEnd,
        ratio: innerRatio,
      })
    })

    return createRhythmNode({
      id: `outer-${outerRatio.label}-${outerIndex + 1}`,
      type: 'division',
      startRatio: outerStart,
      endRatio: outerEnd,
      ratio: outerRatio,
      children: innerChildren,
    })
  })

  return {
    measureCount: 1,
    root: createRhythmNode({
      id: 'measure-1',
      type: 'measure',
      startRatio: 0,
      endRatio: 1,
      children: outerChildren,
    }),
  }
}

export function createNestedNineletTree(): RhythmTree {
  return createNestedRatioTree({
    outerActual: 3,
    outerNormal: 2,
    innerActual: 3,
    innerNormal: 1,
  })
}

export function flattenRhythmTree(tree: RhythmTree): RhythmNode[] {
  const leaves: RhythmNode[] = []

  function visit(node: RhythmNode) {
    if (!node.children || node.children.length === 0) {
      if (node.type === 'note') leaves.push(node)
      return
    }

    node.children.forEach(visit)
  }

  visit(tree.root)
  return leaves
}

export function describeRhythmTree(tree: RhythmTree): string {
  const leaves = flattenRhythmTree(tree)
  return `${tree.root.id}: ${leaves.length} playable rhythm event(s) from ${tree.root.startRatio} to ${tree.root.endRatio}.`
}
