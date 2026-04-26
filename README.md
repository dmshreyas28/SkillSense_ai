# SkillSense AI 🧠

> **AI-powered skill assessment & personalised learning plan generator**  
> Conversationally evaluates real candidate proficiency — not just what's on a resume.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://skill-sense-ai-tawny.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-blue?style=for-the-badge&logo=github)](https://github.com/dmshreyas28/SkillSense_ai)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Powered by Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-orange?style=for-the-badge)](https://groq.com)

---

## 📸 Screenshots

| Step 1 — Upload | Step 2 — Assessment | Step 3 — Results |
|---|---|---|
| ![Upload](screenshots/step%201.jpg) | ![Assessment](screenshots/step%202.jpg) | ![Results](screenshots/step%203.jpg) |

---

## 📌 Problem Statement

A resume tells you what someone *claims* to know — not how well they actually know it.

Recruiters and hiring managers spend hours screening candidates, writing interview questions, and manually judging responses. There's no standardised, scalable way to:
- Verify skill depth before interviews
- Identify exactly which skills are missing
- Give candidates actionable feedback with a learning roadmap

**SkillSense AI solves all three.**

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📄 PDF Resume Parsing | Browser-native PDF text extraction using `unpdf` — zero server required |
| 🤖 AI Skill Extraction | Llama 3.3 70B reads the JD and identifies the top 5 critical skills |
| 💬 Conversational Assessment | AI generates one focused, conversational question per skill |
| 📊 Intelligent Scoring | Each answer is scored 1–10 with AI reasoning |
| 🎯 Gap Detection | Skills below 7/10 are automatically flagged as gaps |
| 📚 Learning Plan | Personalised plan with curated resources and time estimates per skill |
| 📥 PDF Export | Full report exported via a clean print-ready new window |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│                                                         │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────────┐ │
│  │ Step 1   │──▶│   Step 2     │──▶│    Step 3       │ │
│  │ Upload   │   │  Assessment  │   │    Results      │ │
│  └──────────┘   └──────────────┘   └─────────────────┘ │
│       │                │                    │           │
│  ┌────▼────┐      ┌────▼────┐         ┌────▼────┐      │
│  │  unpdf  │      │ Groq API│         │ Groq API│      │
│  │  (PDF   │      │ Q&A     │         │ Learning│      │
│  │  parse) │      │ Engine  │         │  Plan   │      │
│  └─────────┘      └─────────┘         └─────────┘      │
│                                                         │
│            React + TypeScript + Vite + Tailwind         │
└─────────────────────────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │     Groq Cloud API      │
              │  Model: Llama 3.3 70B   │
              │  Endpoint: /v1/chat/    │
              │  completions (OpenAI    │
              │  compatible)            │
              └─────────────────────────┘
```

### Data Flow

```
PDF Upload + JD Text
        │
        ▼
[unpdf] Extract resume text
        │
        ▼
[Groq] Prompt: "Extract top 5 skills from this JD"
        │
        ▼
Skills Array → State
        │
        ▼
For each skill:
  [Groq] Generate conversational question
        │
  User answers in chat UI
        │
  [Groq] Score answer 1-10 + reasoning
        │
        ▼
Scores Array → State
        │
        ▼
[Groq] Generate learning plan for gap skills (score < 7)
        │
        ▼
