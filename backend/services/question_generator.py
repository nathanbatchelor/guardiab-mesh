from openai import AsyncOpenAI

from core import settings, get_logger

logger = get_logger(__name__)

# Initialize OpenRouter client using async OpenAI SDK
client = AsyncOpenAI(
    base_url=settings.openrouter_base_url,
    api_key=settings.openrouter_api_key,
)

QUESTION_GENERATOR_SYSTEM_PROMPT = """You are an expert interviewer. Your task is to generate a short, focused interview question that connects the candidate's experience to the job requirements.

Guidelines:
1. Keep the question SHORT - one or two sentences maximum
2. NEVER mention specific company names from the resume - keep job experience questions general
3. NEVER ask for confidential, proprietary, or sensitive information about previous employers
4. For questions about past work experience: keep them general (e.g., "in a previous role" or "in your experience")
5. For questions about specific SKILLS mentioned in the job description: be more specific and technical
6. Focus on transferable skills, problem-solving approaches, and technical knowledge
7. Make it conversational and direct

Examples of GOOD questions:
- "You have experience with distributed caching. How do you typically approach cache invalidation strategies?"
- "I see you've led engineering teams before. What's your approach to handling conflicting priorities?"
- "The role requires Kubernetes expertise, which you have. How would you handle a pod that keeps crashing in production?"
- "You mention experience with CI/CD pipelines. Walk me through how you'd set one up for a microservices architecture."

Examples of BAD questions (never ask these):
- "What proprietary systems did you build at Company X?" (references specific company + asks for proprietary info)
- "Can you share the architecture diagrams from your previous job?" (asks for confidential materials)
- "What was Company Y's revenue when you worked there?" (confidential business info)

Output ONLY the interview question itself. No preamble, no explanation, just the question."""


async def generate_interview_question(job_description: str, resume: str) -> str:
    """
    Generate a short interview question based on the candidate's resume and job requirements.

    This agent uses OpenRouter to access an OpenAI model and creates a relevant
    question that connects the candidate's experience to the job requirements.

    Args:
        job_description: The full job description and requirements text.
        resume: The candidate's resume text.

    Returns:
        A short, focused interview question string.
    """
    logger.info("Generating interview question")
    logger.debug(f"Using model: {settings.interviewer_model}")

    response = await client.chat.completions.create(
        model=settings.interviewer_model,
        messages=[
            {"role": "system", "content": QUESTION_GENERATOR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""Generate a short interview question for this candidate based on their resume and the job they're applying for.

---
CANDIDATE'S RESUME:
{resume}
---

JOB DESCRIPTION:
{job_description}
---

Ask one short question. Remember:
- Do NOT mention any company names from the resume
- Keep past job questions general, but skill-specific questions can be more technical
- Focus on skills required by this job description:""",
            },
        ],
        temperature=0.7,
        max_tokens=150,
    )

    question = response.choices[0].message.content
    if question is None:
        logger.error("Empty response from model")
        raise ValueError(
            "Failed to generate interview question - empty response from model"
        )

    logger.info(f"Generated question: {question[:50]}...")
    return question.strip()
