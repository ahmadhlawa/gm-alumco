from fastapi import APIRouter

from app.api.v1.endpoints import (
    about_page_content,
    admins,
    audit_logs,
    auth,
    dashboard,
    gallery,
    homepage_video_section,
    messages,
    partners,
    production_projects,
    projects,
    quote_requests,
    services,
    site_content,
    site_settings,
    testimonials,
    uploads,
)


api_router = APIRouter()


@api_router.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


api_router.include_router(
    about_page_content.public_router,
    prefix="/about-page-content",
    tags=["about page content"],
)
api_router.include_router(
    about_page_content.admin_router,
    prefix="/admin/about-page-content",
    tags=["admin: about page content"],
)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    uploads.router,
    prefix="/admin/uploads",
    tags=["admin: uploads"],
)
api_router.include_router(admins.router, prefix="/admin/admins", tags=["admin: admins"])
api_router.include_router(
    dashboard.router,
    prefix="/admin/dashboard",
    tags=["admin: dashboard"],
)
api_router.include_router(
    audit_logs.router,
    prefix="/admin/audit-logs",
    tags=["admin: audit logs"],
)
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
api_router.include_router(
    production_projects.public_router,
    prefix="/production-projects",
    tags=["production projects"],
)
api_router.include_router(
    production_projects.admin_router,
    prefix="/admin/production-projects",
    tags=["admin: production projects"],
)
api_router.include_router(
    production_projects.admin_image_router,
    prefix="/admin/production-project-images",
    tags=["admin: production project images"],
)
api_router.include_router(services.public_router, prefix="/services", tags=["services"])
api_router.include_router(
    services.admin_router,
    prefix="/admin/services",
    tags=["admin: services"],
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
api_router.include_router(
    site_content.public_router,
    prefix="/site-content",
    tags=["site content"],
)
api_router.include_router(
    site_content.admin_router,
    prefix="/admin/site-content",
    tags=["admin: site content"],
)
api_router.include_router(
    site_settings.public_router,
    prefix="/site-settings",
    tags=["site settings"],
)
api_router.include_router(
    site_settings.admin_router,
    prefix="/admin/site-settings",
    tags=["admin: site settings"],
)
api_router.include_router(
    homepage_video_section.public_router,
    prefix="/homepage-video-section",
    tags=["homepage video section"],
)
api_router.include_router(
    homepage_video_section.admin_router,
    prefix="/admin/homepage-video-section",
    tags=["admin: homepage video section"],
)
api_router.include_router(
    messages.public_router,
    prefix="/contact/messages",
    tags=["contact messages"],
)
api_router.include_router(
    messages.admin_router,
    prefix="/admin/contact-messages",
    tags=["admin: contact messages"],
)
api_router.include_router(
    quote_requests.public_router,
    prefix="/quote-requests",
    tags=["quote-requests"],
)
api_router.include_router(
    quote_requests.admin_router,
    prefix="/admin/quote-requests",
    tags=["admin: quote requests"],
)
