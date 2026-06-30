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


class EmailService:
    def __init__(
        self,
        *,
        settings: Settings = settings,
        smtp_factory: Callable[..., Any] = smtplib.SMTP,
    ) -> None:
        self.settings = settings
        self.smtp_factory = smtp_factory

    def _smtp_values(self) -> tuple[dict[str, str], list[str]]:
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
            "QUOTE_REQUEST_RECIPIENT_EMAIL": (
                self.settings.quote_request_recipient_email or ""
            ),
        }
        return values, [name for name, value in values.items() if not value.strip()]

    def send_quote_request_notification(self, request: QuoteRequest) -> bool:
        values, missing = self._smtp_values()
        if missing:
            log = (
                logger.warning
                if self.settings.environment.strip().lower() in _DEVELOPMENT_ENVIRONMENTS
                else logger.error
            )
            log("SMTP configuration is incomplete; quote email skipped. Missing: %s", ", ".join(missing))
            return False

        message = EmailMessage()
        message["Subject"] = f"New quote request #{request.id}"
        message["From"] = formataddr(
            (self.settings.smtp_from_name, values["SMTP_FROM_EMAIL"])
        )
        message["To"] = values["QUOTE_REQUEST_RECIPIENT_EMAIL"]
        message.set_content(
            "\n".join(
                [
                    f"Request ID: {request.id}",
                    f"Name: {request.name}",
                    f"Phone: {request.phone}",
                    f"Email: {request.email or 'Not provided'}",
                    f"Service / project type: {request.service_type or 'Not provided'}",
                    f"Message: {request.message or 'Not provided'}",
                    f"Plans / files link: {request.plans_link or 'Not provided'}",
                    f"Timestamp: {request.created_at.isoformat(sep=' ', timespec='seconds')}",
                ]
            )
        )

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
            logger.error(
                "Failed to send quote request notification (%s).",
                type(exc).__name__,
            )
            return False

        return True


email_service = EmailService()
