from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional

from models.submission import SubmissionResponse
from services.resume_service import process_resume, process_submission
from services.question_generator import generate_interview_question

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("", response_model=SubmissionResponse, status_code=201)
async def create_submission(
    job_description: str = Form(..., min_length=1),
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
):
    """
    Create a new submission with job description and resume.
    Resume can be provided as either a PDF file or raw text (one is required).
    
    An AI agent generates a technical interview question based on the job description,
    which will be used as input for the analyzer agents.
    """
    if not resume_file and not resume_text:
        raise HTTPException(
            status_code=400, detail="Resume is required (either file or text)"
        )

    # Process resume - prefer file if both provided
    if resume_file:
        if not resume_file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        pdf_bytes = await resume_file.read()
        try:
            extracted_text = process_resume(pdf_bytes, is_pdf=True)
        except Exception as e:
            raise HTTPException(
                status_code=400, detail=f"Failed to extract text from PDF: {str(e)}"
            )
    else:
        assert resume_text is not None
        extracted_text = process_resume(resume_text, is_pdf=False)

    # Generate interview question using AI agent based on resume and job description
    try:
        interview_question = await generate_interview_question(
            job_description=job_description,
            resume=extracted_text,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate interview question: {str(e)}"
        )

    return process_submission(
        resume_text=extracted_text,
        job_description=job_description,
        interview_question=interview_question,
    )
