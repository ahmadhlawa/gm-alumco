import logging
from datetime import datetime
from types import SimpleNamespace

from pydantic import SecretStr

from app.models.message import QuoteRequest
from app.services.email_service import EmailService


def smtp_settings(**overrides):
    values = {
        "environment": "development",
        "smtp_host": "smtp.example.com",
        "smtp_port": 587,
        "smtp_username": "smtp-user",
        "smtp_password": SecretStr("smtp-password"),
        "smtp_from_email": "website@example.com",
        "smtp_from_name": "T.A.S",
        "quote_request_recipient_email": "quotes@example.com",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def quote_request() -> QuoteRequest:
    return QuoteRequest(
        id=42,
        name="Customer Name",
        phone="+972500000000",
        email="customer@example.com",
        service_type="Curtain wall",
        message="Please prepare an estimate.",
        created_at=datetime(2026, 6, 23, 12, 30),
    )


def test_email_service_sends_starttls_quote_notification() -> None:
    calls: dict = {}

    class FakeSMTP:
        def __init__(self, host, port, timeout):
            calls["connection"] = (host, port, timeout)

        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return None

        def starttls(self, context):
            calls["starttls"] = context

        def login(self, username, password):
            calls["login"] = (username, password)

        def send_message(self, message):
            calls["message"] = message

    sent = EmailService(settings=smtp_settings(), smtp_factory=FakeSMTP).send_quote_request_notification(
        quote_request()
    )

    assert sent is True
    assert calls["connection"] == ("smtp.example.com", 587, 10)
    assert calls["login"] == ("smtp-user", "smtp-password")
    message = calls["message"]
    assert message["To"] == "quotes@example.com"
    assert "42" in message["Subject"]
    body = message.get_content()
    assert "Customer Name" in body
    assert "+972500000000" in body
    assert "customer@example.com" in body
    assert "Curtain wall" in body
    assert "Please prepare an estimate." in body
    assert "2026-06-23 12:30:00" in body


def test_email_service_skips_missing_development_configuration(caplog) -> None:
    with caplog.at_level(logging.WARNING):
        sent = EmailService(
            settings=smtp_settings(smtp_host=None),
            smtp_factory=lambda *_args, **_kwargs: (_ for _ in ()).throw(AssertionError("must not connect")),
        ).send_quote_request_notification(quote_request())

    assert sent is False
    assert "SMTP configuration is incomplete" in caplog.text


def test_email_service_logs_safe_error_without_secret(caplog) -> None:
    def fail_connection(*_args, **_kwargs):
        raise RuntimeError("smtp-password")

    with caplog.at_level(logging.ERROR):
        sent = EmailService(
            settings=smtp_settings(),
            smtp_factory=fail_connection,
        ).send_quote_request_notification(quote_request())

    assert sent is False
    assert "Failed to send quote request notification" in caplog.text
    assert "smtp-password" not in caplog.text
