"""
Legal Documents Generator for Auto AGI Builder
---------------------------------------------
Automated template-based generator for all required legal documents

This script provides:
1. Terms of Service agreement generation
2. Privacy Policy document creation
3. Service Level Agreement (SLA) configuration
4. Data Processing agreements
5. Custom clauses based on business requirements
"""

import os
import sys
import json
import yaml
import argparse
import logging
import datetime
import jinja2
from pathlib import Path
from typing import Dict, List, Any, Optional, Union

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("legal_documents.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("legal_documents")


class LegalConfig:
    """Core configuration for legal document generation"""
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize legal document configuration
        
        Args:
            config_path: Path to legal configuration file
        """
        # Default paths
        self.base_path = Path("legal")
        self.templates_path = self.base_path / "templates"
        self.output_path = self.base_path / "generated"
        
        # Load default configuration
        self.config = {
            "company_name": "Auto AGI Builder, Inc.",
            "company_address": "123 Innovation Way, San Francisco, CA 94107",
            "company_email": "legal@autoagibuilder.com",
            "company_website": "https://www.autoagibuilder.com",
            "effective_date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "data_storage_locations": ["United States", "European Union"],
            "subscription_tiers": [
                {
                    "name": "Free",
                    "features": [
                        "Basic prototype generation",
                        "Limited to 5 projects",
                        "Community support"
                    ],
                    "limitations": [
                        "No API access",
                        "No custom branding",
                        "Single user access"
                    ]
                },
                {
                    "name": "Professional",
                    "features": [
                        "Unlimited prototype generation",
                        "Unlimited projects",
                        "API access",
                        "Priority support",
                        "Custom branding",
                        "Team collaboration (up to 10 users)"
                    ],
                    "limitations": [
                        "Standard SLA only",
                        "Limited export formats"
                    ]
                },
                {
                    "name": "Enterprise",
                    "features": [
                        "All Professional features",
                        "Premium SLA",
                        "Dedicated customer success manager",
                        "Custom integrations",
                        "On-premises deployment option",
                        "SOC2 compliance",
                        "Unlimited team members"
                    ],
                    "limitations": [
                        "Annual contract required"
                    ]
                }
            ],
            "sla_tiers": [
                {
                    "name": "Standard",
                    "uptime_guarantee": 99.9,
                    "support_response_time": "24 hours",
                    "maintenance_window": "Sundays, 2:00 AM - 4:00 AM PST",
                    "compensation": "Service credits equal to 10% of monthly fee for each 0.1% below uptime guarantee"
                },
                {
                    "name": "Premium",
                    "uptime_guarantee": 99.99,
                    "support_response_time": "4 hours",
                    "maintenance_window": "Sundays, 2:00 AM - 3:00 AM PST",
                    "compensation": "Service credits equal to 20% of monthly fee for each 0.1% below uptime guarantee"
                }
            ],
            "data_retention": {
                "account_data": "7 years after account closure",
                "system_logs": "1 year",
                "user_content": "As long as the account is active, plus 30 days"
            },
            "cookie_categories": [
                {
                    "name": "Essential",
                    "required": True,
                    "description": "These cookies are necessary for the website to function and cannot be switched off."
                },
                {
                    "name": "Analytics",
                    "required": False,
                    "description": "These cookies allow us to measure and improve the performance of our site."
                },
                {
                    "name": "Functional",
                    "required": False,
                    "description": "These cookies enable the website to provide enhanced functionality and personalization."
                },
                {
                    "name": "Targeting",
                    "required": False,
                    "description": "These cookies may be set through our site by our advertising partners."
                }
            ],
            "third_party_services": [
                {
                    "name": "Google Analytics",
                    "purpose": "Analytics",
                    "data_processed": ["Usage Data", "IP Address", "Browser Information"],
                    "privacy_policy": "https://policies.google.com/privacy"
                },
                {
                    "name": "Stripe",
                    "purpose": "Payment Processing",
                    "data_processed": ["Payment Information", "Billing Address"],
                    "privacy_policy": "https://stripe.com/privacy"
                },
                {
                    "name": "SendGrid",
                    "purpose": "Email Communication",
                    "data_processed": ["Email Address", "Name"],
                    "privacy_policy": "https://www.twilio.com/legal/privacy"
                },
                {
                    "name": "Intercom",
                    "purpose": "Customer Support",
                    "data_processed": ["Name", "Email Address", "Support Queries"],
                    "privacy_policy": "https://www.intercom.com/legal/privacy"
                }
            ],
            "legal_jurisdiction": "California, USA",
            "governing_law": "Laws of the State of California, USA"
        }
        
        # Load configuration from file if provided
        if config_path:
            self._load_config(config_path)
    
    def _load_config(self, config_path: str):
        """
        Load configuration from file
        
        Args:
            config_path: Path to configuration file
        """
        try:
            with open(config_path, "r") as f:
                # Determine file type from extension
                if config_path.endswith(".json"):
                    loaded_config = json.load(f)
                elif config_path.endswith((".yaml", ".yml")):
                    loaded_config = yaml.safe_load(f)
                else:
                    logger.error(f"Unsupported configuration file format: {config_path}")
                    return
                
                # Update default config with loaded values
                self.config.update(loaded_config)
                logger.info(f"Loaded configuration from {config_path}")
        
        except Exception as e:
            logger.error(f"Failed to load configuration from {config_path}: {e}")
    
    def setup_directory_structure(self):
        """Create directory structure for legal document generation"""
        logger.info("Creating directory structure for legal document generation")
        
        # Create base directories
        self.base_path.mkdir(exist_ok=True)
        self.templates_path.mkdir(exist_ok=True)
        self.output_path.mkdir(exist_ok=True)
        
        logger.info("Directory structure created")
        
        # Create template directories
        (self.templates_path / "terms").mkdir(exist_ok=True)
        (self.templates_path / "privacy").mkdir(exist_ok=True)
        (self.templates_path / "sla").mkdir(exist_ok=True)
        (self.templates_path / "dpa").mkdir(exist_ok=True)
        
        logger.info("Template directories created")
        
        return True


class TemplateManager:
    """Manages legal document templates and rendering"""
    
    def __init__(self, config: LegalConfig):
        """
        Initialize template manager
        
        Args:
            config: Legal document configuration
        """
        self.config = config
        
        # Set up Jinja2 environment
        self.jinja_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(str(config.templates_path)),
            autoescape=jinja2.select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True
        )
    
    def create_default_templates(self):
        """Create default templates for legal documents"""
        logger.info("Creating default legal document templates")
        
        # Create Terms of Service template
        self._create_terms_of_service_template()
        
        # Create Privacy Policy template
        self._create_privacy_policy_template()
        
        # Create Service Level Agreement template
        self._create_sla_template()
        
        # Create Data Processing Agreement template
        self._create_dpa_template()
        
        logger.info("Default legal document templates created")
        
        return True
    
    def _create_terms_of_service_template(self):
        """Create Terms of Service template"""
        logger.info("Creating Terms of Service template")
        
        template_content = """# Terms of Service

Last Updated: {{ effective_date }}

## 1. Introduction

Welcome to {{ company_name }}. These Terms of Service ("Terms") govern your use of our website, products, and services (collectively, the "Services").

By using the Services, you agree to these Terms. If you don't agree with these Terms, you may not use the Services.

## 2. Definitions

- "**We**", "**our**", or "**us**" refers to {{ company_name }}, located at {{ company_address }}.
- "**You**" or "**your**" refers to any individual or entity using our Services.
- "**Account**" means your registered account with us.
- "**User Content**" means any content you upload or create using our Services.

## 3. Account Registration

To use most features of the Services, you need to register for an account. You agree to provide accurate information and to keep it updated.

You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

## 4. Subscription Tiers

We offer the following subscription options:

{% for tier in subscription_tiers %}
### {{ tier.name }} Tier

Features include:
{% for feature in tier.features %}
- {{ feature }}
{% endfor %}

Limitations:
{% for limitation in tier.limitations %}
- {{ limitation }}
{% endfor %}

{% endfor %}

## 5. Payment Terms

If you choose a paid subscription, you agree to pay all fees according to the applicable subscription plan. All payments are non-refundable except as required by law or as explicitly stated in these Terms.

## 6. Acceptable Use

You agree not to use the Services to:
- Violate any laws or regulations
- Infringe on intellectual property rights
- Distribute malware or harmful code
- Conduct unauthorized data collection
- Engage in abusive behavior
- Send unsolicited communications
- Attempt to gain unauthorized access

## 7. User Content

You retain ownership of your User Content, but you grant us a license to use, store, and display it for the purpose of providing the Services.

You are solely responsible for your User Content and you represent that it does not infringe on any third-party rights.

## 8. Intellectual Property

All intellectual property in the Services, excluding User Content, belongs to us or our licensors.

## 9. Termination

We reserve the right to terminate or suspend your account for violations of these Terms or for any other reason at our discretion.

You may terminate your account at any time by following the instructions on our website.

## 10. Disclaimers

THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.

## 11. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL {{ company_name.upper() }} BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

## 12. Changes to Terms

We may modify these Terms at any time. If we make material changes, we will notify you before the changes take effect.

## 13. Governing Law

These Terms are governed by the laws of {{ governing_law }}, without regard to its conflict of law principles.

## 14. Dispute Resolution

Any disputes arising from these Terms will be resolved through binding arbitration in {{ legal_jurisdiction }}.

## 15. Contact Information

If you have any questions about these Terms, please contact us at {{ company_email }}.

{{ company_name }}
{{ company_address }}
{{ company_email }}
{{ company_website }}"""
        
        # Write template to file
        template_file = self.config.templates_path / "terms" / "terms_of_service.md.j2"
        with open(template_file, "w") as f:
            f.write(template_content)
        
        logger.info(f"Terms of Service template created: {template_file}")
    
    def _create_privacy_policy_template(self):
        """Create Privacy Policy template"""
        logger.info("Creating Privacy Policy template")
        
        template_content = """# Privacy Policy

Last Updated: {{ effective_date }}

## 1. Introduction

{{ company_name }} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, products, and services (collectively, the "Services").

## 2. Information We Collect

### Personal Information

We may collect personal information that you voluntarily provide when using our Services, including:
- Name and contact information (email address, phone number, etc.)
- Account credentials
- Billing and payment information
- Profile information
- Communication records with us

### Usage Information

We automatically collect certain information when you use our Services, including:
- IP address
- Browser type
- Device information
- Log data
- Usage patterns and preferences
- Cookies and similar technologies

### Cookies

We use cookies and similar tracking technologies to enhance your experience with our Services.

We use the following categories of cookies:

{% for category in cookie_categories %}
- **{{ category.name }} Cookies**: {{ category.description }} {% if category.required %}(Required){% else %}(Optional){% endif %}
{% endfor %}

## 3. How We Use Your Information

We may use your information for the following purposes:
- To provide and maintain our Services
- To process payments and manage your account
- To improve our Services
- To communicate with you
- To ensure security and prevent fraud
- To comply with legal obligations

## 4. Third-Party Service Providers

We may share your information with third-party service providers to help us provide and improve our Services, including:

{% for service in third_party_services %}
- **{{ service.name }}** - Purpose: {{ service.purpose }}
  - Data processed: {{ service.data_processed|join(", ") }}
  - Privacy policy: [{{ service.privacy_policy }}]({{ service.privacy_policy }})
{% endfor %}

## 5. Data Storage and Security

Your information may be stored and processed in the following locations: {{ data_storage_locations|join(", ") }}.

We implement appropriate technical and organizational measures to protect your information against unauthorized access or disclosure.

## 6. Data Retention

We retain your information for as long as necessary to provide our Services and for legitimate business purposes:

{% for key, value in data_retention.items() %}
- {{ key|replace("_", " ")|title }}: {{ value }}
{% endfor %}

## 7. Your Rights

Depending on your location, you may have certain rights regarding your personal information, including:
- Right to access
- Right to rectification
- Right to erasure
- Right to restrict processing
- Right to data portability
- Right to object

To exercise these rights, please contact us at {{ company_email }}.

## 8. Children's Privacy

Our Services are not intended for children under 13 years of age, and we do not knowingly collect personal information from children under 13.

## 9. International Data Transfers

We may transfer your information to countries other than your country of residence. When we do so, we implement appropriate safeguards to protect your information.

## 10. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. If we make material changes, we will notify you before the changes take effect.

## 11. Contact Information

If you have any questions about this Privacy Policy, please contact us at:

{{ company_name }}
{{ company_address }}
{{ company_email }}
{{ company_website }}"""
        
        # Write template to file
        template_file = self.config.templates_path / "privacy" / "privacy_policy.md.j2"
        with open(template_file, "w") as f:
            f.write(template_content)
        
        logger.info(f"Privacy Policy template created: {template_file}")
    
    def _create_sla_template(self):
        """Create Service Level Agreement template"""
        logger.info("Creating Service Level Agreement template")
        
        template_content = """# Service Level Agreement (SLA)

Last Updated: {{ effective_date }}

## 1. Overview

This Service Level Agreement ("SLA") is an agreement between {{ company_name }} ("we," "our," or "us") and users of our Services ("you" or "your") that describes the service levels we provide and your rights to compensation if we fail to meet these levels.

## 2. Definitions

- "**Downtime**" means a period during which the Services are unavailable.
- "**Scheduled Maintenance**" means maintenance performed during the designated maintenance window.
- "**Emergency Maintenance**" means unscheduled maintenance necessary to prevent or address significant service issues.
- "**Monthly Uptime Percentage**" means the percentage of time the Services are available during a calendar month, excluding Scheduled Maintenance and Emergency Maintenance.

## 3. Service Level Tiers

We offer the following service level tiers:

{% for tier in sla_tiers %}
### {{ tier.name }} SLA

- **Uptime Guarantee**: {{ tier.uptime_guarantee }}%
- **Support Response Time**: {{ tier.support_response_time }}
- **Scheduled Maintenance Window**: {{ tier.maintenance_window }}
- **Compensation**: {{ tier.compensation }}

{% endfor %}

## 4. Service Commitments

### Uptime Commitment

We commit to providing the Services with the Monthly Uptime Percentage specified in your SLA tier during each calendar month.

### Support Response Time

We commit to responding to support requests within the timeframe specified in your SLA tier.

## 5. Exclusions

This SLA does not apply to any:
- Features or services designated as "beta," "preview," or "experimental"
- Downtime caused by factors outside our reasonable control
- Downtime caused by your actions or omissions
- Downtime caused by third-party services not controlled by us
- Scheduled Maintenance and Emergency Maintenance

## 6. Credit Request and Payment Procedures

To receive compensation for Downtime, you must submit a credit request within 30 days after the calendar month in which the Downtime occurred. The request must include:
- The dates and times of the Downtime
- Affected services or features
- Any relevant error messages or documentation

We will evaluate the request and provide compensation within 60 days if the request is approved.

## 7. Changes to this SLA

We may update this SLA from time to time. If we make material changes, we will notify you before the changes take effect.

## 8. Contact Information

If you have any questions about this SLA, please contact us at:

{{ company_name }}
{{ company_address }}
{{ company_email }}
{{ company_website }}"""
        
        # Write template to file
        template_file = self.config.templates_path / "sla" / "service_level_agreement.md.j2"
        with open(template_file, "w") as f:
            f.write(template_content)
        
        logger.info(f"Service Level Agreement template created: {template_file}")
    
    def _create_dpa_template(self):
        """Create Data Processing Agreement template"""
        logger.info("Creating Data Processing Agreement template")
        
        template_content = """# Data Processing Agreement

Last Updated: {{ effective_date }}

## 1. Introduction

This Data Processing Agreement ("DPA") forms part of the Terms of Service between {{ company_name }} ("Processor," "we," "our," or "us") and the entity using our Services ("Controller" or "you").

This DPA reflects the parties' agreement with respect to the processing of personal data by us on your behalf.

## 2. Definitions

- "**Personal Data**" means any information relating to an identified or identifiable natural person as defined under applicable Data Protection Laws.
- "**Data Protection Laws**" means all laws and regulations applicable to the processing of Personal Data under the Agreement, including but not limited to the EU General Data Protection Regulation ("GDPR") and the California Consumer Privacy Act ("CCPA").
- "**Processing**" means any operation or set of operations performed on Personal Data.
- "**Data Subject**" means the individual to whom Personal Data relates.
- "**Subprocessor**" means any processor engaged by us to process Personal Data on your behalf.

## 3. Roles and Responsibilities

You are the Controller of Personal Data, and we are the Processor. We will process Personal Data only on your documented instructions and in accordance with this DPA.

## 4. Details of Processing

### Categories of Data Subjects
- Your end users
- Your employees and contractors
- Other individuals whose Personal Data is processed through the Services

### Types of Personal Data
- Account information (names, email addresses, etc.)
- Content data provided by end users
- Usage and analytics data
- Other Personal Data provided by you or your end users

### Processing Operations
- Storage and hosting
- Backup and recovery
- Support and maintenance
- Analytics and improvements
- Security monitoring and enforcement

## 5. Processor Obligations

We will:
- Process Personal Data only on your documented instructions
- Ensure that persons authorized to process Personal Data have committed to confidentiality
- Implement appropriate technical and organizational measures to protect Personal Data
- Assist you in responding to requests from Data Subjects
- Assist you in ensuring compliance with your obligations under Data Protection Laws
- Delete or return all Personal Data to you after the end of the provision of Services
- Provide you with information necessary to demonstrate compliance with this DPA

## 6. Subprocessors

We may engage Subprocessors to process Personal Data on your behalf. We will maintain a list of Subprocessors and inform you of any intended changes.

You authorize us to engage the Subprocessors listed at the time you enter into this DPA.

## 7. International Transfers

We will ensure that any international transfer of Personal Data complies with applicable Data Protection Laws, including by implementing appropriate safeguards.

## 8. Data Breach Notification

We will notify you without undue delay after becoming aware of a personal data breach affecting your Personal Data, providing information to help you fulfill any obligations to report the breach to supervisory authorities and Data Subjects.

## 9. Audit Rights

You may audit our compliance with this DPA, provided that such audit is conducted during regular business hours, with reasonable advance notice, and subject to our confidentiality requirements.

## 10. Term and Termination

This DPA will remain in effect as long as we process Personal Data on your behalf under the Terms of Service.

## 11. Contact Information

If you have any questions about this DPA, please contact us at:

{{ company_name }}
{{ company_address }}
{{ company_email }}
{{ company_website }}"""
        
        # Write template to file
        template_file = self.config.templates_path / "dpa" / "data_processing_agreement.md.j2"
        with open(template_file, "w") as f:
            f.write(template_content)
        
        logger.info(f"Data Processing Agreement template created: {template_file}")
    
    def render_all_documents(self):
        """Render all legal documents"""
        logger.info("Rendering all legal documents")
        
        # Render Terms of Service
        self.render_document("terms/terms_of_service.md.j2", "terms_of_service.md")
        
        # Render Privacy Policy
        self.render_document("privacy/privacy_policy.md.j2", "privacy_policy.md")
        
        # Render Service Level Agreement
        self.render_document("sla/service_level_agreement.md.j2", "service_level_agreement.md")
        
        # Render Data Processing Agreement
        self.render_document("dpa/data_processing_agreement.md.j2", "data_processing_agreement.md")
        
        logger.info("All legal documents rendered successfully")
        
        return True
    
    def render_document(self, template_name: str, output_name: str):
        """
        Render a single document from template
        
        Args:
            template_name: Name of the template file
            output_name: Name of the output file
        """
        logger.info(f"Rendering document: {template_name} -> {output_name}")
        
        try:
            # Get template
            template = self.jinja_env.get_template(template_name)
            
            # Render template with config variables
            content = template.render(**self.config.config)
            
            # Write to output file
            output_file = self.config.output_path / output_name
            with open(output_file, "w") as f:
                f.write(content)
            
            logger.info(f"Document rendered successfully: {output_file}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to render document {template_name}: {e}")
            return False


# Main execution function
def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description="Auto AGI Builder Legal Documents Generator")
    parser.add_argument("--config", help="Path to configuration file")
    parser.add_argument("--output-dir", default="legal/generated", help="Output directory for generated documents")
    
    args = parser.parse_args()
    
    # Initialize configuration
    config = LegalConfig(args.config)
    
    # Create directory structure
    if not config.setup_directory_structure():
        logger.error("Failed to create directory structure")
        sys.exit(1)
    
    # Initialize template manager
    template_manager = TemplateManager(config)
    
    # Create default templates
    if not template_manager.create_default_templates():
        logger.error("Failed to create default templates")
        sys.exit(1)
    
    # Render all documents
    if not template_manager.render_all_documents():
        logger.error("Failed to render all documents")
        sys.exit(1)
    
    logger.info("Legal documents generated successfully")
    logger.info(f"Documents located at: {config.output_path}")
    
    print(f"\nLegal documents generated successfully at {config.output_path}")
    print("\nGenerated documents:")
    print("1. Terms of Service")
    print("2. Privacy Policy")
    print("3. Service Level Agreement")
    print("4. Data Processing Agreement")
    print("\nNext steps:")
    print("1. Review the generated documents with your legal team")
    print("2. Customize as needed for your specific business requirements")
    print("3. Convert to HTML or other formats for your website")
    print("4. Keep documents up to date with legal requirements")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Document generation interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Document generation failed: {e}")
        sys.exit(1)
