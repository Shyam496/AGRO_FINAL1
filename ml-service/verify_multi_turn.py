import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
from chat_engine import expert

print("🧪 AGROMIND MULTI-TURN ACCURACY TEST\n")

# Scenario: User asks "What is irrigation", then says "yes" to get advice
history = []
q1 = "what is irrigation"
print(f"USER: {q1}")
r1 = expert.get_response(q1, history)
print(f"AI: {r1}\n")

# Simulated backend: add to history
history.append({"role": "user", "content": q1})
history.append({"role": "model", "content": r1})

q2 = "yes"
print(f"USER: {q2}")
r2 = expert.get_response(q2, history)
print(f"AI: {r2}\n")

print("-" * 50)

# Scenario: Another topic - Organic Farming
history = []
q1 = "define organic farming"
print(f"USER: {q1}")
r1 = expert.get_response(q1, history)
print(f"AI: {r1}\n")

history.append({"role": "user", "content": q1})
history.append({"role": "model", "content": r1})

q2 = "sure"
print(f"USER: {q2}")
r2 = expert.get_response(q2, history)
print(f"AI: {r2}\n")
