from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Aggregate counts powering the admin dashboard control panel.

    Entity counts are of *active* records. The inbox fields map each status to
    its count (e.g. ``{"new": 3, "read": 2}``) so the UI can show "new" badges.
    """

    projects: int
    local_projects: int
    international_projects: int
    featured_projects: int
    services: int
    gallery: int
    partners: int
    testimonials: int
    contact_messages: dict[str, int]
    quote_requests: dict[str, int]
    unread_contact_messages: int
    unread_quote_requests: int
