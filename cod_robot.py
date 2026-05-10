import sim  
import time
import cv2
import numpy as np
import threading
import random
import math
from datetime import datetime
from ultralytics import YOLO
model = YOLO('yolo11n.pt')
folder_poze = "poze_animale"
import asyncio
import websockets
import base64
import json

sim.simxFinish(-1) #se asigura ca nu exista alte conexiuni pornite
client_id = sim.simxStart('127.0.0.1', 19998, True, True, 5000, 5)
ultima_rotire_tip = None

class NetworkClient:
    def __init__(self, uri):
        self.uri = uri
        self.loop = asyncio.new_event_loop()
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.connected = False
        self.queue = asyncio.Queue()
        self.thread.start()

    def _run_loop(self):
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(self._connect())

    async def _connect(self):
        while True:
            try:
                async with websockets.connect(self.uri) as websocket:
                    print("Conectat la WebSocket backend!")
                    self.connected = True
                    while True:
                        data = await self.queue.get()
                        await websocket.send(data)
            except Exception as e:
                print(f"Eroare WebSocket (reconectare in 5s): {e}")
                self.connected = False
                await asyncio.sleep(5)

    def send_data(self, data_dict):
        if self.connected:
            self.loop.call_soon_threadsafe(self.queue.put_nowait, json.dumps(data_dict))
            
network_client = NetworkClient("ws://localhost:8000/ws/robot")

