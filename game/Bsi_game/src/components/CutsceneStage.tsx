import { useCallback, useEffect, useRef, useState } from 'react'
import { useGame } from '../context/GameContext'
import { audioEngine } from '../utils/audioEngine'
import { gsap } from 'gsap'

const LOCATION = 'MORGAN GENERAL HOSPITAL — ICU WARD 4 // 02:14 AM'
const FIRST_LINE = 'Rain washes the blood off the streets, but it never cleans the ledger...'
const SECOND_LINE = 'Twelve ICU patients flatlined tonight... waiting for a miracle that never kicked in.'

function CutsceneStage() {
  const { updateGame } = useGame()
  const cameraRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const stampRef = useRef<HTMLSpanElement>(null)
  const monitorRef = useRef<SVGGElement>(null)
  const vialRef = useRef<SVGGElement>(null)
  const timerRef = useRef<number | undefined>(undefined)
  const flatlineTimeoutRef = useRef<number | undefined>(undefined)
  const sceneRunRef = useRef(0)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const flatlineRef = useRef(false)
  const narrationActiveRef = useRef(false)
  const [location, setLocation] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [flatline, setFlatline] = useState(false)
  const [continueNotice, setContinueNotice] = useState(false)
  const [narratorSpeaking, setNarratorSpeaking] = useState(false)
  const [sceneIndex, setSceneIndex] = useState(1)
  const [sceneCue, setSceneCue] = useState('')

  const runLaterScene = useCallback(async (scene: number, runId: number) => {
    if (sceneRunRef.current !== runId) return
    if (scene > 4) {
      gsap.to('.cinema-bar', { height: 0, minHeight: 0, duration: 0.8, ease: 'power2.inOut' })
      gsap.to(cameraRef.current, { scale: 2.4, x: '-3%', y: '-18%', duration: 2, ease: 'power2.inOut', onComplete: () => updateGame({ gameState: 'desk' }) })
      return
    }
    audioEngine.stopNarrator()
    setSceneIndex(scene)
    setLocation(`CASE 01 // SCENE 0${scene} — ${['', 'THE ICU', 'CORPORATE CLAIM', 'THE SEIZED BATCH', 'THE DETECTIVE’S OFFICE'][scene]}`)
    gsap.to(cameraRef.current, { scale: 1, x: '0%', y: '0%', rotation: 0, duration: 1.1, ease: 'power2.out' })
    gsap.fromTo('.scene-story-visual', { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power2.out' })
    const lines = [
      '',
      '',
      'Aurelia Pharma swears every vial of their antidote carries a fifty-milligram punch... And the factory’s historical records lock population sigma at two milligrams.',
      'Chief Rathore dropped thirty-six seized vials on my desk before the Syndicate’s lawyers could burn them... The lab assay came back pale: forty-nine point one milligrams.',
      'Someone is skimming life-saving medicine into the black market... It’s time to fire up the Z-scanner, and prove this batch was watered down beyond a shadow of a doubt.',
    ]
    const audioFiles = ['', '', '/audio/voice/case01-s2.mp3', '/audio/voice/case01-s3.mp3', '/audio/voice/case01-s4.mp3']
    setSubtitle(lines[scene])
    setSceneCue(scene === 2 ? 'CLAIMED MEAN μ₀ = 50.0 MG  //  HISTORICAL σ = 2.0 MG [KNOWN]' : scene === 3 ? 'SEIZED BATCH #409  //  n = 36  //  SAMPLE MEAN x̄ = 49.1 MG  //  −0.9 MG BELOW CLAIM' : 'B.S.I. Z-SCANNER // STANDBY')
    audioEngine.play(scene === 3 ? 'stamp' : 'scanner')
    narrationActiveRef.current = true
    const fallback = lines[scene]
    await audioEngine.playNarratorLine(audioFiles[scene], fallback)
    if (sceneRunRef.current !== runId) return
    narrationActiveRef.current = false
    if (scene === 4) {
      gsap.to('.cinema-bar', { height: 0, minHeight: 0, duration: 0.8, delay: 0.4 })
      gsap.to(cameraRef.current, { scale: 2.4, x: '-3%', y: '-18%', duration: 2, delay: 0.4, ease: 'power2.inOut', onComplete: () => updateGame({ gameState: 'desk' }) })
      return
    }
    await new Promise((resolve) => window.setTimeout(resolve, 900))
    if (sceneRunRef.current === runId) void runLaterScene(scene + 1, runId)
  }, [updateGame])

  const playScene = useCallback(() => {
    const sceneRun = ++sceneRunRef.current
    setSceneIndex(1)
    setSceneCue('MORGAN GENERAL ICU // 02:14 AM')
    timelineRef.current?.kill()
    if (timerRef.current) window.clearInterval(timerRef.current)
    if (flatlineTimeoutRef.current) window.clearTimeout(flatlineTimeoutRef.current)
    audioEngine.stopNarrator()
    setLocation('')
    setSubtitle('')
    setFlatline(false)
    flatlineRef.current = false
    narrationActiveRef.current = false
    setContinueNotice(false)
    if (monitorRef.current) monitorRef.current.classList.remove('ecg-flatline')
    if (sceneRef.current) sceneRef.current.classList.remove('icu-alarm')
    if (cameraRef.current) gsap.set(cameraRef.current, { scale: 1, x: '0%', y: '0%', rotation: 0 })
    gsap.set('.cinema-bar', { height: '12vh', minHeight: 72 })
    if (vialRef.current) gsap.set(vialRef.current, { rotation: 0, transformOrigin: '50% 10%' })
    audioEngine.play('thunder')

    const typeProgress = { count: 0 }
    const timeline = gsap.timeline()
    timelineRef.current = timeline
    timeline.to(cameraRef.current, { scale: 1.09, x: '1.5%', y: '-1%', rotation: -0.25, duration: 2.5, ease: 'sine.inOut' }, 0)
      .to(typeProgress, { count: LOCATION.length, duration: 1.9, ease: 'none', onUpdate: () => setLocation(LOCATION.slice(0, Math.floor(typeProgress.count))) }, 0.2)
      .call(() => {
        setSubtitle(FIRST_LINE)
        audioEngine.play('click')
        narrationActiveRef.current = true
        if (timerRef.current) window.clearInterval(timerRef.current)
        void (async () => {
          await audioEngine.playNarratorLine('/audio/voice/case01-s1-line1.mp3', 'Rain washes the blood off the streets, but it never cleans the ledger.')
          if (sceneRunRef.current !== sceneRun) return
          narrationActiveRef.current = false
          // Give the first thought room to land; let one bedside pulse break the silence.
          await new Promise((resolve) => window.setTimeout(resolve, 850))
          if (sceneRunRef.current !== sceneRun) return
          audioEngine.playEcgBeep()
          await new Promise((resolve) => window.setTimeout(resolve, 500))
          if (sceneRunRef.current !== sceneRun) return
          setSubtitle(SECOND_LINE)
          audioEngine.play('click')
          narrationActiveRef.current = true
          const secondLine = audioEngine.playNarratorLine('/audio/voice/case01-s1-line2.mp3', 'Twelve ICU patients flatlined tonight... waiting for a miracle that never kicked in.')
          await secondLine
          if (sceneRunRef.current !== sceneRun) return
          narrationActiveRef.current = false
          // One final clean pulse, then the monitor drops into the flatline.
          await new Promise((resolve) => window.setTimeout(resolve, 350))
          if (sceneRunRef.current !== sceneRun) return
          audioEngine.playEcgBeep()
          await new Promise((resolve) => window.setTimeout(resolve, 450))
          if (sceneRunRef.current !== sceneRun) return
          setFlatline(true)
          flatlineRef.current = true
          monitorRef.current?.classList.add('ecg-flatline')
          sceneRef.current?.classList.add('icu-alarm')
          audioEngine.playFlatlineAlarm()
          gsap.to(cameraRef.current, { scale: 1.75, x: '-16%', y: '-9%', rotation: -0.4, duration: 3.3, ease: 'power2.inOut' })
          gsap.to(vialRef.current, { rotation: 2, duration: 0.22, yoyo: true, repeat: 5, ease: 'sine.inOut' })
          await new Promise((resolve) => window.setTimeout(resolve, 3300))
          if (sceneRunRef.current !== sceneRun) return
          if (timerRef.current) window.clearInterval(timerRef.current)
          if (flatlineTimeoutRef.current) window.clearTimeout(flatlineTimeoutRef.current)
          await new Promise((resolve) => window.setTimeout(resolve, 900))
          if (sceneRunRef.current === sceneRun) void runLaterScene(2, sceneRun)
        })()
      }, [], 2.5)
      .to(cameraRef.current, { scale: 1.28, x: '-8%', y: '-5%', rotation: 0.25, duration: 3.5, ease: 'sine.inOut' }, 2.5)

    let lastBeep = 0
    const startedAt = Date.now()
    timerRef.current = window.setInterval(() => {
      const seconds = (Date.now() - startedAt) / 1000
      if (!narrationActiveRef.current && !flatlineRef.current && seconds < 2.5 && seconds - lastBeep >= 1.1) {
        audioEngine.playEcgBeep()
        lastBeep = seconds
      }
    }, 100)
  }, [runLaterScene])

  useEffect(() => {
    const unsubscribe = audioEngine.onNarratorStateChange(setNarratorSpeaking)
    playScene()
    return () => {
      unsubscribe()
      timelineRef.current?.kill()
      if (timerRef.current) window.clearInterval(timerRef.current)
      if (flatlineTimeoutRef.current) window.clearTimeout(flatlineTimeoutRef.current)
      sceneRunRef.current += 1
      narrationActiveRef.current = false
      audioEngine.stopNarrator()
    }
  }, [playScene])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { audioEngine.stopNarrator(); updateGame({ gameState: 'landing' }) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [updateGame])

  const continueAtEnd = () => { const runId = sceneRunRef.current; void runLaterScene(sceneIndex + 1, runId) }

  return (
    <main className={`icu-cinema ${flatline ? 'flatline-event' : ''}`}>
      <div className="icu-camera" ref={cameraRef}>
        <div className="icu-scene" ref={sceneRef}>
          <svg className="icu-illustration" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A rain-soaked hospital ICU at night">
            <defs>
              <linearGradient id="icuSky" x2="0" y2="1"><stop stopColor="#09121c"/><stop offset="1" stopColor="#26343b"/></linearGradient>
              <linearGradient id="glassGlow" x2="0" y2="1"><stop stopColor="#243b48"/><stop offset="1" stopColor="#101b23"/></linearGradient>
              <linearGradient id="cyanCone" x2="0" y2="1"><stop stopColor="#8bd5dc" stopOpacity=".35"/><stop offset="1" stopColor="#80c6d0" stopOpacity="0"/></linearGradient>
              <linearGradient id="amberCone" x2="0" y2="1"><stop stopColor="#ffc56b" stopOpacity=".18"/><stop offset="1" stopColor="#ffc56b" stopOpacity="0"/></linearGradient>
              <filter id="softGlow"><feGaussianBlur stdDeviation="7"/></filter>
              <clipPath id="windowClip"><rect x="140" y="76" width="940" height="490" rx="3"/></clipPath>
            </defs>
            <rect width="1600" height="900" fill="#11171a"/>
            <rect x="95" y="36" width="1030" height="565" fill="#05090d" stroke="#394044" strokeWidth="20"/>
            <g clipPath="url(#windowClip)">
              <rect x="140" y="76" width="940" height="490" fill="url(#icuSky)"/>
              <circle cx="840" cy="170" r="76" fill="#9cb8c2" opacity=".13" filter="url(#softGlow)"/>
              <path d="M140 420 L230 350 308 398 410 292 492 390 574 320 650 404 756 300 860 390 930 280 1080 400V566H140Z" fill="#0a1117"/>
              <g fill="#d9a953" opacity=".45"><path d="M231 380h8v13h-8zM325 376h7v12h-7zM432 335h8v13h-8zM588 371h7v12h-7zM785 349h7v12h-7zM971 337h8v13h-8z"/></g>
              <path d="M140 447H1080M140 475H1080" stroke="#080d12" strokeWidth="3" opacity=".7"/>
              <g className="icu-rain-svg" stroke="#bed8df" strokeOpacity=".35" strokeWidth="2"><path d="M205 75l-38 115m126-115-30 90m141-88-42 128m145-130-34 104m144-105-42 127m145-128-33 103m132-101-41 124m149-125-34 106m143-107-42 128m128-121-30 93"/></g>
              <g stroke="#090d11" strokeWidth="14" opacity=".9"><path d="M374 76v490M610 76v490M846 76v490"/><path d="M140 255h940"/></g>
            </g>
            <rect x="1125" y="0" width="475" height="900" fill="#12181a"/>
            <path d="M0 660H1600V900H0Z" fill="#151715"/>
            <path d="M0 680H1600" stroke="#3b352b" strokeWidth="8"/>

            {/* Surgical lamp and its cold cone */}
            <path d="M665 0v94l76 44" stroke="#171d1e" strokeWidth="18" fill="none"/>
            <path d="M693 121Q743 90 793 125L772 162H710Z" fill="#242b2a" stroke="#7d8174" strokeWidth="5"/>
            <path d="M727 160L516 650H1010L758 160Z" fill="url(#cyanCone)"/>
            <ellipse cx="743" cy="147" rx="33" ry="8" fill="#b1e2df" opacity=".72" filter="url(#softGlow)"/>
            <path d="M721 163L569 632H958L758 163Z" fill="url(#amberCone)"/>

            {/* Bed and patient silhouette */}
            <g fill="#080c0f" stroke="#343a38" strokeWidth="8">
              <path d="M265 575h862v152H265z"/><path d="M300 726v130m770-130v130" strokeWidth="18"/>
              <path d="M210 630h980" strokeWidth="18"/>
            </g>
            <path d="M350 566q30-65 125-47l128 21q91-40 189 7l127 31-45 68H365Z" fill="#111617" stroke="#414644" strokeWidth="5"/>
            <ellipse cx="391" cy="548" rx="54" ry="37" fill="#090d10"/><path d="M354 532q35-44 80-10" fill="none" stroke="#626c68" strokeWidth="7" opacity=".4"/>

            {/* IV stand, bag, chamber, line and hanging glass vial */}
            <g className="iv-rig">
              <path d="M1250 145v690m-57-12h112m-55-690h-44m44 0h43" stroke="#747a75" strokeWidth="8" fill="none"/>
              <path d="M1211 142q0-26 27-26h32q26 0 26 26v116q0 18-19 22h-48q-18-4-18-22Z" fill="#a9d0cb" fillOpacity=".17" stroke="#9baea5" strokeWidth="5"/>
              <path d="M1218 212h72v44q0 16-16 19h-41q-15-3-15-19Z" fill="#a8d9d1" fillOpacity=".18"/>
              <path d="M1247 263v67q0 12 11 12t11-12v-67" fill="none" stroke="#c1ddd4" strokeWidth="4"/>
              <circle className="iv-droplet" cx="1258" cy="303" r="5" fill="#e6f4e9"/>
              <path d="M1258 340v52q0 22 38 22v63" stroke="#a8cec7" strokeOpacity=".64" strokeWidth="4" fill="none"/>
              <g ref={vialRef} className="antidote-vial">
                <rect x="1276" y="473" width="42" height="95" rx="8" fill="#b5d7cf" fillOpacity=".2" stroke="#c2d5c9" strokeWidth="4"/>
                <rect x="1282" y="462" width="30" height="18" rx="3" fill="#92845d"/>
                <path d="M1280 531h34v29h-34z" fill="#b2a16a" fillOpacity=".76"/>
                <text x="1297" y="545" textAnchor="middle" fill="#17201c" fontSize="10" fontFamily="monospace" fontWeight="bold">AURELIA</text>
                <text x="1297" y="555" textAnchor="middle" fill="#17201c" fontSize="9" fontFamily="monospace">50MG</text>
              </g>
            </g>

            {/* ECG bedside monitor hero prop */}
            <g ref={monitorRef} className="ecg-monitor" transform="translate(773 350)">
              <path d="M0 0h360q20 0 20 20v190q0 20-20 20H0q-20 0-20-20V20Q-20 0 0 0Z" fill="#090e0e" stroke="#424c47" strokeWidth="12"/>
              <rect x="8" y="13" width="325" height="155" rx="3" fill="#06110e" stroke="#162921" strokeWidth="3"/>
              <g className="ecg-grid" stroke="#2b4738" strokeOpacity=".43"><path d="M22 32h295M22 58h295M22 84h295M22 110h295M22 136h295"/><path d="M50 20v140m35-140v140m35-140v140m35-140v140m35-140v140m35-140v140m35-140v140m35-140v140"/></g>
              <svg x="18" y="34" width="305" height="88" viewBox="0 0 305 88" className="ecg-wave-window"><path className="ecg-wave" d="M0 47h28l8-4 7 4h12l7-7 8 7h9l8-10 7 10h13l7-5 8 5h14l5-4 5 4h12l7-6 7 6h11l8-31 7 63 8-35h17l8-5 7 5h13l8-9 8 9h12l7-4 7 4h17"/></svg>
              <path className="flatline-wave" d="M25 79h295"/>
              <text className="monitor-status" x="23" y="193" fill="#74d79e" fontSize="13" fontFamily="monospace">HR: 48 BPM // PATIENT #12</text>
              <text className="monitor-arrest" x="23" y="193" fill="#ff3c43" fontSize="13" fontFamily="monospace">0 BPM // CARDIAC ARREST</text>
              <circle cx="340" cy="193" r="7" fill="#79d693" className="monitor-led"/>
            </g>
            <g className="ambulance-sweep"><rect x="0" y="0" width="1600" height="900" fill="#2f9fe6" opacity=".08"/><rect x="0" y="0" width="1600" height="900" fill="#e33442" opacity=".08"/></g>
          </svg>
          <div className="wet-glass-sweep" />
          <div className="icu-emergency-wash" />
          <div className="foreground-doorframe" /><div className="foreground-curtain" />
          <div className="icu-vignette" />
          {sceneIndex > 1 && <div className={`scene-story-visual scene-story-${sceneIndex}`}>
            <div className="scene-story-backdrop" />
            <div className="scene-story-kicker">B.S.I. FORENSIC RECONSTRUCTION // CASE 01</div>
            <div className="scene-story-hero">
              {sceneIndex === 2 && <><span>AURELIA PHARMA // BOTTLING LINE</span><h2>THE CORPORATE CLAIM</h2><div className="conveyor-vials">{Array.from({ length: 7 }, (_, i) => <i key={i} />)}</div><b>CLAIMED POPULATION MEAN μ₀: 50.0 MG</b><b>HISTORICAL SIGMA σ: 2.0 MG [KNOWN]</b></>}
              {sceneIndex === 3 && <><span>EVIDENCE LOCKER // BATCH #409</span><h2>THE SEIZED BATCH</h2><div className="crate-scene">SEIZED // 36 VIALS</div><div className="scene-vial-grid">{Array.from({ length: 36 }, (_, i) => <i key={i} />)}</div><b className="scene-reading">SAMPLE MEAN x̄: 49.1 MG</b><b>−0.9 MG BELOW CLAIM</b></>}
              {sceneIndex === 4 && <><span>DETECTIVE’S OFFICE // 02:31 AM</span><h2>THE NULL PROTOCOL</h2><div className="scene-desk-props"><i>CASE DOSSIER</i><i>SEIZED VIALS · n=36</i><i className="scanner-boot">B.S.I. Z-SCANNER <b>∩</b></i></div><b>THE EVIDENCE IS ON THE DESK.</b></>}
            </div>
            <div className="scene-telemetry">{sceneCue}</div>
          </div>}
        </div>
      </div>

      <div className="cinema-bar cinema-top">
        <span ref={stampRef} className="icu-location-stamp">{location}<i>_</i></span>
        <nav className="cinema-controls" aria-label="Scene controls">
          <button onClick={() => sceneIndex === 1 ? playScene() : continueAtEnd()}>PREV</button>
          <button onClick={playScene}>REPLAY SCENE</button>
          <button onClick={continueAtEnd}>NEXT <b>»</b></button>
          <button onClick={() => { audioEngine.stopNarrator(); updateGame({ gameState: 'desk' }) }}>SKIP TO DESK <b>»</b></button>
          <button onClick={() => { audioEngine.stopNarrator(); updateGame({ gameState: 'landing' }) }}>ESC — TITLE</button>
        </nav>
      </div>
      <div className="cinema-bar cinema-bottom">
        <div className="narrator-indicator"><span>NARRATOR // DETECTIVE VOICE</span><i className={narratorSpeaking ? 'speaking' : ''}><b /><b /><b /><b /><b /><b /><b /><b /></i></div>
        <div className={`icu-subtitle ${subtitle ? 'subtitle-visible' : ''}`} aria-live="polite">{subtitle && <>“{subtitle}”</>}</div>
        {continueNotice && <span className="scene-hold-note">SCENE 01 COMPLETE — SCENE 02 WILL FOLLOW</span>}
      </div>
      <div className="icu-film-grain" aria-hidden="true" />
    </main>
  )
}

export default CutsceneStage
