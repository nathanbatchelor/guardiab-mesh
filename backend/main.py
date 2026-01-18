from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core import settings, setup_logging, get_logger
from routers import submission_router, competition_router

# Initialize logging
setup_logging(level=settings.log_level)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events."""
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.debug(f"Debug mode: {settings.debug}")
    yield
    logger.info(f"Shutting down {settings.app_name}")


app = FastAPI(
    title=settings.app_name,
    description="Backend API for the AI Interview Arena",
    version=settings.app_version,
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(submission_router, prefix="/api/v1")
app.include_router(competition_router, prefix="/api/v1")


@app.get("/", tags=["health"])
async def root():
    """Root endpoint - API status check."""
    return {"message": f"{settings.app_name} is running"}


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "version": settings.app_version}
