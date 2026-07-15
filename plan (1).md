# SwarmOps — 3-Hour Hackathon Build Plan

**Team size:** 2
**Duration:** 3 hours (180 min)
**Pitch:** An autonomous incident-response swarm that detects a bug, writes a fix, *proves the fix actually works* with a real generated test, and reports it — live, running on a local LLM.

---

## 1. The Unique Feature (your differentiator)

Most multi-agent demos at hackathons stop at "agent writes code, agent says it's fixed." Judges have seen this dozens of times, and the weak point is always the same: **nobody proves the fix works.**

**Your differentiator: a Verifier Agent that writes and runs a real regression test against the fix before declaring success.**

Flow:
1. Detective finds the bug from the log/stack trace
2. Architect proposes a code fix
3. Auditor reviews the fix for safety/security (forces one visible rejection + rewrite)
4. **Verifier (new, 5th agent)** — writes a small `pytest` test that reproduces the original bug, runs it against the *old* code (fails), runs it against the *fixed* code (passes), and shows both outputs side by side
5. Communicator summarizes the whole incident in a Slack-style message, including the test result as evidence

This is your unique selling point in the pitch: *"We don't just claim the fix works — we generate the test, run it against the broken code so you see it fail, then run it against the fix so you see it pass. That's the difference between an agent that talks and an agent that proves."*

This is real execution (subprocess running actual pytest), cheap to build (~20 extra minutes), and gives you a concrete, honest answer to the inevitable judge question "how do you know it actually works?"

---

## 2. Scope: What You're Actually Building

- **Enterprise Bug Sandbox:** Pre-built scenarios containing realistic production bugs:
  1. `ServerCrash` — Database connection pool exhaustion leak & server crash (`bug_db_pool.py`)
  2. `RuntimeError` — Modifying dictionary during iteration in session cleanup (`bug_session_cleanup.py`)
  3. `TypeError` — Offset-naive vs. offset-aware datetime comparison in JWT validator (`bug_token_validator.py`)
  4. `SecurityLeak` — Mutable default argument state contamination across sessions (`bug_cache_leak.py`)
  5. `RecursionError` — Unbounded circular reference traversal in org hierarchy (`bug_org_tree.py`)
  6. `TimeoutError` — Concurrency lock leak / missing `try...finally` in rate limiter (`bug_rate_limiter.py`)
- **The trigger:** A UI button / payload trigger that feeds any of the raw log traces to the swarm.
- **Autonomous Log Triage:** The **Detective Agent** ingests whichever raw stack trace is triggered, classifies the incident type (e.g., `ServerCrash`, `SecurityLeak`, etc.), pinpoints the affected file, and streams the live classification badge to the UI.

Do not connect to real AWS, real Slack, or a real production system. Everything is a local sandboxed simulation. This is normal and expected for a hackathon MVP — be upfront about it in the pitch.

---

## 3. Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend | Vite + React + Tailwind, generated via v0/Lovable | Fast, looks polished immediately |
| Streaming | FastAPI + native WebSockets | Simple async streaming, no extra infra |
| Agent orchestration | CrewAI | Fastest way to define 5 agents in plain English |
| LLM (primary) | Local via Ollama — `qwen2.5-coder:7b` | Real execution, no API flakiness, no rate limits, works offline in the room |
| LLM (fallback) | Groq (Llama 3.1 8B) | If local inference is too slow on demo hardware |
| Code execution | Python `subprocess` running `pytest` in a temp dir | Real, not simulated — this is what makes the Verifier agent credible |
| Fix scope | One file, `app.py`, one bug | Keeps LLM output predictable and testable |

**Pre-hackathon setup (legitimate prep — do this before the event, not the submission code):**
```bash
# Install Ollama and pull the model in advance so you're not waiting on a 4GB download live
ollama pull qwen2.5-coder:7b
ollama run qwen2.5-coder:7b "write a python function" # confirm latency is acceptable

pip install crewai fastapi uvicorn websockets pytest --break-system-packages
```
Test this once before the hackathon so you know your laptop can actually run inference fast enough. If it's too slow, plan to use the Groq fallback as your primary instead.

---

## 4. Combined Working Model — Backend First, Frontend Last 40 Min (One Laptop)

Backend and agent engineering take the first ~140 minutes across both laptops (using VS Code Live Share for co-editing), followed by physically pairing at a single laptop for the final 40 minutes to build the frontend.

### Setup (first 5 min)
- Shared GitHub repository with both members pushing/pulling branches
- Continuous voice call open throughout the entire session
- VS Code Live Share active for backend development (two laptops watching & co-editing)

### Agreed WebSocket Message Schema (0–10 min)
Lock this in immediately so agents emit in this exact structure from minute one:
```json
{ 
  "agent": "detective" | "architect" | "auditor" | "verifier" | "communicator",
  "text": "string chunk",
  "status": "typing" | "done" | "rejected" | "test_pass" | "test_fail" 
}
```

### 10–70 min — Environment + Core Agent Logic (Both Laptops via Live Share)
- **Together:** Ollama sanity check (`qwen2.5-coder:7b`) and FastAPI WebSocket skeleton setup
- **Together:** Write `buggy_app.py` (the divide-by-zero endpoint) and `incident_log.txt`
- **Together:** Define all 5 CrewAI agents (Detective, Architect, Auditor, Verifier, Communicator) — role/goal/backstory co-written on the call since agent behaviors drive the core pitch and value
- **Together:** Add the "Auditor rejects first attempt" rule for guaranteed debate loop behavior

