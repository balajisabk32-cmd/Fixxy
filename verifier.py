import subprocess
import tempfile
import os
import re

def extract_code(text: str) -> str:
    """Strips markdown code fences (e.g. ```python ... ```) to extract raw code executable by Python/Pytest."""
    if not text:
        return ""
    # Look for code block inside triple backticks
    match = re.search(r"```(?:python)?\s*\n(.*?)```", text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    # Fallback: strip leading/trailing whitespace and lone backticks
    return text.replace("```python", "").replace("```", "").strip()

def run_verification(original_code: str, patched_code: str, test_code: str) -> dict:
    """
    Executes pytest against the original and patched code in a temporary directory.
    Strips markdown code block wrappers automatically to prevent syntax errors.
    Returns the stdout, stderr, and execution status for both test runs.
    """
    raw_original = extract_code(original_code)
    raw_patched = extract_code(patched_code)
    raw_test = extract_code(test_code)

    with tempfile.TemporaryDirectory() as temp_dir:
        original_file_path = os.path.join(temp_dir, "buggy_app.py")
        patched_file_path = os.path.join(temp_dir, "app.py")
        test_file_path = os.path.join(temp_dir, "test_app.py")

        # Write sanitized files
        with open(original_file_path, "w", encoding="utf-8") as f:
            f.write(raw_original)
        
        with open(patched_file_path, "w", encoding="utf-8") as f:
            f.write(raw_patched)
            
        with open(test_file_path, "w", encoding="utf-8") as f:
            f.write(raw_test)

        # Run test against original code (expect FAIL)
        result1 = subprocess.run(
            ["pytest", "-v", test_file_path],
            env=dict(os.environ, TARGET_FILE="buggy_app.py"),
            capture_output=True,
            text=True,
            cwd=temp_dir
        )
        
        # Run test against patched code (expect PASS)
        result2 = subprocess.run(
            ["pytest", "-v", test_file_path],
            env=dict(os.environ, TARGET_FILE="app.py"),
            capture_output=True,
            text=True,
            cwd=temp_dir
        )
        
        return {
            "test_code": raw_test,
            "run1_original": {
                "stdout": result1.stdout,
                "stderr": result1.stderr,
                "returncode": result1.returncode,
                "passed": result1.returncode == 0
            },
            "run2_patched": {
                "stdout": result2.stdout,
                "stderr": result2.stderr,
                "returncode": result2.returncode,
                "passed": result2.returncode == 0
            }
        }
