# 🧠 ExamGuru AI — Free AI Exam Coach for India

> UPSC · JEE · NEET · SSC · Bank PO — sab ek jagah. 100% FREE.

## Features
- ⚡ Smart Quiz Generator (any topic → 5 MCQs instantly)
- 🤔 Doubt Solver (Hindi + English)
- 📜 PYQ Pattern Analyzer
- 🌏 Current Affairs → Exam Notes
- ✍️ Answer Evaluator with score
- 🗺️ Personalized Study Roadmap

---

## 🚀 Deploy on Vercel (5 minutes)

### Step 1 — GitHub pe daalo
1. GitHub.com pe jaao → Login karo
2. "New repository" click karo
3. Name: `examguru-ai`
4. Public select karo → "Create repository"
5. Is poore folder ko upload karo (drag & drop)

### Step 2 — Vercel pe connect karo
1. [vercel.com](https://vercel.com) pe jaao → GitHub se login karo
2. "Add New Project" → `examguru-ai` repo select karo
3. Framework: **Vite** select karo
4. "Deploy" click karo

### Step 3 — API Key add karo (IMPORTANT)
Vercel dashboard mein:
1. Project Settings → Environment Variables
2. Add karo:
   - Name: `VITE_ANTHROPIC_KEY`
   - Value: `sk-ant-...` (tera Anthropic API key)
3. Redeploy karo

### Step 4 — Live! 🎉
Teri site live ho jayegi:
`https://examguru-ai.vercel.app`

---

## Local Development
```bash
npm install
npm run dev
```

---

## Tech Stack
- React 18 + Vite
- Claude Sonnet API (Anthropic)
- Zero backend — pure frontend
- Deploy: Vercel (free tier)
