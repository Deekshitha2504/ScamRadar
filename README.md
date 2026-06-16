# 🛡️ ScamRadar — Hackathon Blueprint & Project Planner

**ScamRadar** is a unified cyber-defense platform powered by server-side integration of Advanced GenAI to detect scam messages, phishing URLs, and screenshot alerts in real-time. 

---

## 🚀 Getting Started (How to Run)

The primary application is a unified **Node.js/Express server** that hosts the React frontend (via Vite dev server middleware) and handles GenAI backend APIs.

### 1. Unified Web App (React + Node/Express)

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root folder (using [.env.example](file:///c:/Users/dhana/Desktop/Deeksh/ScamRadar/.env.example) as a reference) and insert your Gemini API key:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```
   *Note: If no valid key is provided, ScamRadar will automatically fall back to local offline heuristic engines for message/URL scanning and simulated visual scans.*

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to **`http://localhost:3000`**.

4. **Build and Run for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

### 2. Optional Python Microservice (FastAPI + OCR)

A secondary Python microservice ([main.py](file:///c:/Users/dhana/Desktop/Deeksh/ScamRadar/main.py)) is included to serve as an alternative OCR scanner using EasyOCR and Pillow.

1. **Set Up a Virtual Environment & Install Packages:**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   pip install fastapi uvicorn pydantic pillow easyocr
   ```

2. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   ```
   Access the interactive docs at **`http://localhost:8000/docs`**.

---

## 🛠️ Tech Stack & Frameworks

*   **Frontend Core:** React 19 + TypeScript bundled with **Vite 6**.
*   **Styling Paradigm:** Utility-first styling via **Tailwind CSS 4**.
*   **Animations:** Smooth layout transitions using **motion/react**.
*   **Iconography:** Rendered via **Lucide-React**.
*   **Backend Server:** Node.js + **Express** using **tsx** (TypeScript runner) and **esbuild** (production compiler).
*   **Generative AI:** Server-side endpoints powered by the official **@google/genai** SDK querying `gemini-3.5-flash` with structured JSON schema outputs.
*   **Auxiliary Backend:** Python **FastAPI** + **EasyOCR** for modular text extraction from image attachments.

---

## 👥 Team Roles & Contributions

A parallel 8-hour strategy divides modular responsibilities to ensure independent progression:

*   **Person 1 (Backend Dev):** Setup of the backend, Message Analysis API ([detector.py](file:///c:/Users/dhana/Desktop/Deeksh/ScamRadar/detector.py)), risk scoring algorithms, and keyword rule index database mapping.
*   **Person 2 (OCR & URL Specialist):** Phishing URL reputation scanning, IP & Shortlink tracking filters, Pillow-based image OCR parsing, and visual marker analyses.
*   **Person 3 (Frontend Developer):** Interface development of the React SPA dashboard, tab navigation, state management, form validation, and real-time API integrations.
*   **Person 4 (Deployment & Lead):** Devops pipelines (Vercel/Render), automated webhook workflows (n8n), pitch deck, and mock judging presentations.
