"""
app/api/v1/routes/documents.py
────────────────────────────────────────────────────────────────
Document upload and ingestion endpoints.

Supports:
  PDF   → /documents/upload/pdf      (existing, now also here)
  DOCX  → /documents/upload/docx
  XLSX  → /documents/upload/xlsx
  Image → /documents/upload/image
  Any   → /documents/upload          (auto-detect by extension)
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse

from app.knowledge.ingest import knowledge_ingest
from app.knowledge.parsers.registry import parser_registry

router = APIRouter()


def _ingest_result_to_dict(result, filename: str = "") -> dict:
    return {
        "success":      result.success,
        "document_id":  result.document_id,
        "chunk_count":  result.chunk_count,
        "filename":     filename,
        "error":        result.error,
    }


@router.post("/documents/upload")
async def upload_any(
    file:   UploadFile = File(...),
    title:  str | None = Form(default=None),
    source: str        = Form(default="upload"),
) -> dict:
    """
    Upload any supported document type.
    Auto-detects format by file extension.
    Supported: .pdf, .docx, .xlsx, .xls, .png, .jpg, .jpeg, .tiff, .bmp
    """
    filename  = file.filename or "document"
    extension = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""

    knowledge_ingest.setup()
    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # Route PDF to existing ingest_pdf()
    if extension == ".pdf":
        result = knowledge_ingest.ingest_pdf(
            title=title or filename,
            file_bytes=file_bytes,
            source=source or filename,
        )
    else:
        result = knowledge_ingest.ingest_document(
            file_bytes=file_bytes,
            filename=filename,
            title=title,
            source=source or filename,
        )

    if not result.success:
        raise HTTPException(status_code=422, detail=result.error)

    return _ingest_result_to_dict(result, filename)


@router.post("/documents/upload/docx")
async def upload_docx(
    file:   UploadFile = File(...),
    title:  str | None = Form(default=None),
    source: str        = Form(default="upload"),
) -> dict:
    """Upload and ingest a Microsoft Word (.docx) document."""
    filename = file.filename or "document.docx"
    if not filename.lower().endswith(".docx"):
        raise HTTPException(
            status_code=400,
            detail="Only .docx files accepted on this endpoint",
        )

    knowledge_ingest.setup()
    file_bytes = await file.read()
    result = knowledge_ingest.ingest_document(
        file_bytes=file_bytes,
        filename=filename,
        title=title,
        source=source or filename,
    )

    if not result.success:
        raise HTTPException(status_code=422, detail=result.error)

    return _ingest_result_to_dict(result, filename)


@router.post("/documents/upload/xlsx")
async def upload_xlsx(
    file:   UploadFile = File(...),
    title:  str | None = Form(default=None),
    source: str        = Form(default="upload"),
) -> dict:
    """Upload and ingest a Microsoft Excel (.xlsx/.xls) spreadsheet."""
    filename  = file.filename or "spreadsheet.xlsx"
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension not in ("xlsx", "xls"):
        raise HTTPException(
            status_code=400,
            detail="Only .xlsx or .xls files accepted on this endpoint",
        )

    knowledge_ingest.setup()
    file_bytes = await file.read()
    result = knowledge_ingest.ingest_document(
        file_bytes=file_bytes,
        filename=filename,
        title=title,
        source=source or filename,
    )

    if not result.success:
        raise HTTPException(status_code=422, detail=result.error)

    return _ingest_result_to_dict(result, filename)


@router.post("/documents/upload/image")
async def upload_image(
    file:   UploadFile = File(...),
    title:  str | None = Form(default=None),
    source: str        = Form(default="upload"),
) -> dict:
    """
    Upload an image and extract text via OCR.
    Supported: .png, .jpg, .jpeg, .tiff, .bmp

    Requires tesseract-ocr installed on the system.
    """
    filename  = file.filename or "image.png"
    extension = ("." + filename.rsplit(".", 1)[-1].lower()) if "." in filename else ""

    supported = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp"}
    if extension not in supported:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type {extension!r}. Supported: {sorted(supported)}",
        )

    knowledge_ingest.setup()
    file_bytes = await file.read()
    result = knowledge_ingest.ingest_document(
        file_bytes=file_bytes,
        filename=filename,
        title=title,
        source=source or filename,
    )

    if not result.success:
        raise HTTPException(status_code=422, detail=result.error)

    return _ingest_result_to_dict(result, filename)


@router.get("/documents/supported-types")
def supported_types() -> dict:
    """List all supported document types and their parsers."""
    types = parser_registry.supported_types()
    extensions = parser_registry.supported_extensions()

    return {
        "supported_extensions": extensions + [".pdf"],
        "parsers": {
            **types,
            "PdfParser (built-in)": [".pdf"],
        },
        "notes": {
            ".docx": "Requires python-docx",
            ".xlsx": "Requires openpyxl",
            ".jpg/.png/...": "Requires pytesseract + tesseract-ocr binary",
            ".pdf": "Built-in via pypdf (no extra install needed)",
        },
    }