if client_id != -1: #obinerea id urilor tuturor obiectelor din scena
    print("Conexiune reusita")
    eroare, id_robot = sim.simxGetObjectHandle(client_id, 'Robotnik_Summit_XL', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Robot gasit")
    else:
        print("Id robot nu a fost gasit ")
    eroare, id_camera = sim.simxGetObjectHandle(client_id, 'camera', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Camera gasita")
    else:
        print("Id camera nu a fost gasit ")
    eroare, id_senzor_fata = sim.simxGetObjectHandle(client_id, 'senzor_fata', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Senzor fata gasit")
    else:
        print("Id senzor fata nu a fost gasit ") 
    eroare, id_senzor_stanga = sim.simxGetObjectHandle(client_id, 'senzor_stanga', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Senzor stanga gasit")
    else:
        print("Id senzor stanga nu a fost gasit ")   
    eroare, id_senzor_dreapta = sim.simxGetObjectHandle(client_id, 'senzor_dreapta', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Senzor dreapta gasit")
    else:
        print("Id senzor dreapta nu a fost gasit ")   
    eroare, id_senzor_spate = sim.simxGetObjectHandle(client_id, 'senzor_spate', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Senzor spate gasit")
    else:
        print("Id senzor spate nu a fost gasit ")  
    eroare, id_container_mancare = sim.simxGetObjectHandle(client_id, 'container_mancare', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Container mancare gasit")
    else:
        print("Id container mancare nu a fost gasit ")   
    eroare, id_roata_fata_stanga = sim.simxGetObjectHandle(client_id, 'joint_fata_stanga', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Roata fata stanga gasita")
    else:
        print("Id roata fata stanga nu a fost gasit ")  
    eroare, id_roata_fata_dreapta = sim.simxGetObjectHandle(client_id, 'joint_fata_dreapta', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Roata fata dreapta gasita")
    else:
        print("Id roata fata dreapta nu a fost gasit ")   
    eroare, id_roata_spate_stanga = sim.simxGetObjectHandle(client_id, 'joint_spate_stanga', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Roata spate stanga gasita")
    else:
        print("Id roata spate stanga nu a fost gasit ")   
    eroare, id_roata_spate_dreapta = sim.simxGetObjectHandle(client_id, 'joint_spate_dreapta', sim.simx_opmode_blocking)
    if eroare == sim.simx_return_ok:
        print("Roata spate dreapta gasita")
    else:
        print("Id roata spate dreapta nu a fost gasit ")

    animal_in_proces = False
    timpul_ultimei_detectii = 0
    TIMP_ASTEPTARE_ANIMAL = 10  
    animale_vizitate = [] 
    
    viteza_curenta = 0.0 

    def miscare_inainte(viteza):
        global viteza_curenta
        viteza_curenta = viteza
        sim.simxSetJointTargetVelocity(client_id, id_roata_fata_stanga, viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_fata_dreapta, -viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_spate_stanga, viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_spate_dreapta, -viteza, sim.simx_opmode_oneshot)
        print("Robotul se misca inainte")

    def miscare_inapoi(viteza):
        global viteza_curenta
        viteza_curenta = viteza
        sim.simxSetJointTargetVelocity(client_id, id_roata_fata_stanga, -viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_fata_dreapta, viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_spate_stanga, -viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_spate_dreapta, viteza, sim.simx_opmode_oneshot)
        print("Robotul se misca inapoi")

    def rotire_stanga(viteza):
        global viteza_curenta
        viteza_curenta = viteza
        sim.simxSetJointTargetVelocity(client_id, id_roata_fata_stanga, -viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_fata_dreapta, -viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_spate_stanga, -viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_spate_dreapta, -viteza, sim.simx_opmode_oneshot)
        print("Robotul se roteste la stanga")
        
    def rotire_dreapta(viteza):
        global viteza_curenta
        viteza_curenta = viteza
        sim.simxSetJointTargetVelocity(client_id, id_roata_fata_stanga, viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_fata_dreapta, viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_spate_stanga, viteza, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_spate_dreapta, viteza, sim.simx_opmode_oneshot)
        print("Robotul se roteste la dreapta")

    def stop():
        global viteza_curenta
        viteza_curenta = 0.0
        sim.simxSetJointTargetVelocity(client_id, id_roata_fata_stanga, 0, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_fata_dreapta, 0, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_spate_stanga, 0, sim.simx_opmode_oneshot)
        sim.simxSetJointTargetVelocity(client_id, id_roata_spate_dreapta, 0, sim.simx_opmode_oneshot)
        print("Robotul s-a oprit")
    
    def citire_senzori():
        distante = {}
        for nume, senzor in zip(nume_senzori, id_senzori):
            eroare, detectat, punct_de_contact, _, _ = sim.simxReadProximitySensor(client_id, senzor, sim.simx_opmode_buffer)
            if eroare == sim.simx_return_ok:
                if detectat and punct_de_contact is not None:
                    distanta = abs(punct_de_contact[2])
                    distante[nume] = distanta
                    if distanta < 5:
                        print(f"Senzor {nume}: {distanta:.2f}m")
                else:
                    distante[nume] = None
            else:
                distante[nume] = None
                if eroare not in [0, 1]:
                    print(f"Eroare la citirea senzorului {nume}: {eroare}")
        return distante
    
    def evitare_obstacole(distante, viteza=1.5, prag=2.0, prag_lateral=0.4, prag_spate=0.3):
        global ultima_rotire_tip
        if animal_in_proces: 
            return False
        if distante.get('fata') is not None and distante.get('fata') < prag:
            print(f"Obstacol detectat in fata la {distante.get('fata'):.2f}m")
            stop()
            time.sleep(0.5)
            dist_dreapta = distante.get('dreapta') if 'dreapta' in distante and distante.get('dreapta') is not None else float('inf')
            dist_stanga = distante.get('stanga') if 'stanga' in distante and distante.get('stanga') is not None else float('inf')
            directie_aleasa = None
            if dist_dreapta > dist_stanga:
                directie_aleasa = 'dreapta'
            elif dist_stanga > dist_dreapta:
                directie_aleasa = 'stanga'
            else:
                directie_aleasa = random.choice(['stanga', 'dreapta'])
            
            if ultima_rotire_tip is not None and directie_aleasa != ultima_rotire_tip:
                directie_aleasa = ultima_rotire_tip
            
            if directie_aleasa == 'dreapta':
                rotire_dreapta(viteza)
            else:
                rotire_stanga(viteza)
            
            ultima_rotire_tip = directie_aleasa
            time.sleep(1.5)
            stop()
            return True

        if distante.get('stanga') is not None and distante.get('stanga') < prag_lateral:
            print(f"Obstacol detectat in stanga la {distante.get('stanga'):.2f}m, evitare prin dreapta")
            rotire_dreapta(viteza*0.5)
            ultima_rotire_tip = 'dreapta'
            miscare_inainte(viteza*0.5)
            time.sleep(0.5)
            stop()
            return True

        if distante.get('dreapta') is not None and distante.get('dreapta') < prag_lateral:
            print(f"Obstacol detectat in dreapta la {distante.get('dreapta'):.2f}m, evitare prin stanga")
            rotire_stanga(viteza*0.5)
            ultima_rotire_tip = 'stanga'
            miscare_inainte(viteza*0.5)
            time.sleep(0.5)
            stop()
            return True

        if distante.get('spate') is not None and distante.get('spate') < prag_spate:
            print(f"Obstacol detectat in spate la {distante.get('spate'):.2f}m, miscare inainte")
            rotire_dreapta(viteza*0.5)
            time.sleep(1.0)
            stop()
            return True
        return False

    vizitat = set()
    def pozitie_pe_grid(x, y, dim_celula=0.5): #celula de 0.5m
        if math.isnan(x) or math.isnan(y):
            print(f"[Eroare] Coordonata NaN in pozitie_pe_grid: x={x}, y={y}")
            return None
        return (round(x / dim_celula), round(y / dim_celula))
    
    def celula_animal(x, y, dim_celula=3.0): #pt recunoasterea aceluiasi animal intr-o celula 3m dist
        if math.isnan(x) or math.isnan(y):
            return None
        return (math.floor(x / dim_celula), math.floor(y / dim_celula))
    
    limite_scena = {
        'x_min': -15.0,
        'x_max': 15.0,
        'y_min': -15.0,
        'y_max': 15.0,
        'prag_maxim': 1.0
    }
    
    ultima_virare = 0
    timp_blocat = 0
    
    def verificare_limite(pozitie, viteza=1.5):
        global ultima_virare, ultima_rotire_tip
        timp_curent = time.time()
        if timp_curent - ultima_virare < 1.5:
            return False
            
        x, y, _ = pozitie
        min_x_limit = limite_scena['x_min'] + limite_scena['prag_maxim']
        max_x_limit = limite_scena['x_max'] - limite_scena['prag_maxim']
        min_y_limit = limite_scena['y_min'] + limite_scena['prag_maxim']
        max_y_limit = limite_scena['y_max'] - limite_scena['prag_maxim']
        atins_x_min = x < min_x_limit
        atins_x_max = x > max_x_limit
        atins_y_min = y < min_y_limit
        atins_y_max = y > max_y_limit
        if not (atins_x_min or atins_x_max or atins_y_min or atins_y_max):
            return False

        print(f"Margine scena detectata la pozitia ({x:.2f}, {y:.2f})")
        stop()
        time.sleep(0.2)
        if (atins_x_min or atins_x_max) and (atins_y_min or atins_y_max):
            print("COLT DETECTAT - Manevra extinsa")
            miscare_inapoi(viteza)
            time.sleep(2.5) 
            stop()
            if atins_x_max: 
                rotire_stanga(viteza)
                ultima_rotire_tip = 'stanga'
            else: 
                rotire_dreapta(viteza)
                ultima_rotire_tip = 'dreapta'
            time.sleep(2.5) 
            
        else:
            miscare_inapoi(viteza)
            time.sleep(1.5)
            stop()
            
            directie_necesara = None
            if atins_x_max: 
                directie_necesara = 'stanga'
            elif atins_x_min: 
                directie_necesara = 'dreapta'
            elif atins_y_max: 
                directie_necesara = 'dreapta'
            elif atins_y_min: 
                directie_necesara = 'stanga'
            
            if ultima_rotire_tip is not None and directie_necesara != ultima_rotire_tip:
                miscare_inapoi(viteza)
                time.sleep(1.0)
                stop()
                if ultima_rotire_tip == 'stanga':
                    rotire_stanga(viteza)
                else:
                    rotire_dreapta(viteza)
            else:
                if directie_necesara == 'stanga':
                    rotire_stanga(viteza)
                else:
                    rotire_dreapta(viteza)
                ultima_rotire_tip = directie_necesara
            
            time.sleep(1.2)

        stop()
        ultima_virare = time.time()
        return True
    
    def activeaza_container(unghi):
        if id_container_mancare != -1:
            res, orientare = sim.simxGetObjectOrientation(client_id, id_container_mancare, -1, sim.simx_opmode_blocking)
            if res == sim.simx_return_ok:
                orientare_initiala = list(orientare)
                orientare[0] += math.radians(unghi)
                sim.simxSetObjectOrientation(client_id, id_container_mancare, -1, orientare, sim.simx_opmode_oneshot)
                print(f"Container deschis la {unghi} grade")
                time.sleep(2)
                sim.simxSetObjectOrientation(client_id, id_container_mancare, -1, orientare_initiala, sim.simx_opmode_oneshot)

    def este_animal_deja_hranit(clasa_curenta, x_robot, y_robot, raza_siguranta=2.0):
        for animal in animale_vizitate:
            cls_salvata, x_anim, y_anim = animal
            
            if cls_salvata == clasa_curenta:
                distanta = math.sqrt((x_robot - x_anim)**2 + (y_robot - y_anim)**2)
                
                if distanta < raza_siguranta:
                    return True
        return False

    def procesare_animal_detectat(img, pozitie_robot, box):
        global animal_in_proces, timpul_ultimei_detectii, animale_vizitate
        if time.time() - timpul_ultimei_detectii < TIMP_ASTEPTARE_ANIMAL:
            return False    #sa nu detecteze alt animal in timp ce deja proceseaza unul
        animal_in_proces = True
        print("\nANIMAL DETECTAT!")
        if box.xyxy.shape[0] > 0: #construirea chenarului in jurul animalului pt hranire, procesul incepe dupa ce e 30% in imagine
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            box_height = y2 - y1
            box_width = x2 - x1
            box_area = box_height * box_width
            img_height, img_width = img.shape[:2]
            relative_box_size = box_area / (img_height * img_width)
            print(f"Dimensiune relativa: {relative_box_size:.4f}")
            PRAG_APROPIAT = 0.30     
        else:
            relative_box_size = 0
            PRAG_APROPIAT = 0.30
            
        img_width = img.shape[1]
        img_center_x = img_width / 2
        max_offset = 50 
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        center_x = (x1 + x2) / 2
        offset = center_x - img_center_x
        print(f"[DEBUG] center_x: {center_x:.2f}, offset fata de centru: {offset:.2f}")

        max_iteratii = 10
        iteratie = 0
        while abs(offset) > max_offset and iteratie < max_iteratii:
            if offset > 0:
                print("Animalul este spre dreapta, rotesc dreapta")
                rotire_dreapta(0.6)
            else:
                print("Animalul este spre stanga, rotesc stanga")
                rotire_stanga(0.6)

            time.sleep(0.3)
            stop()
            time.sleep(0.3)

            eroare, rezolutie, imagine = sim.simxGetVisionSensorImage(client_id, id_camera, 0, sim.simx_opmode_buffer)
            if eroare == sim.simx_return_ok and imagine is not None:
                img_temp = np.array(imagine, dtype=np.int8)
                if img_temp.size == rezolutie[0] * rezolutie[1] * 3:
                    img_temp = img_temp.reshape((rezolutie[1], rezolutie[0], 3))
                    img_temp = cv2.flip(img_temp, 0)
                    img_temp = img_temp.astype(np.uint8)
                    img_temp = cv2.cvtColor(img_temp, cv2.COLOR_RGB2BGR)

                    try:
                        img_resized_ws = cv2.resize(img_temp, (640, 480))
                        _, buffer_ws = cv2.imencode('.jpg', img_resized_ws, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
                        img_str_ws = base64.b64encode(buffer_ws).decode('utf-8')
                        network_client.send_data({"type": "video", "payload": img_str_ws})
                    except: pass

                    rezultat_temp = model(img_temp)
                    for r in rezultat_temp:
                        for b in r.boxes:
                            if b.cls in [14, 15, 16, 17, 18, 19, 20, 21, 22, 23]:
                                if b.xyxy.shape[0] > 0:
                                    x1, y1, x2, y2 = b.xyxy[0].tolist()
                                    center_x = (x1 + x2) / 2
                                    offset = center_x - img_center_x
                                    print(f"[CORECTARE] offset nou: {offset:.2f}")
                                    break
            iteratie += 1

        print("Ma apropii de animal")
        timp_apropiere_max = 8.0  
        timp_apropiere = 0
        viteza_apropiere = 1.0
            
        while timp_apropiere < timp_apropiere_max:
            distante = citire_senzori()
            dist_fata = distante.get('fata')
            if dist_fata is not None and dist_fata < 1.0:
                print(f"Animal detectat la {dist_fata:.2f}m de senzor. Opresc apropierea.")
                break
            if relative_box_size >= PRAG_APROPIAT:
                print(f"Sunt suficient de aproape de animal (box: {relative_box_size:.4f}). Oprire.")
                stop()
                break
            miscare_inainte(viteza_apropiere)
            time.sleep(0.5)
            stop()
            time.sleep(0.2)
            timp_apropiere += 0.5
                
            eroare, rezolutie, imagine = sim.simxGetVisionSensorImage(client_id, id_camera, 0, sim.simx_opmode_buffer)
            if eroare == sim.simx_return_ok and imagine is not None:
                img_temp = np.array(imagine, dtype=np.int8)
                if img_temp.size == rezolutie[0] * rezolutie[1] * 3:
                    img_temp = img_temp.reshape((rezolutie[1], rezolutie[0], 3))
                    img_temp = cv2.flip(img_temp, 0)
                    img_temp = img_temp.astype(np.uint8)
                    img_temp = cv2.cvtColor(img_temp, cv2.COLOR_RGB2BGR)
                    
                    try:
                        img_resized_ws = cv2.resize(img_temp, (640, 480))
                        _, buffer_ws = cv2.imencode('.jpg', img_resized_ws, [int(cv2.IMWRITE_JPEG_QUALITY), 50])
                        img_str_ws = base64.b64encode(buffer_ws).decode('utf-8')
                        network_client.send_data({"type": "video", "payload": img_str_ws})
                    except: pass
                        
                    rezultat_temp = model(img_temp)
                    for r in rezultat_temp:
                        for b in r.boxes:
                            if b.cls in [14, 15, 16, 17, 18, 19, 20, 21, 22, 23]:
                                if b.xyxy.shape[0] > 0:
                                    x1, y1, x2, y2 = b.xyxy[0].tolist()
                                    box_area_new = (x2 - x1) * (y2 - y1)
                                    relative_box_size = box_area_new / (img_temp.shape[0] * img_temp.shape[1])
                                    print(f"Noua dimensiune relativa: {relative_box_size:.4f}")
                                    img = img_temp  
                                    break
            if relative_box_size >= PRAG_APROPIAT:
                print("Sunt suficient de aproape de animal!")
                break

        stop()
        time.sleep(0.5)
            
        distante = citire_senzori()
        dist_fata = distante.get('fata')
        if dist_fata is not None:
            print(f"Distanta finala pana la animal: {dist_fata:.2f}m")
            err_p, pos_rob = sim.simxGetObjectPosition(client_id, id_robot, -1, sim.simx_opmode_blocking)
            err_o, orient = sim.simxGetObjectOrientation(client_id, id_robot, -1, sim.simx_opmode_blocking)
                
            if err_p == sim.simx_return_ok and err_o == sim.simx_return_ok:
                yaw = orient[2] 
                x_r, y_r = pos_rob[0], pos_rob[1]
                dist_reala = dist_fata + 0.3
                x_animal = x_r + math.cos(yaw) * dist_reala
                y_animal = y_r + math.sin(yaw) * dist_reala
                    
                clasa = int(box.cls)
                animale_vizitate.append((clasa, x_animal, y_animal))
                print(f"MEMORAT POZITIE FIXA ANIMAL: X:{x_animal:.2f} Y:{y_animal:.2f}")
            
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        nume_fisier = f"{folder_poze}/animal_{timestamp}.jpg"
        cv2.imwrite(nume_fisier, img)
        print(f"Poza salvata de aproape: {nume_fisier}")
        print("Dau de mancare animalului")
        activeaza_container(unghi=90)
        time.sleep(2.0)  
        activeaza_container(unghi=0)
        print("Astept langa animal")
        time.sleep(3.0) 
        print("Ma indepartez de animal")
        miscare_inapoi(viteza_apropiere)
        time.sleep(2.0)
        stop()
        rotire_dreapta(1.0)
        time.sleep(0.8)
        stop()
        timpul_ultimei_detectii = time.time()
        animal_in_proces = False
        print(" PROCESARE ANIMAL COMPLETA \n")
        return True

# de aici, e pt afisarea camerei 
    def afiseaza_imagine_camera():
        global merge_camera, animal_in_proces
        print("Pornire camera")
        sim.simxGetVisionSensorImage(client_id, id_camera, 0, sim.simx_opmode_streaming)
        time.sleep(0.5)
        contor_erori = 0
        erori_maxime = 10
        while merge_camera:
            if animal_in_proces:
                time.sleep(0.1)
                continue
            try:
                eroare, rezolutie, imagine = sim.simxGetVisionSensorImage(client_id, id_camera, 0, sim.simx_opmode_buffer)
            except MemoryError:
                print("Eroare de memorie la capturarea imaginii")
                contor_erori += 1
                if contor_erori >= erori_maxime:
                    print("Prea multe erori de memorie. Oprire camera.")
                    merge_camera = False
                    break
                time.sleep(0.1)
                continue
            except Exception as e:
                print(f"Eroare la capturarea imaginii: {e}")
                contor_erori += 1
                if contor_erori >= erori_maxime:
                    print("Prea multe erori neasteptate. Oprire camera.")
                    merge_camera = False
                    break
                time.sleep(0.1)
                continue
            if(eroare != sim.simx_return_ok or not rezolutie or len(rezolutie) < 2):
                print("Rezolutie invalida")
                time.sleep(0.1)
                continue
            if(rezolutie[0] <= 0 or rezolutie[1] <= 0 or rezolutie[0] > 1920 or rezolutie[1] > 1080):
                print(f"Rezolutie nerealista: {rezolutie}")
                time.sleep(0.1)
                continue
            if eroare == sim.simx_return_ok and imagine is not None and len(imagine) > 0 and isinstance(rezolutie, list) and len(rezolutie) == 2 and rezolutie[0] > 0 and rezolutie[1] > 0 and len(imagine) >= rezolutie[0] * rezolutie[1] * 3:
                img = np.array(imagine, dtype=np.int8)
                
                if img.size == rezolutie[0] * rezolutie[1] * 3:
                    img = img.reshape((rezolutie[1], rezolutie[0], 3))
                    img = cv2.flip(img, 0)
                    img = img.astype(np.uint8)
                    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
                    rezultat = model(img)
                    for r in rezultat:
                        for box in r.boxes:
                            if box.cls in [14, 15, 16, 17, 18, 19, 20, 21, 22, 23]:
                                x1, y1, x2, y2 = box.xyxy[0].tolist()
                                box_area = (x2 - x1) * (y2 - y1)
                                img_area = img.shape[0] * img.shape[1]
                                relative_box_size = box_area / img_area
                                prag_pornire_apropiere = 0.015
                                if relative_box_size > prag_pornire_apropiere:
                                    eroare, pozitie = sim.simxGetObjectPosition(client_id, id_robot, -1, sim.simx_opmode_blocking)
                                    if eroare == sim.simx_return_ok and pozitie is not None:
                                        
                                        clasa_animal = int(box.cls)
                                        x_rob, y_rob = pozitie[0], pozitie[1]
                                        
                                        if este_animal_deja_hranit(clasa_animal, x_rob, y_rob):
                                            print(f"Animal {clasa_animal} deja hranit. Ignor.")
                                        else:
                                            procesare_animal_detectat(img, pozitie, box)
                                            break
                    cv2.imshow('Camera Live', img)
                    
                    try:
                        img_resized = cv2.resize(img, (640, 480))
                        _, buffer = cv2.imencode('.jpg', img_resized, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
                        img_str = base64.b64encode(buffer).decode('utf-8')
                        network_client.send_data({"type": "video", "payload": img_str})
                    except Exception as e:
                        print(f"Eroare trimitere video: {e}")
                    
                    time.sleep(0.05) 
                    
                    if cv2.waitKey(1) & 0xFF == ord('q'): #se opreste executia programului cand apas pe q (cand sunt pe camera)
                        merge_camera = False
                        break
                else:
                    print("Dimensiunea imaginii nu corespunde rezolutiei")
            else:
                if eroare != 1:  
                    print(f"Eroare la capturarea imaginii: {eroare}")
                time.sleep(0.1)
                
        cv2.destroyAllWindows()
    #pana aici
    # main ul    
    try:
        for roata in [id_roata_fata_stanga, id_roata_fata_dreapta, id_roata_spate_stanga, id_roata_spate_dreapta]:
            sim.simxSetJointTargetVelocity(client_id, roata, 0, sim.simx_opmode_oneshot)
        print("Initializare senzori")
        nume_senzori = ['fata', 'stanga', 'dreapta', 'spate']
        id_senzori = [id_senzor_fata, id_senzor_stanga, id_senzor_dreapta, id_senzor_spate]
        for senzor in id_senzori:
            sim.simxReadProximitySensor(client_id, senzor, sim.simx_opmode_streaming)
        time.sleep(0.5)
        eroare, pozitie = sim.simxGetObjectPosition(client_id, id_robot, -1, sim.simx_opmode_blocking)
        if eroare == sim.simx_return_ok:
            print(f"Poziție inițială robot: x={pozitie[0]:.2f}, y={pozitie[1]:.2f}, z={pozitie[2]:.2f}")
        merge_camera = True
        thread_camera = threading.Thread(target=afiseaza_imagine_camera, daemon=True)
        thread_camera.start()
        print("Navigatie autonoma")
        viteza = 2.0
        durata_totala = 300
        start_time = time.time()
        while time.time() - start_time < durata_totala and merge_camera:
            distante = citire_senzori()
            try:
                viteza_simulata = viteza_curenta + random.uniform(-0.1, 0.1) if viteza_curenta > 0 else 0.0
                telemetrie = {
                    "type": "telemetry",
                    "payload": {
                        "sensors": distante,
                        "battery": 85, 
                        "velocity": viteza_simulata,
                        "timestamp": time.time(),
                        "startTime": start_time
                    }
                }
                network_client.send_data(telemetrie)
            except Exception as e:
                pass 

            if animal_in_proces:
                time.sleep(0.1)
                continue     
                
            eroare, pozitie = sim.simxGetObjectPosition(client_id, id_robot, -1, sim.simx_opmode_blocking)
            if eroare == sim.simx_return_ok and pozitie is not None and not any(map(math.isnan, pozitie)):
                if verificare_limite(pozitie, viteza=viteza):
                    continue
                celula = pozitie_pe_grid(pozitie[0], pozitie[1])
                if celula is None:
                    continue    
                if celula not in vizitat:
                    vizitat.add(celula)
                    print(f"Robotul a ajuns in celula {celula}")
                    if len(vizitat) >= 3600:
                        print("Toate celulele au fost vizitate.")
                        break
            if not evitare_obstacole(distante, viteza=viteza, prag=0.8):
                if not animal_in_proces:  
                    miscare_inainte(viteza)
            time.sleep(0.1)
    
    except KeyboardInterrupt:
        print("Oprit de utilizator")    
    
    finally:
        merge_camera = False
        stop()
        time.sleep(2)
        
        if thread_camera.is_alive():
            thread_camera.join(timeout=2.0)
        
        print(f"\nCelule vizitate de robot: {len(vizitat)}")
        print(f"Animale hrănite: {len(animale_vizitate)}")
        
        sim.simxFinish(client_id)
        print("Conexiune inchisa")
else:
    print("Conexiune esuata")