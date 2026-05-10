from database import init_db, SessionLocal, User, engine
from sqlalchemy import text
import os

def test_db():
    print("1. Verificare existenta fisier DB...")
    if os.path.exists("./users.db"):
        print("   [OK] users.db exista.")
    else:
        print("   [INFO] users.db nu exista. Se va crea...")

    print("2. Initializare tabele...")
    try:
        init_db()
        print("   [OK] Tabele initializate.")
    except Exception as e:
        print(f"   [EROARE] Nu s-au putut initializa tabelele: {e}")
        return

    print("3. Test scriere utilizator...")
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == "test_debug").first()
        if existing:
            db.delete(existing)
            db.commit()
        
        new_user = User(username="test_debug", hashed_password="hashed_secret")
        db.add(new_user)
        db.commit()
        print("   [OK] Utilizator 'test_debug' scris in DB.")
    except Exception as e:
        print(f"   [EROARE] Nu s-a putut scrie in DB: {e}")
    finally:
        db.close()

    print("4. Test citire utilizatori...")
    db = SessionLocal()
    users = db.query(User).all()
    print(f"   Utilizatori gasiti: {len(users)}")
    for u in users:
        print(f"   - ID: {u.id}, User: {u.username}")
    db.close()

if __name__ == "__main__":
    test_db()
