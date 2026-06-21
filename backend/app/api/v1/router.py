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
api_router.include_router(admins.router, prefix="/admin/admins", tags=["admin: admins"])
api_router.include_router(projects.public_router, prefix="/projects", tags=["projects"])
api_router.include_router(
    projects.admin_router,
    prefix="/admin/projects",
    tags=["admin: projects"],
)
api_router.include_router(
    projects.admin_image_router,
    prefix="/admin/project-images",
    tags=["admin: project images"],
)
api_router.include_router(services.public_router, prefix="/services", tags=["services"])
api_router.include_router(
    services.admin_router,
    prefix="/admin/services",
    tags=["admin: services"],
)
api_router.include_router(products.public_router, prefix="/products", tags=["products"])
api_router.include_router(
    products.admin_router,
    prefix="/admin/products",
    tags=["admin: products"],
)
api_router.include_router(gallery.public_router, prefix="/gallery", tags=["gallery"])
api_router.include_router(
    gallery.admin_router,
    prefix="/admin/gallery",
    tags=["admin: gallery"],
)
api_router.include_router(partners.public_router, prefix="/partners", tags=["partners"])
api_router.include_router(
    partners.admin_router,
    prefix="/admin/partners",
    tags=["admin: partners"],
)
api_router.include_router(
    testimonials.public_router,
    prefix="/testimonials",
    tags=["testimonials"],
)
api_router.include_router(
    testimonials.admin_router,
    prefix="/admin/testimonials",
    tags=["admin: testimonials"],
)
api_router.include_router(site_content.router, prefix="/site-content", tags=["site-content"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(
    quote_requests.router,
    prefix="/quote-requests",
    tags=["quote-requests"],
)
