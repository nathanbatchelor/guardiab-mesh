from pypdf import PdfReader
from io import BytesIO


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text content from a PDF file."""
    pdf_file = BytesIO(pdf_bytes)
    reader = PdfReader(pdf_file)
    
    text_content = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            text_content.append(text)
    
    return "\n".join(text_content)


def process_resume(content: str | bytes, is_pdf: bool = False) -> str:
    """
    Process resume content - either raw text or PDF bytes.
    Returns the extracted text.
    """
    if is_pdf and isinstance(content, bytes):
        return extract_text_from_pdf(content)
    elif isinstance(content, str):
        return content
    else:
        raise ValueError("Invalid content type. Expected str or bytes for PDF.")


def process_submission(
    resume_text: str,
    job_description: str
) -> dict:
    """
    Process the complete submission with resume and job description.
    Returns processed data ready for the interview arena.
    """
    return {
        "resume": resume_text.strip(),
        "job_description": job_description.strip(),
        "status": "ready"
    }
