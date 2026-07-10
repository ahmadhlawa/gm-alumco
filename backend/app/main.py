from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.api.v1.endpoints.uploads import UPLOAD_ROOT
from app.core.config import settings
from app.core.rate_limit import public_submission_rate_limiter


app = FastAPI(
    title=settings.app_name,
    docs_url=f"{settings.api_prefix}/docs",
    openapi_url=f"{settings.api_prefix}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Accept", "Authorization", "Content-Type"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    path = request.url.path
    public_submission_paths = {
        f"{settings.api_prefix}/contact/messages": "contact",
        f"{settings.api_prefix}/quote-requests": "quote",
    }
    bucket = public_submission_paths.get(path)
    if request.method == "POST" and bucket is not None:
        client_key = request.client.host if request.client else "unknown"
        retry_after = public_submission_rate_limiter.register_request(
            f"{bucket}:{client_key}"
        )
        if retry_after is not None:
            response = JSONResponse(
                status_code=429,
                content={"detail": "Too many submissions. Please try again later."},
                headers={"Retry-After": str(retry_after)},
            )
        else:
            response = await call_next(request)
    else:
        response = await call_next(request)

    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=()",
    )
    if not path.startswith(f"{settings.api_prefix}/docs"):
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
        )
    if path.startswith(
        (
            f"{settings.api_prefix}/admin",
            f"{settings.api_prefix}/auth",
            f"{settings.api_prefix}/contact/messages",
            f"{settings.api_prefix}/quote-requests",
        )
    ):
        response.headers.setdefault("Cache-Control", "no-store")
        response.headers.setdefault("Pragma", "no-cache")
    if request.url.scheme == "https":
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains",
        )
    return response

UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_ROOT), name="uploads")
app.include_router(api_router, prefix=settings.api_prefix)
