from app.models.messaging import Invoice, FeePlan
from app.models.base import Child, ParentChild
from app.core.websocket_manager import manager
import asyncio
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from decimal import Decimal
from uuid import UUID


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
    def create_invoice(db: Session, child_id: int, fee_plan_id: int, due_date: datetime) -> Invoice:
        inv = Invoice(
            child_id=child_id,
            fee_plan_id=fee_plan_id,
            due_date=due_date
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)
        # Broadcast invoice issued to parents and center admins
        try:
            child = db.query(Child).filter_by(id=child_id).first()
            center_id = None
            if child and child.room:
                center_id = str(child.room.center_id)

            parent_links = db.query(ParentChild).filter_by(
                child_id=child_id).all()
            parent_ids = [str(p.user_id) for p in parent_links]
            if center_id:
                asyncio.create_task(manager.broadcast_to_parents_of_child(center_id, str(child_id), parent_ids, "invoice:issued", {
                    "id": inv.id,
                    "invoice_number": inv.invoice_number,
                    "child_id": inv.child_id,
                    "due_date": inv.due_date.isoformat()
                }))
                asyncio.create_task(manager.broadcast_to_roles(center_id, ["ADMIN", "STAFF"], "invoice:issued", {
                    "id": inv.id,
                    "invoice_number": inv.invoice_number,
                    "child_id": inv.child_id,
                    "due_date": inv.due_date.isoformat()
                }))
        except Exception:
            pass

        return inv
