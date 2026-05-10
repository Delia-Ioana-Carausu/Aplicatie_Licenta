from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import json

from database import engine, SessionLocal, Base, User, init_db
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
        raise HTTPException(status_code=400, detail="Parola veche incorectă")
    
    current_user.hashed_password = get_password_hash(data.parola_noua)
    db.commit()
    return {"mesaj": "Parola a fost schimbată cu succes"}

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.robot_connection: WebSocket | None = None

    async def connect_client(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect_client(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def connect_robot(self, websocket: WebSocket):
        await websocket.accept()
        self.robot_connection = websocket
        print("Robot connected!")

    def disconnect_robot(self):
        self.robot_connection = None
        print("Robot disconnected!")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"Eroare trimitere mesaj la client: {e}")

manager = ConnectionManager()

robot_status = {
    "mancare": True,
    "miscare": "inactiv",
    "baterie": 85,
    "temperatura": 37.5
}


@app.get("/")
def home():
    return {"message": "Backend-ul funcționează!"}

@app.get("/status")
def get_status():
    return robot_status

@app.post("/comanda/{actiune}")
def trimite_comanda(actiune: str):
    robot_status["miscare"] = actiune
    return {"status": "comanda primită", "actiune": actiune}

@app.websocket("/ws/robot")
async def websocket_endpoint_robot(websocket: WebSocket):
    await manager.connect_robot(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect_robot()
    except Exception as e:
        print(f"Eroare conexiune robot: {e}")
        manager.disconnect_robot()

@app.websocket("/ws/client")
async def websocket_endpoint_client(websocket: WebSocket):
    await manager.connect_client(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Comanda de la client: {data}")
            if manager.robot_connection:
                  await manager.robot_connection.send_text(data)

    except WebSocketDisconnect:
        manager.disconnect_client(websocket)
