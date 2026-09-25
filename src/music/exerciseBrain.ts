import { getDiatonicScalePitches, parsePitchText, type PitchValue as EnginePitch, type ScaleMode } from './PitchEngine'

export type DurationValue = 'Whole' | 'Half' | 'Quarter' | 'Eighth' | '16th'
export type AccidentalValue = 'Sharp' | 'Flat' | 'Natural' | null
export type PitchValue = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type TimeSignatureValue = '4/4' | '3/4' | '2/4' | '6/8'
export type ExerciseNoteEvent = { duration:DurationValue; accidental:AccidentalValue; isRest:boolean; pitch:PitchValue; octave?:number; measure:number; beat:number }
export type ScaleExerciseResult = { notes:ExerciseNoteEvent[]; timeSignature:TimeSignatureValue; summary:string }

type ScaleSystemValue = ScaleMode | 'ionian'
function normalizePrompt(p:string){ return p.toLowerCase().replace(/[,.;:]/g,' ') }
function detectRoot(prompt:string): EnginePitch {
  const normalized=prompt.replace(/([a-g])\s*-?\s*flat/ig,'$1b').replace(/([a-g])\s*-?\s*sharp/ig,'$1#')
  const m=normalized.match(/\b([a-g])\s*([#b])?\s+(?:major|minor|ionian|dorian|phrygian|lydian|mixolydian|aeolian|locrian|harmonic minor|melodic minor|scale)\b/)
  return parsePitchText(m ? `${m[1]}${m[2]||''}` : 'C',4) || {step:'C',accidental:null,octave:4}
}
function detectScaleSystem(p:string):ScaleSystemValue {
  if(p.includes('harmonic minor'))return 'harmonic minor'; if(p.includes('melodic minor'))return 'melodic minor'
  if(p.includes('ionian'))return 'ionian'; if(p.includes('dorian'))return 'dorian'; if(p.includes('phrygian'))return 'phrygian'
  if(p.includes('lydian'))return 'lydian'; if(p.includes('mixolydian'))return 'mixolydian'; if(p.includes('aeolian'))return 'aeolian'; if(p.includes('locrian'))return 'locrian'
  if(p.includes('minor'))return 'natural minor'; return 'major'
}
function detectDuration(p:string):DurationValue { if(p.includes('whole note'))return 'Whole'; if(p.includes('half note'))return 'Half'; if(p.includes('sixteenth')||p.includes('16th'))return '16th'; if(p.includes('eighth')||p.includes('8th'))return 'Eighth'; return 'Quarter' }
function beats(d:DurationValue){return d==='Whole'?4:d==='Half'?2:d==='Quarter'?1:d==='Eighth'?.5:.25}
function meter(p:string):TimeSignatureValue{return p.includes('6/8')?'6/8':p.includes('3/4')?'3/4':p.includes('2/4')?'2/4':'4/4'}
function measureBeats(t:TimeSignatureValue){return t==='3/4'?3:t==='2/4'?2:t==='6/8'?3:4}
function displayRoot(r:EnginePitch){return r.step+(r.accidental==='Sharp'?'#':r.accidental==='Flat'?'b':'')}
function pattern(scale:EnginePitch[],p:string){
  const base=[...scale,{...scale[0],octave:scale[0].octave+1}]
  if(p.includes('thirds')||p.includes('3rds')){const x:EnginePitch[]=[];for(let i=0;i<base.length-2;i++)x.push(base[i],base[i+2]);return x}
  if(p.includes('up and down')||p.includes('ascending and descending'))return [...base,...base.slice(0,-1).reverse()]
  if(p.includes('descending'))return [...base].reverse(); return base
}
function place(xs:EnginePitch[],duration:DurationValue,t:TimeSignatureValue):ExerciseNoteEvent[]{
  const max=measureBeats(t), step=beats(duration); let measure=1,beat=1
  return xs.map(x=>{if(beat+step>max+1){measure++;beat=1} const n={duration,accidental:x.accidental,isRest:false,pitch:x.step,octave:x.octave,measure,beat} as ExerciseNoteEvent; beat+=step;if(beat>=max+1){measure++;beat=1}return n})
}
export function isScaleExercisePrompt(text:string){const p=normalizePrompt(text);return p.includes('scale')||p.includes('thirds')||p.includes('3rds')||/\b(ionian|dorian|phrygian|lydian|mixolydian|aeolian|locrian)\b/.test(p)}
export function generateScaleExercise(text:string):ScaleExerciseResult{
  const p=normalizePrompt(text), root=detectRoot(p), system=detectScaleSystem(p), duration=detectDuration(p), timeSignature=meter(p)
  const mode:ScaleMode=system==='ionian'?'major':system
  const scale=getDiatonicScalePitches(root,mode,1), notes=place(pattern(scale,p),duration,timeSignature)
  return {notes,timeSignature,summary:`Generated ${displayRoot(root)} ${system} scale exercise using ${duration.toLowerCase()} notes.`}
}
