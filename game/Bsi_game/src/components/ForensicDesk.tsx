import { useEffect, useMemo, useState, type DragEvent } from 'react'
import { ArrowLeft, Archive, Calculator, Check, FileSearch, FileText, LockKeyhole, Settings2, Shield, X } from 'lucide-react'
import { cases } from '../data/cases'
import { useGame } from '../context/GameContext'
import SettingsModal from './SettingsModal'
import { audioEngine } from '../utils/audioEngine'

type DocumentId = 'compliance' | 'calibration' | 'telemetry'
type EvidenceId = 'mu0' | 'alpha' | 'sigma' | 'n'
type Chip = { id: string; label: string; value: number; source: 'evidence' | 'calculator'; role?: EvidenceId | 'mean' | 'sqrtN' }

const rawTelemetry = [48.8,49.3,49.0,49.2,49.1,49.0,49.2,48.9,49.3,49.1,49.2,49.0,49.1,48.8,49.3,49.2,49.0,49.1,48.9,49.3,49.0,49.2,49.1,48.9,49.3,49.0,49.2,49.1,49.0,49.3,49.1,48.9,49.2,49.0,49.3,49.2]
const evidenceMeta: Record<EvidenceId, { label: string; value: number; display: string }> = {
  mu0: { label: 'Claimed Mean (μ₀)', value: 50, display: '50.0 mg' },
  alpha: { label: 'Significance Level (α)', value: 0.05, display: '0.05' },
  sigma: { label: 'Population SD (σ)', value: 2, display: '2.0 mg · KNOWN' },
  n: { label: 'Sample Count (n)', value: 36, display: '36 vials' },
}
const documents: Record<DocumentId, { title: string; stamp: string; text: string }> = {
  compliance: { title: 'Aurelia Pharma Compliance Dossier', stamp: 'AURELIA PHARMA // COMPLIANCE RECORD 88-A', text: 'The company calls every vial a fifty-milligram promise. A promise is only paper until the evidence survives the light.' },
  calibration: { title: 'Factory Calibration Logbook', stamp: 'BOTTLING LINE // HISTORICAL CALIBRATION', text: 'The active production line has a documented population spread. It is not a sample estimate; the factory history names the true sigma.' },
  telemetry: { title: 'Morgue Seized Vial Telemetry', stamp: 'BATCH #409 // MASS-SPEC TELEMETRY', text: 'Thirty-six seized vials. The lab gave us readings and a total, not a verdict. The batch mean is yours to calculate.' },
}
const nearly = (value: number, target: number) => Math.abs(value - target) < 0.001

