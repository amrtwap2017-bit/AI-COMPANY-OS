"""
app/knowledge/parsers/image_parser.py
────────────────────────────────────────────────────────────────
Image document parser using OCR (Optical Character Recognition).

Extracts text from:
  - PNG, JPG, JPEG, TIFF, BMP, GIF images
  - Scanned documents saved as images

Uses pytesseract which requires the tesseract binary.

Install:
  pip install pytesseract Pillow
  sudo apt install tesseract-ocr        (Ubuntu/Debian)
  sudo pacman -S tesseract              (Arch)

Falls back gracefully if tesseract is not installed.
"""

from __future__ import annotations

import io
import logging

from app.knowledge.parsers.base import BaseParser, ParseResult

log = logging.getLogger(__name__)

SUPPORTED_IMAGE_TYPES = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".gif"}


class ImageParser(BaseParser):
    supported_extensions = list(SUPPORTED_IMAGE_TYPES)
    doc_type = "image"

    def parse(self, file_bytes: bytes, filename: str = "") -> ParseResult:
        # Check dependencies
        try:
            from PIL import Image
        except ImportError:
            return ParseResult(
                success=False,
                error="Pillow not installed. Run: pip install Pillow",
            )

        try:
            import pytesseract
        except ImportError:
            return ParseResult(
                success=False,
                error="pytesseract not installed. Run: pip install pytesseract",
            )

        try:
            # Verify tesseract binary exists
            pytesseract.get_tesseract_version()
        except Exception:
            return ParseResult(
                success=False,
                error=(
                    "tesseract binary not found. "
                    "Install: sudo apt install tesseract-ocr"
                ),
            )

        try:
            image = Image.open(io.BytesIO(file_bytes))

            # Convert to RGB if needed (handles RGBA, grayscale, etc.)
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")

            # OCR with English language
            text = pytesseract.image_to_string(
                image,
                lang="eng",
                config="--psm 3",   # automatic page segmentation
            )

            content = text.strip()

            if not content:
                return ParseResult(
                    success=False,
                    error="OCR found no text in this image",
                )

            title = filename
            for ext in SUPPORTED_IMAGE_TYPES:
                title = title.replace(ext, "")
            title = title.replace("_", " ").strip() or "Image Document"

            width, height = image.size

            return ParseResult(
                success=True,
                content=content,
                title=title,
                doc_type=self.doc_type,
                page_count=1,
                word_count=len(content.split()),
                extra_info={
                    "width":      width,
                    "height":     height,
                    "image_mode": image.mode,
                    "ocr_chars":  len(content),
                },
            )

        except Exception as exc:
            log.error("Image OCR failed: %s", exc)
            return ParseResult(
                success=False,
                error=f"Image OCR error: {exc}",
            )


image_parser = ImageParser()
