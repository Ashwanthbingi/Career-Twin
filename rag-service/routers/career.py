import logging
from fastapi import APIRouter, HTTPException
from models.requests import CareerRecommendationRequest
from models.responses import CareerRecommendationResponse
from prompts.templates import CAREER_RECOMMENDATION_PROMPT
from retriever import retriever
from generator import generate_with_context

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["Career Recommendations"])

@router.post("/career-recommendation", response_model=CareerRecommendationResponse)
async def recommend_career(request: CareerRecommendationRequest):
    """
    Generate career recommendations based on user's complete profile
    """
    try:
        # Search query based on all parts of the user profile
        goals_str = ", ".join(request.career_goals)
        skills_str = ", ".join(request.skills)
        query_text = f"Career goals: {goals_str}. Skills: {skills_str}. Profile: {request.resume_text or ''}"
        
        # Retrieve context from all collections
        retrieved_contexts = retriever.retrieve(
            query=query_text,
            collections=["career_roles", "skills", "salary_data"],
            n_results=8
        )
        
        # Structure variables
        variables = {
            "resume_text": request.resume_text or "No resume uploaded.",
            "skills": skills_str,
            "github_data": str(request.github_data) if request.github_data else "No GitHub link.",
            "leetcode_data": str(request.leetcode_data) if request.leetcode_data else "No LeetCode link.",
            "career_goals": goals_str if goals_str else "Not declared."
        }
        
        # Generate analysis
        response_data = generate_with_context(
            prompt_template=CAREER_RECOMMENDATION_PROMPT,
            variables=variables,
            retrieved_contexts=retrieved_contexts
        )
        
        return response_data
    except Exception as e:
        logger.error(f"Error in career-recommendation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
