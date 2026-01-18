"""
Comparator Service - LLM-as-a-Judge for Interview Competition

This service evaluates and compares answers from two challenger agents
and declares a winner based on quality, relevance, and effectiveness.
"""

import json
from typing import Literal

from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from core import settings, get_logger

logger = get_logger(__name__)

# Initialize async OpenRouter client (same as challenger_service)
client = AsyncOpenAI(
    base_url=settings.openrouter_base_url,
    api_key=settings.openrouter_api_key,
)


class EvaluationResult(BaseModel):
    """Structured evaluation result from the comparator agent."""

    winner: Literal["alpha", "beta", "tie"] = Field(
        ..., description="The winner of the comparison"
    )
    reasoning: str = Field(
        ..., description="Detailed explanation of why the winner was chosen"
    )
    alpha_score: int = Field(..., ge=1, le=10, description="Score for Alpha (1-10)")
    beta_score: int = Field(..., ge=1, le=10, description="Score for Beta (1-10)")
    key_differentiator: str = Field(
        ..., description="The main factor that decided the winner"
    )


COMPARATOR_SYSTEM_PROMPT = """You are an expert interview evaluator and hiring manager. Your job is to compare two candidate responses to an interview question and determine which answer is better.

Evaluate each answer based on:
1. **Relevance**: How well does the answer address the specific question asked?
2. **Specificity**: Does the candidate provide concrete examples and details?
3. **Connection to Role**: How well does the answer demonstrate fit for the job?
4. **Communication**: Is the answer clear, concise, and well-structured?
5. **Authenticity**: Does the answer sound genuine and natural?

You must be fair and impartial. Base your judgment solely on the quality of the responses.

IMPORTANT: You must respond with valid JSON matching this exact schema:
{
    "winner": "alpha" | "beta" | "tie",
    "reasoning": "detailed explanation",
    "alpha_score": 1-10,
    "beta_score": 1-10,
    "key_differentiator": "main deciding factor"
}

Only declare a tie if both answers are genuinely equal in quality. Be decisive."""


def _format_model_name(model: str) -> str:
    """
    Format model name for display by removing provider prefix.
    Example: "openai/gpt-5.2-chat" -> "gpt-5.2-chat"
    """
    if "/" in model:
        return model.split("/", 1)[1]
    return model


async def evaluate_responses(
    question: str,
    resume: str,
    job_description: str,
    alpha_answer: str,
    beta_answer: str,
    alpha_model: str = "Alpha",
    beta_model: str = "Beta",
) -> EvaluationResult:
    """
    Compare two challenger responses and determine the winner.

    Args:
        question: The interview question that was asked
        resume: The candidate's resume
        job_description: The job description
        alpha_answer: Response from Challenger Alpha
        beta_answer: Response from Challenger Beta
        alpha_model: Name/identifier of the Alpha model
        beta_model: Name/identifier of the Beta model

    Returns:
        EvaluationResult with winner, scores, and reasoning
    """
    # Clean up model names for display
    alpha_name = _format_model_name(alpha_model)
    beta_name = _format_model_name(beta_model)

    logger.info(f"Starting evaluation with model: {settings.comparator_model}")
    logger.info(f"Comparing {alpha_name} vs {beta_name}")

    user_prompt = f"""Compare these two interview answers and determine which is better.

## INTERVIEW QUESTION
{question}

## CANDIDATE'S RESUME
{resume}

## JOB DESCRIPTION
{job_description}

---

## ANSWER FROM {alpha_name} (referred to as "alpha" in your response)
{alpha_answer}

---

## ANSWER FROM {beta_name} (referred to as "beta" in your response)
{beta_answer}

---

Evaluate both answers carefully. In your reasoning and key_differentiator, refer to the models by their names ({alpha_name} and {beta_name}) rather than "Alpha" and "Beta".

Provide your judgment as JSON."""

    try:
        response = await client.chat.completions.create(
            model=settings.comparator_model,
            messages=[
                {"role": "system", "content": COMPARATOR_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,  # Lower temperature for more consistent judging
            max_tokens=1000,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        logger.debug(f"Comparator raw response: {content}")

        # Parse the JSON response
        result_data = json.loads(content)

        # Validate and create EvaluationResult
        evaluation = EvaluationResult(**result_data)

        logger.info(
            f"Evaluation complete: winner={evaluation.winner}, "
            f"alpha={evaluation.alpha_score}/10, beta={evaluation.beta_score}/10"
        )

        return evaluation

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse comparator response as JSON: {e}")
        raise ValueError(f"Invalid JSON response from comparator: {e}")

    except Exception as e:
        logger.error(f"Comparator evaluation failed: {e}")
        raise
