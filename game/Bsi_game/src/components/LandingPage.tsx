import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Archive, ArrowUpRight, FilePlus2, LockKeyhole, Radio, Settings2 } from 'lucide-react'
import { gsap } from 'gsap'
import { cases } from '../data/cases'
import { useGame } from '../context/GameContext'
import { audioEngine } from '../utils/audioEngine'
import SettingsModal from './SettingsModal'

type RainDrop = { x: number; y: number; length: number; speed: number; opacity: number }

function RainCanvas({ onLightning }: { onLightning: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const flashRef = useRef(onLightning)
  flashRef.current = onLightning

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    let frame = 0
    let width = 0
    let height = 0
    let drops: RainDrop[] = []
    let lastFlash = 0
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      drops = Array.from({ length: Math.min(190, Math.floor(width / 6)) }, () => ({ x: Math.random() * width, y: Math.random() * height, length: 10 + Math.random() * 20, speed: 5 + Math.random() * 7, opacity: 0.09 + Math.random() * 0.24 }))
    }
    const draw = () => {
      context.clearRect(0, 0, width, height)
      context.lineWidth = 1
      for (const drop of drops) {
        context.beginPath()
        context.strokeStyle = `rgba(155, 190, 204, ${drop.opacity})`
        context.moveTo(drop.x, drop.y)
        context.lineTo(drop.x - 2.2, drop.y + drop.length)
        context.stroke()
        drop.x -= 1.2
        drop.y += drop.speed
        if (drop.y > height + drop.length || drop.x < -20) { drop.x = Math.random() * (width + 30); drop.y = -drop.length; }
      }
      if (Date.now() - lastFlash > 10500 && Math.random() > 0.9985) {
        lastFlash = Date.now()
        flashRef.current()
      }
      frame = window.requestAnimationFrame(draw)
    }
    resize()
    window.addEventListener('resize', resize)
    frame = window.requestAnimationFrame(draw)
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas className="rain-canvas" ref={canvasRef} aria-hidden="true" />
}

