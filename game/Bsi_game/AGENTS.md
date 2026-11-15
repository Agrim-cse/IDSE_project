# B.S.I. — Bureau of Statistical Investigation: The Null Protocol

## Project vision

Build a dark-noir interactive forensic detective game inspired by the rain-soaked dread and inner monologue of Alan Wake and Max Payne. Players investigate ten cases while learning one-sample hypothesis testing: one-sample Z-tests, one-sample t-tests, one-sample proportion Z-tests, and the difference between Type I and Type II errors. Statistics must remain mathematically correct and visible through the fiction: evidence reveals parameters, the player states hypotheses, scans a sampling distribution, and reaches a defensible verdict.

## Stack

- Vite, React, and TypeScript
- Tailwind CSS (Vite plugin), GSAP, Lucide React, and jStat
- Web Audio API procedural sound, with no required audio asset files
- Local storage for settings and campaign progress

## Noir visual rules

- Base: deep slate/black `#07090e`; use restrained near-black panels and soft slate borders.
- Desk-lamp amber: `#f59e0b`; forensic cyan: `#06b6d4`; blood crimson: `#e11d48`.
- Use film grain, rain, and a flashlight spotlight aesthetic. Keep overlays atmospheric and content legible.
- Cinzel (or Playfair Display) is for cinematic headings; Inter for readable interface copy; JetBrains Mono for evidence, parameters, and statistical readouts.
- Favor high contrast, sparse layouts, deliberate motion, and tactile paper/evidence details. Avoid bright, playful game styling.
- The entire game is strictly Noir English. Monologues, menus, settings, evidence, and teaching copy must stay in English; there is no language selector.

## Statistical and content rules

- Preserve the supplied case values and tail direction. The alternative hypothesis determines whether a test is left-tailed, right-tailed, or two-tailed.
- Case clues reveal the data a player needs; do not silently reveal the final verdict before the player reasons through it.
- Present fictional settings respectfully and keep statistical definitions precise in English.
- Keep computations and educational explanations accurate. Type I error is rejecting a true null; Type II error is failing to reject a false null.

## 7-Step Master Roadmap

- [x] Step 1: Base Setup, AGENTS.md, 10-Case Dataset, Procedural Audio Engine & GameState Context
- [x] Step 2: Noir Landing Page (Rain/Flashlight, Flickering Title) & Functional Settings Modal
- [ ] Step 3: Alan Wake Style Inner-Monologue Cutscene & GSAP Seamless Camera Slide-In to Desk
- [x] Step 4: Detective Desk UI, Interactive Clue Extraction & Hypothesis Builder (H0 vs Ha)
- [x] Step 5: Interactive SVG Bell Curve Scanner (Case #01 Z-test, cutoff calibration, verdict stamp, and warrant debrief)
- [ ] Step 6: All 10 Cases Progression, Case File Map, t-test df Dial & Level 10 Courtroom Boss Fight
- [ ] Step 7: Narrator Voiceover Hook System, Polish & Final QA

Future agents must read this file before work and update the roadmap and relevant project notes in `AGENTS.md` after completing each step.

## Language lock

The game is locked to Noir English (`language: 'english'`) across the UI and all narrative content. Persisted legacy profiles are normalized to English when loaded. Keep the language setting fixed and do not add alternate-language UI.

## Landing audio

- The user-provided looping piano soundtrack lives at `public/audio/landing-theme.mp3` and plays only while the landing page is mounted.
- Start playback on landing-page entry, retry after the first pointer or keyboard interaction if browser autoplay is blocked, and stop/reset the track when the player enters a case.
- Keep the procedural rain very soft and stop it with the soundtrack when leaving the landing page. The music-volume setting controls both layers.

## Step 3 vertical slice

- Current cutscene scope is only Scene 1 of Case #01, `The Diluted Antidote`: the Morgan General ICU opening and flatline climax.
- Remaining monologue beats and the GSAP desk transition are intentionally not connected until the user requests the next scene.
- Case #01 retains its four typed English `monologueBeats`, Chief Vikram Rathore's mentor note, and Syndicate Zero context for future scene work. Cases 2–10 may omit these fields and must keep a safe fallback presentation.
- Scene 1 narrator MP3s live in `public/audio/voice/`; `audioEngine.playNarratorLine` uses the noir EQ and falls back to English speech synthesis. Stop narration on replay, skip, title exit, or unmount.
- Scene 1 also uses procedural ECG and flatline audio and must clear its timers/timeline when replayed or unmounted.

## Step 5 vertical slice

- Case #01's Model-77 scanner is available after the desk locks Z = -2.70. It teaches the left-tail critical boundary (Zcrit = -1.645), compares p = 0.0035 with alpha = 0.05, and requires a verdict plus evidence-based warrant response.
- Serving the correct warrant closes Case #01 and unlocks Case #02. The scanner returns to the evidence desk through its top-bar control.

