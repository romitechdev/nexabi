import requests

res = requests.post(
    "http://localhost:5000/api/auth/login",
    data={"username": "testuser99", "password": "password123"},
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)
print(res.status_code, res.text)
