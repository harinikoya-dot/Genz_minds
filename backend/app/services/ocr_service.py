
import re
from pathlib import Path
from typing import Any

from app.services.ocr_quality import extract_text_from_file as extract_ocr_text


class OCRService:
    @staticmethod
    def extract_text_from_file(file_path: str, mime_type: str = "") -> dict[str, Any]:
        text = extract_ocr_text(file_path)

        suffix = Path(file_path).suffix.lower()
        page_count = 1

        if suffix == ".pdf":
            try:
                from pypdf import PdfReader
                page_count = len(PdfReader(file_path).pages)
            except Exception:
                page_count = 1

        return {
            "text": text,
            "classification": {
                "document_type": None
            },
            "page_count": page_count,
            "quality": {},
            "confidence": 1.0,
            "structured_fields": {},
        }

    @staticmethod
    def chunk_document(
        text: str,
        chunk_size: int = 350,
        overlap: int = 60,
    ) -> list[dict[str, Any]]:
        if not text or not text.strip():
            return []

        words = text.split()
        if not words:
            return []

        chunk_size = max(1, chunk_size)
        overlap = max(0, min(overlap, chunk_size - 1))
        step = chunk_size - overlap

        chunks = []

        for index, start in enumerate(range(0, len(words), step)):
            chunk_words = words[start:start + chunk_size]
            if not chunk_words:
                break

            chunks.append({
                "text": " ".join(chunk_words),
                "chunk_index": index,
                "page_number": 1,
            })

            if start + chunk_size >= len(words):
                break

        return chunks


ocr_service = OCRService()
