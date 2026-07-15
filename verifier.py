import subprocess
import tempfile
import os

def run_verification(original_code: str, patched_code: str, test_code: str) -> dict:
    """
    Executes pytest against the original and patched code in a temporary directory.
    Returns the stdout and stderr for both test runs.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        original_file_path = os.path.join(temp_dir, "buggy_app.py")
        patched_file_path = os.path.join(temp_dir, "app.py")
        test_file_path = os.path.join(temp_dir, "test_app.py")

        # Write the files
        with open(original_file_path, "w", encoding="utf-8") as f:
            f.write(original_code)
        
        with open(patched_file_path, "w", encoding="utf-8") as f:
            f.write(patched_code)
            
        with open(test_file_path, "w", encoding="utf-8") as f:
            f.write(test_code)

        # Run test against original code (should fail)
        result1 = subprocess.run(
            ["pytest", test_file_path],
            env=dict(os.environ, TARGET_FILE="buggy_app.py"),
            capture_output=True,
            text=True,
            cwd=temp_dir
        )
        
        # Run test against patched code (should pass)
        result2 = subprocess.run(
            ["pytest", test_file_path],
            env=dict(os.environ, TARGET_FILE="app.py"),
            capture_output=True,
            text=True,
            cwd=temp_dir
        )
        
        return {
            "run1_original": {
                "stdout": result1.stdout,
                "stderr": result1.stderr,
                "returncode": result1.returncode
            },
            "run2_patched": {
                "stdout": result2.stdout,
                "stderr": result2.stderr,
                "returncode": result2.returncode
            }
        }
