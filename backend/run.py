"""
Development Server Runner
Run this file to start the FastAPI development server
"""

import uvicorn
from dotenv import load_dotenv
load_dotenv()

from app.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,  # Hot reload for development
        log_level="debug" if settings.debug else "info"
    )