### 70–110 min — Verifier Logic + Streaming Wiring (Brief Parallel Split)
- **Person 1:** Build the Verifier step — generate `pytest` test, execute against buggy code (fails), execute against patched code (passes), and capture raw outputs
- **Person 2:** Wire CrewAI's streaming output into the FastAPI WebSocket endpoint using the locked schema
- Test independently, commit, and push to GitHub

### 110–140 min — Full Backend Integration Test (Together)
- Merge branches and run the entire agent crew end-to-end through the WebSocket (validated via a raw WebSocket client or Python script — no UI yet)
- Confirm every agent message reaches the socket matching the schema shape; debug together
- **Goal at 140 min:** Point any WebSocket client at your backend and watch the complete incident play out in real text — fully proven and rock-solid before any UI code is written

### 140–180 min — Frontend Sprint (Both on One Laptop)
- Prompt v0/Lovable for the 5-pane cyberpunk dashboard, export, and drop the code in
- Build the streaming render directly against the live, proven WebSocket endpoint (zero mock required)
- Build the Verifier pane specifically: showcase generated test code, red `FAIL` vs. green `PASS` output — your high-impact demo element
- **Hard Checkpoint at Minute 170:** Freeze code. Whatever the UI looks like at minute 170 is what you demo
- Record a backup video screen recording of one successful complete run before stopping
- Final 10 minutes (170–180 min) reserved strictly for pitch rehearsal

---

### Why This Order Works
Since the backend is fully proven before the UI exists, Hour 3 becomes pure rendering work with zero backend guesswork. High-risk unknowns (agent prompt tuning, local LLM speed, schema matching, subprocess test running) are eliminated by minute 140. The frontend sprint at the end is low-risk, high-visual-payoff work that can be safely compressed into 40 minutes together on a single screen.

---

## 5. Small, Demo-Safe Fixes to Build In (not to fake)

These are real, cheap, and specifically chosen because they're easy to reproduce reliably live:

1. **The bug itself:** divide-by-zero in a discount calculator — trivial for a 7B coding model to diagnose and fix correctly almost every time. Don't pick a bug the local model might get wrong live.
2. **The Auditor's first rejection:** hardcode the rejection reason to something plausible ("fix doesn't handle the zero-quantity edge case") rather than leaving it fully open-ended — keeps the loop fast and coherent.
3. **The Verifier's test:** keep it to one assertion (`assert calculate_discount(0, 10) == 0` or similar) — one clear pass/fail signal, not a full test suite, so it's fast and unambiguous on screen.
4. **Timeout guard:** if local inference takes more than ~15 seconds on any single agent call during rehearsal, that's your signal to switch primary to Groq before the actual judging round — decide this in rehearsal, not live.

---

## 6. Fallback Plan (in case live agents flake during judging)

- Record your own successful end-to-end run during Hour 3 rehearsal (screen capture, ~90 seconds)
- If live demo stalls (model hangs, WebSocket drops), say: *"Let me show you the run we captured earlier today"* and play the clip — this is honest (it's your own real run from the event, not pre-event work) and keeps the pitch moving
- Keep the terminal-only version (Person B's Hour 2 output) as a second fallback if even the recording fails

---

## 7. Q&A Prep

**"Aren't you worried about AI pushing code to prod automatically?"**
"For the enterprise version, the Communicator agent opens a PR and pings the on-call engineer with a Y/N button — SwarmOps does the heavy lifting, a human holds the final key. Right now, we go one step further than most demos: the Verifier agent proves the fix with a real test before anyone even reviews it."

**"How do you know the fix actually works?"**
"That's exactly what the Verifier agent is for — it's not us claiming it works, it's a generated test that fails on the old code and passes on the new code, run live."

**"Why local LLM instead of an API?"**
"Reliability in the room — no rate limits, no network dependency during judging. We fall back to Groq if we need more horsepower for a harder bug."

**"Does this scale to other incident types?"**
"The state machine is incident-agnostic — the dropdown shows other incident types using the same agent pipeline, we just scoped to one live-wired scenario given the 3-hour build window."

---

## 8. Timeline Summary

| Time | Structure | Phase & Key Tasks |
|---|---|---|
| 0–10 min | Together (Live Share) | Agree on & lock WebSocket message schema |
| 10–70 min | Together (Live Share) | Ollama check, FastAPI skeleton, `buggy_app.py`, write all 5 CrewAI agents & Auditor rejection rule |
| 70–110 min | Parallel Split | Person 1: Build Verifier test generation & execution logic<br>Person 2: Wire CrewAI streaming into FastAPI WebSocket |
| 110–140 min | Together (Live Share) | Merge & full backend integration test via raw WebSocket client/script (Goal: proven stable backend at 140 min) |
| 140–170 min | Together (One Laptop) | Frontend Sprint: Prompt v0/Lovable, drop code in, connect real WebSocket stream, build Verifier pane (red FAIL / green PASS) |
| 170–180 min | Together (One Laptop) | **Hard Code Freeze @ 170m.** Record backup demo recording, rehearse pitch Q&A |
