import logging
from fastapi import APIRouter, HTTPException
from models.requests import GitHubAnalysisRequest
from models.responses import GitHubAnalysisResponse
from prompts.templates import GITHUB_ANALYSIS_PROMPT
from retriever import retriever
from generator import generate_with_context

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/rag", tags=["GitHub Analysis"])

@router.post("/github-analysis", response_model=GitHubAnalysisResponse)
async def analyze_github(request: GitHubAnalysisRequest):
    """
    Perform semantic analysis on GitHub portfolio metadata
    """
    try:
        # Create queries from repositories and topics
        repo_desc_list = [f"{r.get('name')}: {r.get('description', '')} ({r.get('language', '')})" for r in request.repositories[:5]]
        query_text = f"Languages: {', '.join(request.languages)}. Repositories: {'; '.join(repo_desc_list)}"
        
        # Retrieve context from skills and career_roles
        retrieved_contexts = retriever.retrieve(
            query=query_text,
            collections=["skills", "career_roles"],
            n_results=5
        )
        
        # Structure variables
        variables = {
            "repositories": str(request.repositories),
            "languages": ", ".join(request.languages),
            "total_stars": request.total_stars,
            "contribution_score": request.contribution_score
        }
        
        # Generate analysis
        response_data = generate_with_context(
            prompt_template=GITHUB_ANALYSIS_PROMPT,
            variables=variables,
            retrieved_contexts=retrieved_contexts
        )
        
        return response_data
    except Exception as e:
        logger.error(f"Error in github-analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
