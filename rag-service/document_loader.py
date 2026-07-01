import os
import json
import logging
from pathlib import Path
from config import settings

logger = logging.getLogger(__name__)

class DocumentLoader:
    def __init__(self, base_dir: str = None):
        self.base_dir = Path(base_dir or settings.KNOWLEDGE_BASE_DIR)

    def load_all_documents(self) -> dict[str, list[dict]]:
        """
        Loads all JSON files from the knowledge base.
        Returns a dict mapping collection_name to list of document dictionaries:
        {
            "skills": [{"text": "...", "metadata": {...}, "id": "..."}, ...],
            "career_roles": [...]
        }
        """
        collections = {
            "skills": [],
            "career_roles": [],
            "interview_prep": [],
            "salary_data": [],
            "learning_paths": []
        }

        if not self.base_dir.exists():
            logger.warning(f"Knowledge base directory does not exist: {self.base_dir}")
            return collections

        for category in collections.keys():
            category_dir = self.base_dir / category
            if not category_dir.exists():
                logger.info(f"Subdirectory {category_dir} does not exist, skipping.")
                continue

            for root, _, files in os.walk(category_dir):
                for file in files:
                    if not file.endswith(".json"):
                        continue
                    
                    file_path = Path(root) / file
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            
                        docs = self.parse_json_data(data, category, file_path.name)
                        collections[category].extend(docs)
                    except Exception as e:
                        logger.error(f"Error reading/parsing file {file_path}: {e}")

        return collections

    def parse_json_data(self, data, category: str, file_name: str) -> list[dict]:
        """
        Parse loaded JSON data depending on its shape (list vs dict) and category.
        Returns a list of dicts: {"text": str, "metadata": dict, "id": str}
        """
        documents = []
        base_name = file_name.replace(".json", "")

        # If data is a list, parse each element as a document
        if isinstance(data, list):
            for i, item in enumerate(data):
                doc_id = f"{category}:{base_name}:{i}"
                doc = self.convert_item_to_doc(item, category, file_name, doc_id)
                if doc:
                    documents.append(doc)
        # If data is a single dict, parse it as a single document (or check if it has a list of key items inside)
        elif isinstance(data, dict):
            # Sometimes a dict contains a list of objects under a main key (like "skills", "roles", etc.)
            list_key = None
            for k, v in data.items():
                if isinstance(v, list) and len(v) > 0 and isinstance(v[0], (dict, str)):
                    list_key = k
                    break
            
            if list_key:
                logger.info(f"Detected list of items under key '{list_key}' in {file_name}")
                items = data[list_key]
                for i, item in enumerate(items):
                    doc_id = f"{category}:{base_name}:{i}"
                    # If item is a string, wrap it
                    if isinstance(item, str):
                        item = {"name": item, "description": f"Information about {item}"}
                    doc = self.convert_item_to_doc(item, category, file_name, doc_id)
                    if doc:
                        documents.append(doc)
            else:
                # Treat the entire dict as one single document
                doc_id = f"{category}:{base_name}"
                doc = self.convert_item_to_doc(data, category, file_name, doc_id)
                if doc:
                    documents.append(doc)
        
        return documents

    def convert_item_to_doc(self, item, category: str, file_name: str, doc_id: str) -> dict:
        """
        Converts a JSON item into a unified document dict with flat metadata suitable for ChromaDB.
        """
        if not isinstance(item, dict):
            # Fallback for plain strings or values
            text_content = str(item)
            metadata = {
                "category": category,
                "source_file": file_name
            }
            return {
                "text": text_content,
                "metadata": metadata,
                "id": doc_id
            }

        # Create structured text presentation of the document for embedding searches
        text_parts = []
        
        # Flatten metadata for ChromaDB (which only supports primitive types: str, int, float, bool)
        metadata = {
            "category": category,
            "source_file": file_name
        }

        # Handle specific common fields
        name_fields = ["name", "role", "title", "skill", "topic", "subject"]
        item_name = "Unknown"
        for nf in name_fields:
            if nf in item:
                item_name = str(item[nf])
                metadata["item_name"] = item_name
                text_parts.append(f"Name/Title: {item_name}")
                break

        # Populate other metadata/text fields
        for key, val in item.items():
            if key in name_fields:
                continue
                
            # If it's a nested structure, serialize it to JSON or dump it nicely in the text
            if isinstance(val, (dict, list)):
                val_str = json.dumps(val, ensure_ascii=False)
                # Store serialized json as string metadata
                metadata[f"data_{key}"] = val_str
                # Add to text representation
                text_parts.append(f"{key.capitalize()}: {val_str}")
            else:
                metadata[key] = val
                text_parts.append(f"{key.capitalize()}: {val}")

        text_content = "\n".join(text_parts)
        
        return {
            "text": text_content,
            "metadata": metadata,
            "id": doc_id
        }

document_loader = DocumentLoader()
