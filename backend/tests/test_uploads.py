import base64
import re
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
)
UPLOAD_ROOT = Path(__file__).resolve().parents[1] / "uploads"


def upload_image(
    client: TestClient,
    headers: dict[str, str],
    *,
    folder: str = "projects",
    filename: str = "image.png",
    content: bytes = PNG_BYTES,
    content_type: str = "image/png",
):
    return client.post(
        "/api/v1/admin/uploads/image",
        headers=headers,
        data={"folder": folder},
        files={"file": (filename, content, content_type)},
    )


@pytest.mark.parametrize("folder", ["projects", "services", "partners", "gallery"])
def test_admin_uploads_images_to_allowed_folders(
    client: TestClient, auth_headers, folder: str
) -> None:
    response = upload_image(
        client,
        auth_headers(),
        folder=folder,
        filename="../../unsafe.png",
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["url"] == f"/uploads/{folder}/{payload['filename']}"
    assert re.fullmatch(r"[0-9a-f-]{36}\.png", payload["filename"])
    assert payload["content_type"] == "image/png"
    assert payload["size"] == len(PNG_BYTES)

    stored_file = UPLOAD_ROOT / folder / payload["filename"]
    try:
        assert stored_file.read_bytes() == PNG_BYTES
        served = client.get(payload["url"])
        assert served.status_code == 200
        assert served.content == PNG_BYTES
    finally:
        stored_file.unlink(missing_ok=True)


def test_upload_requires_admin_authentication(client: TestClient) -> None:
    response = upload_image(client, {})
    assert response.status_code == 401


def test_upload_rejects_unknown_folder(client: TestClient, auth_headers) -> None:
    response = upload_image(client, auth_headers(), folder="other")
    assert response.status_code == 422


def test_upload_rejects_files_larger_than_five_mb(
    client: TestClient, auth_headers
) -> None:
    response = upload_image(
        client,
        auth_headers(),
        content=PNG_BYTES[:8] + b"x" * (5 * 1024 * 1024),
    )
    assert response.status_code == 413


@pytest.mark.parametrize(
    ("filename", "content", "content_type"),
    [
        ("image.gif", b"GIF89a", "image/gif"),
        ("image.png", b"not-an-image", "image/png"),
        ("image.jpg", PNG_BYTES, "image/jpeg"),
    ],
)
def test_upload_rejects_disallowed_or_mismatched_images(
    client: TestClient,
    auth_headers,
    filename: str,
    content: bytes,
    content_type: str,
) -> None:
    response = upload_image(
        client,
        auth_headers(),
        filename=filename,
        content=content,
        content_type=content_type,
    )
    assert response.status_code == 400


def test_uploaded_relative_url_can_be_saved_on_project(
    client: TestClient, auth_headers
) -> None:
    headers = auth_headers()
    upload = upload_image(client, headers)
    assert upload.status_code == 201
    uploaded = upload.json()
    try:
        created = client.post(
            "/api/v1/admin/projects",
            headers=headers,
            json={
                "title_ar": "مشروع",
                "title_en": "Project",
                "title_he": "פרויקט",
                "category": "LOCAL",
                "main_image_url": uploaded["url"],
            },
        )
        assert created.status_code == 201
        assert created.json()["main_image_url"] == uploaded["url"]
    finally:
        (UPLOAD_ROOT / "projects" / uploaded["filename"]).unlink(missing_ok=True)
