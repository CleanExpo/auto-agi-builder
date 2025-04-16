"""
External Data Synchronization Service

This module provides functionality to synchronize data from external
CRM and accounting systems like Xero, QuickBooks, MYOB, and HubSpot.
"""
import logging
from typing import Dict, List, Optional, Union, Any
from abc import ABC, abstractmethod
from datetime import datetime

from app import db
from app.models.client import Client
from app.models.invoice import Invoice, InvoiceItem, Payment

logger = logging.getLogger(__name__)


class DataSyncError(Exception):
    """Exception raised for errors during data synchronization."""
    pass


class DataSyncResult:
    """Result of a data synchronization operation."""
    
    def __init__(self):
        self.success = True
        self.error = None
        self.created = 0
        self.updated = 0
        self.failed = 0
        self.details = []
        self.start_time = datetime.utcnow()
        self.end_time = None
    
    def finish(self):
        """Mark the sync operation as complete and record the end time."""
        self.end_time = datetime.utcnow()
        
    def add_success(self, entity_type: str, entity_id: str, action: str):
        """Add a successful operation to the results."""
        self.details.append({
            'status': 'success',
            'entity_type': entity_type,
            'entity_id': entity_id,
            'action': action,
            'timestamp': datetime.utcnow()
        })
        if action == 'created':
            self.created += 1
        elif action == 'updated':
            self.updated += 1
    
    def add_failure(self, entity_type: str, entity_id: str, reason: str):
        """Add a failed operation to the results."""
        self.details.append({
            'status': 'failure',
            'entity_type': entity_type,
            'entity_id': entity_id,
            'reason': reason,
            'timestamp': datetime.utcnow()
        })
        self.failed += 1
        self.success = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the result to a dictionary for API responses."""
        duration = (self.end_time - self.start_time).total_seconds() if self.end_time else None
        return {
            'success': self.success,
            'error': str(self.error) if self.error else None,
            'created': self.created,
            'updated': self.updated,
            'failed': self.failed,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_seconds': duration,
            'details': self.details
        }


class BaseIntegrationAdapter(ABC):
    """Base class for integration adapters."""
    
    @abstractmethod
    def authenticate(self) -> bool:
        """Authenticate with the external service."""
        pass
    
    @abstractmethod
    def fetch_clients(self) -> List[Dict[str, Any]]:
        """Fetch client data from the external service."""
        pass
    
    @abstractmethod
    def fetch_invoices(self, client_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch invoice data from the external service."""
        pass
    
    @abstractmethod
    def fetch_payments(self, invoice_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Fetch payment data from the external service."""
        pass


class ExternalDataSyncService:
    """Service for syncing data from external systems."""
    
    def __init__(self, adapter: BaseIntegrationAdapter):
        """Initialize with the appropriate integration adapter."""
        self.adapter = adapter
    
    def sync_all(self, business_id: str) -> DataSyncResult:
        """
        Synchronize all data (clients, invoices, payments) for a business.
        
        Args:
            business_id: The ID of the business to sync data for
            
        Returns:
            DataSyncResult: The result of the sync operation
        """
        result = DataSyncResult()
        try:
            # Authenticate with the external service
            if not self.adapter.authenticate():
                result.success = False
                result.error = "Authentication failed"
                return result
            
            # Sync clients
            self._sync_clients(business_id, result)
            
            # Sync invoices and their line items
            self._sync_invoices(business_id, result)
            
            # Sync payments
            self._sync_payments(business_id, result)
            
        except Exception as e:
            logger.exception(f"Error during data sync: {str(e)}")
            result.success = False
            result.error = str(e)
        
        result.finish()
        return result
    
    def _sync_clients(self, business_id: str, result: DataSyncResult) -> None:
        """
        Synchronize client data from the external service.
        
        Args:
            business_id: The ID of the business to sync clients for
            result: The DataSyncResult to update with progress
        """
        try:
            external_clients = self.adapter.fetch_clients()
            for client_data in external_clients:
                try:
                    external_id = client_data.get('id')
                    if not external_id:
                        result.add_failure('client', 'unknown', 'Missing external ID')
                        continue
                    
                    # Check if client already exists
                    client = Client.query.filter_by(
                        business_id=business_id,
                        external_id=external_id,
                        source=self.adapter.__class__.__name__
                    ).first()
                    
                    if client:
                        # Update existing client
                        client.name = client_data.get('name', client.name)
                        client.email = client_data.get('email', client.email)
                        client.phone = client_data.get('phone', client.phone)
                        client.address = client_data.get('address', client.address)
                        client.updated_at = datetime.utcnow()
                        
                        result.add_success('client', external_id, 'updated')
                    else:
                        # Create new client
                        client = Client(
                            business_id=business_id,
                            external_id=external_id,
                            source=self.adapter.__class__.__name__,
                            name=client_data.get('name', ''),
                            email=client_data.get('email'),
                            phone=client_data.get('phone'),
                            address=client_data.get('address'),
                            created_at=datetime.utcnow(),
                            updated_at=datetime.utcnow()
                        )
                        db.session.add(client)
                        
                        result.add_success('client', external_id, 'created')
                    
                    db.session.commit()
                    
                except Exception as e:
                    db.session.rollback()
                    logger.exception(f"Error syncing client {client_data.get('id')}: {str(e)}")
                    result.add_failure('client', client_data.get('id', 'unknown'), str(e))
        
        except Exception as e:
            logger.exception(f"Error fetching clients: {str(e)}")
            result.add_failure('client', 'batch', f"Failed to fetch clients: {str(e)}")
    
    def _sync_invoices(self, business_id: str, result: DataSyncResult) -> None:
        """
        Synchronize invoice data from the external service.
        
        Args:
            business_id: The ID of the business to sync invoices for
            result: The DataSyncResult to update with progress
        """
        try:
            external_invoices = self.adapter.fetch_invoices()
            for invoice_data in external_invoices:
                try:
                    external_id = invoice_data.get('id')
                    if not external_id:
                        result.add_failure('invoice', 'unknown', 'Missing external ID')
                        continue
                    
                    # Get client by external ID
                    client_external_id = invoice_data.get('client_id')
                    client = Client.query.filter_by(
                        business_id=business_id,
                        external_id=client_external_id,
                        source=self.adapter.__class__.__name__
                    ).first()
                    
                    if not client:
                        result.add_failure('invoice', external_id, f'Client not found: {client_external_id}')
                        continue
                    
                    # Check if invoice already exists
                    invoice = Invoice.query.filter_by(
                        business_id=business_id,
                        external_id=external_id,
                        source=self.adapter.__class__.__name__
                    ).first()
                    
                    if invoice:
                        # Update existing invoice
                        invoice.client_id = client.id
                        invoice.invoice_number = invoice_data.get('number', invoice.invoice_number)
                        invoice.amount = invoice_data.get('amount', invoice.amount)
                        invoice.date = invoice_data.get('date', invoice.date)
                        invoice.due_date = invoice_data.get('due_date', invoice.due_date)
                        invoice.status = invoice_data.get('status', invoice.status)
                        invoice.updated_at = datetime.utcnow()
                        
                        # Clear existing items and re-add them
                        InvoiceItem.query.filter_by(invoice_id=invoice.id).delete()
                        
                        result.add_success('invoice', external_id, 'updated')
                    else:
                        # Create new invoice
                        invoice = Invoice(
                            business_id=business_id,
                            client_id=client.id,
                            external_id=external_id,
                            source=self.adapter.__class__.__name__,
                            invoice_number=invoice_data.get('number', ''),
                            amount=invoice_data.get('amount', 0.0),
                            date=invoice_data.get('date'),
                            due_date=invoice_data.get('due_date'),
                            status=invoice_data.get('status', 'draft'),
                            created_at=datetime.utcnow(),
                            updated_at=datetime.utcnow()
                        )
                        db.session.add(invoice)
                        db.session.flush()  # Get the invoice ID
                        
                        result.add_success('invoice', external_id, 'created')
                    
                    # Add invoice items
                    for item_data in invoice_data.get('items', []):
                        item = InvoiceItem(
                            invoice_id=invoice.id,
                            description=item_data.get('description', ''),
                            quantity=item_data.get('quantity', 1),
                            unit_price=item_data.get('unit_price', 0.0),
                            amount=item_data.get('amount', 0.0)
                        )
                        db.session.add(item)
                    
                    db.session.commit()
                    
                except Exception as e:
                    db.session.rollback()
                    logger.exception(f"Error syncing invoice {invoice_data.get('id')}: {str(e)}")
                    result.add_failure('invoice', invoice_data.get('id', 'unknown'), str(e))
        
        except Exception as e:
            logger.exception(f"Error fetching invoices: {str(e)}")
            result.add_failure('invoice', 'batch', f"Failed to fetch invoices: {str(e)}")
    
    def _sync_payments(self, business_id: str, result: DataSyncResult) -> None:
        """
        Synchronize payment data from the external service.
        
        Args:
            business_id: The ID of the business to sync payments for
            result: The DataSyncResult to update with progress
        """
        try:
            external_payments = self.adapter.fetch_payments()
            for payment_data in external_payments:
                try:
                    external_id = payment_data.get('id')
                    if not external_id:
                        result.add_failure('payment', 'unknown', 'Missing external ID')
                        continue
                    
                    # Get invoice by external ID
                    invoice_external_id = payment_data.get('invoice_id')
                    invoice = Invoice.query.filter_by(
                        business_id=business_id,
                        external_id=invoice_external_id,
                        source=self.adapter.__class__.__name__
                    ).first()
                    
                    if not invoice:
                        result.add_failure('payment', external_id, f'Invoice not found: {invoice_external_id}')
                        continue
                    
                    # Check if payment already exists
                    payment = Payment.query.filter_by(
                        business_id=business_id,
                        external_id=external_id,
                        source=self.adapter.__class__.__name__
                    ).first()
                    
                    if payment:
                        # Update existing payment
                        payment.invoice_id = invoice.id
                        payment.amount = payment_data.get('amount', payment.amount)
                        payment.date = payment_data.get('date', payment.date)
                        payment.method = payment_data.get('method', payment.method)
                        payment.reference = payment_data.get('reference', payment.reference)
                        payment.updated_at = datetime.utcnow()
                        
                        result.add_success('payment', external_id, 'updated')
                    else:
                        # Create new payment
                        payment = Payment(
                            business_id=business_id,
                            invoice_id=invoice.id,
                            external_id=external_id,
                            source=self.adapter.__class__.__name__,
                            amount=payment_data.get('amount', 0.0),
                            date=payment_data.get('date'),
                            method=payment_data.get('method', 'unknown'),
                            reference=payment_data.get('reference', ''),
                            created_at=datetime.utcnow(),
                            updated_at=datetime.utcnow()
                        )
                        db.session.add(payment)
                        
                        result.add_success('payment', external_id, 'created')
                    
                    db.session.commit()
                    
                except Exception as e:
                    db.session.rollback()
                    logger.exception(f"Error syncing payment {payment_data.get('id')}: {str(e)}")
                    result.add_failure('payment', payment_data.get('id', 'unknown'), str(e))
        
        except Exception as e:
            logger.exception(f"Error fetching payments: {str(e)}")
            result.add_failure('payment', 'batch', f"Failed to fetch payments: {str(e)}")
