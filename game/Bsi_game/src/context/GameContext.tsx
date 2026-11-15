import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { audioEngine } from '../utils/audioEngine'
export type Difficulty = 'rookie' | 'veteran'
export type GameScreen = 'landing' | 'case_map' | 'cutscene' | 'desk' | 'scanner' | 'boss_tribunal'
export type GameSettings = { musicVolume: number; voiceVolume: number; subtitles: boolean; flashlightEffect: boolean; language: 'english'; difficulty: Difficulty }
export type CampaignState = { gameState: GameScreen; currentCaseId: number; unlockedCases: number[]; credibility: number }
type GameContextValue = { settings: GameSettings; game: CampaignState; updateSettings: (patch: Partial<GameSettings>) => void; updateGame: (patch: Partial<CampaignState>) => void }

const defaults: GameSettings = { musicVolume: 35, voiceVolume: 80, subtitles: true, flashlightEffect: true, language: 'english', difficulty: 'rookie' }
const initialGame: CampaignState = { gameState: 'landing', currentCaseId: 1, unlockedCases: [1], credibility: 100 }
const SETTINGS_KEY = 'bsi-null-protocol:settings'
const GAME_KEY = 'bsi-null-protocol:gameState'
const GameContext = createContext<GameContextValue | null>(null)

function readStored<T>(key: string, fallback: T): T {
  try { const stored = localStorage.getItem(key); return stored ? { ...fallback, ...JSON.parse(stored) } as T : fallback }
  catch { return fallback }
}

function readSettings(): GameSettings {
  const stored = readStored(SETTINGS_KEY, defaults)
  return { ...stored, language: 'english' }
}

function readCampaign(): CampaignState {
  const stored = readStored(GAME_KEY, initialGame)
  return { ...stored, gameState: 'landing' }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(readSettings)
  const [game, setGame] = useState<CampaignState>(readCampaign)
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); audioEngine.setMusicVolume(settings.musicVolume); audioEngine.setSfxVolume(settings.voiceVolume) }, [settings])
  useEffect(() => { localStorage.setItem(GAME_KEY, JSON.stringify(game)) }, [game])
  const value = useMemo<GameContextValue>(() => ({
    settings, game,
    updateSettings: (patch) => setSettings((current) => ({ ...current, ...patch })),
    updateGame: (patch) => setGame((current) => ({ ...current, ...patch })),
  }), [settings, game])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within GameProvider')
  return context
}
