from fastapi import HTTPException
import requests

from app.config import OPENAI_BASE_URL, OPENAI_API_KEY, OPENAI_MODEL


API_URL = f"{OPENAI_BASE_URL}/chat/completions"


def call_ai(prompt: str, max_tokens: int = 350) -> str:
    """Kirim prompt ke OpenAI-compatible API dan kembalikan teks jawaban.

    Mendukung model dengan thinking mode (Qwen3, GLM-Z1, dll) yang mungkin
    mengembalikan content kosong dengan jawaban sebenarnya di reasoning_content.
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}",
    }
    payload = {
        "model": OPENAI_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }
    try:
        # Timeout 180s: model bisa dalam status sleeping dan perlu waktu untuk wake up
        resp = requests.post(API_URL, json=payload, headers=headers, timeout=180)
        resp.raise_for_status()
        data = resp.json()

        choices = data.get("choices", [])
        if not choices:
            raise HTTPException(status_code=500, detail="AI tidak mengembalikan jawaban.")

        message = choices[0].get("message", {})

        # Ambil content utama — jika kosong, fallback ke reasoning_content
        # (Qwen3/GLM-Z1 thinking mode mengembalikan jawaban di reasoning_content
        #  ketika enable_thinking=true dan reasoning_format=deepseek)
        content = (message.get("content") or "").strip()
        if not content:
            content = (message.get("reasoning_content") or "").strip()

        if not content:
            raise HTTPException(status_code=500, detail="AI mengembalikan respons kosong.")

        return content

    except HTTPException:
        raise
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Tidak bisa terhubung ke AI service. Pastikan server berjalan.")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="AI service timeout. Model mungkin sedang loading, coba lagi.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses AI: {str(e)}")

