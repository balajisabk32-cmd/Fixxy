import os
from crewai import Agent, Task, Crew, Process

# Configure Litellm to use local Ollama instance by default, or fallback to Groq
os.environ["MODEL_PROVIDER"] = os.getenv("MODEL_PROVIDER", "ollama")
if os.environ["MODEL_PROVIDER"] == "ollama":
    llm = "ollama/qwen2.5-coder:7b"
else:
    llm = "groq/llama-3.1-8b-instant"

# 1. Detective Agent
detective = Agent(
    role='Lead Incident Investigator',
    goal='Parse incident logs and source code to precisely pinpoint the root cause of the bug.',
    backstory='You are a senior SRE and debugging expert. You examine stack traces, isolate the exact line numbers and root cause, and output a concise root cause analysis report.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# 2. Architect Agent
architect = Agent(
    role='Senior Software Architect',
    goal='Generate clean, robust, patched Python code that resolves the root cause identified by the Detective.',
    backstory='You are an elite Python software architect. You take root cause analysis notes and produce production-grade, bug-free Python code fixes.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# 3. Auditor Agent
auditor = Agent(
    role='Strict Code Auditor',
    goal='Review patched code for security, performance, and edge cases. Perform a 2-step audit: reject first attempt with edge-case feedback, then approve refined code.',
    backstory='You are an uncompromising security and code quality auditor. You verify edge cases and force a single constructive rejection loop to guarantee debate safety.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# 4. Verifier Agent
verifier = Agent(
    role='QA Automation Engineer',
    goal='Generate a standalone pytest test file that specifically reproduces the original bug and validates the fixed code.',
    backstory='You are a QA automation lead. You write concise, high-impact pytest test functions that fail on buggy implementations and pass on corrected code.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# 5. Communicator Agent
communicator = Agent(
    role='Incident Communications Manager',
    goal='Compile the findings, fix details, audit approval, and verification test status into a polished incident report.',
    backstory='You are a technical communications manager. You write clear executive post-mortems summarizing incident timelines and resolution proof.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

def create_incident_tasks(incident_log: str, source_code: str):
    detect_task = Task(
        description=f"Analyze the following incident log and source code.\nLog:\n{incident_log}\nSource Code:\n{source_code}\n\nIdentify the root cause, exact line numbers, and failure mechanism.",
        expected_output="Detailed Root Cause Analysis stating the bug type, line number, and mechanism.",
        agent=detective
    )

    fix_task = Task(
        description="Based on the Root Cause Analysis, generate a complete, production-ready patched version of the Python code. Provide the full corrected code inside a ```python ``` block.",
        expected_output="Complete patched source code enclosed in python code fences.",
        agent=architect
    )

    audit_task = Task(
        description="Review the patched code. If this is Attempt #1, output '[DECISION: REJECTED]' and state a minor edge case requiring refinement. Once refined, output '[DECISION: APPROVED]'.",
        expected_output="Audit decision prefixed with '[DECISION: REJECTED]' or '[DECISION: APPROVED]' followed by feedback.",
        agent=auditor
    )

    verify_task = Task(
        description="Write a complete pytest test file (`test_app.py`) that reproduces the failure. Use dynamic import or target the functions from `app.py`. Return the code inside ```python ``` code blocks.",
        expected_output="Standalone pytest source code targeting the test scenario.",
        agent=verifier
    )

    communicate_task = Task(
        description="Synthesize the entire incident lifecycle into a concise Markdown incident post-mortem report summarizing root cause, architect patch, audit decision, and verification status.",
        expected_output="A structured executive incident post-mortem in Markdown.",
        agent=communicator
    )
    
    return [detect_task, fix_task, audit_task, verify_task, communicate_task]

def setup_incident_crew(incident_log: str, source_code: str) -> Crew:
    tasks = create_incident_tasks(incident_log, source_code)
    crew = Crew(
        agents=[detective, architect, auditor, verifier, communicator],
        tasks=tasks,
        process=Process.sequential,
        verbose=True
    )
    return crew
