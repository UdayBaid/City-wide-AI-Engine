"""
RAG Engine — FAISS + Gemini Embeddings
=======================================
Builds a FAISS vector index from the knowledge base on startup,
then retrieves the top-k relevant documents for any incoming query.
"""

import os
import numpy as np
import faiss
from google import genai
from google.genai import types

from .knowledge_base import KNOWLEDGE_BASE

EMBEDDING_MODEL = "gemini-embedding-2"
EMBED_DIM = 3072  # gemini-embedding-2 output dimension

_client: genai.Client | None = None
_index: faiss.IndexFlatIP | None = None
_documents: list[dict] = []


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise EnvironmentError("GEMINI_API_KEY is not set. Check backend/.env")
        _client = genai.Client(api_key=api_key)
    return _client


def _embed_text(text: str) -> np.ndarray:
    """Embed a single piece of text using Gemini embedding model."""
    client = _get_client()
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
    )
    vec = np.array(response.embeddings[0].values, dtype=np.float32)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec


def _embed_query(text: str) -> np.ndarray:
    """Embed a user query."""
    client = _get_client()
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
    )
    vec = np.array(response.embeddings[0].values, dtype=np.float32)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec


def build_index() -> None:
    """Build the FAISS index from KNOWLEDGE_BASE. Called once at startup."""
    global _index, _documents

    print("[INFO] Building RAG vector index...")
    _documents = KNOWLEDGE_BASE
    embeddings = []

    for doc in _documents:
        text = f"{doc['title']}: {doc['content']}"
        vec = _embed_text(text)
        embeddings.append(vec)

    matrix = np.stack(embeddings, axis=0)
    _index = faiss.IndexFlatIP(matrix.shape[1])  # Inner Product = cosine on normalized vecs
    _index.add(matrix)
    print(f"[SUCCESS] RAG index ready — {len(_documents)} documents indexed.")


def retrieve(query: str, top_k: int = 4) -> list[dict]:
    """Retrieve the top-k most relevant documents for a query."""
    if _index is None:
        raise RuntimeError("RAG index not built. Call build_index() first.")

    q_vec = _embed_query(query)
    q_matrix = np.expand_dims(q_vec, axis=0)
    scores, indices = _index.search(q_matrix, top_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        doc = _documents[idx].copy()
        doc["score"] = float(score)
        results.append(doc)
    return results
