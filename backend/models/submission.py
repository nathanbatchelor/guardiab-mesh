from pydantic import BaseModel, Field


class SubmissionResponse(BaseModel):
    """Response model for successful submission."""

    resume: str = Field(..., description="Processed resume text content")
    job_description: str = Field(..., description="Processed job description")
    interview_question: str = Field(..., description="AI-generated technical interview question")
    status: str = Field(..., description="Processing status")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "resume": "John Doe\nSoftware Engineer\n5 years experience...",
                    "job_description": "We are looking for a senior developer...",
                    "interview_question": "How would you design a distributed caching system that handles millions of requests per second?",
                    "status": "ready",
                }
            ]
        }
    }
