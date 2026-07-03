import logging
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr
from typing import Any, Callable

from app.core.config import Settings, settings
from app.models.message import QuoteRequest


logger = logging.getLogger(__name__)
_DEVELOPMENT_ENVIRONMENTS = {"development", "dev", "local", "test", "testing"}

_COMPANY_NAME = "TECHNO ALUM SYSTEM"


class EmailService:
    def __init__(
        self,
        *,
        settings: Settings = settings,
        smtp_factory: Callable[..., Any] = smtplib.SMTP,
    ) -> None:
        self.settings = settings
        self.smtp_factory = smtp_factory

    def _smtp_values(self, *, require_notification_recipient: bool) -> tuple[dict[str, str], list[str]]:
        password = (
            self.settings.smtp_password.get_secret_value()
            if self.settings.smtp_password is not None
            else ""
        )
        values = {
            "SMTP_HOST": self.settings.smtp_host or "",
            "SMTP_USERNAME": self.settings.smtp_username or "",
            "SMTP_PASSWORD": password,
            "SMTP_FROM_EMAIL": self.settings.smtp_from_email or "",
        }
        if require_notification_recipient:
            values["QUOTE_NOTIFICATION_EMAIL"] = (
                self.settings.quote_notification_email or ""
            )
        return values, [name for name, value in values.items() if not value.strip()]

    def _preflight(
        self, kind: str, *, require_notification_recipient: bool
    ) -> dict[str, str] | None:
        if not getattr(self.settings, "smtp_enabled", True):
            logger.info("SMTP is disabled (SMTP_ENABLED=false); %s skipped.", kind)
            return None

        values, missing = self._smtp_values(
            require_notification_recipient=require_notification_recipient
        )
        if missing:
            log = (
                logger.warning
                if self.settings.environment.strip().lower() in _DEVELOPMENT_ENVIRONMENTS
                else logger.error
            )
            log(
                "SMTP configuration is incomplete; %s skipped. Missing: %s",
                kind,
                ", ".join(missing),
            )
            return None
        return values

    def _send(self, message: EmailMessage, values: dict[str, str], kind: str) -> bool:
        try:
            with self.smtp_factory(
                values["SMTP_HOST"],
                self.settings.smtp_port,
                timeout=10,
            ) as smtp:
                smtp.starttls(context=ssl.create_default_context())
                smtp.login(values["SMTP_USERNAME"], values["SMTP_PASSWORD"])
                smtp.send_message(message)
        except Exception as exc:
            # Log only the exception type: SMTP errors can echo credentials.
            logger.error("Failed to send %s (%s).", kind, type(exc).__name__)
            return False
        return True

    def send_quote_request_notification(self, request: QuoteRequest) -> bool:
        kind = "quote request notification"
        values = self._preflight(kind, require_notification_recipient=True)
        if values is None:
            return False

        message = EmailMessage()
        message["Subject"] = "New Quote Request Received"
        message["From"] = formataddr(
            (self.settings.smtp_from_name, values["SMTP_FROM_EMAIL"])
        )
        message["To"] = values["QUOTE_NOTIFICATION_EMAIL"]
        message.set_content(
            "\n".join(
                [
                    "A new quote request was received on the website.",
                    "",
                    f"Request ID: {request.id}",
                    f"Name: {request.name}",
                    f"Phone: {request.phone}",
                    f"Email: {request.email or 'Not provided'}",
                    f"Service / project type: {request.service_type or 'Not provided'}",
                    f"Message: {request.message or 'Not provided'}",
                    f"Plans / files link: {request.plans_link or 'Not provided'}",
                    f"Status: {request.status}",
                    f"Submitted at: {request.created_at.isoformat(sep=' ', timespec='seconds')}",
                ]
            )
        )
        return self._send(message, values, kind)

    def send_quote_confirmation(self, request: QuoteRequest) -> bool:
        kind = "quote confirmation email"
        if not (request.email or "").strip():
            logger.info(
                "Quote request %s has no customer email; confirmation skipped.",
                request.id,
            )
            return False

        values = self._preflight(kind, require_notification_recipient=False)
        if values is None:
            return False

        message = EmailMessage()
        message["Subject"] = "Your quote request has been received"
        message["From"] = formataddr(
            (self.settings.smtp_from_name, values["SMTP_FROM_EMAIL"])
        )
        message["To"] = request.email
        message.set_content(
            "\n".join(
                [
                    f"Dear {request.name},",
                    "",
                    f"Thank you for contacting {_COMPANY_NAME}.",
                    "",
                    "Your quote request has been received successfully and will be",
                    "reviewed by our team. We will contact you soon with the details.",
                    "",
                    "Best regards,",
                    f"{_COMPANY_NAME} Team",
                ]
            )
        )
        return self._send(message, values, kind)


email_service = EmailService()
