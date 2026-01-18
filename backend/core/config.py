from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Keys (required)
    openrouter_api_key: str

    # OpenRouter Settings (required)
    openrouter_base_url: str

    # Interviewer Model (generates questions)
    interviewer_model: str = "google/gemini-3-flash-preview"

    # Challenger Models (compete to answer)
    challenger_alpha_model: str = "openai/gpt-5.2-chat"
    challenger_beta_model: str = "deepseek/deepseek-v3.2"

    # Comparator Model (LLM-as-a-Judge)
    comparator_model: str = "google/gemini-3-flash-preview"

    # Application Settings
    app_name: str = "Interview Arena API"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: str = "INFO"

    # CORS Settings (required - JSON formatted list)
    cors_origins: list[str]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to avoid reloading .env file on every call.
    """
    return Settings()


# Convenience instance for direct imports
settings = get_settings()
