export type TestTail = 'left' | 'right' | 'two'
export type CaseClue = { id: string; title: string; icon: 'vial' | 'chart' | 'clock' | 'file' | 'fingerprint' | 'scale' | 'ledger' | 'ticket' | 'witness'; reveal: string }
export type MeanZCase = { kind: 'mean-z'; nullMean: number; sigma: number; n: number; sampleMean: number; alpha: number; alternative: 'less' | 'greater' | 'not-equal'; unit: string }
export type MeanTCase = { kind: 'mean-t'; nullMean: number; sampleSd: number; n: number; df: number; sampleMean: number; alpha: number; alternative: 'less' | 'greater' | 'not-equal'; unit: string }
export type ProportionCase = { kind: 'proportion-z'; nullProportion: number; n: number; sampleProportion: number; alpha: number; alternative: 'less' | 'greater' | 'not-equal' }
export type TribunalRound = { id: string; prompt: string; truth: string; decision: string; error: 'type-i' | 'type-ii' | 'none'; alphaEffect: string; betaEffect: string }
export type TribunalCase = { kind: 'tribunal'; rounds: TribunalRound[] }
export type CaseStatistics = MeanZCase | MeanTCase | ProportionCase | TribunalCase
export type MonologueBeat = { text: string; duration: number; focusTarget: 'window' | 'dossier' | 'evidence' | 'scanner'; visualCue: string }
export type InvestigationCase = {
  id: number; chapter: number; chapterTitle: string; title: string; subtitle: string; tail: TestTail
  english: string; mentorNote?: string; syndicateContext?: string; monologueBeats?: [MonologueBeat, MonologueBeat, MonologueBeat, MonologueBeat]; clues: [CaseClue, CaseClue, CaseClue]; statistics: CaseStatistics
}

