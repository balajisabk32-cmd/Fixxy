# SwarmOps: Phase-by-Phase Implementation Plan

SwarmOps is an autonomous incident-response swarm that detects a bug, writes a code fix, executes a real regression test via `pytest` to prove the fix works, and reports the resolution—streamed live in real-time to a 5-pane cyberpunk UI over WebSockets.

This document translates the hackathon strategy into a detailed, step-by-step technical implementation plan.

---

## User Review Required

> [!IMPORTANT]
> **LLM Execution Strategy:** The plan defaults to local inference using `qwen2.5-coder:7b` via Ollama. If local latency during testing exceeds 15s per step, switch to **Groq (`llama-3.1-8b-instant`)** by toggling the LLM provider environment variable.

> [!NOTE]
> **Working Model:** Phases 0–4 focus entirely on backend stability (0–140 min across 2 laptops via Live Share). Phase 5 shifts to pairing physically on one laptop to build the React frontend (140–180 min).

---

## Open Questions

> [!NOTE]
> No unresolved open questions at this time. All architectural components and WebSocket event schemas have been locked in the build plan.

---

## Proposed Changes

### Phase 0: Setup & Schema Contract Definition (0–10 min)

Initialize project layout, setup Python environment, and lock the WebSocket event payload specification.

#### [NEW] [requirements.txt](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/requirements.txt)
Define backend dependencies: `crewai`, `fastapi`, `uvicorn`, `websockets`, `pytest`, `python-dotenv`.

#### [NEW] [schema.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/schema.py)
Python models / typing definitions for WebSocket event frames:
```python
# Event payload contract
{
    "agent": "detective" | "architect" | "auditor" | "verifier" | "communicator",
    "text": "string chunk",
    "status": "typing" | "done" | "rejected" | "test_pass" | "test_fail"
}
```

---

### Phase 1: Target Incident Sandbox (10–30 min)

Create 5 distinct Python bug scenarios and their corresponding raw incident log stack traces in an `incidents/` directory:

#### [NEW] [incidents/bug_db_pool.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/bug_db_pool.py) & [incidents/incident_db_pool.log](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/incident_db_pool.log)
`RuntimeError: ConnectionPoolExhausted` server crash caused by unclosed DB connections on early returns.

#### [NEW] [incidents/bug_session_cleanup.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/bug_session_cleanup.py) & [incidents/incident_session.log](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/incident_session.log)
`RuntimeError: dictionary changed size during iteration` when removing expired sessions from dictionary in-place.

#### [NEW] [incidents/bug_token_validator.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/bug_token_validator.py) & [incidents/incident_token.log](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/incident_token.log)
`TypeError: can't compare offset-naive and offset-aware datetimes` in token expiration validation.

#### [NEW] [incidents/bug_cache_leak.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/bug_cache_leak.py) & [incidents/incident_cache.log](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/incident_cache.log)
State Contamination Security Leak due to mutable default argument `roles_cache={}` bleeding user permissions across requests.

#### [NEW] [incidents/bug_org_tree.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/bug_org_tree.py) & [incidents/incident_org.log](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/incident_org.log)
`RecursionError: maximum recursion depth exceeded` caused by circular dependency traversal in org reporting graph.

#### [NEW] [incidents/bug_rate_limiter.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/bug_rate_limiter.py) & [incidents/incident_rate_limiter.log](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/incidents/incident_rate_limiter.log)
`TimeoutError: Lock Acquisition Timeout` caused by missing `try...finally` lock release on uncaught exception.

---

### Phase 2: Agent Swarm & Verifier Engine (30–110 min)

Configure the 5 CrewAI agents and build the real subprocess execution engine.

#### [NEW] [agents.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/agents.py)
Defines roles, goals, backstories, and tasks for the 5 agents:
1. **Detective Agent:** Parses `incident_log.txt` to pinpoint the root cause in `buggy_app.py`.
2. **Architect Agent:** Generates the revised Python code for `buggy_app.py`.
3. **Auditor Agent:** Reviews code for safety/edge-cases. Enforces **1 forced rejection loop** on attempt #1 to demonstrate real agent-to-agent debate.
4. **Verifier Agent:** Prompts the LLM to write a `pytest` file reproducing the issue, then runs the test via `verifier.py`.
5. **Communicator Agent:** Formats final incident report for dev teams.

#### [NEW] [verifier.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/verifier.py)
Executes `pytest` in a temporary directory via `subprocess.run`:
- Test Run #1 against original `buggy_app.py` -> Captures **FAIL** output.
- Test Run #2 against patched `app.py` -> Captures **PASS** output.
- Returns raw stdout/stderr for both runs to be streamed to UI.

---

### Phase 3: FastAPI Server & WebSocket Event Stream (110–140 min)

Expose the swarm orchestration via a real-time WebSocket connection.

#### [NEW] [server.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/server.py)
- `FastAPI` instance with CORS setup.
- `GET /health` endpoint.
- `WebSocket /ws/incident` streaming endpoint: instantiates CrewAI swarm, hooks into custom event handler/callback, and emits token chunks matching `schema.py`.

#### [NEW] [test_client.py](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/test_client.py)
Console WebSocket client to verify real-time event streaming and payload validity before touching frontend code.

---

### Phase 4: Frontend Cyberpunk Dashboard (140–170 min)

Pair physically on one laptop to create the 5-pane live rendering dashboard.

#### [NEW] [frontend/](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/frontend)
Initialize React application using Vite & Tailwind CSS.

#### [NEW] [frontend/src/components/Dashboard.jsx](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/frontend/src/components/Dashboard.jsx)
5-Pane dark-mode terminal layout featuring:
- **Header & Telemetry Bar:** "Simulate Production Incident" trigger button & dynamic **Live Classification Badge** (populated live by Detective Agent: Severity, Error Type, Target File).
- **Agent Panes (4 Grid Panes):** Detective, Architect, Auditor, Communicator streaming text windows with status icons (`typing`, `done`, `rejected`).
- **Verifier Pane (Featured 5th Pane):** Split visual display showing:
  - Generated `pytest` source code.
  - Red `FAIL` execution panel (before fix).
  - Green `PASS` execution panel (after fix).

#### [NEW] [frontend/src/hooks/useIncidentSocket.js](file:///c:/Users/Balaji/OneDrive/Desktop/Hackathon/Fixxy/frontend/src/hooks/useIncidentSocket.js)
Custom React hook managing WebSocket lifecycles, message buffering, and state distribution across all 5 agent panes.

---

### Phase 5: Hard Code Freeze, Backup Recording & Pitch Prep (170–180 min)

Freeze development, record screen capture backup run, and rehearse pitch demo.

---

## Verification Plan

### Automated Verification
- Verify local LLM / Groq connectivity:
  ```bash
  python -c "import crewai; print(crewai.__version__)"
  ```
- Backend Headless Integration Test:
  ```bash
  uvicorn server:app --port 8000 &
  python test_client.py
  ```
  *Success Criterion:* All 5 agent events stream cleanly, auditor forces 1 rejection, verifier captures 1 failure and 1 passing test.

### Manual Verification
- Launch Frontend:
  ```bash
  cd frontend && npm run dev
  ```
- Click "Trigger Swarm Resolution" in browser dashboard.
- Observe real-time streaming in Detective, Architect, and Auditor panes.
- Verify Auditor pane turns amber/red on rejection, then green on approved rewrite.
- Verify Verifier pane highlights generated test code and visually displays **FAIL (Red)** followed by **PASS (Green)**.
- Confirm full execution completes within 60–90 seconds.
