import os
import httpx
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

async def generate_summary(duration_seconds: int, distraction_count: int, event_log: list):
    if not GROQ_API_KEY: return "AI Summary is unavailable (Missing API Key)."
    duration_mins = duration_seconds // 60
    prompt = f"I just finished a focus session. It lasted {duration_mins} mins and had {distraction_count} distractions. Give a 2-3 line summary of my focus performance and one actionable tip to improve."
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    data = {"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": prompt}], "max_tokens": 150}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data, timeout=10.0)
            if response.status_code == 200: return response.json()['choices'][0]['message']['content']
            return f"Failed: {response.text}"
        except Exception as e:
            return f"Error: {str(e)}"
