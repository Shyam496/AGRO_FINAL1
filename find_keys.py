import os
print("--- ENVIRONMENT VARIABLES ---")
for key, value in os.environ.items():
    if "KEY" in key.upper() or "API" in key.upper() or "GEMINI" in key.upper():
        print(f"{key}: {value[:8]}...")
