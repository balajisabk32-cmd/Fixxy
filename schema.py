from typing import Literal
from pydantic import BaseModel, Field

AgentName = Literal["detective", "architect", "auditor", "verifier", "communicator"]
EventStatus = Literal["typing", "done", "rejected", "test_pass", "test_fail"]

class IncidentEvent(BaseModel):
    agent: AgentName
    text: str
    status: EventStatus

def format_event(agent: AgentName, text: str, status: EventStatus) -> dict:
    """Helper utility to format an event payload for WebSocket transmission."""
    return IncidentEvent(agent=agent, text=text, status=status).model_dump()
