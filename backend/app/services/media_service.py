from app.models.daily_log import MediaPost
from app.models.base import Room, Child, ParentChild
from app.core.websocket_manager import manager
import asyncio
from sqlalchemy.orm import Session
from typing import Optional, List
from app.schemas.media_messaging_billing import MediaUploadRequest


class MediaService:
    @staticmethod
    def add_media(db: Session, staff_id: int, media_data: MediaUploadRequest) -> Optional[MediaPost]:
        # Basic validation for child
        if media_data.child_id:
            child = db.query(Child).filter_by(id=media_data.child_id).first()
            if not child:
                return None

        media = MediaPost(
            child_id=media_data.child_id,
            staff_id=staff_id,
            media_type=media_data.media_type or "PHOTO",
            url=str(media_data.url),
            caption=media_data.caption,
        )
        db.add(media)
        db.commit()
        db.refresh(media)

        # Broadcast media event to parents of the child and center staff (async)
        pass

        return media

    @staticmethod
    def get_media_for_child(db: Session, child_id: int) -> List[MediaPost]:
        return db.query(MediaPost).filter_by(child_id=child_id).order_by(MediaPost.posted_at.desc()).all()
