from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps workspace_id to a list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, workspace_id: str):
        await websocket.accept()
        if workspace_id not in self.active_connections:
            self.active_connections[workspace_id] = []
        self.active_connections[workspace_id].append(websocket)
        # Broadcast that a user joined
        await self.broadcast(workspace_id, {
            "type": "presence",
            "message": "A user joined the workspace",
            "users_count": len(self.active_connections[workspace_id])
        })

    def disconnect(self, websocket: WebSocket, workspace_id: str):
        if workspace_id in self.active_connections:
            if websocket in self.active_connections[workspace_id]:
                self.active_connections[workspace_id].remove(websocket)
            if not self.active_connections[workspace_id]:
                del self.active_connections[workspace_id]

    async def broadcast(self, workspace_id: str, message: dict):
        if workspace_id in self.active_connections:
            for connection in self.active_connections[workspace_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.websocket("/ws/{workspace_id}")
async def websocket_endpoint(websocket: WebSocket, workspace_id: str):

 """
WebSocket Endpoint: /ws/{workspace_id}

 Provides real-time workspace presence and collaboration updates.

Connection:
ws://<host>/ws/{workspace_id}

## Client Events

1. join
   Sent when a user connects.

{
"type": "join",
"userId": "user-123",
"name": "Alice"
}

## Server Events

1. user_joined
   Broadcast when a user joins.

{
"type": "user_joined",
"userId": "user-123",
"name": "Alice"
}

2. user_left
   Broadcast when a user disconnects.

{
"type": "user_left",
"userId": "user-123",
"name": "Alice"
}

3. presence_sync
   Sent after connection to synchronize active users.

{
"type": "presence_sync",
"users": [
{
"userId": "user-123",
"name": "Alice"
}
]
}

Notes:

* Connections are scoped per workspace_id.
* Messages are exchanged as JSON payloads.
* Invalid JSON payloads are ignored.

  """

 await manager.connect(websocket, workspace_id)
 try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                # Re-broadcast the message to everyone in the workspace
                await manager.broadcast(workspace_id, message_data)
            except json.JSONDecodeError:
                pass
 except WebSocketDisconnect:
        manager.disconnect(websocket, workspace_id)
        # Broadcast that a user left
        if workspace_id in manager.active_connections:
            await manager.broadcast(workspace_id, {
                "type": "presence",
                "message": "A user left the workspace",
                "users_count": len(manager.active_connections[workspace_id])
            })
