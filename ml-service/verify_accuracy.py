import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
from chat_engine import expert

print("🧪 AGROMIND GLOSSARY & FALLBACK TEST\n")

queries = [
    "what is agriculture",      # Should hit the new Glossary
    "what is farming",          # Should hit the new Glossary
    "define soil",              # Should hit the new Glossary
    "who is prime minister",    # Should trigger [FALLBACK_TO_GEMINI]
    "tell me a joke"            # Should trigger [FALLBACK_TO_GEMINI]
]

for q in queries:
    print(f"USER: {q}")
    response = expert.get_response(q)
    print(f"AI: {response}\n")
    print("-" * 50)
