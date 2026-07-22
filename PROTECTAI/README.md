<div align="center">

<img src="https://raw.githubusercontent.com/panjasiddarth-hub/PROTECTAI/main/docs/protectai_webpage_map.png" alt="ProtectAI Banner" width="100%" />

# 🛡️ ProtectAI

### *Industrial Safety Intelligence — Powered by AI*

**An AI-driven compound-risk detection platform that connects fragmented safety signals into a unified, explainable, and actionable intelligence layer for industrial environments.**

[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python_FastAPI-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![YOLO](https://img.shields.io/badge/YOLO_Vision-FF6F00?style=for-the-badge&logo=opencv&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](#)

---

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🏗️ Architecture](#️-architecture) • [📸 Screenshots](#-screenshots) • [🎯 Demo Flow](#-demo-flow) • [📄 Docs](#-hackathon-docs)

</div>

---

## 🎯 The Problem

Industrial safety systems today are **siloed**. Gas sensors, temperature monitors, PPE compliance, work permits, incident records — they all operate independently. No one connects the dots until it's too late.

> **A hot-work permit is active. Gas readings are rising. A nearby zone had a similar incident last year. The second gas test was never done.**
> 
> *No single system catches this. ProtectAI does.*

## 💡 The Solution

ProtectAI is a **simulation-first industrial safety intelligence platform** that fuses multi-source signals into a **compound risk score** with full explainability.

```
┌──────────────────┐   ┌─────────────────┐   ┌──────────────────┐
│  Active Hot-Work │   │  Rising Gas      │   │  Missing 2nd     │
│  Permit          │   │  Reading         │   │  Gas Test        │
└────────┬─────────┘   └────────┬────────┘   └────────┬─────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                ▼
                    ┌───────────────────────┐
                    │  🛡️ ProtectAI Engine   │
                    │  Compound Risk: 87/100 │
                    │  Status: CRITICAL      │
                    └───────────┬───────────┘
                                ▼
              ┌─────────────────────────────────┐
              │ Explain · Act · Report · Audit   │
              └─────────────────────────────────┘
```

It doesn't just **detect** risk — it **explains** why, **recommends** what to do, and **generates** the paperwork.

---

## 🚀 Quick Start

### Frontend (React + Vite)

```bash
# Clone the repository
git clone https://github.com/panjasiddarth-hub/PROTECTAI.git
cd PROTECTAI

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** — demo login accepts any non-empty email/password.

### Vision Agent (Python FastAPI)

<details>
<summary><b>🪟 Windows PowerShell</b></summary>

```powershell
cd vision-agent
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:VISION_MOCK="true"
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

</details>

<details>
<summary><b>🐧 macOS / Linux</b></summary>

```bash
cd vision-agent
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
VISION_MOCK=true python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

</details>

Verify: **[http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)** ✅

<details>
<summary><b>🔬 Optional: Train & run YOLO model mode</b></summary>

```bash
cd vision-agent
pip install -r requirements-model.txt
python train.py
# Place checkpoint at vision-agent/models/best.pt
MODEL_PATH=models/best.pt python -m uvicorn app:app --reload --port 8000
```

</details>

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 📊 Risk Intelligence Dashboard
Real-time compound-risk scoring with full **factor decomposition**, lead-time estimation, and similar-incident evidence retrieval.

### 📋 Permit Risk Center
Cross-references active work permits against **live simulated plant conditions** — flags missing gas tests, expired authorizations, and proximity hazards.

### 🔍 Compliance Audit Workflow
Tracks missing evidence, assigns owners, sets due dates, and generates corrective action trails — fully auditable.

### 📹 Vision Lab (CCTV/PPE)
Software-based CCTV frame analysis with **mock mode** (no model needed) or **YOLO-powered** PPE detection via the Python Vision Agent.

</td>
<td width="50%" valign="top">

### 🤖 AI Copilot
Searches seeded incident databases and safety guidance documents — answers natural-language safety queries with evidence citations.

### 🗺️ Factory Map
Interactive plant visualization showing zones, worker positions, sensor readings, and camera coverage.

### 📺 Live Monitoring
Simulated camera feeds, alert streams, and grouped sensor dashboards for real-time situational awareness.

### 📑 Report Generation
One-click **simulation reports** and **preliminary incident reports** — ready for audit trails and management review.

</td>
</tr>
</table>

### 🧠 What Makes It Intelligent

| Signal | Source | Contribution |
|--------|--------|-------------|
| Work Permits | Permit database | Authorization + proximity risk |
| Environmental Sensors | Gas, temperature, humidity | Threshold breach + trend |
| CCTV / PPE | Vision Agent (YOLO/mock) | Worker compliance score |
| Historical Incidents | Incident DB + AI retrieval | Pattern similarity weight |
| Compliance Evidence | Audit trail | Missing docs + overdue actions |
| Plant Zones | Factory map | Proximity + exposure radius |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│          Digital Plant Simulator / CCTV Replay        │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │     Specialist Safety Agents   │
         │                               │
         │  🔬 Sensor    👁️ Vision       │
         │  📋 Permit    📜 History      │
         │  ⚙️ Machine   ✅ Compliance   │
         │  🚨 Response                  │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │      Central Orchestrator      │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Compound Risk / DCIRI Engine │
         └───────┬───────────┬───────────┘
                 │           │
        ┌────────┴──┐  ┌────┴────────┐  ┌────────────┐
        │ Explain +  │  │ Dashboard + │  │ Response + │
        │ Evidence   │  │ Alerts      │  │ Reports    │
        └───────────┘  └─────────────┘  └────────────┘
```

> **Future-ready:** Architecture supports MQTT, OPC-UA, Modbus, SCADA, and real CCTV/SCADA adapters — no hardware lock-in.

---

## 📸 Screenshots

### Vision Lab — PPE Detection

<details>
<summary><b>Click to expand</b></summary>

![Vision Lab Mock PPE Event](https://raw.githubusercontent.com/panjasiddarth-hub/PROTECTAI/main/docs/vision-lab-mock-event.png)

*Mock PPE event: 2 workers detected, compliance estimate, missing-helmet violation flagged.*

</details>

### Application Pages

| Page | Purpose |
|------|---------|
| **Dashboard** | Plant overview, KPIs, current compound-risk state |
| **Risk Intelligence** | Scenario engine, risk score, factors, evidence, response workflow |
| **Permit Risk Center** | Permits vs. current simulated conditions |
| **Compliance Audit** | Missing evidence, owners, due dates, corrective actions |
| **Vision Lab** | Image-based PPE analysis (mock or YOLO) |
| **AI Copilot** | Natural-language incident & safety guidance search |
| **Factory Map** | Zones, workers, sensors, cameras |
| **Live Monitoring** | Simulated cameras, alerts, sensor groups |
| **Incidents** | Incident record search & review |
| **Reports** | Simulation & preliminary incident report generation |
| **Analytics** | Incident trends, severity distribution, zone exposure |
| **Settings** | Demo workspace configuration |

---

## 🎯 Demo Flow

Follow this script to showcase ProtectAI end-to-end:

```
 1️⃣  Open Risk Intelligence
 2️⃣  Click "Activate permit"
 3️⃣  Click "Raise sensor signal"
 4️⃣  Click "Trigger critical event"
 5️⃣  Review score, lead time, contributing factors & similar incidents
 6️⃣  Open Permit Risk Center → see missing gas-test evidence
 7️⃣  Open Compliance Audit → assign a corrective action
 8️⃣  Return to Risk Intelligence → start human-approved response
 9️⃣  Open Reports → generate the preliminary incident report
 🔟  Open Vision Lab → run a PPE detection event
```

> ⏱️ **Total demo time: ~3 minutes** — perfect for hackathon pitches.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 5.9, Tailwind CSS 4, Vite 7 |
| **UI/UX** | Framer Motion, Lucide React Icons |
| **Backend API** | Supabase-compatible serverless routes |
| **Vision Agent** | Python, FastAPI, YOLO (optional) |
| **State Management** | React Context + shared simulation state |
| **Deployment** | Vercel (frontend), local/self-hosted (vision agent) |
| **Routing** | React Router v7 |

---

## 📂 Project Structure

```
PROTECTAI/
├── api/                          # Supabase/Vercel-compatible API routes
├── src/
│   ├── components/               # Dashboard, layout, reusable UI
│   ├── contexts/                 # Auth & simulation state providers
│   ├── hooks/                    # Shared React hooks
│   ├── lib/                      # API clients, demo data, evidence contracts
│   └── pages/                    # All application pages (12 modules)
├── vision-agent/                 # Python FastAPI PPE/CCTV Agent
│   ├── app.py                    # FastAPI server
│   ├── vision_agent.py           # Detection logic
│   ├── train.py                  # YOLO training script
│   ├── infer_video.py            # Video inference utility
│   ├── requirements.txt          # Lightweight mock-mode deps
│   └── requirements-model.txt    # YOLO/PyTorch deps (optional)
├── docs/                         # Architecture diagrams & screenshots
├── package.json
├── vite.config.ts
└── vercel.json
```

---

## 📄 Hackathon Docs

| Document | Description |
|----------|-------------|
| [`docs/ProtectAI_Hackathon_Technical_Documentation.docx`](docs/) | Full technical paper: architecture, agent design, risk model, evaluation plan, limitations |
| [`HACKATHON_DEMO_GUIDE.md`](HACKATHON_DEMO_GUIDE.md) | Step-by-step demo script for live presentations |

---

## 🔬 Research Alignment

ProtectAI implements the proposed research direction for:

- ✅ Multi-source industrial safety reasoning
- ✅ Permit-linked compound risk assessment
- ✅ Explainable evidence chains
- ✅ Historical incident retrieval
- ✅ Human-approved emergency response workflows
- ✅ Software CCTV/PPE event integration

> **Transparency:** This prototype does **not** claim verified live industrial performance. Formal DCIRI calibration, trained CV evaluation, vector retrieval, and real-time orchestration are future phases.

---

## 🛡️ Safety & Responsible Use

> ProtectAI is a **decision-support prototype**. It does not control real machinery, emergency shutdowns, or evacuation systems. Any future industrial deployment requires qualified safety review, validated data, cybersecurity controls, regulatory review, human approval, and site-specific testing.

---

## 🤝 Contributing

This is a hackathon prototype. Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is a hackathon prototype. Add project and dataset licenses before public or commercial redistribution.

---

<div align="center">

### Built with 💙 for safer industrial workplaces

**If ProtectAI resonates with you, drop a ⭐ on the repo!**

[⬆ Back to Top](#-protectai)

</div>
