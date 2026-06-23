import logging
from fastapi import APIRouter, HTTPException
from models.requests import SkillValidationRequest
from models.responses import SkillValidationResponse
from prompts.templates import SKILL_VALIDATION_PROMPT
from retriever import retriever
from generator import generate_with_context

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["Skill Validation"])

@router.post("/skill-validation", response_model=SkillValidationResponse)
async def validate_skill(request: SkillValidationRequest):
    """
    Perform deep validation of user capability in a specific skill
    """
    try:
        # Retrieve context from skills collection focusing on the specific skill
        retrieved_contexts = retriever.retrieve(
            query=request.skill_name,
            collections=["skills"],
            n_results=3,
            where_filter={"item_name": request.skill_name} if request.skill_name else None
        )
        
        # If no strict matches, retrieve general context on the skill
        if not retrieved_contexts:
            retrieved_contexts = retriever.retrieve(
                query=f"Skill details: {request.skill_name}",
                collections=["skills"],
                n_results=4
            )
            
        # Structure variables
        variables = {
            "skill_name": request.skill_name,
            "resume_evidence": request.resume_evidence or "No resume evidence.",
            "github_evidence": request.github_evidence or "No GitHub evidence.",
            "leetcode_evidence": request.leetcode_evidence or "No LeetCode evidence."
        }
        
        # Generate analysis
        response_data = generate_with_context(
            prompt_template=SKILL_VALIDATION_PROMPT,
            variables=variables,
            retrieved_contexts=retrieved_contexts
        )
        
        return response_data
    except Exception as e:
        logger.error(f"Error in skill-validation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
