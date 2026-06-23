import logging
from fastapi import APIRouter, HTTPException
from models.requests import LeetCodeAnalysisRequest
from models.responses import LeetCodeAnalysisResponse
from prompts.templates import LEETCODE_ANALYSIS_PROMPT
from retriever import retriever
from generator import generate_with_context

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["LeetCode Analysis"])

@router.post("/leetcode-analysis", response_model=LeetCodeAnalysisResponse)
async def analyze_leetcode(request: LeetCodeAnalysisRequest):
    """
    Perform semantic analysis on LeetCode performance statistics
    """
    try:
        # Search query based on strengths/weaknesses and solved numbers
        query_text = f"LeetCode solved: {request.total_solved}. Strengths: {', '.join(request.strengths)}. Weaknesses: {', '.join(request.weaknesses)}"
        
        # Retrieve context from interview_prep benchmarks
        retrieved_contexts = retriever.retrieve(
            query=query_text,
            collections=["interview_prep"],
            n_results=4
        )
        
        # Structure variables
        variables = {
            "total_solved": request.total_solved,
            "easy_solved": request.easy_solved,
            "medium_solved": request.medium_solved,
            "hard_solved": request.hard_solved,
            "contest_rating": request.contest_rating if request.contest_rating is not None else "N/A",
            "ranking": request.ranking if request.ranking is not None else "N/A",
            "strengths": ", ".join(request.strengths) if request.strengths else "None declared",
            "weaknesses": ", ".join(request.weaknesses) if request.weaknesses else "None declared"
        }
        
        # Generate analysis
        response_data = generate_with_context(
            prompt_template=LEETCODE_ANALYSIS_PROMPT,
            variables=variables,
            retrieved_contexts=retrieved_contexts
        )
        
        return response_data
    except Exception as e:
        logger.error(f"Error in leetcode-analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
