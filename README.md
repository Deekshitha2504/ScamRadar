# ScamRadar — Hackathon Blueprint & Project Planner

Welcome to **ScamRadar**, a unified cyber-defense platform powered by server-side integration of Advanced GenAI to detect scam messages, phishing URLs, and screenshot alerts in real-time. 

This repository contains the complete frontend control surface and backend security node configurations. Below is the active development strategy and timeline curated for the ScamRadar hackathon sprint.

---

## 🛠️ Hackathon Development Strategy

### 👥 Team Structure (8-Hour Parallel Strategy)

Our team of four executes modular responsibilities in parallel. This keeps the work flowing without blocking critical dependency paths.

| Member | Role | Active Responsibilities | Estimated Focus |
| :--- | :--- | :--- | :--- |
| **Person 1** | Backend Dev | FastAPI backend setup, Message Analysis API, Risk Scoring algorithms, and keyword rule index database mapping. | `2-3 Hours` |
| **Person 2** | OCR & URL Specialist | URL reputation scanning module, IP & Shortlink tracking filters, Pillow-based image OCR parsing, and visual marker analyzers. | `2-3 Hours` |
| **Person 3** | Frontend Developer | Interactive React SPA dashboard application, state managers, form validation, and real-time API integrations. | `3-4 Hours` |
| **Person 4** | Deployment & Lead | Pitch deck, slide audit, Vercel/Render pipeline, n8n automated webhook workflows, and mock reheasals. | `2-3 Hours` |

---

### ⏱️ Suggested Agile Timeline

The 8-hour sprint lifecycle below represents our exact parallel timeline from initiation to submission:

| Timeline | Person 1 (Backend) | Person 2 (OCR & URL) | Person 3 (React UI) | Person 4 (Lead & Pitch) |
| :--- | :--- | :--- | :--- | :--- |
| **Hour 1** | Backend Workspace Setup | URL Scanner Setup & Registry | React SPA Scaffold Setup | App Architecture Slides |
| **Hour 2** | Message Detection Endpoints | URL Syntax Analyses | Core Layout & Styling | Render Cloud Pipeline Deploy |
| **Hour 3** | Swagger API Testing | OCR File Capture Module | API client integration | n8n workflow webhook hook |
| **Hour 4** | Scam Weights Adjustment | OCR Integration Checklist | Results Display Dashboard | Judging Presentation Deck |
| **Hour 5–6** | Core Integration Tests | Security rules verification | Form Input Validators | Pre-pitch Team Mock Rehearsal |
| **Hour 7** | Deployment verification | Latency improvements | UX / UI System Polish | Slide presentation audit |
| **Hour 8** | Final bug sweeps | Tidy workspaces | Production Dry Runs | Submitting final deliverables |

---

## 💻 Tech Stack & Framework Alignments

- **Frontend Environment**: React 19 + TypeScript, bundler managed with **Vite**.
- **Interactive UI Components**: Streamlined with **motion/react** layout animations.
- **Visuals & Iconography**: Beautifully rendered using **Lucide-React**.
- **Styling Paradigm**: Utility-first styling via **Tailwind CSS**.
- **Generative AI Core**: Server-side client endpoints configured over **@google/genai** SDK.
