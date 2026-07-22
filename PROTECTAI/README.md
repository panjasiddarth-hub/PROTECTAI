# Protect AI — Safety Intelligence MVP

Protect AI is a simulation-first industrial safety intelligence prototype. It demonstrates how permit context, synthetic sensor telemetry, plant geography, historical incidents and compliance evidence can be combined to detect compound risk before an incident escalates.

> **Important:** The current application is a demonstration prototype. Sensor readings, permits and response actions are simulated and are not connected to plant control systems.

## Run the MVP locally

```bash
npm install
npm run dev
```

Open the local Vite URL, sign in with any non-empty email and password, then open **Risk Intelligence** from the sidebar.

## Demonstration flow

1. Open **Risk Intelligence**.
2. Click **Activate permit** to activate simulated hot-work permit `HW-104` in Reactor Bay A.
3. Click **Raise sensor signal** to simulate a rising gas reading near the permit.
4. Click **Trigger critical event** to show the compound-risk assessment.
5. Review the risk factors, predicted lead time, similar incidents and permit evidence.
6. Click **Start response** or **Confirm simulated emergency**.
7. Tick response actions to demonstrate the first-10-minute emergency workflow.
8. Use **Reset scenario** to return to the baseline state.
9. Open **Permit Risk Center** to review the same scenario as a permit controller.
10. Open **Compliance Audit** to assign and verify corrective actions.

## What is included in this MVP slice

- Simulation mode with a staged digital plant scenario
- Synthetic gas telemetry and permit events
- Explainable compound-risk scoring
- Sensor-only versus compound-risk comparison
- Predicted escalation lead time
- Similar incident pattern evidence
- Dedicated Permit Risk Center
- Compliance Audit findings and corrective-action workflow
- Permit and compliance evidence checks
- Human-approved emergency response checklist
- Preliminary evidence snapshot state
- Shared simulation state across Risk Intelligence and Permit Risk Center
- Persistent local simulation audit trail
- Dashboard compound-risk banner linked to the live simulation
- Transparent prototype evidence retrieval for Copilot answers
- Seeded incident, near-miss, permit and safety-guidance corpus
- Preliminary simulation and incident-report generation
- Seeded fallback data for the existing dashboard, monitoring, map, incidents, analytics and reports pages

## Architecture direction

```text
React + TypeScript UI
          |
          v
Digital-twin event simulator
          |
          v
Explainable risk engine
          |
  ---------------------------
  |            |             |
Permit       Incident      Compliance
intelligence patterns      audit
          |
          v
Human-approved response workflow
```

The frontend API client uses the existing `/api/*` contract. When the Vercel/Supabase API is not available locally, it falls back to seeded digital-twin data in `src/lib/demoData.ts`. This allows the MVP to be demonstrated without physical IoT sensors.

When hardware becomes available, the simulator can be replaced with an adapter for MQTT, OPC-UA, Modbus, SCADA or another IoT gateway while preserving the UI and risk-assessment contracts.

## Build and lint

```bash
npm run build
npm run lint
```

The production TypeScript/Vite build is currently passing. The repository also contains several pre-existing lint findings in the original template; those are separate from the simulation MVP implementation.
