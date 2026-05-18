from fastapi import WebSocket
from typing import Dict, List
import json

class WebSocketManager:
    def __init__(self):
        # Map center_id → list of {websocket, user_id, role}
        self.connections: Dict[str, List[dict]] = {}

    async def connect(self, websocket: WebSocket, center_id: str, user_id: str, role: str):
        await websocket.accept()
        if center_id not in self.connections:
            self.connections[center_id] = []
        self.connections[center_id].append({
            "ws": websocket,
            "user_id": user_id,
            "role": role
        })

    def disconnect(self, websocket: WebSocket, center_id: str):
        if center_id in self.connections:
            self.connections[center_id] = [
                c for c in self.connections[center_id] if c["ws"] != websocket
            ]
            if not self.connections[center_id]:
                del self.connections[center_id]

    async def broadcast_to_center(self, center_id: str, event: str, data: dict):
        """Broadcast to all users in a center"""
        if center_id not in self.connections:
            return
        for conn in self.connections[center_id]:
            try:
                await conn["ws"].send_json({"event": event, "data": data})
            except:
                pass

    async def broadcast_to_parents_of_child(self, center_id: str, child_id: str, parent_ids: list, event: str, data: dict):
        """Broadcast to specific parents of a child"""
        if center_id not in self.connections:
            return
        for conn in self.connections[center_id]:
            if conn["user_id"] in parent_ids:
                try:
                    await conn["ws"].send_json({"event": event, "data": data})
                except:
                    pass

    async def broadcast_to_roles(self, center_id: str, roles: list, event: str, data: dict):
        """Broadcast to users with specific roles"""
        if center_id not in self.connections:
            return
        for conn in self.connections[center_id]:
            if conn["role"] in roles:
                try:
                    await conn["ws"].send_json({"event": event, "data": data})
                except:
                    pass

manager = WebSocketManager()
