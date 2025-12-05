"""
Application Configuration
Manages environment-specific settings using Pydantic Settings
"""

from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Environment
    environment: str = Field(default="dev", alias="ENVIRONMENT")
    debug: bool = Field(default=True, alias="DEBUG")
    
    # Application
    app_name: str = Field(default="WorthWise College ROI Planner", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")
    
    # Database - MySQL
    database_url: str = Field(
        default="mysql+pymysql://worthwise_dev:dev_password_123@localhost:3306/worthwise?charset=utf8mb4",
        alias="DATABASE_URL"
    )
    mysql_host: str = Field(default="localhost", alias="MYSQL_HOST")
    mysql_port: int = Field(default=3306, alias="MYSQL_PORT")
    mysql_user: str = Field(default="worthwise_dev", alias="MYSQL_USER")
    mysql_password: str = Field(default="dev_password_123", alias="MYSQL_PASSWORD")
    mysql_database: str = Field(default="worthwise", alias="MYSQL_DATABASE")
    
    # Analytics Artifacts
    artifacts_path: str = Field(default="./artifacts", alias="ARTIFACTS_PATH")
    duckdb_path: str = Field(default="./artifacts/analytics.duckdb", alias="DUCKDB_PATH")

    # HuggingFace AI
    hf_service_url: str = Field(default="http://localhost:7860", alias="HF_SERVICE_URL")
    
    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    @property
    def is_production(self) -> bool:
        """Check if running in production environment"""
        return self.environment.lower() in ["production", "prod"]
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment"""
        return self.environment.lower() in ["development", "dev"]
    
    @property
    def mysql_url_sync(self) -> str:
        """Construct MySQL connection URL for SQLAlchemy"""
        return self.database_url
    
    def get_cors_config(self) -> dict:
        """
        Get CORS configuration based on environment
        Hardcoded for security and simplicity
        """
        if self.is_development:
            # Development: Allow localhost origins
            return {
                "allow_origins": [
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:3001",
                ],
                "allow_credentials": True,
                "allow_methods": ["*"],
                "allow_headers": ["*"],
                "expose_headers": ["Content-Disposition"]
            }
        else:
            # Production: Strict CORS
            return {
                "allow_origins": [
                    "https://worthwise-backend-server.onrender.com",
                    "https://worthwise-nu.vercel.app",
                ],
                "allow_credentials": True,
                "allow_methods": ["GET", "POST", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization", "Accept"],
                "expose_headers": ["Content-Disposition"]
            }


# Global settings instance
settings = Settings()
