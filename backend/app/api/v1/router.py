from fastapi import APIRouter

from app.api.v1.endpoints import (
    admins,
    auth,
    gallery,
    messages,
    partners,
    products,
    projects,
    quote_requests,
    services,
    site_content,
    testimonials,
)


api_router = APIRouter()


@api_router.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admins.router, prefix="/admins", tags=["admins"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(gallery.router, prefix="/gallery", tags=["gallery"])
api_router.include_router(partners.router, prefix="/partners", tags=["partners"])
api_router.include_router(testimonials.router, prefix="/testimonials", tags=["testimonials"])
api_router.include_router(site_content.router, prefix="/site-content", tags=["site-content"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(
    quote_requests.router,
    prefix="/quote-requests",
    tags=["quote-requests"],
)
