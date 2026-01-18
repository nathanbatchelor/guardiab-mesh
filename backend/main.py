from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import submission_router

app = FastAPI(
    title="Interview Arena API",
    description="Backend API for the AI Interview Arena",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(submission_router, prefix="/api/v1")


@app.get("/", tags=["health"])
async def root():
    """Root endpoint - API status check."""
    return {"message": "Interview Arena API is running"}


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}
