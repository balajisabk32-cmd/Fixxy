import asyncio
import sys
import os
import json
import threading
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from schema import format_event, AgentName, EventStatus
from agents import setup_incident_crew, detective, architect, auditor, verifier, communicator
from verifier import run_verification, extract_code

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "Fixxy-SwarmOps-Engine"}

INCIDENTS_DIR = "incidents"

def load_incident_assets(bug_filename: str):
    """Loads specified bug scenario and corresponding log trace."""
    # Ensure bug_filename is safe
    base_name = os.path.basename(bug_filename)
    if not base_name.endswith(".py"):
        base_name = f"{base_name}.py"
        
    code_path = os.path.join(INCIDENTS_DIR, base_name)
    log_name = base_name.replace("bug_", "incident_").replace(".py", ".log")
    log_path = os.path.join(INCIDENTS_DIR, log_name)
    
    source_code = ""
    incident_log = ""
    
    if os.path.exists(code_path):
        with open(code_path, "r", encoding="utf-8") as f:
            source_code = f.read()
    else:
        # Fallback to default bug_db_pool.py if file not found
        fallback_code = os.path.join(INCIDENTS_DIR, "bug_db_pool.py")
        if os.path.exists(fallback_code):
            with open(fallback_code, "r", encoding="utf-8") as f:
                source_code = f.read()
                
    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8") as f:
            incident_log = f.read()
    else:
        fallback_log = os.path.join(INCIDENTS_DIR, "incident_db_pool.log")
        if os.path.exists(fallback_log):
            with open(fallback_log, "r", encoding="utf-8") as f:
                incident_log = f.read()

    return source_code, incident_log, base_name

class AsyncStdoutWrapper:
    def __init__(self, loop, queue, original_stdout):
        self.loop = loop
        self.queue = queue
        self.original_stdout = original_stdout
        self.current_agent: AgentName = "detective"

    def write(self, text):
        self.original_stdout.write(text)
        if not text:
            return
        
        lower_text = text.lower()
        if "lead incident investigator" in lower_text:
            self.current_agent = "detective"
        elif "senior software architect" in lower_text:
            self.current_agent = "architect"
        elif "strict code auditor" in lower_text:
            self.current_agent = "auditor"
        elif "qa automation engineer" in lower_text:
            self.current_agent = "verifier"
        elif "incident communications manager" in lower_text:
            self.current_agent = "communicator"

        # Determine status signals
        status: EventStatus = "typing"
        if "[decision: rejected]" in lower_text:
            status = "rejected"
        elif "test pass" in lower_text or "passed" in lower_text:
            status = "test_pass"
        elif "test fail" in lower_text or "failed" in lower_text:
            status = "test_fail"

        self.loop.call_soon_threadsafe(self.queue.put_nowait, (self.current_agent, text, status))

    def flush(self):
        self.original_stdout.flush()

@app.websocket("/ws/incident")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    queue = asyncio.Queue()
    loop = asyncio.get_running_loop()

    # Receive initial configuration/trigger message if sent
    requested_incident = "bug_db_pool.py"
    try:
        data_text = await asyncio.wait_for(websocket.receive_text(), timeout=1.0)
        parsed = json.loads(data_text)
        if isinstance(parsed, dict) and "incident" in parsed:
            requested_incident = parsed["incident"]
    except Exception:
        pass # Use default scenario if no initial payload sent

    source_code, incident_log, target_file = load_incident_assets(requested_incident)
    
    # Send Telemetry Ingestion Event
    await websocket.send_json(format_event(
        "detective", 
        f"Ingesting Telemetry for [{target_file}]...\nLogs:\n{incident_log}\n", 
        "typing"
    ))

    crew = setup_incident_crew(incident_log, source_code)
    
    def run_crew():
        original_stdout = sys.stdout
        wrapper = AsyncStdoutWrapper(loop, queue, original_stdout)
        sys.stdout = wrapper
        try:
            results = crew.kickoff()
            
            # Extract task results
            tasks_output = getattr(crew, 'tasks_output', [])
            patched_code = source_code
            generated_test = ""

            if len(tasks_output) >= 2:
                patched_code = extract_code(str(tasks_output[1].raw))
            if len(tasks_output) >= 4:
                generated_test = extract_code(str(tasks_output[3].raw))
                
            # Perform Subprocess Pytest Verification
            verif_res = run_verification(source_code, patched_code, generated_test)
            
            # Stream verification outputs
            test_summary = (
                f"\n--- SUBPROCESS VERIFIER EXECUTION ---\n"
                f"Generated Test Script:\n{verif_res['test_code']}\n\n"
                f"[RUN 1: ORIGINAL CODE] (Expected FAIL):\n{verif_res['run1_original']['stdout']}\n"
                f"[RUN 2: PATCHED CODE] (Expected PASS):\n{verif_res['run2_patched']['stdout']}\n"
            )
            
            loop.call_soon_threadsafe(queue.put_nowait, ("verifier", test_summary, "test_pass"))
            loop.call_soon_threadsafe(queue.put_nowait, ("communicator", f"\nINCIDENT POST-MORTEM REPORT:\n{results}\n", "done"))
            
        except Exception as e:
            loop.call_soon_threadsafe(queue.put_nowait, ("communicator", f"Swarm Execution Error: {e}", "done"))
        finally:
            sys.stdout = original_stdout
            loop.call_soon_threadsafe(queue.put_nowait, ("communicator", "EOF", "done"))
            
    thread = threading.Thread(target=run_crew)
    thread.start()
    
    try:
        while True:
            agent, msg, status = await queue.get()
            
            if msg == "EOF":
                await websocket.send_json(format_event("communicator", "Swarm Execution Complete.", "done"))
                break

            await websocket.send_json(format_event(agent, msg, status))
                 
    except WebSocketDisconnect:
        print("WebSocket client disconnected.")
