import os

file_path = os.path.expanduser("~/AI-COMPANY-OS/09-EXECUTION/execution_engine.py")
with open(file_path, 'r') as f:
    content = f.read()

# Remove any variation of --timeout=X or -t X
import re
new_content = re.sub(r'--timeout=\d+', '', content)
new_content = re.sub(r'-t\s+\d+', '', new_content)

with open(file_path, 'w') as f:
    f.write(new_content)

print("✅ ExecutionEngine scrubbed of timeout flags.")
