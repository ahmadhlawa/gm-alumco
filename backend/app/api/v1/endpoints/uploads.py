from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.api.dependencies import require_admin
from app.models.admin import Admin


router = APIRouter()
UPLOAD_ROOT = Path(__file__).resolve().parents[4] / "uploads"
MAX_IMAGE_SIZE = 5 * 1024 * 1024
UploadFolder = Literal["projects", "services", "partners", "gallery"]

CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}


class UploadResponse(BaseModel):
    url: str
    filename: str
    content_type: str
    size: int


def _matches_image_signature(content: bytes, extension: str) -> bool:
    if extension in {".jpg", ".jpeg"}:
        return content.startswith(b"\xff\xd8\xff")
    if extension == ".png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    if extension == ".webp":
        return len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP"
    return False


@router.post("/image", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile = File(...),
    folder: UploadFolder = Form(...),
    _: Admin = Depends(require_admin),
) -> UploadResponse:
    extension = Path(file.filename or "").suffix.lower()
    expected_content_type = CONTENT_TYPES.get(extension)
    if expected_content_type is None or file.content_type != expected_content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG, PNG, and WEBP images are allowed",
        )

    try:
        content = await file.read(MAX_IMAGE_SIZE + 1)
    finally:
        await file.close()

    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image must not exceed 5MB",
        )
    if not _matches_image_signature(content, extension):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file content does not match its image type",
        )

    filename = f"{uuid4()}{extension}"
    destination = UPLOAD_ROOT / folder
    destination.mkdir(parents=True, exist_ok=True)
    (destination / filename).write_bytes(content)

    return UploadResponse(
        url=f"/uploads/{folder}/{filename}",
        filename=filename,
        content_type=expected_content_type,
        size=len(content),
    )