Results Dashboard + PDF Export
```

---

## 📊 Scoring & Assessment Logic

### Skill Extraction
The AI receives the full Job Description and Resume text together. It is instructed to extract exactly **5 skills** that are:
- Explicitly mentioned in the JD as required
- Verifiable through a conversational interview
- Technical or domain-specific (not soft skills)

### Question Generation
For each skill, the AI generates a **single, conversational question** that:
- Can be answered in 2–3 sentences
- Requires no code writing
- Tests conceptual understanding and real-world experience
- Is tailored to the specific JD context

### Answer Scoring (1–10 scale)

| Score | Meaning |
|---|---|
| 9–10 | Expert-level. Deep understanding, can articulate edge cases |
| 7–8 | Proficient. Solid understanding with practical experience |
| 5–6 | Basic. Awareness of concepts but limited depth |
| 3–4 | Beginner. Vague or partially correct understanding |
| 1–2 | Minimal. Little to no demonstrated knowledge |

> **Gap threshold: < 7** — Any skill scoring below 7 triggers a learning plan entry.

### Learning Plan Generation
The AI generates a plan per gap skill containing:
- **Priority level** (High / Medium / Low) based on how critical the skill is to the JD
- **Estimated time** to reach proficiency (e.g., "2 Weeks", "1 Month")
- **Curated resources** — a mix of Courses, Videos, and Books

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + TypeScript | Component-driven UI with full type safety |
| **Build Tool** | Vite 5 | Extremely fast HMR and ESM-first bundling |
| **Styling** | Tailwind CSS v3 | Utility-first with custom design tokens |
| **Animations** | Framer Motion | Smooth page transitions and micro-animations |
| **Icons** | Lucide React | Consistent, minimal icon library |
| **AI Model** | Llama 3.3 70B (Groq) | Fast inference, strong reasoning, free tier |
| **API** | Groq Cloud (`/openai/v1/chat/completions`) | OpenAI-compatible, ultra-low latency |
| **PDF Parsing** | `unpdf` | Browser-native, zero worker config needed |
| **Deployment** | Vercel | Instant CI/CD from GitHub |

---

## 🗂️ Project Structure

```
SkillSense AI/
│
├── 📄 index.html                  # Vite HTML entry point
├── 📄 package.json                # Dependencies & scripts
├── 📄 vite.config.ts              # Vite build configuration
├── 📄 tailwind.config.js          # Custom brand colors & fonts
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 .env                        # Local environment variables (gitignored)
├── 📄 .env.example                # Template for contributors
├── 📄 .gitignore                  # Excludes node_modules, .env, dist
│
├── 📁 screenshots/                # README screenshots
│
└── 📁 src/
    ├── 📄 main.tsx                # React DOM root mount
    ├── 📄 App.tsx                 # Root: global state, routing, settings modal
    ├── 📄 index.css               # Global styles, glassmorphism, design tokens
    │
    ├── 📁 components/
    │   ├── 📄 Background.tsx      # Animated gradient background canvas
    │   ├── 📄 StepIndicator.tsx   # 3-step progress bar with animations
    │   ├── 📄 StepUpload.tsx      # Step 1 — JD textarea + PDF drag & drop
    │   ├── 📄 StepAssessment.tsx  # Step 2 — Chat interface for Q&A assessment
    │   └── 📄 StepResults.tsx     # Step 3 — Score cards, learning plan, PDF export
    │
    └── 📁 utils/
        └── 📄 api.ts              # All Groq API calls: extract, question, score, plan
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com) (takes 30 seconds)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/dmshreyas28/SkillSense_ai
cd SkillSense_ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

Edit `.env` and add your Groq API key:
```env
VITE_GROQ_API_KEY=gsk_your_key_here
```

```bash
# 4. Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🌐 Live Demo

**🔗 [https://skill-sense-ai-tawny.vercel.app](https://skill-sense-ai-tawny.vercel.app)**

The live deployment uses a shared Groq API key. For best performance, add your own key via the ⚙️ Settings button in the top-right corner of the app.

> **Note:** The free Groq tier has rate limits. If you see a rate limit error, wait 1–2 minutes and retry.

---

## 🔌 API Integration

All AI calls route through `src/utils/api.ts` using the **OpenAI-compatible Groq endpoint**:

```
POST https://api.groq.com/openai/v1/chat/completions
Authorization: Bearer YOUR_GROQ_KEY
Model: llama-3.3-70b-versatile
```

### Functions

| Function | Input | Output |
|---|---|---|
| `extractSkills()` | JD text + Resume text | `string[]` — top 5 skills |
| `generateQuestion()` | JD + skill name | `string` — interview question |
| `scoreAnswer()` | skill + question + answer | `{ score: number, reasoning: string }` |
| `generateLearningPlan()` | array of `{ skill, score }` | `LearningPlanItem[]` — full plan |

---

## 📥 PDF Report

Clicking **Download Report PDF** opens a new tab with a fully pre-rendered HTML report and triggers the browser's print dialog automatically. The report includes:

1. **Header** — SkillSense AI branding + generation date
2. **Skill Proficiency** — each skill with score and AI reasoning
3. **Personalised Learning Plan** — gap skills with priority, time, and resources

> 💡 **Tip:** In the print dialog → More settings → uncheck **Headers and footers** for a cleaner PDF.

---

## 🔒 Security Notes

- API keys are stored **only in browser memory** (React state) — never sent to any third-party server
- The `.env` file is git-ignored — your key is safe
- All AI calls go directly from browser → Groq API — no backend server involved

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push and open a PR

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

Built with ❤️ for the **Deccan AI Hackathon 2026**
