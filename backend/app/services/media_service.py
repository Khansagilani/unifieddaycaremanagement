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
            title=media_data.title,
            description=media_data.description,
            media_type=media_data.media_type,
            url=str(media_data.url),
            public_id=media_data.public_id
        )
        db.add(media)
        db.commit()
        db.refresh(media)

        # Broadcast media event to parents of the child and center staff (async)
        try:
            center_id = None
            if media.child_id:
                # try to determine center via relationship
                child = db.query(Child).filter_by(id=media.child_id).first()
                if child and child.room:
                    center_id = str(child.room.center_id)

                parent_links = db.query(ParentChild).filter_by(child_id=media.child_id).all()
                parent_ids = [str(p.user_id) for p in parent_links]
                if center_id:
                    asyncio.create_task(manager.broadcast_to_parents_of_child(center_id, str(media.child_id), parent_ids, "media:posted", {
                        "id": media.id,
                        "child_id": media.child_id,
                        "url": media.url,
                        "title": media.title
                    }))

            # Broadcast to staff/admin in center if known
            if center_id:
                asyncio.create_task(manager.broadcast_to_roles(center_id, ["ADMIN", "STAFF"], "media:posted", {
                    "id": media.id,
                    "child_id": media.child_id,
                    "url": media.url,
                    "title": media.title
                }))
        except Exception:
            pass

        return media

    @staticmethod
    def get_media_for_child(db: Session, child_id: int) -> List[MediaPost]:
        return db.query(MediaPost).filter_by(child_id=child_id).order_by(MediaPost.created_at.desc()).all()
