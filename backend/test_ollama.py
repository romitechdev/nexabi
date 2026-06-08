import requests
try:
    resp = requests.post(
        "http://192.168.10.16:11434/api/generate",
        json={
            "model": "llama3.1:8b",
            "prompt": "Test",
            "stream": False,
            "options": {"num_predict": 10}
        },
        timeout=10
    )
    print("Status code:", resp.status_code)
    print(resp.json())
except Exception as e:
    print(type(e).__name__, str(e))