function LandingPage() {
  const { settings, game, updateGame } = useGame()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [archivesOpen, setArchivesOpen] = useState(false)
  const [lightning, setLightning] = useState(false)
  const lightRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const musicRef = useRef<HTMLAudioElement>(null)
  const transitionRef = useRef(false)
  const activeCase = cases.find((item) => item.id === game.currentCaseId) ?? cases[0]

  useEffect(() => {
    const element = titleRef.current
    if (!element) return
    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 7 })
    timeline.to(element, { opacity: 0.7, duration: 0.06 }).to(element, { opacity: 1, duration: 0.08 }).to(element, { opacity: 0.86, duration: 0.04 }).to(element, { opacity: 1, duration: 0.1 })
    return () => { timeline.kill() }
  }, [])

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (!settings.flashlightEffect || !lightRef.current) return
      gsap.to(lightRef.current, { x: event.clientX, y: event.clientY, duration: 0.42, ease: 'power2.out', overwrite: true })
      document.documentElement.style.setProperty('--flash-x', `${event.clientX}px`)
      document.documentElement.style.setProperty('--flash-y', `${event.clientY}px`)
    }
    if (settings.flashlightEffect && lightRef.current) gsap.set(lightRef.current, { x: window.innerWidth / 2, y: window.innerHeight / 2 })
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [settings.flashlightEffect])

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = settings.musicVolume / 100
  }, [settings.musicVolume])

  useEffect(() => {
    const music = musicRef.current
    if (!music) return
    const attemptPlayback = () => {
      if (music.paused) void music.play().catch(() => { /* browser will retry after the next user gesture */ })
    }
    audioEngine.toggleRain(true)
    attemptPlayback()
    window.addEventListener('pointerdown', attemptPlayback, true)
    window.addEventListener('keydown', attemptPlayback, true)
    return () => {
      window.removeEventListener('pointerdown', attemptPlayback, true)
      window.removeEventListener('keydown', attemptPlayback, true)
      music.pause()
      music.currentTime = 0
      audioEngine.stopRain()
    }
  }, [])

  const beginInvestigation = (caseId = game.currentCaseId, freshGame = false) => {
    if (transitionRef.current) return
    transitionRef.current = true
    const selectedCase = cases.find((item) => item.id === caseId) ?? cases[0]
    audioEngine.stopRain()
    const enterCase = () => {
      const music = musicRef.current
      if (music) { music.pause(); music.currentTime = 0 }
      updateGame(freshGame
        ? { currentCaseId: 1, unlockedCases: [1], credibility: 100, gameState: 'cutscene' }
        : { currentCaseId: selectedCase.id, gameState: 'cutscene' })
    }
    const music = musicRef.current
    if (music && !music.paused && music.volume > 0.001) {
      gsap.to(music, { volume: 0, duration: 0.9, ease: 'power1.out', onComplete: enterCase })
    } else enterCase()
  }
  const startNewGame = () => {
    const hasProgress = game.currentCaseId !== 1 || game.unlockedCases.length > 1 || game.credibility < 100
    if (hasProgress && !window.confirm('Start a new investigation? Your current campaign progress will be reset.')) return
    beginInvestigation(1, true)
  }
  const hover = (event: MouseEvent<HTMLButtonElement>) => {
    audioEngine.play('typewriter')
    gsap.to(event.currentTarget, { x: 4, duration: 0.16, ease: 'power2.out' })
  }

  return (
    <main className={`landing-page ${settings.flashlightEffect ? 'flashlight-enabled' : ''} ${lightning ? 'lightning-flash' : ''}`}>
      <audio ref={musicRef} src="/audio/landing-theme.mp3" loop preload="auto" aria-hidden="true" />
      <RainCanvas onLightning={() => { setLightning(true); window.setTimeout(() => setLightning(false), 180) }} />
      <div className="landing-window" aria-hidden="true"><div className="window-frame"><i /><i /><i /><i /></div><div className="window-city"><b /><b /><b /><b /><b /></div></div>
      <div className="forensic-chalk" aria-hidden="true"><span>Z = (x̄ − μ₀) / (σ / √n)</span><span>H₀ : μ = μ₀</span><span>Hₐ : μ &lt; μ₀</span><span>α = 0.05</span><span>p̂ = x / n</span></div>
      <div className="landing-light" ref={lightRef} aria-hidden="true" />
      <div className="landing-grain" aria-hidden="true" />
      <section className="landing-layout">
        <div className="landing-identity">
          <h1 className="landing-title" ref={titleRef}>B.S.I.</h1>
          <p className="landing-agency">BUREAU OF STATISTICAL INVESTIGATION</p>
          <div className="landing-rule"><span /><span /></div>
          <p className="landing-subtitle">THE NULL PROTOCOL</p>
          <p className="landing-tagline">Every case leaves a trace.<br />Every conclusion carries a cost.</p>
        </div>

        <nav className="landing-menu" aria-label="Main menu">
          <p className="menu-heading">INVESTIGATION DESK <span>SEASON 01 / 10 FILES</span></p>
          <button className="menu-button primary-menu-button" onMouseEnter={hover} onMouseLeave={(event) => gsap.to(event.currentTarget, { x: 0, duration: 0.2 })} onClick={() => beginInvestigation()}><span className="menu-index">01</span><span className="menu-action-copy"><b>CONTINUE</b><small>CASE #{String(activeCase.id).padStart(2, '0')} · {activeCase.title}</small></span><ArrowUpRight size={17} /><i className="button-glint" /></button>
          <button className="menu-button" onMouseEnter={hover} onMouseLeave={(event) => gsap.to(event.currentTarget, { x: 0, duration: 0.2 })} onClick={startNewGame}><span className="menu-index">02</span><span className="menu-action-copy"><b>NEW GAME</b><small>BEGIN AGAIN FROM CASE #01</small></span><FilePlus2 size={15} /><span className="button-glint" /></button>
          <button className="menu-button" onMouseEnter={hover} onMouseLeave={(event) => gsap.to(event.currentTarget, { x: 0, duration: 0.2 })} onClick={() => { setSettingsOpen(true); audioEngine.play('paper') }}><span className="menu-index">03</span><span className="menu-action-copy"><b>SETTINGS</b><small>CALIBRATE FIELD EQUIPMENT</small></span><Settings2 size={15} /></button>
          <button className="menu-button" onMouseEnter={hover} onMouseLeave={(event) => gsap.to(event.currentTarget, { x: 0, duration: 0.2 })} onClick={() => { setArchivesOpen(true); audioEngine.play('paper') }}><span className="menu-index">04</span><span className="menu-action-copy"><b>CASE ARCHIVES</b><small>REVIEW UNLOCKED DOSSIERS</small></span><Archive size={15} /></button>
        </nav>
      </section>

      <footer className="landing-footer"><span><Radio size={12} /> SECURE CHANNEL / LOCAL</span><span><i className="footer-signal" /> SIGNAL STABLE</span><span>ENGLISH // CLEARANCE {settings.difficulty.toUpperCase()}</span></footer>

      {archivesOpen && <div className="archive-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setArchivesOpen(false) }}><section className="archive-panel" role="dialog" aria-modal="true" aria-labelledby="archive-title"><header><div><p className="terminal-overline">B.S.I. / EVIDENCE STORAGE</p><h2 id="archive-title">Case archives</h2></div><button className="modal-close" aria-label="Close case archives" onClick={() => setArchivesOpen(false)}>×</button></header><p className="archive-intro">Select an unlocked dossier to set it as the active investigation.</p><div className="archive-list">{cases.map((item) => { const unlocked = game.unlockedCases.includes(item.id); return <button key={item.id} className={`archive-case ${unlocked ? 'unlocked' : 'locked'} ${item.id === game.currentCaseId ? 'current' : ''}`} disabled={!unlocked} onClick={() => { updateGame({ currentCaseId: item.id }); setArchivesOpen(false); audioEngine.play('click') }}><span className="archive-number">{String(item.id).padStart(2, '0')}</span><span className="archive-copy"><b>{item.title}</b><small>{item.chapterTitle}</small></span>{unlocked ? <span className="archive-open">{item.id === game.currentCaseId ? 'ACTIVE FILE' : 'OPEN FILE'}</span> : <span className="archive-locked"><LockKeyhole size={12} /> LOCKED</span>}</button> })}</div><button className="archive-launch" onClick={() => { setArchivesOpen(false); beginInvestigation() }}>OPEN ACTIVE DOSSIER <ArrowUpRight size={14} /></button></section></div>}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </main>
  )
}

export default LandingPage
