import asyncio
import time
from dataclasses import dataclass, field
from typing import AsyncIterator

from openai import AsyncOpenAI

from core import settings, get_logger

logger = get_logger(__name__)

# Initialize async OpenRouter client for proper async streaming
client = AsyncOpenAI(
    base_url=settings.openrouter_base_url,
    api_key=settings.openrouter_api_key,
)

CHALLENGER_SYSTEM_PROMPT = """You are a job candidate answering an interview question.
You have been given your resume and the job description. Use this information to craft a compelling, authentic answer.

Guidelines:
1. Draw from the experience in your resume
2. Be specific with examples when possible
3. Keep your answer focused and concise under 3-5 sentences, remember the interviewer does not have all day
4. Show enthusiasm and confidence
5. Connect your experience to what the role requires

Answer naturally as if you're in a real interview. Do not mention that you're an AI."""


@dataclass
class ChallengerTiming:
    """Timing data for a challenger's response."""

    start_time: float = 0.0
    first_token_time: float | None = None
    complete_time: float | None = None
    total_tokens: int = 0

    @property
    def first_token_ms(self) -> int | None:
        if self.first_token_time is None:
            return None
        return int((self.first_token_time - self.start_time) * 1000)

    @property
    def complete_ms(self) -> int | None:
        if self.complete_time is None:
            return None
        return int((self.complete_time - self.start_time) * 1000)

    @property
    def tokens_per_second(self) -> float | None:
        if self.complete_time is None or self.total_tokens == 0:
            return None
        duration = self.complete_time - self.start_time
        if duration == 0:
            return None
        return self.total_tokens / duration


@dataclass
class ChallengerResult:
    """Result from a challenger's response."""

    challenger_id: str
    model: str
    answer: str
    timing: ChallengerTiming
    error: str | None = None
    failed: bool = False


@dataclass
class CompetitionSession:
    """Holds the state for a competition round."""

    question: str
    resume: str
    job_description: str
    alpha_result: ChallengerResult | None = None
    beta_result: ChallengerResult | None = None
    created_at: float = field(default_factory=time.time)


# In-memory session storage (for development)
_sessions: dict[str, CompetitionSession] = {}


def create_session(
    session_id: str, question: str, resume: str, job_description: str
) -> CompetitionSession:
    """Create a new competition session."""
    session = CompetitionSession(
        question=question,
        resume=resume,
        job_description=job_description,
    )
    _sessions[session_id] = session
    logger.info(f"Created competition session: {session_id}")
    return session


def get_session(session_id: str) -> CompetitionSession | None:
    """Get an existing session."""
    return _sessions.get(session_id)


def update_session_result(
    session_id: str, challenger_id: str, result: ChallengerResult
) -> None:
    """Update a session with a challenger's result."""
    session = _sessions.get(session_id)
    if session:
        if challenger_id == "alpha":
            session.alpha_result = result
        else:
            session.beta_result = result
        logger.debug(f"Updated session {session_id} with {challenger_id} result")


async def stream_challenger_response(
    challenger_id: str,
    model: str,
    question: str,
    resume: str,
    job_description: str,
) -> AsyncIterator[tuple[str, str, ChallengerTiming]]:
    """
    Stream a challenger's response token by token.

    Yields:
        Tuple of (challenger_id, content_chunk, timing)
    """
    timing = ChallengerTiming(start_time=time.time())

    try:
        logger.info(f"Starting {challenger_id} stream with model: {model}")

        # Use async streaming from AsyncOpenAI
        stream = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": CHALLENGER_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"""Answer this interview question based on your resume and the job you're applying for.

INTERVIEW QUESTION:
{question}

YOUR RESUME:
{resume}

JOB DESCRIPTION:
{job_description}