export const cases: InvestigationCase[] = [
  {
    id: 1, chapter: 1, chapterTitle: '1-Sample Mean · Sigma Known · Z-Test', title: 'The Diluted Antidote', subtitle: 'A batch that came up short', tail: 'left',
    english: 'The antidote was supposed to hold the line at fifty milligrams. Under the morgue lamp, the numbers looked pale. Someone had watered down the city’s last defense.',
    mentorNote: 'Chief Vikram Rathore, Senior Forensic Scientist: “Lock the baseline before you chase the motive. Population sigma is known here.”',
    syndicateContext: 'Aurelia Pharma is suspected of operating as a front for Syndicate Zero, a black-market network diverting scarce medical supplies.',
    monologueBeats: [
      { text: 'Rain washes the blood off the streets, but it never cleans the ledger. Twelve ICU patients flatlined tonight waiting for a miracle that never kicked in.', duration: 5, focusTarget: 'window', visualCue: 'MORGAN GENERAL ICU // 02:14 AM' },
      { text: 'Aurelia Pharma—a known Syndicate Zero front—swears every vial of their antidote carries a fifty-milligram punch. The factory\'s historical calibration locks population sigma at two milligrams.', duration: 5, focusTarget: 'dossier', visualCue: 'AURELIA PHARMA // CLAIMED MEAN: μ₀ = 50.0 MG (σ = 2.0 MG)' },
      { text: 'Chief Rathore dropped thirty-six seized vials on my desk before the Syndicate\'s lawyers could burn them. The lab assay came back pale: forty-nine point one milligrams.', duration: 5, focusTarget: 'evidence', visualCue: 'SEIZED EVIDENCE // n = 36 VIALS — SAMPLE MEAN: x̄ = 49.1 MG' },
      { text: 'Someone is skimming life-saving medicine into the black market. It\'s time to fire up the Z-scanner and prove this batch was watered down beyond a shadow of doubt.', duration: 5, focusTarget: 'scanner', visualCue: 'FORENSIC DIRECTIVE // LEFT-TAILED Z-TEST AT α = 0.05' },
    ],
    clues: [
      { id: 'batch-label', title: 'Batch label', icon: 'file', reveal: 'Claimed target: μ₀ = 50 mg' },
      { id: 'lab-vial', title: 'Lab vial', icon: 'vial', reveal: 'Known population spread: σ = 2 mg' },
      { id: 'intake-sheet', title: 'Intake sheet', icon: 'chart', reveal: '36 vials sampled; x̄ = 49.1 mg' },
    ], statistics: { kind: 'mean-z', nullMean: 50, sigma: 2, n: 36, sampleMean: 49.1, alpha: 0.05, alternative: 'less', unit: 'mg' },
  },
  {
    id: 2, chapter: 1, chapterTitle: '1-Sample Mean · Sigma Known · Z-Test', title: 'Midnight Poison', subtitle: 'A trace above the safe limit', tail: 'right',
    english: 'At midnight the river gave up a number it should never have held. The poison did not drift in by accident; every sample pointed upstream, toward a locked door.',
    clues: [
      { id: 'permit', title: 'Discharge permit', icon: 'file', reveal: 'Legal baseline: μ₀ = 120 ppm' },
      { id: 'sensor-log', title: 'Sensor log', icon: 'chart', reveal: 'Known process spread: σ = 15 ppm' },
      { id: 'water-sample', title: 'Water samples', icon: 'vial', reveal: '25 readings; x̄ = 126.6 ppm' },
    ], statistics: { kind: 'mean-z', nullMean: 120, sigma: 15, n: 25, sampleMean: 126.6, alpha: 0.05, alternative: 'greater', unit: 'ppm' },
  },
  {
    id: 3, chapter: 1, chapterTitle: '1-Sample Mean · Sigma Known · Z-Test', title: 'The Mint Heist', subtitle: 'The weight of a missing fortune', tail: 'two',
    english: 'The vault was empty, but the mint’s own scales told a stranger story. The coins were light. Whether that was theft or a faulty machine, the evidence would have to speak.',
    clues: [
      { id: 'mint-order', title: 'Mint order', icon: 'file', reveal: 'Stamped target: μ₀ = 1000 g' },
      { id: 'calibration-card', title: 'Calibration card', icon: 'scale', reveal: 'Known spread: σ = 4 g' },
      { id: 'coin-tray', title: 'Coin tray', icon: 'vial', reveal: '16 coins weighed; x̄ = 997.4 g' },
    ], statistics: { kind: 'mean-z', nullMean: 1000, sigma: 4, n: 16, sampleMean: 997.4, alpha: 0.01, alternative: 'not-equal', unit: 'g' },
  },
  {
    id: 4, chapter: 2, chapterTitle: '1-Sample Mean · Sigma Unknown · t-Test', title: 'The Sabotaged Bridge', subtitle: 'A span built to fail', tail: 'left',
    english: 'The bridge held through the storm. It might not survive the trucks. The steel’s true strength was unknown, and the engineer who signed off had vanished before dawn.',
    clues: [
      { id: 'blueprint', title: 'Blueprint', icon: 'file', reveal: 'Required mean strength: μ₀ = 40 MPa' },
      { id: 'core-samples', title: 'Core samples', icon: 'vial', reveal: 'Sample SD s = 3.2 MPa; n = 16' },
      { id: 'lab-report', title: 'Lab report', icon: 'chart', reveal: 'Measured mean x̄ = 38.1 MPa; df = 15' },
    ], statistics: { kind: 'mean-t', nullMean: 40, sampleSd: 3.2, n: 16, df: 15, sampleMean: 38.1, alpha: 0.05, alternative: 'less', unit: 'MPa' },
  },
  {
    id: 5, chapter: 2, chapterTitle: '1-Sample Mean · Sigma Unknown · t-Test', title: 'Dark-Web Trace', subtitle: 'Milliseconds in the dark', tail: 'right',
    english: 'A server blinked awake for a fraction too long. Nine traces were all the lab could recover. The network was quick to erase itself; the sample was small, and the trail was warm.',
    clues: [
      { id: 'baseline-timing', title: 'Timing standard', icon: 'clock', reveal: 'Expected response: μ₀ = 35 ms' },
      { id: 'packet-traces', title: 'Packet traces', icon: 'chart', reveal: '9 traces; x̄ = 40.2 ms' },
      { id: 'lab-notes', title: 'Lab notes', icon: 'file', reveal: 'Sample SD s = 6.0 ms; df = 8' },
    ], statistics: { kind: 'mean-t', nullMean: 35, sampleSd: 6, n: 9, df: 8, sampleMean: 40.2, alpha: 0.05, alternative: 'greater', unit: 'ms' },
  },
  {
    id: 6, chapter: 2, chapterTitle: '1-Sample Mean · Sigma Unknown · t-Test', title: 'The Doctored Alibi', subtitle: 'A reaction time out of place', tail: 'two',
    english: 'The witness said the signal came instantly. The machine recorded a delay. A bad clock could explain the gap; so could a rehearsed story. Every direction mattered.',
    clues: [
      { id: 'statement', title: 'Witness statement', icon: 'file', reveal: 'Expected response: μ₀ = 800 ms' },
      { id: 'timing-rig', title: 'Timing rig', icon: 'clock', reveal: '16 trials; x̄ = 814.5 ms' },
      { id: 'calibration', title: 'Calibration notes', icon: 'chart', reveal: 'Sample SD s = 24 ms; df = 15' },
    ], statistics: { kind: 'mean-t', nullMean: 800, sampleSd: 24, n: 16, df: 15, sampleMean: 814.5, alpha: 0.05, alternative: 'not-equal', unit: 'ms' },
  },
  {
    id: 7, chapter: 3, chapterTitle: '1-Sample Proportion · Z-Test for p', title: 'Biometric Breach', subtitle: 'The lock that knew too many faces', tail: 'left',
    english: 'The scanner had promised near certainty. Two hundred attempts later, the door had let too many strangers through. The promise was ninety-five percent. The log was not.',
    clues: [
      { id: 'spec-sheet', title: 'Security spec', icon: 'file', reveal: 'Claimed success rate: p₀ = 0.95' },
      { id: 'access-log', title: 'Access log', icon: 'fingerprint', reveal: '200 attempts recorded' },
      { id: 'incident-board', title: 'Incident board', icon: 'chart', reveal: 'Observed success proportion p̂ = 0.91' },
    ], statistics: { kind: 'proportion-z', nullProportion: 0.95, n: 200, sampleProportion: 0.91, alpha: 0.05, alternative: 'less' },
  },
  {
    id: 8, chapter: 3, chapterTitle: '1-Sample Proportion · Z-Test for p', title: 'Shell Accounts', subtitle: 'A small fraction with a long shadow', tail: 'right',
    english: 'The accounts looked ordinary one at a time. Then the ledger showed how often the same fingerprints returned. Two percent was the old estimate. The new pattern was harder to ignore.',
    clues: [
      { id: 'risk-model', title: 'Risk model', icon: 'file', reveal: 'Baseline suspicious rate: p₀ = 0.02' },
      { id: 'transaction-ledger', title: 'Transaction ledger', icon: 'ledger', reveal: '500 accounts reviewed' },
      { id: 'link-analysis', title: 'Link analysis', icon: 'chart', reveal: 'Observed suspicious proportion p̂ = 0.038' },
    ], statistics: { kind: 'proportion-z', nullProportion: 0.02, n: 500, sampleProportion: 0.038, alpha: 0.01, alternative: 'greater' },
  },
  {
    id: 9, chapter: 3, chapterTitle: '1-Sample Proportion · Z-Test for p', title: 'The Rigged Casino', subtitle: 'The house always wins—by how much?', tail: 'two',
    english: 'The house claimed the wheel was fair. Four hundred spins left a trail that leaned one way. A crooked wheel might pay too often or too rarely. The evidence had to test both doors.',
    clues: [
      { id: 'payout-table', title: 'Payout table', icon: 'file', reveal: 'Fair-game baseline: p₀ = 0.486' },
      { id: 'spin-tickets', title: 'Spin tickets', icon: 'ticket', reveal: '400 spins recorded' },
      { id: 'wheel-audit', title: 'Wheel audit', icon: 'chart', reveal: 'Observed win proportion p̂ = 0.545' },
    ], statistics: { kind: 'proportion-z', nullProportion: 0.486, n: 400, sampleProportion: 0.545, alpha: 0.05, alternative: 'not-equal' },
  },
  {
    id: 10, chapter: 4, chapterTitle: 'Errors in Hypothesis Testing · Courtroom Boss Fight', title: 'The Tribunal of Truth', subtitle: 'The jury must price its certainty', tail: 'two',
    english: 'The court wanted certainty. The evidence offered probabilities. Each verdict could condemn an innocent system or let a guilty one walk. The gavel waited while the jury weighed α against β.',
    clues: [
      { id: 'jury-instructions', title: 'Jury instructions', icon: 'file', reveal: 'Rejecting a true H₀ is a Type I error (false positive).' },
      { id: 'case-record', title: 'Case record', icon: 'witness', reveal: 'Failing to reject a false H₀ is a Type II error (false negative).' },
      { id: 'policy-docket', title: 'Policy docket', icon: 'scale', reveal: 'Lower α reduces Type I risk; for fixed n it can raise Type II risk (β).' },
    ], statistics: { kind: 'tribunal', rounds: [
      { id: 'innocent', prompt: 'The system is innocent (H₀ true). The jury rejects H₀.', truth: 'H₀ is true', decision: 'Reject H₀', error: 'type-i', alphaEffect: 'Lower α makes this false-positive verdict less likely.', betaEffect: '—' },
      { id: 'guilty', prompt: 'The system is guilty (H₀ false). The jury fails to reject H₀.', truth: 'H₀ is false', decision: 'Fail to reject H₀', error: 'type-ii', alphaEffect: '—', betaEffect: 'This false negative is Type II error β; lower α can raise β when n stays fixed.' },
      { id: 'tradeoff', prompt: 'Keep sample size fixed. The court lowers α.', truth: 'A real effect may be harder to detect.', decision: 'The rejection region shrinks.', error: 'none', alphaEffect: 'Type I error probability is capped at a smaller level.', betaEffect: 'Power may fall and β may rise.' },
    ] },
  },
]

export const getCase = (id: number) => cases.find((investigation) => investigation.id === id)
