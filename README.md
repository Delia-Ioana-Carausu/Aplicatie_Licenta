# Aplicație Control și Telemetrie Robot - Proiect de Licență

Acest proiect reprezintă o aplicație completă pentru controlul și monitorizarea unui robot. Este structurată pe trei componente principale: un server backend (FastAPI), o interfață web frontend (React) și codul propriu-zis care rulează pe robot.

## Structura Proiectului

*   **`/backend`**: Server web scris în Python folosind **FastAPI**. Gestionează autentificarea utilizatorilor (cu JWT), baza de date (SQLite) și conexiunile în timp real prin **WebSockets** (atât cu interfața web, cât și cu robotul).
*   **`/frontend`**: Interfața cu utilizatorul (SPA - Single Page Application) scrisă în **React**. Permite logarea, trimiterea de comenzi către robot și vizualizarea datelor de telemetrie în timp real pe grafice.
*   **`cod_robot.py`**: Scriptul Python care trebuie rulat direct pe hardware-ul robotului. Acesta comunică cu serverul backend pentru a trimite datele senzorilor și pentru a primi comenzile de mișcare.

## Tehnologii Utilizate

*   **Backend**: Python, FastAPI, SQLAlchemy, WebSockets, JWT (JSON Web Tokens), SQLite.
*   **Frontend**: React, React Router, Context API, CSS (Module/Tailwind).
*   **Robot**: Python, librării specifice senzorilor și motoarelor.

## Configurare și Rulare Locală

### 1. Pornirea Serverului Backend

Asigurați-vă că sunteți în folderul `backend`.

```bash
cd backend
# Dacă aveți un mediu virtual (venv), activați-l.
# Ex: .\venv\Scripts\activate
pip install -r requirements.txt # (Dacă există)
uvicorn main:app --reload
```
Serverul va rula implicit la adresa `http://localhost:8000`.

### 2. Pornirea Interfeței Web (Frontend)

Deschideți un terminal nou și navigați în folderul `frontend`.

```bash
cd frontend
npm install
npm start
```
Aplicația web va fi accesibilă în browser la adresa `http://localhost:3000`.

### 3. Rularea Codului pe Robot

Pe sistemul de operare al robotului (ex. un Raspberry Pi):
```bash
python cod_robot.py
```
*Notă: Asigurați-vă că robotul este conectat la aceeași rețea și că în `cod_robot.py` este specificată corect adresa IP a serverului backend.*
