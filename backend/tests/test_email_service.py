import logging
from datetime import datetime
from types import SimpleNamespace

from pydantic import SecretStr

from app.models.message import QuoteRequest
from app.services.email_service import EmailService


def smtp_settings(**overrides):
    values = {
        "environment": "development",
        "smtp_enabled": True,
        "smtp_host": "smtp.example.com",
        "smtp_port": 587,
        "smtp_username": "smtp-user",
        "smtp_password": SecretStr("smtp-password"),
        "smtp_from_email": "website@example.com",
        "smtp_from_name": "T.A.S",
        "quote_notification_email": "quotes@example.com",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def quote_request(**overrides) -> QuoteRequest:
    values = dict(
        id=42,
        name="Customer Name",
        phone="+972500000000",
        email="customer@example.com",
        service_type="Curtain wall",
        message="Please prepare an estimate.",
        status="NEW",
        created_at=datetime(2026, 6, 23, 12, 30),
    )
    values.update(overrides)
    return QuoteRequest(**values)


class FakeSMTP:
    """Records one connection/login/send cycle into the shared `calls` dict."""

    calls: dict = {}

    def __init__(self, host, port, timeout):
        type(self).calls["connection"] = (host, port, timeout)

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return None

    def starttls(self, context):
        type(self).calls["starttls"] = context

    def login(self, username, password):
        type(self).calls["login"] = (username, password)

    def send_message(self, message):
        type(self).calls.setdefault("messages", []).append(message)


def fresh_fake_smtp():
    return type("FreshFakeSMTP", (FakeSMTP,), {"calls": {}})


def must_not_connect(*_args, **_kwargs):
    raise AssertionError("must not connect")


def test_email_service_sends_starttls_quote_notification() -> None:
    fake = fresh_fake_smtp()

    sent = EmailService(
        settings=smtp_settings(), smtp_factory=fake
    ).send_quote_request_notification(quote_request())

    assert sent is True
    assert fake.calls["connection"] == ("smtp.example.com", 587, 10)
    assert fake.calls["login"] == ("smtp-user", "smtp-password")
    assert fake.calls["starttls"] is not None
    (message,) = fake.calls["messages"]
    assert message["To"] == "quotes@example.com"
    assert message["Subject"] == "New Quote Request Received"
    body = message.get_content()
    assert "Request ID: 42" in body
    assert "Customer Name" in body
    assert "+972500000000" in body
    assert "customer@example.com" in body
    assert "Curtain wall" in body
    assert "Please prepare an estimate." in body
    assert "2026-06-23 12:30:00" in body


def test_email_service_sends_customer_confirmation() -> None:
    fake = fresh_fake_smtp()

    sent = EmailService(
        settings=smtp_settings(), smtp_factory=fake
    ).send_quote_confirmation(quote_request())

    assert sent is True
    assert fake.calls["connection"] == ("smtp.example.com", 587, 10)
    assert fake.calls["login"] == ("smtp-user", "smtp-password")
    (message,) = fake.calls["messages"]
    assert message["To"] == "customer@example.com"
    assert message["Subject"] == "Your quote request has been received"
    body = message.get_content()
    assert "Customer Name" in body
    assert "TECHNO ALUM SYSTEM" in body
    assert "received successfully" in body
    assert "contact you soon" in body


def test_email_service_skips_confirmation_without_customer_email(caplog) -> None:
    with caplog.at_level(logging.INFO):
        sent = EmailService(
            settings=smtp_settings(),
            smtp_factory=must_not_connect,
        ).send_quote_confirmation(quote_request(email=None))

    assert sent is False
    assert "no customer email" in caplog.text


def test_email_service_skips_both_emails_when_smtp_disabled(caplog) -> None:
    service = EmailService(
        settings=smtp_settings(smtp_enabled=False),
        smtp_factory=must_not_connect,
    )

    with caplog.at_level(logging.INFO):
        assert service.send_quote_request_notification(quote_request()) is False
        assert service.send_quote_confirmation(quote_request()) is False

    assert "SMTP is disabled" in caplog.text


def test_email_service_skips_missing_development_configuration(caplog) -> None:
    with caplog.at_level(logging.WARNING):
        sent = EmailService(
            settings=smtp_settings(smtp_host=None),
            smtp_factory=must_not_connect,
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


def test_email_service_confirmation_failure_is_safe(caplog) -> None:
    def fail_connection(*_args, **_kwargs):
        raise RuntimeError("smtp-password")

    with caplog.at_level(logging.ERROR):
        sent = EmailService(
            settings=smtp_settings(),
            smtp_factory=fail_connection,
        ).send_quote_confirmation(quote_request())

    assert sent is False
    assert "Failed to send quote confirmation email" in caplog.text
    assert "smtp-password" not in caplog.text
