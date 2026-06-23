import logging
import chromadb
from chromadb.api.types import EmbeddingFunction, Documents, Embeddings
from config import settings
from embeddings import embedding_service

logger = logging.getLogger(__name__)

class SentenceTransformerEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        # Wrap our singleton EmbeddingService to be used by ChromaDB
        return embedding_service.embed_texts(list(input))

class ChromaDBManager:
    _instance = None
    _client = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ChromaDBManager, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def initialize(self):
        if self._client is None:
            persist_dir = settings.CHROMA_PERSIST_DIR
            logger.info(f"Initializing ChromaDB persistent client at: {persist_dir}")
            try:
                self._client = chromadb.PersistentClient(path=persist_dir)
                logger.info("ChromaDB initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize ChromaDB client: {e}")
                raise e

    def get_embedding_function(self):
        return SentenceTransformerEmbeddingFunction()

    def get_or_create_collection(self, collection_name: str):
        if self._client is None:
            self.initialize()
        
        # We pass our custom embedding function so ChromaDB handles embedding automatically during queries
        emb_fn = self.get_embedding_function()
        return self._client.get_or_create_collection(
            name=collection_name, 
            embedding_function=emb_fn
        )

    def index_documents(self, collection_name: str, documents: list[str], metadatas: list[dict], ids: list[str]):
        if not documents:
            return
            
        collection = self.get_or_create_collection(collection_name)
        
        # Batch items to avoid hitting any size limits (e.g. max batch size in chromadb is typically 41665)
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            end_idx = min(i + batch_size, len(documents))
            batch_docs = documents[i:end_idx]
            batch_meta = metadatas[i:end_idx]
            batch_ids = ids[i:end_idx]
            
            logger.info(f"Indexing batch {i} to {end_idx} in collection '{collection_name}'...")
            collection.add(
                documents=batch_docs,
                metadatas=batch_meta,
                ids=batch_ids
            )
        logger.info(f"Successfully indexed all documents in collection '{collection_name}'. Total count: {collection.count()}")

    def query(self, collection_name: str, query_text: str, n_results: int = 5, where: dict = None) -> list[dict]:
        collection = self.get_or_create_collection(collection_name)
        
        # Perform query. ChromaDB will automatically embed query_text using our EmbeddingFunction
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where=where
        )
        
        # Format results to a list of dicts for convenience
        formatted_results = []
        if results and results.get("documents"):
            documents = results["documents"][0]
            metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(documents)
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(documents)
            ids = results["ids"][0] if results.get("ids") else [""] * len(documents)
            
            for doc, meta, dist, doc_id in zip(documents, metadatas, distances, ids):
                # Chroma distance: smaller means closer. We can convert to a similarity score (e.g. 1 / (1 + dist) or similar)
                similarity_score = 1.0 - (dist / 2.0) if dist <= 2.0 else 0.0 # for cosine distance
                formatted_results.append({
                    "id": doc_id,
                    "text": doc,
                    "metadata": meta,
                    "relevance_score": max(0.0, min(1.0, similarity_score))
                })
                
        return formatted_results

    def get_collection_count(self, collection_name: str) -> int:
        try:
            collection = self.get_or_create_collection(collection_name)
            return collection.count()
        except Exception:
            return 0

# Singleton instance
chroma_manager = ChromaDBManager()
