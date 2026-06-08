import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def _parse_csv_env(name: str, default: str) -> list[str]:
    raw_value = os.getenv(name, default).strip()
    if raw_value == "*":
        return ["*"]
    return [item.strip() for item in raw_value.split(",") if item.strip()]


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@db:5432/nexabi_db",
)
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-before-deploy")
CSV_FILE_PATH = os.getenv("CSV_FILE_PATH", str(BASE_DIR / "df_kmeans.csv"))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CORS_ORIGINS = _parse_csv_env(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173",
)
