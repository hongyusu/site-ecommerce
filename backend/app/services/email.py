"""Email service using Resend."""

import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send_email(to: str, subject: str, html: str) -> bool:
    """Send an email via Resend, or log to console if no API key."""
    if not settings.RESEND_API_KEY:
        logger.info(f"[EMAIL] To: {to} | Subject: {subject}")
        logger.info(f"[EMAIL] Body:\n{html}\n")
        print(f"\n📧 EMAIL (console mode - no RESEND_API_KEY set)")
        print(f"   To: {to}")
        print(f"   Subject: {subject}")
        print(f"   Body: {html[:200]}...\n")
        return True

    if not settings.EMAIL_ENABLED:
        logger.info(f"Email disabled, skipping: {to}")
        return True

    try:
        import resend

        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": f"Mall & More <{settings.EMAIL_FROM}>",
            "to": [to],
            "subject": subject,
            "html": html,
        })
        logger.info(f"Email sent to {to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


def send_verification_email(to: str, name: str, token: str) -> bool:
    """Send email verification link."""
    url = f"{settings.FRONTEND_URL}/en/verify-email?token={token}"
    html = f"""
    <h2>Verify your email</h2>
    <p>Hi {name},</p>
    <p>Thanks for signing up at Mall & More! Please verify your email by clicking the link below:</p>
    <p><a href="{url}" style="display:inline-block;padding:12px 24px;background:#232f3e;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a></p>
    <p>Or copy this link: {url}</p>
    <p>This link expires in 24 hours.</p>
    <p>— Mall & More</p>
    """
    return _send_email(to, "Verify your email - Mall & More", html)


def send_password_reset_email(to: str, name: str, token: str) -> bool:
    """Send password reset link."""
    url = f"{settings.FRONTEND_URL}/en/reset-password?token={token}"
    html = f"""
    <h2>Reset your password</h2>
    <p>Hi {name},</p>
    <p>We received a request to reset your password. Click the link below:</p>
    <p><a href="{url}" style="display:inline-block;padding:12px 24px;background:#232f3e;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
    <p>Or copy this link: {url}</p>
    <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    <p>— Mall & More</p>
    """
    return _send_email(to, "Reset your password - Mall & More", html)


def send_order_confirmation_email(
    to: str, name: str, order_number: str, total: str
) -> bool:
    """Send order confirmation email."""
    html = f"""
    <h2>Order Confirmed!</h2>
    <p>Hi {name},</p>
    <p>Your order <strong>#{order_number}</strong> has been confirmed.</p>
    <p>Total: <strong>€{total}</strong></p>
    <p>You can view your order details in your account.</p>
    <p>Thank you for shopping at Mall & More!</p>
    <p>— Mall & More</p>
    """
    return _send_email(to, f"Order Confirmed - #{order_number}", html)
