# SkillSense AI 🧠

> AI-powered skill assessment & personalised learning plan generator

[Live Demo](https://skill-sense-ai-tawny.vercel.app) | [GitHub Repo](https://github.com/dmshreyas28/SkillSense_ai)

## 📸 Screenshots

| Step 1 — Upload | Step 2 — Assessment | Step 3 — Results |
|---|---|---|
| ![Upload](screenshots/step%201.jpg) | ![Assessment](screenshots/step%202.jpg) | ![Results](screenshots/step%203.jpg) |



SkillSense AI solves a critical problem: a resume tells you what someone *claims* to know — not how well they actually know it.

This agent:
1. Takes a Job Description + Resume (PDF) as input
2. Conversationally assesses real proficiency on each required skill
3. Identifies skill gaps with scores and reasoning
4. Generates a personalised learning plan with curated resources & time estimates
5. Exports a full PDF report

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS v3 + Glassmorphism |
| Animations | Framer Motion |
| AI Model | Llama 3.3 70B via Groq API |
| PDF Parsing | unpdf |
| Deployment | Vercel |

## 🚀 Quick Start

```bash
git clone https://github.com/dmshreyas28/SkillSense_ai
cd SkillSense_ai
npm install
```

Create a `.env` file:
Get a free Groq API key at [console.groq.com](https://console.groq.com)

```env
VITE_GROQ_API_KEY=your_groq_key_here
```

```bash
npm run dev
```

## 📊 Scoring Logic

- AI extracts top 5 skills from the Job Description
- For each skill, Llama 3.3 70B generates a conversational question
- Answers scored 1-10 based on clarity, accuracy, and depth
- Skills scoring below 7 flagged as gaps
- Learning plan generated for all gap skills

## 🌐 Live Demo

[https://skill-sense-ai-tawny.vercel.app](https://skill-sense-ai-tawny.vercel.app)

Built with ❤️ for the Deccan AI Hackathon 2026
