# ProtectAI — Industrial Safety Intelligence MVP

ProtectAI is a **simulation-first industrial safety intelligence platform** that detects compound risk by combining work permits, environmental events, plant zones, historical incidents, compliance evidence and software-based CCTV/PPE observations.

> **Prototype status:** ProtectAI MVP is a software-defined digital-plant demonstration. It does not connect to physical IoT sensors, live industrial control systems or certified emergency shutdown equipment.

![ProtectAI Web Page Map](docs/protectai_webpage_map.png)

## Why ProtectAI?

Industrial safety systems often monitor individual hazards separately:

- Gas readings
- Temperature
- Machine condition
- Worker PPE
- Work permits
- Incident records

ProtectAI connects these signals. For example:

```text
Active hot-work permit
+ rising gas reading
+ permit within the nearby risk radius
+ similar historical incidents
+ missing second gas test
= critical compound-risk assessment
```

The system explains the contributing evidence and proposes human-approved actions such as pausing the permit, repeating a gas test, notifying the control room and generating a preliminary incident report.

## MVP capabilities

- Simulation-based digital plant
- Explainable compound-risk assessment
- Shared simulation state and audit trail
- Risk Intelligence dashboard
- Permit Risk Center
- Compliance Audit workflow
- Emergency response checklist
- Historical incident evidence retrieval
- AI Copilot prototype
- Software CCTV/PPE Vision Lab
- Python FastAPI Vision Agent with mock and optional YOLO modes
- Preliminary simulation and incident report generation
- Responsive React interface

## Main application pages

| Page | Purpose |
|---|---|
| **Dashboard** | Plant overview, KPIs and current compound-risk state |
| **Risk Intelligence** | Main scenario, risk score, factors, evidence and response workflow |
| **Permit Risk Center** | Reviews permits against current simulated plant conditions |
| **Compliance Audit** | Shows missing evidence, owners, due dates and corrective actions |
| **Vision Lab** | Tests image-based PPE events with mock or model-backed Vision Agent |
| **AI Copilot** | Searches seeded incident and safety-guidance evidence |
| **Factory Map** | Shows zones, workers, sensors and cameras |
| **Live Monitoring** | Shows simulated cameras, alerts and sensor groups |
| **Incidents** | Searches and reviews incident records |
| **Reports** | Generates simulation and preliminary incident reports |
| **Analytics** | Shows incident trends, severity and zone exposure |
| **Settings** | Demo workspace settings and account controls |

## Vision Lab screenshot

The Vision Lab accepts a software CCTV frame or a public PPE dataset image. It can run a deterministic mock event without a trained model, or call the optional Python Vision Agent service.

![Vision Lab mock PPE event](docs/vision-lab-mock-event.png)

The screenshot shows a mock PPE event with:

- Two workers detected
- PPE compliance estimate
- Vision risk estimate
- Model confidence
- A simulated missing-helmet violation

## Architecture

```text
Digital Plant Simulator / Software CCTV Replay
                  |
                  v
       Specialist Safety Agents
  Sensor · Vision · Permit · History
  Machine · Compliance · Response
                  |
                  v
         Central Orchestrator
                  |
                  v
       Compound Risk / DCIRI Engine
                  |
        -------------------------
        |           |           |
   Explanation   Dashboard   Response
   + Evidence    + Alerts    + Reports
```

The architecture is designed so that future MQTT, OPC-UA, Modbus, SCADA, CCTV and database adapters can publish events using the same contracts. Physical devices are not required for the current MVP.

## Demonstration workflow

1. Open **Risk Intelligence**.
2. Click **Activate permit**.
3. Click **Raise sensor signal**.
4. Click **Trigger critical event**.
5. Review the score, lead time, contributing factors and similar incidents.
6. Open **Permit Risk Center**.
7. Review the missing second gas-test evidence.
8. Open **Compliance Audit**.
9. Assign or verify a corrective action.
10. Return to **Risk Intelligence** and start the human-approved response.
11. Open **Reports** and generate the preliminary report.

## Run the web application

From the project directory containing `package.json`:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/
```

The demo login accepts any non-empty email and password.

## Run the Vision Agent in mock mode

The mock mode is lightweight and does not require PyTorch or a trained model.

### Windows PowerShell

```powershell
cd vision-agent
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:VISION_MOCK="true"
python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

### macOS/Linux

```bash
cd vision-agent
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
VISION_MOCK=true python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

Then open **Vision Lab** in the React application and run a Vision Agent event.

## Optional YOLO model mode

The heavier model dependencies are separated from the mock dependencies:

```bash
cd vision-agent
pip install -r requirements-model.txt
python train.py
```

After training, place the checkpoint at:

```text
vision-agent/models/best.pt
```

Then run:

```bash
MODEL_PATH=models/best.pt python -m uvicorn app:app --reload --port 8000
```

On Windows, use PowerShell environment-variable syntax:

```powershell
$env:MODEL_PATH="models/best.pt"
python -m uvicorn app:app --reload --port 8000
```

## Project structure

```text
PROTECTAI/
├── api/                         # Supabase/Vercel-compatible API routes
├── src/
│   ├── components/              # Dashboard, layout and reusable UI
│   ├── contexts/                # Authentication and simulation state
│   ├── hooks/                   # Shared React hooks
│   ├── lib/                     # API, demo data, evidence and vision contracts
│   └── pages/                   # Application pages
├── vision-agent/                # FastAPI PPE/CCTV Vision Agent
│   ├── app.py
│   ├── vision_agent.py
│   ├── train.py
│   ├── infer_video.py
│   ├── requirements.txt         # Lightweight mock-mode dependencies
│   └── requirements-model.txt   # Optional YOLO/PyTorch dependencies
├── docs/                        # Architecture, screenshots and documentation
└── package.json
```

## Research alignment

ProtectAI is a simulation-based implementation of the proposed research direction. The prototype demonstrates the software workflow for:

- Multi-source industrial safety reasoning
- Permit-linked compound risk
- Explainable evidence
- Historical incident retrieval
- Human-approved emergency response
- Software CCTV/PPE event integration

The current prototype does **not** claim verified live industrial performance, certified emergency control, real accident reduction or final model accuracy. Formal DCIRI calibration, trained computer-vision evaluation, semantic vector retrieval, real-time event orchestration and industrial integration are future research and engineering phases.

## Hackathon documentation

Detailed submission documentation is available in:

```text
docs/ProtectAI_Hackathon_Technical_Documentation.docx
HACKATHON_DEMO_GUIDE.md
```

The technical document includes the architecture, agent design, risk model, implementation, evaluation plan, limitations, local setup and demo script.

## Safety and responsible use

ProtectAI is a decision-support prototype. It does not control real machinery, emergency shutdowns or evacuation systems. Any future industrial deployment requires qualified safety review, validated data, cybersecurity controls, regulatory review, human approval and site-specific testing.

## License

This project is currently a hackathon prototype. Add the project license and dataset licenses before public or commercial redistribution.
