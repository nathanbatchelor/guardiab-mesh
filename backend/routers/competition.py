import json
import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from core import get_logger
from services.challenger_service import (
    merge_challenger_streams,
    create_session,
    get_session,
)

logger = get_logger(__name__)

router = APIRouter(prefix="/competition", tags=["competition"])


class CompetitionRequest(BaseModel):
    """Request to start a competition round."""

    question: str = Field(..., min_length=1, description="The interview question")
    resume: str = Field(..., min_length=1, description="The candidate's resume")
    job_description: str = Field(
        ..., min_length=1, description="The job description"
    )


class CompetitionStartResponse(BaseModel):
    """Response after creating a competition."""

    session_id: str
    stream_url: str


@router.post("", response_model=CompetitionStartResponse, status_code=201)
async def create_competition(request: CompetitionRequest):
    """
    Create a new competition session.

    This creates a session and returns a URL to stream the competition.
    RESTful approach: POST to create resource, then GET to stream results.
    """
    session_id = str(uuid.uuid4())

    # Create session
    create_session(
        session_id=session_id,
        question=request.question,
        resume=request.resume,
        job_description=request.job_description,
    )

    logger.info(f"Created competition session: {session_id}")

    return CompetitionStartResponse(
        session_id=session_id,
        stream_url=f"/api/v1/competition/{session_id}/stream",
    )


@router.get("/{session_id}/stream")
async def stream_competition(session_id: str):
    """
    Stream the competition results using Server-Sent Events (SSE).

    Both challengers start simultaneously and their responses are
    streamed as they arrive, interleaved.

    Event types:
    - chunk: A token from a challenger {"type": "chunk", "challenger": "alpha"|"beta", "content": "...", "elapsed_ms": 123}
    - error: A challenger failed {"type": "error", "challenger": "alpha"|"beta", "message": "..."}
    - complete: Competition finished {"type": "complete", "timing": {...}, "answers": {...}}
    """
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    logger.info(f"Starting stream for session: {session_id}")

    async def event_generator():
        """Generate SSE events from the competition."""
        try:
            async for event in merge_challenger_streams(
                question=session.question,
                resume=session.resume,
                job_description=session.job_description,
            ):
                # Format as SSE
                data = json.dumps(event)
                yield f"data: {data}\n\n"

        except Exception as e:
            logger.error(f"Stream error for session {session_id}: {e}")
            error_event = json.dumps(
                {"type": "error", "message": f"Stream error: {str(e)}"}
            )
            yield f"data: {error_event}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@router.get("/{session_id}")
async def get_competition_status(session_id: str):
    """
    Get the current status of a competition session.

    Useful for checking results after the stream has completed.
    """
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session_id,
        "question": session.question,
        "alpha_result": session.alpha_result,
        "beta_result": session.beta_result,
        "created_at": session.created_at,
    }