Give your best answer:""",
                },
            ],
            temperature=0.7,
            max_tokens=500,
            stream=True,
        )

        # Use async iteration for the stream
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content

                # Record first token time
                if timing.first_token_time is None:
                    timing.first_token_time = time.time()
                    logger.debug(
                        f"{challenger_id} first token at {timing.first_token_ms}ms"
                    )

                timing.total_tokens += 1
                yield (challenger_id, content, timing)

        # Mark completion
        timing.complete_time = time.time()
        logger.info(
            f"{challenger_id} complete: {timing.complete_ms}ms, {timing.total_tokens} tokens"
        )

    except Exception as e:
        logger.error(f"{challenger_id} failed: {str(e)}")
        timing.complete_time = time.time()
        # Yield error marker
        yield (challenger_id, f"__ERROR__:{str(e)}", timing)


async def merge_challenger_streams(
    question: str,
    resume: str,
    job_description: str,
) -> AsyncIterator[dict]:
    """
    Run both challengers in parallel and merge their streams.

    Yields events in the format:
        {"type": "chunk", "challenger": "alpha"|"beta", "content": "...", "elapsed_ms": 123}
        {"type": "error", "challenger": "alpha"|"beta", "message": "..."}
        {"type": "complete", "timing": {...}}
    """
    start_time = time.time()

    alpha_model = settings.challenger_alpha_model
    beta_model = settings.challenger_beta_model

    logger.info(f"Starting competition: Alpha={alpha_model}, Beta={beta_model}")

    # Track state
    alpha_answer = ""
    beta_answer = ""
    alpha_timing: ChallengerTiming | None = None
    beta_timing: ChallengerTiming | None = None
    alpha_error: str | None = None
    beta_error: str | None = None
    alpha_complete = False
    beta_complete = False

    # Create queues to collect events from both streams
    event_queue: asyncio.Queue = asyncio.Queue()

    async def run_challenger(challenger_id: str, model: str):
        nonlocal alpha_answer, beta_answer, alpha_timing, beta_timing
        nonlocal alpha_error, beta_error, alpha_complete, beta_complete

        try:
            async for cid, content, timing in stream_challenger_response(
                challenger_id, model, question, resume, job_description
            ):
                # Update timing
                if challenger_id == "alpha":
                    alpha_timing = timing
                else:
                    beta_timing = timing

                # Check for error marker
                if content.startswith("__ERROR__:"):
                    error_msg = content.replace("__ERROR__:", "")
                    if challenger_id == "alpha":
                        alpha_error = error_msg
                    else:
                        beta_error = error_msg
                    await event_queue.put(
                        {
                            "type": "error",
                            "challenger": challenger_id,
                            "message": error_msg,
                        }
                    )
                else:
                    # Accumulate answer
                    if challenger_id == "alpha":
                        alpha_answer += content
                    else:
                        beta_answer += content

                    await event_queue.put(
                        {
                            "type": "chunk",
                            "challenger": challenger_id,
                            "content": content,
                            "elapsed_ms": int((time.time() - start_time) * 1000),
                        }
                    )

        except Exception as e:
            error_msg = str(e)
            if challenger_id == "alpha":
                alpha_error = error_msg
            else:
                beta_error = error_msg
            await event_queue.put(
                {
                    "type": "error",
                    "challenger": challenger_id,
                    "message": error_msg,
                }
            )

        finally:
            if challenger_id == "alpha":
                alpha_complete = True
            else:
                beta_complete = True

    # Start both challengers concurrently
    alpha_task = asyncio.create_task(run_challenger("alpha", alpha_model))
    beta_task = asyncio.create_task(run_challenger("beta", beta_model))

    # Yield events as they come in
    while not (alpha_complete and beta_complete):
        try:
            # Wait for events with a short timeout to check completion
            event = await asyncio.wait_for(event_queue.get(), timeout=0.1)
            yield event
        except asyncio.TimeoutError:
            continue

    # Drain any remaining events
    while not event_queue.empty():
        yield await event_queue.get()

    # Wait for tasks to fully complete
    await asyncio.gather(alpha_task, beta_task, return_exceptions=True)

    # Send completion event with timing
    yield {
        "type": "complete",
        "timing": {
            "alpha": {
                "model": alpha_model,
                "first_token_ms": alpha_timing.first_token_ms if alpha_timing else None,
                "complete_ms": alpha_timing.complete_ms if alpha_timing else None,
                "total_tokens": alpha_timing.total_tokens if alpha_timing else 0,
                "tokens_per_second": (
                    alpha_timing.tokens_per_second if alpha_timing else None
                ),
                "failed": alpha_error is not None,
                "error": alpha_error,
            },
            "beta": {
                "model": beta_model,
                "first_token_ms": beta_timing.first_token_ms if beta_timing else None,
                "complete_ms": beta_timing.complete_ms if beta_timing else None,
                "total_tokens": beta_timing.total_tokens if beta_timing else 0,
                "tokens_per_second": (
                    beta_timing.tokens_per_second if beta_timing else None
                ),
                "failed": beta_error is not None,
                "error": beta_error,
            },
        },
        "answers": {
            "alpha": alpha_answer if not alpha_error else None,
            "beta": beta_answer if not beta_error else None,
        },
    }
