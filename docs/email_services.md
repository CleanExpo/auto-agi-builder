# Email Service Integration Guide

This document provides information on how to set up and use email services with the Auto AGI Builder platform.

## SendGrid Integration

Auto AGI Builder uses SendGrid for reliable email delivery. This integration enables your application to send transactional emails, notifications, and other important communications.

### Prerequisites

- SendGrid account (https://sendgrid.com)
- SendGrid API Key with appropriate permissions
- Verified sender email address in SendGrid

### Environment Setup

1. Add the following variables to your `.env` file:

```
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email@example.com
SENDGRID_FROM_NAME=Auto AGI Builder
```

2. Make sure the `sendgrid` package is installed:

```bash
pip install sendgrid==6.10.0
```

This package is included in the project's `requirements.txt` file.

### Using the SendGrid Service

The SendGrid service is implemented in `app/services/email/sendgrid_service.py` and provides two main methods for sending emails:

#### 1. Simple Email

Use the `send_email` method for basic email sending:

```python
from app.services.email import SendGridEmailService

email_service = SendGridEmailService()
result = email_service.send_email(
    to_email="recipient@example.com",  # Can also be a list of emails
    subject="Your Subject Line",
    html_content="<p>This is the <strong>HTML content</strong> of your email.</p>",
    plain_text_content="This is the plain text version of your email.",  # Optional
    attachments=None,  # Optional
    cc=None,  # Optional list of CC recipients
    bcc=None,  # Optional list of BCC recipients
    reply_to=None  # Optional reply-to email
)

if result['success']:
    print("Email sent successfully!")
else:
    print(f"Failed to send email: {result['error']}")
```

#### 2. Template Email

Use the `send_template_email` method to send emails using SendGrid's dynamic templates:

```python
from app.services.email import SendGridEmailService

email_service = SendGridEmailService()
result = email_service.send_template_email(
    to_email="recipient@example.com",
    template_id="d-xxxxxxxxxxxxxxxxxxxxxxxxxx",  # SendGrid template ID
    dynamic_data={
        "first_name": "John",
        "confirmation_link": "https://example.com/confirm/user123",
        "company_name": "Auto AGI Builder"
    },
    subject=None,  # Optional - will use template subject if not provided
    cc=None,  # Optional
    bcc=None,  # Optional
    reply_to=None  # Optional
)
```

### Best Practices

1. **Environment Variables**:
   - Never hardcode API keys in your application
   - Use environment variables for all sensitive credentials
   - Include SendGrid configuration in your `.env.example` file without real values

2. **Error Handling**:
   - Always check the success status in the returned result
   - Log email sending failures for troubleshooting
   - Consider implementing a retry mechanism for important emails

3. **Email Templates**:
   - Create reusable email templates in SendGrid
   - Test all templates across multiple email clients
   - Include both HTML and plain-text versions

4. **Email Delivery**:
   - Monitor your SendGrid dashboard for delivery issues
   - Implement email validation before sending
   - Set up SendGrid webhooks for tracking email events (opens, clicks, etc.)

5. **Security**:
   - Regularly rotate your SendGrid API keys
   - Limit API key permissions to only what's needed
   - Be careful with attachment handling to prevent security issues

### Common Use Cases

- User registration confirmation
- Password reset emails
- Notification emails
- Promotional communications
- System alerts and reports

### Troubleshooting

If emails are not being sent correctly:

1. Verify your SendGrid API key is correct and has the necessary permissions
2. Check that your sender email is verified in SendGrid
3. Look for error messages in your application logs
4. Verify your SendGrid account is in good standing
5. Check the SendGrid Activity Feed for potential delivery issues

## Additional Email Providers

The Auto AGI Builder platform is designed to support multiple email providers. To implement an alternative provider:

1. Create a new service class in `app/services/email/`
2. Implement the same interface as `SendGridEmailService`
3. Update your environment configuration accordingly
