# SMILE Platform — Smart & Innovative Learning Environment

> **Open-source reference implementation** of the SMILE instructional model for numeracy teacher professional development in Indonesia.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-99.6%25-blue)](https://github.com/youtaid/smilenumerasi)
[![Built with React 19](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![AI-Powered](https://img.shields.io/badge/AI-Google%20Gemini-orange)](https://ai.google.dev)
[![Research-Backed](https://img.shields.io/badge/Research-UNJ%20Educational%20Technology-red)](https://unj.ac.id)

---

## 🎯 Why This Exists

Indonesia has **3.48 million teachers** and **52.9 million students** — yet ranks among the lowest in Southeast Asia on PISA numeracy outcomes. The root problem is not student capability. It is a structural gap in how teachers are professionally developed to *teach numeracy across all subjects*, not just mathematics.

This platform was born from a **two-year Design Thinking research study** at Universitas Negeri Jakarta (UNJ), Department of Educational Technology — involving **52 secondary school teachers across 6 schools in North Jakarta**. The study used FGD sessions with a Mindset-Skillset-Toolset framework to map the exact professional development needs of numeracy educators in Indonesian classrooms.

The finding was clear: teachers need not just content knowledge, but **structured, AI-assisted scaffolding** that meets them where they are — inside their daily lesson planning workflow, not outside of it.

**SMILE** is the answer.

---

## 📐 The SMILE Instructional Model

SMILE is a pedagogical syntax designed for **teacher professional development**, not just student learning:

| Phase | Meaning | What happens |
|-------|---------|-------------|
| **S** | Siap (Ready) | Mindset activation — teachers assess their numeracy beliefs and prior knowledge |
| **M** | Misi (Mission) | Goal-setting — teachers define specific competency targets per cluster |
| **I** | Integrasi (Integration) | Cross-subject numeracy — connecting math thinking to real subject contexts |
| **L** | Latih (Practice) | Skill-building — AI-assisted lesson plan creation, item bank development |
| **E** | Evaluasi (Evaluate) | Evidence of learning — pre/post assessment, rubric scoring, peer review |

This model is the result of validated academic research and is being published as a **Scopus-indexed journal article** (in preparation, target: Q1 Educational Technology journal).

---

## ✨ Platform Features

### 🎛 Cockpit Mastery (Dashboard)
Real-time visualization of teacher competency progression across 4 clusters (A–D), with XP tracking and badge system.

### 📚 SMILE Training Module (LMS)
Full learning management system — video modules, interactive quizzes, Mindset Assessment, and **AI-powered Reflection** that adapts feedback to individual teacher profiles.

### 🧪 Design Thinking Lab
End-to-end facilitation of the 5-stage DT process: **Empathize → Define → Ideate → Prototype → Test** — structured for use in teacher training workshops and in-school professional learning communities (PLC).

### 📝 Studio Modul Ajar (RPP Generator)
AI-assisted lesson plan generator compliant with Indonesia's **Deep Learning curriculum framework**, supporting both general schools (Sekolah Umum) and Islamic schools (Madrasah).

### 🏦 Studio Soal & Materi (Item Bank)
AI-powered numeracy item bank builder with support for **IRT-aware item design** (difficulty, discrimination, distractor analysis) — bridging classroom assessment with psychometric rigor.

### 📊 Pusat Asesmen
Pre/Post test system with Hake's normalized gain calculation, Likert attitude scales, and rubric-based portfolio scoring.

### 🤝 Kolaborasi 360°
Peer review system, discussion forums, and co-curricular activity generator for school-based teacher collaboration.

### 🏆 Jalur Kompetensi (Mastery Gates)
5-gate progressive competency pathway with XP economy and achievement badges — gamifying the professional development journey.

---

## 🔬 Research Foundation

This repository is grounded in active academic research:

- **FGD Study (2024):** 52 teachers, 6 schools, North Jakarta — using Design Thinking Empathize methodology + Liberating Structures facilitation
- **Framework:** Mindset-Skillset-Toolset (MST) for numeracy teacher professional development
- **Validation:** 6-dimension instrument with 18 aspects and 28 indicators (CTT/IRT psychometric approach)
- **Academic output:** Mixed-methods manuscript on teacher numeracy professional development needs (TNA + FGD, n=52) — target journal: *Teaching and Teacher Education* (Scopus Q1)
- **Institutional affiliation:** Department of Educational Technology, Universitas Negeri Jakarta (UNJ)

---

## 🌍 Ecosystem Impact

This is not just an application. It is **open educational infrastructure** — designed to be forked, adapted, and deployed by:

- **University researchers** building teacher PD programs in other Indonesian provinces
- **EdTech developers** who need a reference architecture for AI-integrated LMS for teachers
- **Teacher training institutions** (LPTK) needing a validated instructional model + working implementation
- **Government curriculum teams** piloting numeracy integration frameworks

**The impact pathway:**
```
52 teachers (FGD study, North Jakarta)
    ↓
Validated SMILE model (research-backed, open-sourced)
    ↓
Teacher training workshops using this platform
    ↓
Companion book "Guru Bernumerasi" (in publication)
    ↓
Scopus-indexed research establishing evidence base
    ↓
665,000+ SMP/SMA teachers in Indonesia
    ↓
52.9 million students impacted through better-prepared teachers
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS + Inter font |
| Auth & Database | Firebase Authentication + Firestore |
| AI Engine | Google Gemini API (`@google/genai`) |
| Math Rendering | KaTeX + react-markdown |
| Charts | Recharts |

Stack chosen deliberately as a **modern reference architecture** for AI-integrated educational tools — replacing outdated Moodle-based systems that dominate Indonesian EdTech infrastructure.

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repository
git clone https://github.com/youtaid/smilenumerasi.git
cd smilenumerasi

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Add your Gemini API key to .env.local:
# GEMINI_API_KEY=your_gemini_api_key_here

# 4. Run development server
npm run dev
# Open http://localhost:3000
```

### Quick Demo (No account needed)
Click **"Mode Demo (Masuk sebagai Guru/Admin)"** on the login page to explore the full platform without creating an account.

### Admin Access
Click **"Akses Cepat: Masuk sebagai Admin"** to access content management features.

### Firebase Auth
Register with Email/Password or Google (Belajar.id accounts supported).

---

## 📦 Production Build

```bash
npm run build
npm run preview
```

---

## 🤝 Contributing

This project welcomes contributions from:
- **Researchers** in educational technology, instructional design, or psychometrics
- **Developers** building EdTech solutions for Indonesian classrooms
- **Teachers** who want to provide feedback from the field

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. *(coming soon)*

---

## 📄 License

MIT License — free to use, adapt, and build upon for educational purposes.

---

## 👤 Author

**Farid Fachrudin (youtaid)**
- Operational & Academic Head, Konstanta Education (UTBK SNBT preparation center)
- Researcher, Educational Technology — Universitas Negeri Jakarta (UNJ)
- 25+ years experience in web & mobile development
- Research focus: numeracy teacher professional development, CTT/IRT psychometrics, AI in education

---

*Built to serve Indonesia's 3.48 million teachers and 52.9 million students — one open-source contribution at a time.*
