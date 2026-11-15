# B.S.I. — Bureau of Statistical Investigation
## The Null Protocol

**A noir detective game where you solve the case by doing the statistics yourself.**

### [▶ Play B.S.I. — The Null Protocol](https://bsi-nine.vercel.app)

Live deployment: **[https://bsi-nine.vercel.app](https://bsi-nine.vercel.app)**

> Rain covers the city. It does not cover the numbers.

Someone may be watering down a life-saving antidote. Aurelia Pharma says every vial contains **50.0 mg**. Thirty-six seized vials tell a different story. Your job is to inspect the records, calculate what the batch actually contains, test the company's claim, and defend your conclusion.

This project combines a rain-soaked detective story with a guided, hands-on introduction to statistical hypothesis testing. You do not just read a solution: you gather the inputs, calculate the sample mean and Z-statistic, set the rejection boundary, and decide what the evidence supports.

---

## Contents

- [What you do in the game](#what-you-do-in-the-game)
- [The investigation, step by step](#the-investigation-step-by-step)
- [The statistics behind Case 01](#the-statistics-behind-case-01)
- [Difficulty and settings](#difficulty-and-settings)
- [Controls](#controls)
- [Run the game on your computer](#run-the-game-on-your-computer)
- [Built with](#built-with)
- [Current project scope](#current-project-scope)

## What you do in the game

You are a detective in the **Bureau of Statistical Investigation**. The bureau handles cases where a claim must be checked against sample data. The first investigation, **Case 01: The Diluted Antidote**, teaches a **one-sample, left-tailed Z-test for a population mean**.

The case is designed around a simple rule: every number used in the test must come from evidence or from a calculation you performed. For example, the factory records disclose the known population standard deviation, but the sample mean is deliberately left for you to calculate from the vial readings.

The game currently includes:

- A noir title screen with a piano soundtrack, soft rain, case continuation, archives, and settings.
- An animated opening scene at Morgan General Hospital, with narrator audio and optional subtitles.
- A desk investigation with three documents, raw vial readings, draggable evidence, and a scientific calculator.
- A hypothesis and test-selection challenge.
- A formula assembly stage that checks whether you put the values in the right places and preserves the sign of the result.
- A CRT-style normal-curve scanner for calibrating the left-tail cutoff and comparing the test result with the significance level.
- A verdict, three-question response to the defense, a closing scene, and a case debrief.

## The investigation, step by step

### 1. Inspect the case files

Open the three documents on the desk:

1. **Aurelia Pharma Compliance Dossier** — provides the claimed mean, **μ₀ = 50.0 mg**, and significance level, **α = 0.05**.
2. **Factory Calibration Logbook** — confirms that the population standard deviation is known: **σ = 2.0 mg**.
3. **Morgue Seized Vial Telemetry** — shows the individual measurements from **36 vials**. It does not give you the sample mean.

Drag each evidence slip into its matching slot in the evidence tray. The sample mean must be calculated from the measurements; it is not a clue you can pin directly.

### 2. Calculate the sample mean

The calculator is part of the desk. To total the vial readings, press **Σ** on the calculator, choose how many readings to include, and press **Enter** (or `=`). For the complete batch, choose all 36 readings. The calculator returns their sum.

Then calculate:

```text
sample mean = sum of the 36 vial readings ÷ 36
```

Save the verified result as an evidence chip. You will use this value as **x̄**, the observed sample mean.

### 3. State the hypotheses and choose the test

The null hypothesis represents Aurelia's claim:

```text
H₀: μ = 50.0 mg
```

The allegation is that the vials are under-filled, so the alternative hypothesis points below the claim:

```text
Hₐ: μ < 50.0 mg
```

The “less than” sign makes this a **left-tailed** test. Because the factory's population standard deviation **σ** is known, select a **one-sample Z-test**. A one-sample t-test is used when the population standard deviation is unknown and the sample standard deviation is used instead.

### 4. Assemble the Z formula

Place the evidence chips into the formula slots:

```text
             x̄ − μ₀
Z = ─────────────────────
         σ / √n
```

The order in the numerator matters. **Observed sample mean minus claimed population mean** gives a negative result when the sample mean is below the claim. Once the correctly identified values are placed, the desk calculates the statistic.

### 5. Scan the curve and make the call

On the Model-77 scanner, move the cutoff to the left-tail boundary for **α = 0.05** and lock it. Then inject the observed test statistic. The scanner shows how the observed result compares with the rejection boundary and the p-value threshold.

Choose a verdict, then answer three questions from Aurelia's defense counsel. The questions check whether you can explain standard errors, interpret a p-value under the null hypothesis, and state the statistical conclusion accurately. The case closes with a cinematic aftermath and a debrief showing your remaining credibility.

## The statistics behind Case 01

Here are the values used in the investigation:

| Symbol | Meaning | Case value |
| --- | --- | ---: |
| **μ₀** | Claimed population mean dosage | 50.0 mg |
| **σ** | Known population standard deviation | 2.0 mg |
| **n** | Number of vials in the sample | 36 |
| **x̄** | Mean dosage measured in the sample | 49.1 mg |
| **α** | Significance level | 0.05 |

The sample mean is computed from the raw vial measurements. With those values, the test statistic is:

```text
Z = (x̄ − μ₀) / (σ / √n)
  = (49.1 − 50.0) / (2.0 / √36)
  = −0.90 / 0.3333
  = −2.70
```

For a left-tailed test at **α = 0.05**, the critical value is approximately **Zcrit = −1.645**. The one-tailed p-value for **Z = −2.70** is approximately **0.0035** (0.35%). The scanner's job is to help you compare those quantities and make the decision; the debrief explains the conclusion.

### Quick glossary

- **Population mean (μ):** the true average dosage across all vials produced by the process.
- **Sample mean (x̄):** the average dosage measured in the 36 seized vials.
- **Population standard deviation (σ):** how much individual vial dosages vary in the production population. It is known here from the calibration records.
- **Standard error (σ / √n):** the expected spread of sample means around the population mean under the null hypothesis.
- **Significance level (α):** the chosen threshold for the probability of a Type I error—rejecting a true null hypothesis.
- **p-value:** assuming the null hypothesis is true, the probability of observing a result at least as extreme in the direction specified by the alternative hypothesis. It is not the probability that the null hypothesis is true.
- **Type II error:** failing to reject a null hypothesis that is false.

## Difficulty and settings

Open **Settings** from the title screen or desk to adjust music and sound volume, narrator subtitles, the cursor flashlight, and detective clearance.

- **Rookie Detective** displays field-guide explanations for the current stage, including the meaning of the parameters, how to choose a tail and test, and how to assemble the formula.
- **Veteran Detective** hides those formula and concept hints so you must rely more on the documents and your own reasoning.

The game UI and narrative are in **Noir English**. Audio and campaign settings are saved in your browser's local storage.

## Controls

| Input | What it does |
| --- | --- |
| Mouse | Open documents, drag evidence slips, place formula chips, and operate the scanner |
| `0`–`9`, `.` | Enter numbers in the desk calculator |
| `+`, `-`, `*`, `/`, `(`, `)` | Build a calculator expression (`*` and `/` also work on the numpad) |
| `Σ` button or `S` key | Enter summation mode for the vial readings |
| Calculator sample-count selector | Choose how many readings to sum, from 1 to 36 |
| `Enter` or `=` | Evaluate the current expression or total the selected vial readings |
| `Backspace` | Delete the last character entered in the calculator |
| `Escape` | Clear the calculator display |

## Run the game on your computer

### Requirements

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/installation)
- Git, if you are cloning the project

### Install and start the development server

Open a terminal in the folder where you want the project, then run:

```bash
git clone https://github.com/Arpit-69-glitch/Bsi_game.git
cd Bsi_game
pnpm install
pnpm dev
```

Vite prints a local address in the terminal, usually `http://localhost:5173`. Open that address in your browser. Keep the terminal running while you play; press `Ctrl+C` there to stop the development server.

### Create and preview a production build

```bash
pnpm run build
pnpm preview
```

The build output is written to `dist/`. The preview command serves that built version locally. The GitHub repository is [Arpit-69-glitch/Bsi_game](https://github.com/Arpit-69-glitch/Bsi_game).

### If `pnpm` is not recognized

Install pnpm using its [official installation instructions](https://pnpm.io/installation), then close and reopen your terminal so Windows refreshes its command path. You can check the tools with:

```bash
node --version
pnpm --version
```

## Built with

- **React** and **TypeScript** for the game interface and state.
- **Vite** for local development and production builds.
- **Tailwind CSS** for styling support, with custom CSS for the noir desk and instruments.
- **GSAP** for cinematic scene and interface animation.
- **Lucide React** for interface icons.
- **jStat** for statistical distribution utilities.
- **Web Audio API** for procedural effects; included MP3 files provide landing music and Case 01 narration.

## Current project scope

The game is a work in progress. **Case 01, “The Diluted Antidote,” is the current playable vertical slice**, from the opening scene through the desk investigation, scanner, warrant questions, aftermath, and debrief. Completing it unlocks the Case 02 archive entry, but the complete ten-case campaign is not implemented yet.

The larger plan is to build out additional one-sample mean tests, one-sample proportion tests, Type I and Type II error scenarios, and a final courtroom case. Until those investigations are implemented, the README and in-game archive should be read as a roadmap—not as a claim that all ten cases are playable.

---

**B.S.I. // FIELD OFFICE**  
*Inspect the evidence. Show your working. Make a conclusion the numbers can defend.*
