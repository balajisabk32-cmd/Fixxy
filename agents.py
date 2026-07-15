import os
from crewai import Agent, Task, Crew, Process

# Configure Litellm to use local Ollama instance by default
os.environ["MODEL_PROVIDER"] = os.getenv("MODEL_PROVIDER", "ollama")
if os.environ["MODEL_PROVIDER"] == "ollama":
    llm = "ollama/qwen2.5-coder:7b"
else:
    llm = "groq/llama-3.1-8b-instant"

# 1. Detective Agent
detective = Agent(
    role='Lead Incident Investigator',
    goal='Parse the provided incident logs and source code to precisely pinpoint the root cause of the bug.',
    backstory='You are a seasoned SRE and debugging expert. You excel at reading stack traces and identifying subtle bugs in Python applications.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# 2. Architect Agent
architect = Agent(
    role='Senior Software Architect',
    goal='Generate robust, patched Python code that resolves the root cause identified by the Detective.',
    backstory='You are an elite Python developer known for writing clean, efficient, and bug-free code. You take root cause analysis and turn it into working fixes.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# 3. Auditor Agent
auditor = Agent(
    role='Strict Code Auditor',
    goal='Review the Architect\'s patched code for edge cases, security issues, and overall safety. Force a rejection on the first attempt if necessary.',
    backstory='You are an uncompromising security and code quality auditor. You always look for edge cases. For this simulation, you MUST reject the first patch attempt to enforce rigorous debate.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# 4. Verifier Agent
verifier = Agent(
    role='QA Automation Engineer',
    goal='Write a pytest file that reproduces the bug, then use the verification tools to execute the test against both the original and patched code.',
    backstory='You are a QA automation specialist. You believe code is only fixed if a test proves it. You write tests that target the exact issue.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# 5. Communicator Agent
communicator = Agent(
    role='Incident Communications Manager',
    goal='Format the final incident report detailing the bug, the fix, the test results, and the resolution status for the development team.',
    backstory='You are a technical writer and incident manager. You translate technical fixes into clear, actionable reports for stakeholders.',
    verbose=True,
    allow_delegation=False,
    llm=llm
)

# Helper function to create the Swarm tasks given specific inputs
def create_incident_tasks(incident_log: str, source_code: str):
    detect_task = Task(
        description=f"Analyze the following incident log and source code.\nLog:\n{incident_log}\nSource Code:\n{source_code}\n\nIdentify the specific line and reason for the failure.",
        expected_output="A root cause analysis explaining the bug and pointing to the specific faulty code.",
        agent=detective
    )

    fix_task = Task(
        description="Based on the root cause analysis, rewrite the provided source code to fix the bug. Provide ONLY the full patched Python code.",
        expected_output="The complete, patched source code.",
        agent=architect
    )

    audit_task = Task(
        description="Review the patched code. If this is your first review of this code, you MUST reject it by pointing out a potential minor edge case (e.g. 'what if the input is None?'), and require the architect to refine it. Once refined (or if instructed to approve), approve the patch.",
        expected_output="A review decision: either a rejection with feedback, or an approval.",
        agent=auditor
    )

    verify_task = Task(
        description="Write a pytest script (using pytest syntax) that will reproduce the bug. The test should fail on the original code and pass on the patched code. Assume the target file is imported dynamically based on the TARGET_FILE env var.",
        expected_output="The raw pytest script code.",
        agent=verifier
    )

    communicate_task = Task(
        description="Compile the findings into a final incident report. Include the root cause, the fix, and the test results.",
        expected_output="A formatted Markdown report.",
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
