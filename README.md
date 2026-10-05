# 🌌 VEERA SATYA SAI PRASANNA — AI UNIVERSE PORTFOLIO

> **AI/ML • GenAI • Intelligent Systems**  
> An immersive, multidimensional personal portfolio and autonomous content management system architected for AI/ML, Generative AI, and intelligent systems engineering.

---

## 🛰️ Architecture & Core Highlights

- **Visual Metaphor:** AI/ML + futuristic technology + deep space + subtle fantasy. Deep space and fantasy serve purely as the visual canvas; rigorous AI/ML engineering remains the core identity.
- **Strict Two-Door Entry Experience:**
  - `[ 🚀 ENTER THE UNIVERSE ]`: Public, read-only observation mode for recruiters and visitors. No edit or administrative capabilities are exposed.
  - `[ 🔐 MY LOGIN ]`: Secure cryptographic gateway leading directly to **VEERA MISSION CONTROL**.
- **Dynamic AI Worlds:** Database-driven sectors including *ML Galaxy, Agentic AI World, Generative AI Nebula, RAG Realm, Computer Vision Lab, NLP World, Engineering Arena, Space-Tech Lab*.
- **Planetary Project Case Studies:** In-depth technical case studies with mission overview, problem, solution, AI/ML approach, system architecture diagram, tech stack, contributions, challenges, solutions, and learnings.
- **Interactive Skill Constellation:** Semantic node topology mapping technical competencies and dependencies without boring flat lists.
- **Orbital Journey & Achievement Galaxy:** Cosmic flight paths tracking career milestones, honors, and verified credentials.
- **Resume Station & Resume Intelligence:**
  - Instant PDF/text resume parsing with structured AI extraction.
  - Zero-hallucination mode: Extracts only information explicitly present in the document.
  - **Duplicate Detection:** Automatic conflict identification with `MERGE`, `REPLACE`, `KEEP EXISTING`, or `REVIEW MANUALLY`.
  - **Manual Data Preservation (Rule 13):** Existing GitHub repositories, live deployment URLs, demo videos, screenshots, architecture diagrams, and custom writeups survive future resume synchronization.
  - **Change Report Audit:** Owner reviews every field before changes update the live database.
- **Production Backend & RLS:** Complete PostgreSQL schema with Row-Level Security (`supabase/schema.sql`) plus seamless offline vault fallback for zero setup friction.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build optimized production bundle
npm run build
```

The application will be live at `http://localhost:3000/`.

---

## 🔐 Mission Control Access

1. On the landing screen, click `[ 🔐 MY LOGIN ]` (or navigate to `http://localhost:3000/#mission-control`).
2. Enter your commander email and master cipher password.
3. Upon first initialization, your credentials will securely initialize your cryptographic owner session.
4. From **VEERA MISSION CONTROL**, you can:
   - Ingest new resumes via **Resume Intelligence**.
   - Manage AI Worlds (reorder, toggle, edit visual properties).
   - Deploy new project missions, case studies, and architecture diagrams.
   - Configure skill constellations, journey milestones, and achievement artifacts.
   - Update your profile, bio, and social transmission coordinates.
   - Download or restore complete JSON backups.

---

## 🗄️ Supabase Cloud Integration (Optional)

The application operates with zero setup friction out-of-the-box using the built-in persistent storage vault. To link a production Supabase instance:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and execute the script in `supabase/schema.sql`.
3. In the project root, copy `.env.example` to `.env` and fill in:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   VITE_GEMINI_API_KEY=your-gemini-api-key # Optional for Resume Intelligence
   ```
4. Restart the dev server (`npm run dev`). The status indicator in Mission Control will instantly display **Supabase Live Connected**.

---

## 📐 Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Space Grotesk & Inter typography.
- **Graphics & Sensory:** Layered HTML5 Canvas particle & neural synapse graph, smooth cursor parallax, responsive reduced-motion accessibility.
- **Icons & Styling:** Lucide React, Custom Brand SVGs, Glassmorphism & Holographic shaders.
- **Document & AI Ingestion:** `pdfjs-dist`, Google Gemini 1.5/2.0 API integration, deterministic zero-hallucination NLP parser.
- **Backend & Security:** PostgreSQL / Supabase, Row-Level Security (RLS), WebCrypto PBKDF2/SHA-256 session vault.
