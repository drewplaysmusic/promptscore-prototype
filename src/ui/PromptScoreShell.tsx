import React, { useState } from 'react'
import ScoreRenderer from './ScoreRenderer'
import { generateMusicBrainResult } from './musicBrain'

// ... rest unchanged until handler

function handlePromptGenerate() {
  const result = generateMusicBrainResult(promptText, {
    duration: selectedDuration,
    accidental: selectedAccidental,
    timeSignature,
  })

  setNotes(result.notes)
  setTimeSignature(result.timeSignature)
  setCurrentMeasure(1)
  setCurrentBeat(1)
  setPromptText('')

  console.log(result.summary)
}

// rest of file remains same