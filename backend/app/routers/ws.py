from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.core.websocket_manager import manager
from app.core.security import decode_token
from typing import Optional

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = Query(None)):
    """WebSocket endpoint that accepts a `token` query parameter (JWT).
    Token payload must include `user_id`, `center_id`, and `role`.
    """
    if not token:
        await websocket.close(code=4001)
        return

    payload = decode_token(token)
    if not payload:
        await websocket.close(code=4002)
        return

    user_id = str(payload.get("sub") or payload.get("user_id"))
    center_id = str(payload.get("center_id"))
    role = payload.get("role", "STAFF")

    try:
        await manager.connect(websocket, center_id, user_id, role)
        while True:
            data = await websocket.receive_text()
            # Echo or handle incoming events as needed
            # For now, simple echo with event wrapper
            await websocket.send_json({"event": "echo", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket, center_id)
    except Exception:
        manager.disconnect(websocket, center_id)
