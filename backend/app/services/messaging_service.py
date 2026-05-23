from app.models.messaging import Conversation, ConversationMember, Message
from app.models.user import User
from sqlalchemy.orm import Session
from typing import Optional, List


class MessagingService:
    @staticmethod
    def create_conversation(db: Session, creator_id, center_id, member_ids: List, name: Optional[str] = None) -> Conversation:
        convo = Conversation(
            title=name,
            type="DIRECT" if not name else "GROUP",
            center_id=center_id,
        )
        db.add(convo)
        db.flush()

        # add creator
        db.add(ConversationMember(conversation_id=convo.id, user_id=creator_id))
        for m in set(member_ids):
            if m != creator_id:
                db.add(ConversationMember(conversation_id=convo.id, user_id=m))

        db.commit()
        db.refresh(convo)
        return convo

    @staticmethod
    def send_message(db: Session, sender_id, conversation_id, body: str, attachment_url: Optional[str] = None) -> Message:
        sender = db.query(User).filter_by(id=sender_id).first()
        center_id = sender.center_id if sender else None

        msg = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            center_id=center_id,
            body=body,
            attachment_url=attachment_url,
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

    @staticmethod
    def get_conversation_messages(db: Session, conversation_id: int) -> List[Message]:
        return db.query(Message).filter_by(conversation_id=conversation_id).order_by(Message.created_at.asc()).all()
