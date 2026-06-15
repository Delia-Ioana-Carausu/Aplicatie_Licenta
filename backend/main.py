from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import time

from database import User, init_db
from auth import get_db, get_password_hash, verify_password, create_access_token, get_current_user, timedelta

init_db()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel


class UtilizatorInregistrare(BaseModel):
    nume_utilizator: str
    parola: str


@app.post("/register")
def inregistrare(data_utilizator: UtilizatorInregistrare, db: Session = Depends(get_db)):
    nume = data_utilizator.nume_utilizator
    parola_clara = data_utilizator.parola

    if not nume or not parola_clara:
        raise HTTPException(status_code=400, detail="Nume utilizator si parola necesare")

    utilizator_existent = db.query(User).filter(User.username == nume).first()
    if utilizator_existent:
        raise HTTPException(status_code=400, detail="Nume utilizator deja existent")

    parola_hash = get_password_hash(parola_clara)
    utilizator_nou = User(username=nume, hashed_password=parola_hash)
    db.add(utilizator_nou)
    db.commit()
    return {"mesaj": "Utilizator creat cu succes"}


@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username, "id": current_user.id}


class SchimbareParola(BaseModel):
    parola_veche: str
    parola_noua: str


@app.post("/change-password")
async def change_password(data: SchimbareParola, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(data.parola_veche, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Parola veche incorecta")

    current_user.hashed_password = get_password_hash(data.parola_noua)
    db.commit()
    return {"mesaj": "Parola a fost schimbata cu succes"}


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.robot_connection: WebSocket | None = None
        self.latest_telemetry = None
        self.latest_video = None

    async def connect_client(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        robot_is_online = self.robot_connection is not None
        await websocket.send_text(json.dumps({
            "type": "robot_connection",
            "payload": {"connected": robot_is_online}
        }))
        # Only send cached data if the robot is currently connected
        if robot_is_online and self.latest_telemetry:
            await websocket.send_text(json.dumps(self.latest_telemetry))
        if robot_is_online and self.latest_video:
            await websocket.send_text(json.dumps(self.latest_video))

    def disconnect_client(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def connect_robot(self, websocket: WebSocket):
        await websocket.accept()
        self.robot_connection = websocket
        print("Robot connected!")
        await self.broadcast(json.dumps({
            "type": "robot_connection",
            "payload": {"connected": True}
        }))

    async def disconnect_robot(self):
        self.robot_connection = None
        self.latest_telemetry = None
        self.latest_video = None
        print("Robot disconnected! All cached data cleared.")

        # Reset global robot status
        robot_status["robotConectat"] = False
        robot_status["miscare"] = "inactiv"
        robot_status["ultimaActualizare"] = None
        robot_status["telemetrie"] = None

        await self.broadcast(json.dumps({
            "type": "robot_connection",
            "payload": {"connected": False}
        }))
        # Notify all clients to reset their local data
        await self.broadcast(json.dumps({
            "type": "data_reset",
            "payload": {"reason": "robot_disconnected"}
        }))

    async def broadcast(self, message: str):
        dead_connections = []
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Eroare trimitere mesaj la client: {e}")
                dead_connections.append(connection)
        for connection in dead_connections:
            self.disconnect_client(connection)

    async def send_to_robot(self, message: dict):
        if not self.robot_connection:
            raise HTTPException(status_code=503, detail="Robotul nu este conectat")
        await self.robot_connection.send_text(json.dumps(message))


manager = ConnectionManager()

robot_status = {
    "robotConectat": False,
    "miscare": "inactiv",
    "ultimaActualizare": None,
    "telemetrie": None
}


class ComandaRobot(BaseModel):
    action: str
    speed: Optional[float] = None
    mode: Optional[str] = "manual"


def update_robot_status(message: dict):
    if message.get("type") == "telemetry":
        payload = message.get("payload", {})
        robot_status["robotConectat"] = manager.robot_connection is not None
        robot_status["ultimaActualizare"] = time.time()
        robot_status["telemetrie"] = payload
        robot_status["miscare"] = payload.get("motion", robot_status.get("miscare", "inactiv"))
        manager.latest_telemetry = message
    elif message.get("type") == "video":
        manager.latest_video = message


@app.get("/")
def home():
    return {"message": "Backend-ul functioneaza!"}


@app.get("/status")
def get_status():
    robot_status["robotConectat"] = manager.robot_connection is not None
    return robot_status


@app.post("/comanda/{actiune}")
async def trimite_comanda(actiune: str):
    robot_status["miscare"] = actiune
    comanda = {"type": "command", "payload": {"action": actiune, "mode": "manual"}}
    await manager.send_to_robot(comanda)
    return {"status": "comanda primita", "actiune": actiune}


@app.post("/comanda")
async def trimite_comanda_json(comanda: ComandaRobot):
    payload = comanda.dict()
    payload = {key: value for key, value in payload.items() if value is not None}
    robot_status["miscare"] = payload.get("action", robot_status["miscare"])
    await manager.send_to_robot({"type": "command", "payload": payload})
    return {"status": "comanda trimisa", "payload": payload}


@app.websocket("/ws/robot")
async def websocket_endpoint_robot(websocket: WebSocket):
    await manager.connect_robot(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                update_robot_status(json.loads(data))
            except json.JSONDecodeError:
                pass
            await manager.broadcast(data)
    except WebSocketDisconnect:
        await manager.disconnect_robot()
    except Exception as e:
        print(f"Eroare conexiune robot: {e}")
        await manager.disconnect_robot()


@app.websocket("/ws/client")
async def websocket_endpoint_client(websocket: WebSocket):
    await manager.connect_client(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Comanda de la client: {data}")
            if manager.robot_connection:
                await manager.robot_connection.send_text(data)
            else:
                await websocket.send_text(json.dumps({
                    "type": "command_error",
                    "payload": {"message": "Robotul nu este conectat"}
                }))

    except WebSocketDisconnect:
        manager.disconnect_client(websocket)
