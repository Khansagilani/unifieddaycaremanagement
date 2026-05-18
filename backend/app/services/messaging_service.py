from app.models.messaging import Conversation, ConversationMember, Message
from app.models.user import User
from app.core.websocket_manager import manager
import asyncio
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

class MessagingService:
    @staticmethod
    def create_conversation(db: Session, creator_id: int, member_ids: List[int], name: Optional[str] = None) -> Conversation:
        convo = Conversation(name=name)
        db.add(convo)
        db.flush()
        
        # add creator
        db.add(ConversationMember(conversation_id=convo.id, user_id=creator_id))
        for m in set(member_ids):
            db.add(ConversationMember(conversation_id=convo.id, user_id=m))
        
        db.commit()
        db.refresh(convo)
        return convo

    @staticmethod
    def send_message(db: Session, sender_id: int, conversation_id: int, content: str, attachments: Optional[List[str]] = None) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content,
            attachments=attachments or []
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        # Broadcast to conversation members (async)
        try:
            members = db.query(ConversationMember).filter_by(conversation_id=conversation_id).all()
            member_ids = [str(m.user_id) for m in members]
            # Try to infer center from sender
            sender = db.query(User).filter_by(id=sender_id).first()
            center_id = str(sender.center_id) if sender and sender.center_id else ""
            if center_id:
                asyncio.create_task(manager.broadcast_to_parents_of_child(center_id, "", member_ids, "message:new", {
                    "id": msg.id,
                    "conversation_id": msg.conversation_id,
                    "sender_id": msg.sender_id,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat()
                }))
        except Exception:
            pass

        return msg

    @staticmethod
    def get_conversation_messages(db: Session, conversation_id: int) -> List[Message]:
        return db.query(Message).filter_by(conversation_id=conversation_id).order_by(Message.created_at.asc()).all()
