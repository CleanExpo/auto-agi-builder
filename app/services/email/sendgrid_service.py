"""
SendGrid Email Service for Auto AGI Builder
Handles all email communication functionality using SendGrid API
"""

import os
from typing import List, Dict, Optional, Union
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment, FileContent, FileName, FileType, Disposition, ContentId
import base64
import logging

logger = logging.getLogger(__name__)

class SendGridEmailService:
    """Service class for sending emails using SendGrid"""
    
    def __init__(self):
        """Initialize the SendGrid email service"""
        self.api_key = os.environ.get('SENDGRID_API_KEY')
        self.from_email = os.environ.get('SENDGRID_FROM_EMAIL')
        self.from_name = os.environ.get('SENDGRID_FROM_NAME')
        
        if not self.api_key:
            logger.warning("SendGrid API key not found in environment variables")
        
        if not self.from_email:
            logger.warning("SendGrid from email not found in environment variables")
            
    def send_email(
        self, 
        to_email: Union[str, List[str]], 
        subject: str, 
        html_content: str,
        plain_text_content: Optional[str] = None,
        attachments: Optional[List[Dict]] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        reply_to: Optional[str] = None
    ) -> Dict:
        """
        Send an email using SendGrid
        
        Args:
            to_email: Recipient email or list of recipient emails
            subject: Email subject
            html_content: Email content in HTML format
            plain_text_content: Optional plain text version of the email
            attachments: Optional list of attachments, each being a dict with keys:
                         'content', 'filename', 'type', 'disposition'
            cc: Optional list of CC recipients
            bcc: Optional list of BCC recipients
            reply_to: Optional reply-to email address
            
        Returns:
            Dict containing 'success' status and additional info
        """
        if not self.api_key:
            return {
                'success': False,
                'error': 'SendGrid API key not configured'
            }
            
        try:
            # Create email message
            message = Mail(
                from_email=(self.from_email, self.from_name),
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )
            
            # Add plain text content if provided
            if plain_text_content:
                message.content = Content("text/plain", plain_text_content)
            
            # Add CC recipients if provided
            if cc:
                for cc_email in cc:
                    message.add_cc(cc_email)
                    
            # Add BCC recipients if provided
            if bcc:
                for bcc_email in bcc:
                    message.add_bcc(bcc_email)
            
            # Add reply-to if provided
            if reply_to:
                message.reply_to = Email(reply_to)
            
            # Add attachments if provided
            if attachments:
                for attachment in attachments:
                    message.add_attachment(
                        Attachment(
                            FileContent(attachment['content']),
                            FileName(attachment['filename']),
                            FileType(attachment.get('type', 'application/octet-stream')),
                            Disposition(attachment.get('disposition', 'attachment')),
                            ContentId(attachment.get('content_id', ''))
                        )
                    )
            
            # Send email
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            
            return {
                'success': True,
                'status_code': response.status_code,
                'body': response.body,
                'headers': response.headers
            }
            
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_template_email(
        self,
        to_email: Union[str, List[str]],
        template_id: str,
        dynamic_data: Dict,
        subject: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        reply_to: Optional[str] = None
    ) -> Dict:
        """
        Send an email using a SendGrid template
        
        Args:
            to_email: Recipient email or list of recipient emails
            template_id: SendGrid template ID
            dynamic_data: Dictionary of dynamic data to populate the template
            subject: Optional email subject (will override template subject)
            cc: Optional list of CC recipients
            bcc: Optional list of BCC recipients
            reply_to: Optional reply-to email address
            
        Returns:
            Dict containing 'success' status and additional info
        """
        if not self.api_key:
            return {
                'success': False,
                'error': 'SendGrid API key not configured'
            }
            
        try:
            # Create email message
            message = Mail(
                from_email=(self.from_email, self.from_name),
                to_emails=to_email
            )
            
            # Set subject if provided
            if subject:
                message.subject = subject
            
            # Add CC recipients if provided
            if cc:
                for cc_email in cc:
                    message.add_cc(cc_email)
                    
            # Add BCC recipients if provided
            if bcc:
                for bcc_email in bcc:
                    message.add_bcc(bcc_email)
            
            # Add reply-to if provided
            if reply_to:
                message.reply_to = Email(reply_to)
            
            # Set template and dynamic data
            message.template_id = template_id
            message.dynamic_template_data = dynamic_data
            
            # Send email
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            
            return {
                'success': True,
                'status_code': response.status_code,
                'body': response.body,
                'headers': response.headers
            }
            
        except Exception as e:
            logger.error(f"Error sending template email: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


# Example usage
if __name__ == "__main__":
    # This won't run in production, just for demonstration
    email_service = SendGridEmailService()
    result = email_service.send_email(
        to_email="recipient@example.com",
        subject="Test Email from Auto AGI Builder",
        html_content="<p>This is a test email from the <strong>Auto AGI Builder</strong> platform.</p>"
    )
    print(f"Email sent: {result}")
