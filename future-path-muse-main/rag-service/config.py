import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Get directory where config.py is located
BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"
    
    CHROMA_PERSIST_DIR: str = str(BASE_DIR / "chroma_data")
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    KNOWLEDGE_BASE_DIR: str = str(BASE_DIR / "knowledge-base")

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
