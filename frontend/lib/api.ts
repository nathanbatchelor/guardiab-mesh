import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface SubmissionResponse {
  resume: string;
  job_description: string;
  status: string;
}

export interface ApiError {
  detail: string;
}

/**
 * Submit job description and resume to the backend.
 * Supports both text resume and PDF file upload.
 */
export async function submitInterview(
  jobDescription: string,
  resumeText?: string,
  resumeFile?: File
): Promise<SubmissionResponse> {
  const formData = new FormData();
  formData.append("job_description", jobDescription);

  if (resumeFile) {
    formData.append("resume_file", resumeFile);
  } else if (resumeText) {
    formData.append("resume_text", resumeText);
  }

  try {
    const response = await api.post<SubmissionResponse>(
      "/api/v1/submissions",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(
        axiosError.response?.data?.detail || "Failed to submit interview data"
      );
    }
    throw error;
  }
}

export { api };
