import asyncio
import sys
import threading
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from schema import format_event
from agents import setup_incident_crew

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
    return {"status": "ok"}

class AsyncStdoutWrapper:
    def __init__(self, loop, queue, original_stdout):
        self.loop = loop
        self.queue = queue
        self.original_stdout = original_stdout
        self.current_agent = "detective"

    def write(self, text):
        self.original_stdout.write(text) # Still print to console for debugging
        if not text:
            return
        
        # Simple heuristic to identify which agent is currently active based on CrewAI verbose output
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

        # Push to the async queue
        self.loop.call_soon_threadsafe(self.queue.put_nowait, (self.current_agent, text))

    def flush(self):
        self.original_stdout.flush()

@app.websocket("/ws/incident")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    queue = asyncio.Queue()
    loop = asyncio.get_running_loop()

    # In Phase 3 we test with one specific incident (db pool). 
    # Frontend can pass incident ID later, but for now we hardcode it to test the Swarm.
    try:
        with open("incidents/incident_db_pool.log", "r", encoding="utf-8") as f:
            incident_log = f.read()
        with open("incidents/bug_db_pool.py", "r", encoding="utf-8") as f:
            source_code = f.read()
    except FileNotFoundError:
        incident_log = "RuntimeError: db pool empty"
        source_code = "def db_connect(): pass"

    crew = setup_incident_crew(incident_log, source_code)
    
    def run_crew():
        original_stdout = sys.stdout
        wrapper = AsyncStdoutWrapper(loop, queue, original_stdout)
        sys.stdout = wrapper
        try:
            result = crew.kickoff()
            # Signal the end with the final result
            loop.call_soon_threadsafe(queue.put_nowait, ("communicator", f"\nFINAL REPORT:\n{result}\nDONE"))
        except Exception as e:
            loop.call_soon_threadsafe(queue.put_nowait, ("communicator", f"Error during execution: {e}"))
        finally:
            sys.stdout = original_stdout
            loop.call_soon_threadsafe(queue.put_nowait, ("system", "EOF"))
            
    # Run CrewAI in a separate thread to not block the asyncio event loop
    thread = threading.Thread(target=run_crew)
    thread.start()
    
    try:
        while True:
            agent, msg = await queue.get()
            
            if msg == "EOF":
                await websocket.send_json(format_event("communicator", "\nExecution Complete.", "done"))
                break
            
            # Catchall if system leaks
            if agent == "system":
                agent = "communicator"

            if "FINAL REPORT" in msg and "DONE" in msg:
                 await websocket.send_json(format_event(agent, msg.replace("DONE", ""), "done"))
            else:
                 await websocket.send_json(format_event(agent, msg, "typing"))
                 
    except WebSocketDisconnect:
        print("WebSocket client disconnected.")
