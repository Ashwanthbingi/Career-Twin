import logging
from fastapi import APIRouter, HTTPException
from models.requests import ResumeAnalysisRequest
from models.responses import ResumeAnalysisResponse
from prompts.templates import RESUME_ANALYSIS_PROMPT
from retriever import retriever
from generator import generate_with_context

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["Resume Analysis"])

@router.post("/resume-analysis", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    """
    Perform semantic analysis on resume content against known skills and roles
    """
    try:
        # Retrieve context from skills and career_roles collections
        # Search using resume text and career goals
        search_query = f"{request.resume_text}\nGoals: {', '.join(request.career_goals)}"
        retrieved_contexts = retriever.retrieve(
            query=search_query,
            collections=["skills", "career_roles"],
            n_results=6
        )
        
        # Structure variables
        variables = {
            "resume_text": request.resume_text,
            "user_skills": ", ".join(request.user_skills),
            "career_goals": ", ".join(request.career_goals)
        }
        
        # Generate analysis
        response_data = generate_with_context(
            prompt_template=RESUME_ANALYSIS_PROMPT,
            variables=variables,
            retrieved_contexts=retrieved_contexts
        )
        
        return response_data
    except Exception as e:
        logger.error(f"Error in resume-analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
