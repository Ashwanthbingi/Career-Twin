import logging
from fastapi import APIRouter, HTTPException
from models.requests import RoadmapRequest
from models.responses import RoadmapResponse
from prompts.templates import ROADMAP_PROMPT
from retriever import retriever
from generator import generate_with_context

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["Learning Roadmaps"])

@router.post("/roadmap", response_model=RoadmapResponse)
async def generate_roadmap(request: RoadmapRequest):
    """
    Generate a personalized roadmap to transition to a target role
    """
    try:
        # Search query matching target role and current skills
        query_text = f"Target role: {request.target_role}. Current skills: {', '.join(request.current_skills)}"
        
        # Retrieve context from learning_paths and career_roles
        retrieved_contexts = retriever.retrieve(
            query=query_text,
            collections=["learning_paths", "career_roles", "skills"],
            n_results=6
        )
        
        # Structure variables
        variables = {
            "current_skills": ", ".join(request.current_skills),
            "target_role": request.target_role,
            "experience_years": request.experience_years,
            "career_goals": ", ".join(request.career_goals) if request.career_goals else "None declared"
        }
        
        # Generate analysis
        response_data = generate_with_context(
            prompt_template=ROADMAP_PROMPT,
            variables=variables,
            retrieved_contexts=retrieved_contexts
        )
        
        return response_data
    except Exception as e:
        logger.error(f"Error in roadmap: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
