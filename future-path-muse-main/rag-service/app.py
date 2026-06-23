import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from embeddings import embedding_service
from chromadb_manager import chroma_manager
from document_loader import document_loader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("rag_service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup behavior
    logger.info("Initializing RAG Service dependencies...")
    try:
        # Load the sentence transformer model
        embedding_service.initialize()
        
        # Connect to ChromaDB
        chroma_manager.initialize()
        
        # Auto-index knowledge base if collections are empty
        logger.info("Checking knowledge base collection indexes...")
        collections = ["skills", "career_roles", "interview_prep", "salary_data", "learning_paths"]
        
        # Load files from disk
        all_docs = document_loader.load_all_documents()
        
        for col in collections:
            count = chroma_manager.get_collection_count(col)
            logger.info(f"Chroma collection '{col}' has {count} documents.")
            
            if count == 0 and all_docs.get(col):
                logger.info(f"Collection '{col}' is empty. Automatically indexing loaded JSONs...")
                docs = all_docs[col]
                
                texts = [d["text"] for d in docs]
                metadatas = [d["metadata"] for d in docs]
                ids = [d["id"] for d in docs]
                
                chroma_manager.index_documents(col, texts, metadatas, ids)
            elif count == 0:
                logger.warning(f"No local source files found to index for '{col}' collection.")
                
    except Exception as e:
        logger.error(f"Critical error initializing services during startup: {e}", exc_info=True)
        
    yield
    # Shutdown behavior
    logger.info("Shutting down RAG Service...")

app = FastAPI(
    title="Twinos Career RAG microservice",
    description="FastAPI service for semantic search and generative career recommendations",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configurations - allowing requests from the Spring Boot API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import resume, github, leetcode, career, skill_validation, roadmap

app.include_router(resume.router)
app.include_router(github.router)
app.include_router(leetcode.router)
app.include_router(career.router)
app.include_router(skill_validation.router)
app.include_router(roadmap.router)

# Routers registered
@app.get("/rag/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for service status verification and collections telemetry
    """
    status = {
        "status": "healthy",
        "llm_provider": settings.LLM_PROVIDER,
        "embedding_model": settings.EMBEDDING_MODEL,
        "collections": {}
    }
    
    for col in ["skills", "career_roles", "interview_prep", "salary_data", "learning_paths"]:
        status["collections"][col] = chroma_manager.get_collection_count(col)
        
    return status
