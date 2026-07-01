import logging
from sentence_transformers import SentenceTransformer
from config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    _instance = None
    _model = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(EmbeddingService, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def initialize(self):
        if self._model is None:
            model_name = settings.EMBEDDING_MODEL
            logger.info(f"Initializing SentenceTransformer model: {model_name}")
            try:
                # This will download the model to the local cache if not present
                self._model = SentenceTransformer(model_name)
                logger.info("SentenceTransformer model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load SentenceTransformer model: {e}")
                raise e

    def embed_text(self, text: str) -> list[float]:
        if self._model is None:
            self.initialize()
        embeddings = self._model.encode([text])
        return embeddings[0].tolist()

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if self._model is None:
            self.initialize()
        embeddings = self._model.encode(texts)
        return [emb.tolist() for emb in embeddings]

# Singleton instance
embedding_service = EmbeddingService()
