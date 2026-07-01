import logging
from chromadb_manager import chroma_manager

logger = logging.getLogger(__name__)

class Retriever:
    def retrieve(self, query: str, collections: list[str], n_results: int = 10, where_filter: dict = None) -> list[dict]:
        """
        Queries one or more collections, aggregates the results, and sorts them by relevance.
        Returns a list of dicts:
        [
            {"text": "...", "metadata": {...}, "relevance_score": 0.85, "collection": "skills"},
            ...
        ]
        """
        all_results = []
        
        # We query collections one by one
        for col_name in collections:
            try:
                # Query with slightly higher limits to allow merging and filtering
                results = chroma_manager.query(
                    collection_name=col_name,
                    query_text=query,
                    n_results=n_results,
                    where=where_filter
                )
                
                for r in results:
                    r["collection"] = col_name
                    all_results.append(r)
            except Exception as e:
                logger.error(f"Error querying collection '{col_name}': {e}")

        # Deduplicate by document ID
        seen_ids = set()
        deduped_results = []
        for r in all_results:
            doc_id = r["id"]
            if doc_id not in seen_ids:
                seen_ids.add(doc_id)
                deduped_results.append(r)

        # Sort by relevance score in descending order
        deduped_results.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Limit to the requested n_results
        return deduped_results[:n_results]

# Singleton instance
retriever = Retriever()
