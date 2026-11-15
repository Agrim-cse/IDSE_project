import { ArrowLeft, FileText, Radio } from 'lucide-react'
import LandingPage from './components/LandingPage'
import CutsceneStage from './components/CutsceneStage'
import ForensicDesk from './components/ForensicDesk'
import BellCurveScanner from './components/BellCurveScanner'
import { cases } from './data/cases'
import { useGame } from './context/GameContext'
import { audioEngine } from './utils/audioEngine'

function App() {
  const { game, updateGame, settings } = useGame()
  if (game.gameState === 'landing') return <LandingPage />
  if (game.gameState === 'cutscene') return <CutsceneStage />
  if (game.gameState === 'desk') return <ForensicDesk />
  if (game.gameState === 'scanner') return <BellCurveScanner />

  const activeCase = cases.find((item) => item.id === game.currentCaseId) ?? cases[0]
  return (
    <main className="placeholder-screen">
      <div className="placeholder-grain" aria-hidden="true" />
      <div className="placeholder-mark"><span className="landing-seal">B</span><span>B.S.I. / CASE FILE {String(activeCase.id).padStart(2, '0')}</span></div>
      <section className="placeholder-card">
        <span className="placeholder-icon"><FileText size={20} /></span>
        <p className="terminal-overline">INCOMING CASE MONOLOGUE / ENGLISH</p>
        <h1>{activeCase.title}</h1>
        <p className="placeholder-subtitle">{activeCase.subtitle}</p>
        <div className="placeholder-divider"><i /><Radio size={13} /><i /></div>
        {settings.subtitles && <blockquote>“{activeCase.english}”</blockquote>}
        {!settings.subtitles && <p className="subtitles-muted">Narrator subtitles are disabled in field settings.</p>}
        <p className="placeholder-next">THE CUTSCENE CAMERA IS ON ITS WAY.</p>
        <button className="return-title-button" onClick={() => { audioEngine.stopRain(); updateGame({ gameState: 'landing' }); audioEngine.play('click') }}><ArrowLeft size={15} /> RETURN TO TITLE SCREEN</button>
      </section>
      <footer className="placeholder-footer"><span>FOUNDATION TEST / STEP 02</span><span>SECURE CHANNEL ACTIVE</span></footer>
    </main>
  )
}

export default App