function ForensicDesk() {
  const { game, settings, updateGame } = useGame()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [archivesOpen, setArchivesOpen] = useState(false)
  const [openDocument, setOpenDocument] = useState<DocumentId | null>(null)
  const [pinned, setPinned] = useState<EvidenceId[]>([])
  const [display, setDisplay] = useState('0')
  const [lastResult, setLastResult] = useState<number | null>(null)
  const [sumMode, setSumMode] = useState(false)
  const [sumCount, setSumCount] = useState(36)
  const [calculatorChips, setCalculatorChips] = useState<Chip[]>([])
  const [selectedChip, setSelectedChip] = useState<string | null>(null)
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null])
  const [h0Parameter, setH0Parameter] = useState('μ')
  const [haParameter, setHaParameter] = useState('μ')
  const [tail, setTail] = useState('<')
  const [instrument, setInstrument] = useState('')
  const [hypothesisLocked, setHypothesisLocked] = useState(false)
  const [instrumentLocked, setInstrumentLocked] = useState(false)
  const [formulaSolved, setFormulaSolved] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [mistake, setMistake] = useState(false)

  const baselineReady = pinned.length === 4
  const caseFile = cases[0]
  const sampleMeanChip = calculatorChips.find(chip => chip.role === 'mean')
  const stage = !baselineReady ? 1 : !hypothesisLocked ? 2 : !instrumentLocked ? 3 : 4
  const objective = stage === 1 ? 'Inspect the raw files. Pin baseline facts and calculate the missing sample mean.' : stage === 2 ? 'State the allegation: an under-dosed batch, tested on the left tail.' : stage === 3 ? 'Choose the instrument justified by known population sigma.' : formulaSolved ? 'The statistic is locked. The oscilloscope is ready for Bell-Curve analysis.' : 'Assemble the Z-statistic from the evidence tray. Preserve the sign of the deficit.'
  const rookieGuidance = stage === 1
    ? { title: 'READING THE EVIDENCE', text: 'Open each file and drag its clue into the matching tray slot. μ₀ is the claimed average (50.0 mg); σ is the known population spread (2.0 mg); n is the vial count (36). α = 0.05 is the Type I error limit. Calculate x̄: total all 36 readings with Σ, then divide by 36.' }
    : stage === 2
      ? { title: 'BUILDING THE HYPOTHESES', text: 'H₀ is the starting claim: μ = 50.0 mg. The suspected crime is under-dosing, so Hₐ is μ < 50.0 mg. The “less than” sign makes this a left-tailed test.' }
      : stage === 3
        ? { title: 'CHOOSING THE TEST', text: 'Use a 1-sample Z-test when the population standard deviation σ is known. Use a t-test when σ is unknown and you only have sample s. A proportion Z-test is for binary outcomes such as pass/fail.' }
        : { title: 'ASSEMBLING THE Z-STATISTIC', text: 'Z = (x̄ − μ₀) / (σ / √n). Put the observed mean first, then the claimed mean; 49.1 − 50.0 must stay negative. The denominator is the standard error: 2.0 / √36 = 0.3333. α is not part of this formula.' }
  const evidenceChips = pinned.map((key): Chip => ({ id: key, label: `${evidenceMeta[key].display} · ${key === 'mu0' ? 'μ₀' : key === 'sigma' ? 'σ' : key}`, value: evidenceMeta[key].value, source: 'evidence', role: key }))
  const allChips = [...evidenceChips, ...calculatorChips]
  const chipById = (id: string | null) => allChips.find(chip => chip.id === id)
  const slotValue = (index: number) => {
    const chip = chipById(slots[index])
    if (!chip) return ''
    if (chip.role === 'mean' || chip.role === 'mu0' || chip.role === 'sigma') return chip.value.toFixed(1)
    return Number(chip.value.toFixed(4)).toString()
  }
  const slotMatches = (index: number) => {
    const role = chipById(slots[index])?.role
    return index === 0 ? role === 'mean' : index === 1 ? role === 'mu0' : index === 2 ? role === 'sigma' : role === 'n' || role === 'sqrtN'
  }
  const formulaSlot = (index: number, symbol: string, ariaLabel: string) => <button className={`formula-slot-button ${slotMatches(index) ? 'matched' : ''}`} aria-label={ariaLabel} onClick={() => fillSlot(index)} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy' }} onDrop={event => { event.preventDefault(); const chipId = event.dataTransfer.getData('text/bsi-chip'); if (chipId) fillSlot(index, chipId) }}>{slotMatches(index) ? slotValue(index) : chipById(slots[index]) ? <><small>{symbol}</small><span>{slotValue(index)}</span></> : symbol}</button>

  const penalize = (message: string) => {
    updateGame({ credibility: Math.max(0, game.credibility - 15) })
    setFeedback(message); setMistake(true); audioEngine.play('thunder')
    window.setTimeout(() => setMistake(false), 650)
  }
  const pinEvidence = (key: EvidenceId) => { setPinned(current => current.includes(key) ? current : [...current, key]); audioEngine.play('typewriter') }
  const beginEvidenceDrag = (event: DragEvent<HTMLElement>, key: EvidenceId) => {
    event.dataTransfer.setData('text/bsi-evidence', key)
    event.dataTransfer.effectAllowed = 'copy'
    audioEngine.play('paper')
  }
  const dropEvidence = (event: DragEvent<HTMLElement>, key: EvidenceId) => {
    event.preventDefault()
    const received = event.dataTransfer.getData('text/bsi-evidence') as EvidenceId
    if (received === key) { pinEvidence(key); setFeedback(`${evidenceMeta[key].label.toUpperCase()} SECURED IN THE EVIDENCE TRAY.`); return }
    if (received) penalize(`That evidence slip does not belong in the ${evidenceMeta[key].label} slot. Keep the chain of evidence intact.`)
  }
  const insertCalculator = (value: string) => {
    const token = value === '−' ? '-' : value
    setDisplay(current => current === 'ERROR' || (current === '0' && /^[0-9.]$/.test(token)) ? token : `${current === '0' && token !== '-' ? '' : current}${token}`)
    setLastResult(null)
    audioEngine.play('click')
  }
  const backspaceCalculator = () => { setDisplay(current => current === 'ERROR' || current.length <= 1 ? '0' : current.slice(0, -1)); setLastResult(null); audioEngine.play('click') }
  const toggleSumMode = () => { setSumMode(current => !current); setLastResult(null); setDisplay('0'); audioEngine.play('click') }
  const evaluateCalculator = () => {
    try {
      if (sumMode) {
        const total = rawTelemetry.slice(0, sumCount).reduce((sum, reading) => sum + reading, 0)
        const roundedTotal = Math.round(total * 10) / 10
        setDisplay(String(roundedTotal)); setLastResult(roundedTotal); setSumMode(false); audioEngine.play('scanner'); return
      }
      let expression = display.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/√\(/g, 'Math.sqrt(').replace(/²/g, '**2')
      const openParentheses = (expression.match(/\(/g) ?? []).length
      const closeParentheses = (expression.match(/\)/g) ?? []).length
      if (closeParentheses > openParentheses) throw new Error('Unmatched closing parenthesis')
      expression += ')'.repeat(openParentheses - closeParentheses)
      if (!/^[0-9+\-*/().\sMathsqrt]+$/.test(expression)) throw new Error('Invalid')
      const result = Function(`"use strict"; return (${expression})`)()
      if (!Number.isFinite(result)) throw new Error('Invalid')
      const rounded = Math.round(result * 10000) / 10000
      setDisplay(String(rounded)); setLastResult(rounded); audioEngine.play('scanner')
    } catch { setDisplay('ERROR'); setLastResult(null); audioEngine.play('thunder') }
  }
  const saveCalculatorResult = () => {
    if (lastResult === null) { setFeedback('THE CALCULATOR HAS NO VERIFIED RESULT TO BAG AS EVIDENCE.'); return }
    const role = nearly(lastResult, 49.1) ? 'mean' : nearly(lastResult, 6) ? 'sqrtN' : undefined
    const label = role === 'mean' ? '49.1 mg · calculated x̄' : role === 'sqrtN' ? '6 · calculated √n' : `${lastResult} · calculator result`
    setCalculatorChips(current => current.some(chip => nearly(chip.value, lastResult) && chip.role === role) ? current : [...current, { id: `calc-${lastResult}-${role ?? current.length}`, label, value: lastResult, source: 'calculator', role }])
    setFeedback(role === 'mean' ? 'SAMPLE MEAN VERIFIED // x̄ = 49.1 MG. THE RESULT IS NOW IN THE EVIDENCE TRAY.' : 'CALCULATOR RESULT BAGGED AS EVIDENCE. PLACE IT ONLY WHERE THE FORMULA CALLS FOR IT.')
    audioEngine.play('stamp')
  }
  const lockHypothesis = () => {
    if (!sampleMeanChip) { setFeedback('YOU STILL NEED THE SAMPLE MEAN (x̄). USE THE DESK CALCULATOR: Σx 1767.6 ÷ n 36.'); return }
    if (h0Parameter !== 'μ' || haParameter !== 'μ' || tail !== '<') { penalize('The seized batch averages below Aurelia’s claim. The allegation is a deficit: Hₐ must be μ < 50.0 mg, on the left tail.'); return }
    setHypothesisLocked(true); setFeedback('HYPOTHESIS LOCKED // H₀: μ = 50.0 MG  ·  Hₐ: μ < 50.0 MG'); audioEngine.play('scanner')
  }
  const lockInstrument = () => {
    if (instrument !== 'z') { penalize('The factory log gives the population sigma: σ = 2.0 mg. This is a 1-sample Z-test, not a t-test or a proportion test.'); return }
    setInstrumentLocked(true); setFeedback('INSTRUMENT LOCKED // 1-SAMPLE LEFT-TAILED Z-TEST'); audioEngine.play('stamp')
  }
  const fillSlot = (slot: number, chipId = selectedChip) => {
    const chip = chipById(chipId)
    if (!chip) { setFeedback('SELECT A CHIP FROM THE EVIDENCE TRAY, THEN PLACE IT IN A FORMULA SLOT.'); return }
    const next = slots.map((value, index) => index === slot ? chip.id : value)
    const first = chipById(next[0]); const second = chipById(next[1])
    if (first?.role === 'mu0' && second?.role === 'mean') {
      penalize('Hold it. You reversed the subtraction: μ₀ − x̄ turns an under-dose into a positive statistic. The numerator is always x̄ − μ₀.')
      setSlots([null, null, next[2], next[3]]); return
    }
    setSlots(next); audioEngine.play('typewriter')
  }
  useEffect(() => {
    if (!instrumentLocked || formulaSolved) return
    const chosen = slots.map(chipById)
    const correct = chosen[0]?.role === 'mean' && chosen[1]?.role === 'mu0' && chosen[2]?.role === 'sigma' && (chosen[3]?.role === 'n' || chosen[3]?.role === 'sqrtN')
    if (!correct) return
    setFormulaSolved(true); setFeedback('Z-STATISTIC LOCKED // NUMERATOR −0.90 · STANDARD ERROR 0.3333 · Z = −2.70'); audioEngine.play('scanner')
  // The calculation should run when a formula slot changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, instrumentLocked, formulaSolved])
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (['SELECT', 'INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return
      if (target.tagName === 'BUTTON' && !target.closest('.calculator-bench')) return
      const numpadKey = event.code.match(/^Numpad([0-9])$/)?.[1]
      const key = numpadKey ?? ({ NumpadDecimal: '.', NumpadAdd: '+', NumpadSubtract: '-', NumpadMultiply: '*', NumpadDivide: '/', NumpadEnter: 'Enter' } as Record<string, string>)[event.code] ?? event.key
      if (key === 'Enter') { event.preventDefault(); evaluateCalculator(); return }
      if (key.toLowerCase() === 's') { event.preventDefault(); toggleSumMode(); return }
      if (/^[0-9.]$/.test(key)) insertCalculator(key)
      if (['+', '-', '*', '/'].includes(key)) insertCalculator(key === '*' ? '×' : key === '/' ? '÷' : key)
      if (key === '=') { event.preventDefault(); evaluateCalculator() }
      if (key === 'Backspace') { event.preventDefault(); backspaceCalculator() }
      if (key === 'Escape') setDisplay('0')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const activeDocument = openDocument ? documents[openDocument] : null
  const archiveItems = useMemo(() => cases, [])
  return <main className={`forensic-desk-screen desk-loop-screen ${mistake ? 'credibility-hit' : ''}`} onMouseMove={event => { const bounds = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--desk-parallax-x', `${(((event.clientX - bounds.left) / bounds.width) - .5) * 12}px`); event.currentTarget.style.setProperty('--desk-parallax-y', `${(((event.clientY - bounds.top) / bounds.height) - .5) * 12}px`) }}>
    <header className="desk-hud"><div className="desk-brand"><FileSearch size={18} aria-hidden="true" /><b>CASE 01 // THE DILUTED ANTIDOTE</b></div><div className="directive-badge"><Shield size={14} /><span>STAGE {stage} / 4</span></div><div className="credibility"><small>DETECTIVE CREDIBILITY</small><b>{game.credibility}%</b><i><span style={{ width: `${game.credibility}%` }} /></i></div><button className="desk-hud-button" onClick={() => updateGame({ gameState: 'cutscene' })}><ArrowLeft size={14} /> REPLAY CUTSCENE</button><button className="desk-hud-button" onClick={() => setArchivesOpen(true)}><Archive size={14} /> CASE ARCHIVES</button><button className="desk-hud-button settings-hud-button" onClick={() => setSettingsOpen(true)}><Settings2 size={14} /> SETTINGS</button></header>
    <div className="desk-objective"><b>ACTIVE OBJECTIVE</b><span>{objective}</span></div>
    {settings.difficulty === 'rookie' && <aside className="rookie-guide"><div><small>ROOKIE FIELD GUIDE // STAGE {stage} OF 4</small><b>{rookieGuidance.title}</b></div><p>{rookieGuidance.text}</p></aside>}
    <section className="desk-loop">
      <svg className="workbench-texture" aria-hidden="true" viewBox="0 0 1000 700" preserveAspectRatio="none"><defs><filter id="walnut-grain"><feTurbulence type="fractalNoise" baseFrequency=".018 .22" numOctaves="3" seed="18" result="grain"/><feDiffuseLighting in="grain" lightingColor="#a87c4c" surfaceScale="2.6" result="lit"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting></filter></defs><rect width="100%" height="100%" filter="url(#walnut-grain)"/></svg>
      <div className="banker-lamp" aria-hidden="true"><span className="banker-lamp-shade"/><i className="banker-lamp-stem"/><b className="banker-lamp-pool"/></div>
      <div className="desk-ambient-props" aria-hidden="true"><svg className="edge-vial-tray" viewBox="0 0 150 80"><path d="M8 18h133l-9 48H17z" fill="#3a4140" stroke="#918568" strokeWidth="3"/><path d="M17 25h116l-6 33H23z" fill="#111a18" stroke="#111"/><g fill="#b6d9c9" fillOpacity=".35" stroke="#d2d6bd"><path d="M39 20h17v34q-8 10-17 0z"/><path d="M76 20h17v34q-8 10-17 0z"/><path d="M113 20h15v34q-7 10-15 0z"/></g><path d="M41 39h13v12H41zm37 0h13v12H78zm36 0h12v12h-12z" fill="#bd9955"/><text x="45" y="17" fill="#dfd4b5" fontSize="9">50 MG</text><text x="82" y="17" fill="#dfd4b5" fontSize="9">50 MG</text></svg><svg className="desk-caliper" viewBox="0 0 120 60"><path d="M10 30h94M30 15v30m0-15h56m0-13v26m18-26v26" fill="none" stroke="#a89a76" strokeWidth="4"/><circle cx="30" cy="30" r="8" fill="#363b37" stroke="#d0bb82" strokeWidth="3"/></svg><span className="mat-pencil-mark">x̄ = Σx / n</span></div>
      <aside className="desk-evidence-stack"><h2>RAW CASE FILES</h2>{(Object.entries(documents) as [DocumentId, typeof documents[DocumentId]][]).map(([id, document]) => <button className={`case-paper paper-${id}`} key={id} onClick={() => { setOpenDocument(id); audioEngine.play('paper') }}><i className="folder-tab" aria-hidden="true"/><i className="paperclip" aria-hidden="true"/><small>{document.stamp}</small><b>{document.title}</b><span>OPEN DOCUMENT</span></button>)}<div className="rathore-note"><b>CHIEF RATHORE // FIELD NOTE</b><p>“{caseFile.mentorNote}”</p></div></aside>
      <div className="desk-center-zone">
      <section className="calculator-bench"><div className="bench-heading"><Calculator size={16} /><div><small>B.S.I. FIELD EQUIPMENT</small><h2>FORENSIC SCIENTIFIC CALCULATOR</h2></div></div><div className="calculator-display"><span>{sumMode ? `Σx // FIRST ${sumCount} VIAL READINGS` : lastResult === null ? 'READY' : 'VERIFIED RESULT'}</span><output>{display}</output></div>{sumMode && <label className="sum-count-control">SUM SAMPLE COUNT <select value={sumCount} onChange={event => setSumCount(Number(event.target.value))}>{Array.from({length:36},(_,i)=>i+1).map(count=><option key={count} value={count}>{count} {count===1?'VALUE':'VALUES'}</option>)}</select><small>Choose 36 to sum the complete batch.</small></label>}<div className="calculator-pad">{['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','(',')','√(','²','+','S','C','⌫'].map(key => <button key={key} className={`${key==='S'&&sumMode?'sum-key active':''} ${key==='⌫'?'calc-backspace':''}`} aria-label={key==='⌫'?'Backspace':key==='S'?'Summation':'Calculator '+key} title={key==='⌫'?'Delete last character':key==='S'?'Sum vial readings':''} onClick={() => { if(key==='S') toggleSumMode(); else if(key==='C'){setSumMode(false);setDisplay('0');setLastResult(null)} else if(key==='⌫') backspaceCalculator(); else insertCalculator(key) }}>{key}</button>)}<button className="calc-equals" onClick={evaluateCalculator}>=</button></div><button className="save-result" onClick={saveCalculatorResult}>+ SAVE RESULT AS EVIDENCE CHIP</button><div className="calculator-keyboard-hint">KEYBOARD INPUT: NUMBERS · + − × ÷ · S (SUM) · BACKSPACE · ENTER (=)</div>{settings.difficulty === 'rookie' && <div className="calculator-tip rookie-calc-tip">Σ totals the first selected vial readings. Set the count to 36, press S then Enter, and divide the total by 36 to find x̄.</div>}</section>
      <section className="evidence-tray"><svg className="evidence-strings" viewBox="0 0 420 280" preserveAspectRatio="none" aria-hidden="true"><path d="M18 45 C140 5 178 98 250 96 S340 120 405 76 M20 130 C110 175 195 115 270 150 S350 208 405 170 M20 220 C130 205 190 255 270 220 S350 245 405 230" fill="none" stroke="#8f2630" strokeOpacity=".38" strokeWidth="1.4"/></svg><h2>ACTIVE VALUE TRAY</h2><p>Drag a value chip onto its matching formula slot. Click a chip, then a slot, if needed.</p><div className="tray-chips">{allChips.length === 0 && <span className="empty-tray">NO BAGGED EVIDENCE</span>}{allChips.map(chip => <button key={chip.id} draggable onDragStart={event => { event.dataTransfer.setData('text/bsi-chip', chip.id); event.dataTransfer.effectAllowed = 'copy' }} className={`value-chip ${selectedChip === chip.id ? 'selected' : ''} ${chip.source}`} onClick={() => setSelectedChip(chip.id)}><small>{chip.source === 'calculator' ? 'CALCULATED' : 'PINNED'}</small>{chip.label}</button>)}</div><h3>PINNED BASELINE FACTS</h3>{(['mu0','sigma','n','alpha'] as EvidenceId[]).map(key => <div className={`baseline-slot ${pinned.includes(key) ? 'verified' : ''}`} key={key} onDragOver={event => event.preventDefault()} onDrop={event => dropEvidence(event, key)}><span>{evidenceMeta[key].label}</span><b>{pinned.includes(key) ? evidenceMeta[key].display : 'DROP MATCHING EVIDENCE HERE'}</b>{pinned.includes(key) && <Check size={13} />}</div>)}</section>
      </div>
      <aside className="terminal-bay"><div className="terminal-topline"><span>BSI // STATISTICAL TERMINAL</span><i className={baselineReady ? 'online' : 'standby'}>{baselineReady ? 'ONLINE' : 'STANDBY'}</i></div>{!baselineReady ? <div className="terminal-locked"><LockKeyhole /><b>PIN THE FOUR BASELINE FACTS FROM THE RAW FILES.</b><small>THE SAMPLE MEAN IS NOT A CLUE. CALCULATE IT.</small></div> : !hypothesisLocked ? <div className="terminal-flow"><h2>HYPOTHESIS LOCK</h2><label>H₀<select value={h0Parameter} onChange={e => setH0Parameter(e.target.value)}><option>μ</option><option>p</option></select><b>= 50.0 mg</b></label><label>Hₐ<select value={haParameter} onChange={e => setHaParameter(e.target.value)}><option>μ</option><option>p</option></select><select value={tail} onChange={e => setTail(e.target.value)}><option value="<">&lt; LEFT-TAILED</option><option value=">">&gt; RIGHT-TAILED</option><option value="≠">≠ TWO-TAILED</option></select><b>50.0 mg</b></label><button className="desk-action" onClick={lockHypothesis}>LOCK HYPOTHESIS</button></div> : !instrumentLocked ? <div className="terminal-flow"><h2>SELECT THE INSTRUMENT</h2><button className={instrument === 'z' ? 'choice selected' : 'choice'} onClick={() => setInstrument('z')}>1-SAMPLE Z-TEST <small>σ KNOWN</small></button><button className={instrument === 't' ? 'choice selected' : 'choice'} onClick={() => setInstrument('t')}>STUDENT’S t-TEST <small>σ UNKNOWN</small></button><button className={instrument === 'p' ? 'choice selected' : 'choice'} onClick={() => setInstrument('p')}>PROPORTION Z-TEST</button><button className="desk-action" onClick={lockInstrument}>LOCK INSTRUMENT</button></div> : <div className="terminal-flow formula-station"><h2>Z-STATISTIC BLUEPRINT</h2><div className="blueprint-formula"><span className="formula-z-label">Z =</span><div className="z-fraction"><div className="z-numerator"><div className="z-term">{formulaSlot(0, 'x̄', 'Observed sample mean x-bar')}</div><span>−</span><div className="z-term">{formulaSlot(1, 'μ₀', 'Claimed population mean mu-zero')}</div></div><div className="z-fraction-rule"/><div className="z-denominator"><div className="z-term">{formulaSlot(2, 'σ', 'Known population standard deviation sigma')}</div><span className="z-divide">÷</span>{chipById(slots[3])?.role === 'sqrtN' ? <div className="z-term">{formulaSlot(3, '√n', 'Precomputed square root of sample size')}</div> : <span className="z-root">√<span className="z-root-value"><span className="z-term">{formulaSlot(3, 'n', 'Sample size n')}</span></span></span>}</div></div></div>{!sampleMeanChip && <div className="formula-warning">YOU STILL NEED x̄. CALCULATE THE SAMPLE MEAN FROM YOUR RAW READINGS.</div>}{formulaSolved && <div className="math-breakdown"><strong>LOCKED TEST STATISTIC: Z = −2.70</strong><button className="launch-oscilloscope" onClick={() => updateGame({ gameState: 'scanner' })}>LAUNCH BELL-CURVE OSCILLOSCOPE (Z = −2.70) »</button></div>}</div>}{feedback && <div className="desk-feedback">{feedback}</div>}</aside>
    </section>
    <footer className="desk-footer"><span><FileText size={12} /> CASE 01 / EVIDENCE CHAIN ACTIVE</span><span><Shield size={12} /> CREDIBILITY {game.credibility}%</span></footer>
    {openDocument && activeDocument && <div className="clue-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpenDocument(null) }}><section className="clue-document raw-document" role="dialog" aria-modal="true"><button className="clue-close" onClick={() => setOpenDocument(null)} aria-label="Close document"><X /></button><small>{activeDocument.stamp}</small><h2>{activeDocument.title}</h2><div className="document-rule" /><p>{activeDocument.text}</p>{openDocument === 'compliance' && <div className="document-evidence"><div className="evidence-slip" draggable onDragStart={event => beginEvidenceDrag(event, 'mu0')}><b>CLAIMED MEAN (μ₀)</b><span>50.0 MG</span><small>DRAG TO EVIDENCE TRAY BELOW</small></div><div className="evidence-slip" draggable onDragStart={event => beginEvidenceDrag(event, 'alpha')}><b>SIGNIFICANCE LEVEL (α)</b><span>0.05</span><small>DRAG TO EVIDENCE TRAY BELOW</small></div></div>}{openDocument === 'calibration' && <div className="document-evidence"><div className="evidence-slip" draggable onDragStart={event => beginEvidenceDrag(event, 'sigma')}><b>POPULATION SD (σ)</b><span>2.0 MG · KNOWN</span><small>DRAG TO EVIDENCE TRAY BELOW</small></div></div>}{openDocument === 'telemetry' && <><div className="raw-summary"><b>SAMPLE COUNT: n = 36 VIALS</b><span>SAMPLE MEAN (x̄) IS UNCALCULATED. ADD THE RAW READINGS, THEN DIVIDE BY n ON THE FIELD CALCULATOR.</span></div><div className="telemetry-grid">{rawTelemetry.map((reading, index) => <span key={index}>VIAL #{String(index + 1).padStart(2, '0')}<b>{reading.toFixed(1)} mg</b></span>)}</div><div className="document-evidence"><div className="evidence-slip" draggable onDragStart={event => beginEvidenceDrag(event, 'n')}><b>SAMPLE COUNT (n)</b><span>36 VIALS</span><small>DRAG TO EVIDENCE TRAY BELOW</small></div></div></>}<div className="modal-drop-tray"><b>EVIDENCE DROP TRAY</b><span>DROP EACH SLIP INTO ITS MATCHING SLOT</span>{(['mu0','sigma','n','alpha'] as EvidenceId[]).map(key => <div className={`modal-drop-slot ${pinned.includes(key) ? 'verified' : ''}`} key={key} onDragOver={event => event.preventDefault()} onDrop={event => dropEvidence(event, key)}><span>{evidenceMeta[key].label}</span><strong>{pinned.includes(key) ? evidenceMeta[key].display : 'DROP HERE'}</strong></div>)}</div></section></div>}
    {archivesOpen && <div className="clue-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setArchivesOpen(false) }}><section className="archive-desk-panel"><button className="clue-close" onClick={() => setArchivesOpen(false)} aria-label="Close archives"><X /></button><h2>CASE ARCHIVES</h2>{archiveItems.map(item => <button key={item.id} disabled={!game.unlockedCases.includes(item.id)} onClick={() => { updateGame({ currentCaseId: item.id }); setArchivesOpen(false) }}>CASE {String(item.id).padStart(2, '0')} // {item.title} {game.unlockedCases.includes(item.id) ? '— OPEN' : '— LOCKED'}</button>)}</section></div>}
    {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
  </main>
}
export default ForensicDesk
