import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, AudioLines, Check, House, SlidersHorizontal, X } from 'lucide-react'
import { gsap } from 'gsap'
import { useGame } from '../context/GameContext'
import { audioEngine } from '../utils/audioEngine'

type SettingsModalProps = { onClose: () => void }

function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings, game, updateGame } = useGame()
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const timeline = gsap.timeline()
    timeline.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.18 })
      .fromTo(panelRef.current, { opacity: 0, y: 18, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }, '<')
    return () => { timeline.kill() }
  }, [])

  const close = () => {
    if (closing) return
    setClosing(true)
    gsap.to(panelRef.current, { opacity: 0, y: 12, scale: 0.99, duration: 0.18, ease: 'power1.in' })
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose })
  }

  const wipeRecords = () => {
    if (!window.confirm('Wipe all case records? This will return the campaign to Case #01 and restore credibility to 100.')) return
    updateGame({ gameState: 'landing', currentCaseId: 1, unlockedCases: [1], credibility: 100 })
    audioEngine.play('thunder')
  }

  const returnToTitle = () => {
    updateGame({ gameState: 'landing' })
    audioEngine.play('click')
    onClose()
  }

  return (
    <div className="modal-backdrop" ref={backdropRef} onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <section className="settings-panel" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header className="modal-header">
          <div className="modal-emblem"><SlidersHorizontal size={18} /></div>
          <div><p className="terminal-overline">B.S.I. / FIELD EQUIPMENT / CALIBRATION</p><h2 id="settings-title">System settings</h2></div>
          <button className="modal-close" aria-label="Close settings" onClick={close}><X size={18} /></button>
        </header>
        <p className="modal-intro">Adjust the bureau terminal. Changes are saved to this local profile immediately.</p>

        <div className="settings-group">
          <div className="settings-group-title"><AudioLines size={15} /> AUDIO CALIBRATION</div>
          <label className="setting-slider"><span><b>Soundtrack & rain</b><small>Landing-page piano score and soft rainfall</small></span><input type="range" min="0" max="100" value={settings.musicVolume} onChange={(event) => updateSettings({ musicVolume: Number(event.target.value) })} /><output>{settings.musicVolume}%</output></label>
          <label className="setting-slider"><span><b>Forensic SFX & voice</b><small>Mechanical cues and narrator level</small></span><input type="range" min="0" max="100" value={settings.voiceVolume} onChange={(event) => updateSettings({ voiceVolume: Number(event.target.value) })} /><output>{settings.voiceVolume}%</output></label>
          <button className="test-sound-button" onClick={() => audioEngine.play('stamp')}><span>▰</span> TEST SOUND <small>HEAVY FILE STAMP</small></button>
        </div>

        <div className="settings-group settings-options">
          <div className="settings-group-title"><Check size={15} /> FIELD INTERFACE</div>
          <div className="setting-toggle-row"><span><b>Narrator subtitles</b><small>Display inner monologue captions</small></span><button className={`terminal-toggle ${settings.subtitles ? 'on' : ''}`} role="switch" aria-checked={settings.subtitles} onClick={() => updateSettings({ subtitles: !settings.subtitles })}><i />{settings.subtitles ? 'ENABLED' : 'DISABLED'}</button></div>
          <div className="setting-toggle-row"><span><b>Dynamic flashlight beam</b><small>Cursor-tracked light and hidden evidence</small></span><button className={`terminal-toggle ${settings.flashlightEffect ? 'on' : ''}`} role="switch" aria-checked={settings.flashlightEffect} onClick={() => updateSettings({ flashlightEffect: !settings.flashlightEffect })}><i />{settings.flashlightEffect ? 'ENABLED' : 'DISABLED'}</button></div>
          <div className="setting-difficulty"><span><b>Detective clearance</b><small>Controls the level of statistical guidance</small></span><div className="difficulty-choice"><button className={settings.difficulty === 'rookie' ? 'selected' : ''} onClick={() => updateSettings({ difficulty: 'rookie' })}>ROOKIE DETECTIVE</button><button className={settings.difficulty === 'veteran' ? 'selected' : ''} onClick={() => updateSettings({ difficulty: 'veteran' })}>VETERAN DETECTIVE</button></div><p>{settings.difficulty === 'rookie' ? 'Scanner calculates Z/t statistics and displays formula guidance.' : 'Requires deeper forensic verification; formula guidance stays hidden.'}</p></div>
        </div>

        <div className="danger-zone"><div><span><AlertTriangle size={15} /> DANGER ZONE</span><small>Unlocked files: {game.unlockedCases.length} · Credibility: {game.credibility}%</small></div><button onClick={wipeRecords}>WIPE CASE RECORDS</button></div>
        <footer className="modal-footer"><span>LANGUAGE / ENGLISH ONLY</span><div className="settings-footer-actions"><button className="settings-title-button" onClick={returnToTitle}><House size={13} /> RETURN TO TITLE</button><button onClick={close}>CLOSE TERMINAL <X size={12} /></button></div></footer>
      </section>
    </div>
  )
}

export default SettingsModal
