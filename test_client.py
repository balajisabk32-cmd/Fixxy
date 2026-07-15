import asyncio
import websockets
import json

async def connect():
    uri = "ws://localhost:8000/ws/incident"
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to {uri}")
            print("Listening for swarm events...")
            print("-" * 50)
            while True:
                try:
                    message = await websocket.recv()
                    data = json.loads(message)
                    agent = data.get("agent")
                    status = data.get("status")
                    text = data.get("text")
                    
                    # Formatting output cleanly
                    # If it's a typing chunk, we just print it (no newline to simulate streaming)
                    # If it's done, we print a new line
                    if status == "typing":
                        print(f"\033[94m[{agent.upper()}]\033[0m: {text}", end="", flush=True)
                    else:
                        print(f"\n\033[92m[{agent.upper()} - {status.upper()}]\033[0m: {text}")
                        
                    if status == "done" and "Execution Complete" in text:
                        break
                        
                except websockets.ConnectionClosed:
                    print("\nConnection closed by server.")
                    break
    except ConnectionRefusedError:
        print("Failed to connect. Is the FastAPI server running?")

if __name__ == "__main__":
    asyncio.run(connect())
