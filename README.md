# IDSE Course Final Submission

This repository contains the final project deliverables for the IDSE course, split into two distinct applications: 
1. **The Pipeline Project (`/pipeline`):** A Quantitative Portfolio Risk Engine and Data Pipeline.
2. **The Educational Game (`/game`):** B.S.I. — The Null Protocol, an interactive statistical investigation game.
3. **Project Documentation (`/documents`):** Contains the comprehensive project reports and final presentation slides.

---

## Repository Structure
\`\`\`text
IDSE_project/
├── pipeline/      # Streamlit ML Pipeline & Quant Risk Engine
├── game/          # React/Vite Educational Statistics Game
└── documents/     # Project reports and presentation slides
\`\`\`

---

## 1. Quantitative Portfolio Risk Engine (Pipeline)

A Streamlit application for historical portfolio simulation, classical portfolio optimization, market and asset diagnostics, and forward-volatility analysis. The project combines local NSE equity price files with pandas, NumPy, Plotly, PyPortfolioOpt, and LightGBM.

*Note: This is an educational analytics project. Its historical results are not live investment performance, and its forecasts and allocations are not investment advice.*

### Core Modules
* **Historical Simulator:** Record dated, whole-share buys and sells and inspect the resulting portfolio history, tracking NAV, CAGR, and drawdowns.
* **Classical Quant Engine:** Compare equal-weight, minimum-volatility, and maximum-Sharpe portfolios; inspect allocations, risks, and an out-of-sample rolling backtest using PyPortfolioOpt.
* **EDA & Statistics:** Explore asset returns, correlations, sector comparisons, distributions, and rolling risk.
* **ML Risk Engine:** A LightGBM regressor pipeline that engineers market-level features to estimate forward market volatility (30 trading sessions), reviewing share-weighted portfolios to calculate integer-share rebalance recommendations.

### How to Run Locally
Ensure you have Python 3.10+ installed. Navigate to the `pipeline` directory:

\`\`\`bash
cd pipeline
python -m venv .venv

# On Windows:
.venv\Scripts\Activate.ps1
# On Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
streamlit run app/app.py
\`\`\`
The dashboard will be served locally at `http://localhost:8501`.

---

## 2. B.S.I. — The Null Protocol (Educational Game)

**Live deployment:** [Play B.S.I. — The Null Protocol](https://bsi-nine.vercel.app)

A noir detective game where you solve the case by doing the statistics yourself. You are a detective in the Bureau of Statistical Investigation. The first investigation, *Case 01: The Diluted Antidote*, teaches a one-sample, left-tailed Z-test for a population mean. You do not just read a solution: you gather the inputs, calculate the sample mean and Z-statistic, set the rejection boundary, and decide what the evidence supports.

### Tech Stack
* **Frontend:** React and TypeScript
* **Build Tool:** Vite
* **Styling & Animation:** Tailwind CSS and GSAP
* **Math/Audio:** jStat for statistical distributions, Web Audio API for procedural effects.

### The Investigation (Case 01)
1. **Inspect the case files:** Review the Compliance Dossier (claim: μ₀ = 50.0 mg, α = 0.05), Calibration Logbook (σ = 2.0 mg), and raw vial readings.
2. **Calculate the sample mean:** Use the desk calculator to sum 36 vial readings and find the average (x̄ = 49.1 mg).
3. **Assemble the Z-Formula:** Drag and drop evidence chips into the formula `Z = (x̄ − μ₀) / (σ / √n)` to calculate the test statistic (-2.70).
4. **Scan the curve:** Use the CRT-style Model-77 scanner to calibrate the left-tail cutoff, inject the test statistic, compare the p-value, and make a verdict.

### Controls

| Input | Action |
| :--- | :--- |
| **Mouse** | Open documents, drag evidence slips, place formula chips, operate scanner |
| **0–9, .** | Enter numbers in the desk calculator |
| **+, -, *, /, (, )** | Build a calculator expression |
| **Σ or S** | Enter summation mode for the vial readings |
| **Enter or =** | Evaluate the current expression or total the selected vial readings |
| **Backspace / Esc**| Delete last character / Clear calculator display |

### How to Run Locally
Ensure you have [Node.js](https://nodejs.org/) (LTS) and [pnpm](https://pnpm.io/installation) installed. Navigate to the `game` directory:

\`\`\`bash
cd game
pnpm install
pnpm dev
\`\`\`
Vite will print a local address in the terminal (usually `http://localhost:5173`). Open that address in your browser to play.