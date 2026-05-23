from app.models.messaging import Invoice, FeePlan, InvoiceStatus, Payment, PaymentMethod, PaymentStatus
from app.models.base import Child, ParentChild
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, date, timezone
from decimal import Decimal
from uuid import UUID, uuid4
import calendar


MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]


class BillingService:
    @staticmethod
    def create_fee_plan(
        db: Session,
        center_id: UUID,
        name: str,
        monthly_amount: Decimal,
        billing_cycle: str,
        registration_fee: Optional[Decimal] = None,
        sibling_discount: bool = False,
        sibling_discount_pct: Optional[Decimal] = None
    ) -> FeePlan:
        fp = FeePlan(
            center_id=center_id,
            name=name,
            monthly_amount=monthly_amount,
            registration_fee=registration_fee,
            sibling_discount=sibling_discount,
            sibling_discount_pct=sibling_discount_pct,
            billing_cycle=billing_cycle,
        )
        db.add(fp)
        db.commit()
        db.refresh(fp)
        return fp

    @staticmethod
    def create_invoice(
        db: Session,
        child_id: UUID,
        fee_plan_id: UUID,
        due_date: datetime,
        center_id: Optional[UUID] = None,
        billing_month: Optional[str] = None,
        billing_year: Optional[int] = None,
        amount_due: Optional[Decimal] = None,
        notes: Optional[str] = None,
    ) -> Invoice:
        # Resolve center_id from child if not provided
        if center_id is None:
            child = db.query(Child).filter_by(id=child_id).first()
            center_id = child.center_id if child else None

        # Resolve amount_due from fee plan if not provided
        if amount_due is None and fee_plan_id:
            fp = db.query(FeePlan).filter_by(id=fee_plan_id).first()
            amount_due = fp.monthly_amount if fp else Decimal("0")

        # Generate unique invoice number
        now = datetime.now(timezone.utc)
        seq = db.query(Invoice).count() + 1
        invoice_number = f"INV-{now.year}{now.month:02d}-{seq:04d}"

        # Determine billing month/year from due_date if not provided
        if billing_month is None:
            billing_month = MONTH_NAMES[due_date.month - 1] if isinstance(due_date, (date, datetime)) else None
        if billing_year is None:
            billing_year = due_date.year if isinstance(due_date, (date, datetime)) else now.year

        inv = Invoice(
            id=uuid4(),
            child_id=child_id,
            center_id=center_id,
            fee_plan_id=fee_plan_id,
            invoice_number=invoice_number,
            billing_month=billing_month,
            billing_year=billing_year,
            amount_due=amount_due or Decimal("0"),
            amount_paid=Decimal("0"),
            due_date=due_date if isinstance(due_date, date) else due_date.date(),
            status=InvoiceStatus.DRAFT,
            notes=notes,
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)
        return inv

    @staticmethod
    def generate_monthly_invoices(
        db: Session,
        center_id: UUID,
        year: int,
        month: int,
        fee_plan_id: Optional[UUID] = None,
    ) -> list:
        """
        Create DRAFT invoices for every active child in the center.
        Due date = 6th of the given month.
        Skips children that already have an invoice for that billing_month+year.
        Uses the specified fee plan, or falls back to the center's first fee plan.
        """
        due_date = date(year, month, 6)
        billing_month_name = MONTH_NAMES[month - 1]

        # Resolve fee plan
        if fee_plan_id:
            fp = db.query(FeePlan).filter_by(id=fee_plan_id, center_id=center_id).first()
        else:
            fp = db.query(FeePlan).filter_by(center_id=center_id).first()
        if not fp:
            return []

        children = db.query(Child).filter(
            Child.center_id == center_id,
            Child.status == "ACTIVE"
        ).all()

        created = []
        for child in children:
            # Skip if already has an invoice for this month/year
            existing = db.query(Invoice).filter_by(
                child_id=child.id,
                billing_month=billing_month_name,
                billing_year=year,
            ).first()
            if existing:
                continue

            seq = db.query(Invoice).count() + len(created) + 1
            invoice_number = f"INV-{year}{month:02d}-{seq:04d}"

            inv = Invoice(
                id=uuid4(),
                child_id=child.id,
                center_id=center_id,
                fee_plan_id=fp.id,
                invoice_number=invoice_number,
                billing_month=billing_month_name,
                billing_year=year,
                amount_due=fp.monthly_amount,
                amount_paid=Decimal("0"),
                due_date=due_date,
                status=InvoiceStatus.DRAFT,
            )
            db.add(inv)
            created.append(inv)

        db.commit()
        for inv in created:
            db.refresh(inv)
        return created

    @staticmethod
    def send_invoice(db: Session, invoice_id: UUID) -> Invoice:
        """Admin approves and sends a DRAFT invoice to parent (status → SENT)."""
        inv = db.query(Invoice).filter_by(id=invoice_id).first()
        if not inv:
            return None
        if inv.status != InvoiceStatus.DRAFT:
            return inv
        inv.status = InvoiceStatus.SENT
        db.commit()
        db.refresh(inv)
        return inv

    @staticmethod
    def mark_overdue(db: Session, center_id: UUID) -> int:
        """Mark all SENT invoices past due_date as OVERDUE."""
        today = date.today()
        result = db.query(Invoice).filter(
            Invoice.center_id == center_id,
            Invoice.status == InvoiceStatus.SENT,
            Invoice.due_date < today,
        ).all()
        count = 0
        for inv in result:
            inv.status = InvoiceStatus.OVERDUE
            count += 1
        db.commit()
        return count
