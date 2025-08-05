# 🧠 Smart Discount Allocation Engine

A modular, explainable system to fairly allocate a fixed discount budget (kitty) among sales agents based on their performance, seniority, and workload — powered by real-time score evaluation and optional AI-generated justifications.

Built for the [Red Health Take-Home Assignment](https://red.health)

---

## 📌 Features

- ✅ Distributes base amount fairly across all agents
- 📊 Bonus distribution based on real-life performance percentages
- 🔐 Caps to prevent unfair over-allocation to a single agent
- 🤖 Justifications generated using **Gemini 2.0 Flash** or custom fallback
- 💡 Configurable and future-proof via `.env` settings
- 🧪 Includes support for multiple test scenarios

---

## 📁 Project Structure

```
discount-engine/
├── allocator.js          # Main logic for allocation
├── justifier.js          # Builds explanation using Gemini or templates
├── utils.js              # Helper for normalization and cap redistribution
├── index.js              # Script runner with multi-scenario execution
├── .env                  # Configuration file (explained below)
├── data/
│   └── sample-input.json # Test cases
└── output/
    └── case-*.json       # Outputs per test scenario
```

---

## 📥 Configuration (.env) — Explained with Real-Life Scenarios

```env
PARAM_WEIGHTS=performanceScore:0.35,targetAchievedPercent:0.3,activeClients:0.2,seniorityMonths:0.15
BASE_PERCENT=0.6
MAX_AGENT_CAP_PERCENT=0.4
ALLOW_LEFTOVER=false
GEMINI_API_KEY=your_google_api_key_here
USE_GEMINI=true
JUSTIFICATION_THRESHOLD=0.3
```

### 🔍 Real-World Rationale:

| Variable | Meaning | Real-Life Justification |
|----------|---------|------------------------|
| `performanceScore` (35%) | Agent's efficiency and overall contribution | Most critical metric — represents consistent sales capability |
| `targetAchievedPercent` (30%) | % of targets met (goal completion) | Reflects results-driven execution, important for revenue |
| `activeClients` (20%) | Number of currently active clients | Measures workload and responsibility |
| `seniorityMonths` (15%) | How long the agent has served | Loyalty & trust — but given lower weight than performance |
| `BASE_PERCENT=0.6` | 60% of kitty is equally distributed among all agents | Ensures fairness and basic motivation for all |
| `MAX_AGENT_CAP_PERCENT=0.4` | No agent can get >40% of total kitty | Prevents top-performers from monopolizing the budget |
| `ALLOW_LEFTOVER=false` | Leftover (undistributed) funds will be redistributed | Ensures full usage of available discount kitty |
| `JUSTIFICATION_THRESHOLD=0.3` | If agent gets <30% of kitty → generate motivating comment | Balances recognition vs encouragement |
| `USE_GEMINI=true` | Enables dynamic AI-based justification | Provides human-like explanations based on real performance |
| `GEMINI_API_KEY` | Your Google API key for Gemini 2.0 Flash | Required for calling the Gemini API |

---

## 🧪 Included Test Scenarios

```json
[ {"title": "Sample case", "...": "scores given in the pdf"},
  { "title": "Normal case", "...": "Varied scores and output" },
  { "title": "Identical scores", "...": "All agents are equal" },
  { "title": "Rounding edge", "...": "Small kitty, rounding stress test" }
]
```

**Generated files:**
```
output/case-1-sample-case.json
output/case-2-normal-case.json
output/case-3-identical-scores-case.json
output/case-4-rounding-edge-case.json
```

---

## ▶️ How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Update `.env` with your own API key if using Gemini.**

3. **Run all test cases:**
   ```bash
   node index.js
   ```

4. **Check outputs in the `/output` folder.**

---

## 💡 How Allocation Works

1. **Split kitty:** 60% base (equally), 40% bonus (performance-based)

2. **Bonus score = Sum of:**
   ```
   (Agent's value / total value) × parameter weight
   ```

3. **Cap enforcement** (max per-agent limit)

4. **Redistribute excess** if allowed

5. **Generate justification** (positive if ≥30%, else motivating)

---

## ✨ Sample Output

```json
{
  "id": "A2",
  "assignedDiscount": 3867.1203,
  "justification": "Excellent performance and target achievement made a strong impact. (capped)"
}
```

---

## 📬 Author

Developed by **[Sagar Kumar Yadav]**  
For Red Health assignment  


---

## 🚀 Additional Features

Let me know if you'd like:
- A `.env.example` file
- Markdown badges for prettier appearance
- Auto-score logs in `console.table` format during test runs