import requests



ENDPOINT_PACIENTES = "http://localhost:8000"
ENDPOINT_USUARIOS = "http://localhost:8003"

def refresh_users():
	"""Llama DELETE /personal/refresh_users para forzar recarga/refresh de usuarios."""
	return requests.delete(ENDPOINT_USUARIOS + "/personal/refresh_users")

# Llamadas a la API
def create_paciente(payload):
    return requests.post(ENDPOINT_PACIENTES + "/pacientes/", json=payload, headers=HEADERS_SECRETARIA)

def get_paciente(id_usuario):
    return requests.get(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}", headers=HEADERS_SECRETARIA)

def update_paciente(id_usuario, payload):
    return requests.put(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}", json=payload, headers=HEADERS_SECRETARIA)

def list_pacientes():
    return requests.get(ENDPOINT_PACIENTES + "/pacientes", headers=HEADERS_SECRETARIA)

def delete_paciente(id_usuario, payload):
    return requests.delete(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}", json=payload, headers=HEADERS_SECRETARIA)


# Additional helpers for remaining endpoints
def get_items_dm():
    return requests.get(ENDPOINT_PACIENTES + "/items-dm", headers=HEADERS_PSIQUIATRA)

def list_evoluciones(id_usuario):
    return requests.get(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}/evoluciones", headers=HEADERS_PSIQUIATRA)

def list_sots(id_usuario):
    return requests.get(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}/sots", headers=HEADERS_PSIQUIATRA)

def post_paciente_foto(id_usuario, body):
    return requests.post(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}/foto", body, headers=HEADERS_SECRETARIA)

def get_paciente_foto(id_usuario):
    return requests.get(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}/foto", headers=HEADERS_SECRETARIA)

def delete_paciente_foto(id_usuario):
    return requests.delete(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}/foto", headers=HEADERS_SECRETARIA)



# Tests pacientes
def test_can_create_paciente():
    payload =  {
        "dni": "112312123123",
        "nombre": "Alejandra",
        "apellido": "Cechich",
        "genero": "mujer",
        "obra_social": "sosunc",
        "fecha_nacimiento": "2005-11-19",
        "fecha_ingreso": "2023-11-19",
        "domicilio": "calle falsa 123",
        "telefono": "2994123456",
        "email": "omegalol@gmail.com"
    }
    response_create_paciente = create_paciente(payload)
   
    print(response_create_paciente.text)  # para ver más info en caso de error
    assert response_create_paciente.status_code == 201
    data_create_paciente = response_create_paciente.json()
    print(data_create_paciente)

    id_usuario_paciente = data_create_paciente['id_usuario']

    response_get_paciente = get_paciente(id_usuario_paciente)
    assert response_get_paciente.status_code == 200
    data_get_paciente = response_get_paciente.json()
    assert data_get_paciente['id_usuario'] == id_usuario_paciente
    assert data_get_paciente['dni'] == payload['dni']
    assert data_get_paciente['nombre'] == payload['nombre']
    assert data_get_paciente['apellido'] == payload['apellido']
    assert data_get_paciente['genero'] == payload['genero']
    assert data_get_paciente['obra_social'] == payload['obra_social']
    assert data_get_paciente['fecha_nacimiento'] == payload['fecha_nacimiento']
    assert data_get_paciente['fecha_ingreso'] == payload['fecha_ingreso']
    assert data_get_paciente['domicilio'] == payload['domicilio']
    assert data_get_paciente['email'] == payload['email']
    assert data_get_paciente['telefono'] == payload['telefono']

    refresh_users()  # Refrescar usuarios para limpiar el paciente creado

def test_cant_create_paciente_with_existing_dni():
    """Intentar crear un paciente con un DNI ya existente debe devolver 400."""
    #Primero creamos un paciente
    # Payload del paciente
    payload =  {
        "dni": "22334455",
        "nombre": "Carlos",
        "apellido": "Lopez",
        "genero": "hombre",
        "obra_social": "galeno",
        "fecha_nacimiento": "1985-07-20",
        "fecha_ingreso": "2021-03-15",
        "domicilio": "calle inventada 789",
        "telefono": "01155667788",
        "email": "asd@example.com"
    }
    response_create_paciente = create_paciente(payload)
    print(response_create_paciente.text)  # para ver más info en caso de error
    assert response_create_paciente.status_code == 201

    # Ahora intentamos crear otro paciente con el mismo DNI
    response_create_duplicate = create_paciente(payload)
    print(response_create_duplicate.text)  # para ver más info en caso de error
    assert response_create_duplicate.status_code == 400


def test_can_get_paciente():
    id_usuario = 8  # Asegurarse de que este ID exista en la base de datos de prueba
    response = get_paciente(id_usuario)
    print(response.text)  # para ver más info en caso de error
    assert response.status_code == 200
    data = response.json()
    assert data['id_usuario'] == id_usuario
    assert 'dni' in data

def test_cant_get_nonexistent_paciente():
    """GET /pacientes/{id_usuario} con id_usuario inexistente debe devolver 404."""
    id_usuario = -99  # ID que no existe
    response = get_paciente(id_usuario)
    print(response.text)  # para ver más info en caso de error
    assert response.status_code == 404

def test_can_update_paciente():
    payload = {
        "dni": "95432321",
        "nombre": "Agustina",
        "apellido": "Buccela",
        "genero": "mujer",
        "obra_social": "swiss medical",
        "fecha_nacimiento": "2005-11-19",
        "fecha_ingreso": "2023-11-19",
        "domicilio": "las grutas 123",
        "email": "hola@gmail.com",
        "telefono": "022328323",
    }
    response_create_paciente = create_paciente(payload)
    id_usuario_paciente = response_create_paciente.json()['id_usuario']

    new_payload = {
        "dni": "95432321",
        "nombre": "Agustina Maria",
        "apellido": "Buccela Lopez",
        "genero": "otro",
        "obra_social": "swiss medical plus",
        "fecha_nacimiento": "2010-12-25",
        "fecha_ingreso": "2022-10-10",
        "domicilio": "avenida siempre viva 742",
        "email": "aqwe@gmail.com",
        "telefono": "022328999",
    }

    response_update_paciente = update_paciente(id_usuario_paciente, new_payload)
    assert response_update_paciente.status_code == 200
    data_update_paciente = response_update_paciente.json()
    assert data_update_paciente['id_usuario'] == id_usuario_paciente
    assert data_update_paciente['dni'] == payload['dni'] # El DNI no se puede cambiar
    assert data_update_paciente['nombre'] == new_payload['nombre']
    assert data_update_paciente['apellido'] == new_payload['apellido']
    assert data_update_paciente['genero'] == new_payload['genero']
    assert data_update_paciente['obra_social'] == new_payload['obra_social']
    assert data_update_paciente['fecha_nacimiento'] == new_payload['fecha_nacimiento']
    assert data_update_paciente['fecha_ingreso'] == new_payload['fecha_ingreso']
    assert data_update_paciente['domicilio'] == new_payload['domicilio']
    assert data_update_paciente['email'] == new_payload['email']
    assert data_update_paciente['telefono'] == new_payload['telefono']

def test_cant_update_nonexistent_paciente():
    """Intentar actualizar un paciente inexistente debe devolver 404."""
    id_usuario = -99  # ID que no existe
    new_payload = {
        "dni": "00000000",
        "nombre": "No Existe",
        "apellido": "Paciente",
        "genero": "otro",
        "obra_social": "ninguna",
        "fecha_nacimiento": "1990-01-01",
        "fecha_ingreso": "2020-01-01",
        "domicilio": "calle inexistente 0",
        "email": "asd@example.com"
    }
    response_update_paciente = update_paciente(id_usuario, new_payload)
    print(response_update_paciente.text)  # para ver más info en caso de error
    assert response_update_paciente.status_code == 404

def test_can_list_pacientes(): #se podria mejorar testeando los parametros de busqueda (solo testea que devuelve cantidad correcta)
    response = list_pacientes()
   
    print(response.text)  # para ver más info en caso de error
    assert response.status_code == 200
    data = response.json()

    n = 4 # cambiar por la cantidad de pacientes creados en la base de datos de prueba

    pacientes = data['pacientes']
    assert len(pacientes) > n
    print (data)

def test_can_delete_paciente():
    payload =  {
        "dni": "99887766",
        "nombre": "Juan",
        "apellido": "Perez",
        "genero": "hombre",
        "obra_social": "osde",
        "fecha_nacimiento": "1990-05-15",
        "fecha_ingreso": "2020-01-10",
        "domicilio": "calle verdadera 456",
        "telefono": "01122334455",
        "email": "juan.perez@example.com"
    }
    response_create_paciente = create_paciente(payload)
    id_usuario_paciente = response_create_paciente.json()['id_usuario']

    delete_payload = {
        "motivo": "salgo volando, por la ventana"
    }

    response_delete_paciente = delete_paciente(id_usuario_paciente, delete_payload)
    print(response_delete_paciente.text)  # para ver más info en caso de error
    assert response_delete_paciente.status_code == 200

    get_response_after_delete = get_paciente(id_usuario_paciente)
    assert get_response_after_delete.status_code == 200
    data_after_delete = get_response_after_delete.json()
    assert data_after_delete['baja']['motivo'] == delete_payload['motivo']

def test_cant_delete_nonexistent_paciente():
    """Intentar eliminar un paciente inexistente debe devolver 404."""
    id_usuario = -99  # ID que no existe
    delete_payload = {
        "motivo": "no existo"
    }
    response_delete_paciente = delete_paciente(id_usuario, delete_payload)
    print(response_delete_paciente.text)  # para ver más info en caso de error
    assert response_delete_paciente.status_code == 400

# Evoluciones helpers
def create_evolucion(id_usuario, payload):
    return requests.post(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}/evoluciones/", json=payload, headers=HEADERS_PSIQUIATRA)

def get_evolucion(id_usuario, id_evolucion):
    return requests.get(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}/evoluciones/{id_evolucion}", headers=HEADERS_PSIQUIATRA)

def create_evoluciones_grupales(payload):
    return requests.post(ENDPOINT_PACIENTES + "/evoluciones/grupal", json=payload, headers=HEADERS_PSIQUIATRA)

def patch_marcar_erronea(id_usuario, id_evolucion, payload):
    return requests.patch(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}/evoluciones/{id_evolucion}/marcar-erronea", json=payload, headers=HEADERS_PSIQUIATRA)

# Tests evoluciones

def test_can_get_items_dm():
    #Verifica que GET /items-dm devuelva 200 y una lista en el body
    response = get_items_dm()
    print(response.text)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
#------------------------
def test_can_create_evolucion():
    id_usuario = 9  # Asegurarse de que este ID exista en la base de datos de prueba
    payload =  {
        "observacion": "El paciente presenta mejoría significativa.",
        "id_turno": 0,
        "id_item1": "E1-001",
        "id_item2": "E2-002",
        "id_item3": "E3-001",
        "id_item4": "E4-001",
        "id_item5": "E5-002"
    }
    response_create_evolucion = create_evolucion(id_usuario, payload)
   
    print(response_create_evolucion.text)  # para ver más info en caso de error
    assert response_create_evolucion.status_code == 201
    data_create_evolucion = response_create_evolucion.json()
    print(data_create_evolucion)

    id_evolucion = data_create_evolucion['id_evolucion']

    response_get_evolucion = get_evolucion(id_usuario, id_evolucion)
    assert response_get_evolucion.status_code == 200
    data_get_evolucion = response_get_evolucion.json()

    # Verificaciones generales
    assert data_get_evolucion['id_evolucion'] == id_evolucion
    assert data_get_evolucion['id_usuario'] == id_usuario
    assert data_get_evolucion['tipo'] == 'individual'
    assert data_get_evolucion['observacion'] == payload['observacion']
    assert data_get_evolucion['id_turno'] == payload['id_turno']

    # Verificar diagnostico multiaxial presente y estructura
    diagnostico = data_get_evolucion.get('diagnostico')
    assert diagnostico is not None, "Se esperaba un diagnóstico multiaxial en la respuesta"

    # id del diagnostico creado
    assert isinstance(diagnostico.get('id_diagnostico_multiaxial'), int)

    # Verificar items del diagnóstico coinciden con el payload
    assert diagnostico['item_1']['id_item'] == payload['id_item1']
    assert diagnostico['item_2']['id_item'] == payload['id_item2']
    assert diagnostico['item_3']['id_item'] == payload['id_item3']
    assert diagnostico['item_4']['id_item'] == payload['id_item4']
    assert diagnostico['item_5']['id_item'] == payload['id_item5']

    # Cada item tiene eje y descripcion
    for i in range(1,6):
        it = diagnostico[f'item_{i}']
        assert 'eje' in it and isinstance(it['eje'], int)
        assert 'descripcion' in it and isinstance(it['descripcion'], str) and len(it['descripcion']) > 0

    # Verificar campos de creación (creacion) existen y tienen formato esperado
    creacion = data_get_evolucion.get('creacion')
    assert creacion is not None
    assert 'nombre' in creacion and 'id_usuario' in creacion and 'fecha' in creacion

    # Erronea debe ser null
    assert data_get_evolucion.get('erronea') is None

def test_cant_create_evolucion_with_bad_item():
    """Intentar crear una evolución con un item inválido debe devolver 400."""
    id_usuario = 9
    payload =  {
        "observacion": "El paciente presenta mejoría significativa.",
        "id_turno": 0,
        "id_item1": "un-item-que-no-existe",
        "id_item2": "E2-002",
        "id_item3": "E3-001",
        "id_item4": "E4-001",
        "id_item5": "E5-002"
    }

    resp = create_evolucion(id_usuario, payload)
    print(resp.text)
    assert resp.status_code == 400

def test_cant_create_evolucion_with_wrong_eje():
    """Intentar crear una evolución con items que comparten eje incorrectamente debe devolver 400."""
    id_usuario = 9
    payload =  {
        "observacion": "Evolucion para marcar como erronea",
        "id_turno": 0,
        "id_item1": "E1-001",
        "id_item2": "E1-002",
        "id_item3": "E3-001",
        "id_item4": "E4-001",
        "id_item5": "E5-002"
    }

    resp = create_evolucion(id_usuario, payload)
    print(resp.text)
    assert resp.status_code == 400

def test_cant_create_evolucion_with_missing_eje():
    """Intentar crear una evolución con un eje faltante (solo 4 items) debe devolver 400."""
    id_usuario = 9
    payload = {
        "observacion": "string",
        "id_item1": "E1-001",
        "id_item2": "E2-001",
        "id_item3": "E3-001",
        "id_item4": "E4-001"
    }

    resp = create_evolucion(id_usuario, payload)
    print(resp.text)
    assert resp.status_code == 400

def test_cant_create_evolucion_without_observacion():
    """Intentar crear una evolución sin la clave 'observacion' debe devolver 400."""
    id_usuario = 9
    payload = {
        "id_turno": 0,
        "id_item1": "E1-001",
        "id_item2": "E2-002",
        "id_item3": "E3-001",
        "id_item4": "E4-001",
        "id_item5": "E5-002"
    }

    resp = create_evolucion(id_usuario, payload)
    print(resp.text)
    assert resp.status_code == 422
#------------------------
def test_can_list_evoluciones():
    id_usuario = 9
    response = list_evoluciones(id_usuario)
    print(response.text)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_cant_list_evoluciones_wrong_patient():
    id_usuario = -99
    response = list_evoluciones(id_usuario)
    print(response.text)
    assert response.status_code == 404

def test_cant_get_evolucion_wrong_patient():
    """GET /pacientes/{id_usuario}/evoluciones/{id_evolucion} para paciente inexistente debe devolver 404 con detalle."""
    id_usuario = -99
    id_evolucion = 1
    resp = get_evolucion(id_usuario, id_evolucion)
    print(resp.text)
    assert resp.status_code == 404
    data = resp.json()
    assert 'detail' in data
    assert 'Paciente' in str(data['detail'])

def test_cant_get_wrong_evolucion_from_patient():
    """GET /pacientes/9/evoluciones/-999 debe devolver 404 (evolución inexistente para paciente existente)."""
    id_usuario = 9
    id_evolucion = -999
    resp = get_evolucion(id_usuario, id_evolucion)
    print(resp.text)
    assert resp.status_code == 404


#------------------------
def test_can_marcar_evolucion_erronea():
    id_usuario = 9
    # Crear una evolución primero
    payload = {
        "observacion": "Evolucion para marcar como erronea",
        "id_turno": 0,
        "id_item1": "E1-001",
        "id_item2": "E2-002",
        "id_item3": "E3-001",
        "id_item4": "E4-001",
        "id_item5": "E5-002"
    }
    resp_create = create_evolucion(id_usuario, payload)
    assert resp_create.status_code == 201
    id_evolucion = resp_create.json()['id_evolucion']

    # Marcar como erronea
    motivo_payload = {"motivo_erronea": "prueba motivo"}
    resp_patch = patch_marcar_erronea(id_usuario, id_evolucion, motivo_payload)
    print(resp_patch.text)
    assert resp_patch.status_code == 200

    # Obtener evolución y verificar motivo
    resp_get = get_evolucion(id_usuario, id_evolucion)
    assert resp_get.status_code == 200
    data = resp_get.json()
    assert data.get('erronea') is not None
    assert data['erronea'].get('motivo') == motivo_payload['motivo_erronea']

def test_cant_marcar_evolucion_erronea_twice():
    """Intentar marcar una misma evolución como errónea dos veces debe devolver 400 en la segunda petición."""
    id_usuario = 9
    # Crear una evolución primero
    payload = {
        "observacion": "Evolucion para marcar como erronea",
        "id_turno": 0,
        "id_item1": "E1-001",
        "id_item2": "E2-002",
        "id_item3": "E3-001",
        "id_item4": "E4-001",
        "id_item5": "E5-002"
    }
    resp_create = create_evolucion(id_usuario, payload)
    assert resp_create.status_code == 201
    id_evolucion = resp_create.json()['id_evolucion']

    # Primera marcación como errónea -> OK
    motivo_payload = {"motivo_erronea": "prueba motivo"}
    resp_patch1 = patch_marcar_erronea(id_usuario, id_evolucion, motivo_payload)
    print(resp_patch1.text)
    assert resp_patch1.status_code == 200

    # Segunda marcación sobre la misma evolución -> debe devolver 400
    resp_patch2 = patch_marcar_erronea(id_usuario, id_evolucion, motivo_payload)
    print(resp_patch2.text)
    assert resp_patch2.status_code == 400
#------------------------
def test_cant_create_evoluciones_grupales_without_observacion():
    """Intentar crear evoluciones grupales sin el campo 'observacion' debe devolver 422."""
    payload = {
        "ids_usuario": [9, 8]
        # 'observacion' intencionalmente omitida
    }

    resp = create_evoluciones_grupales(payload)
    print(resp.text)
    assert resp.status_code == 422

def test_can_create_evoluciones_grupales():
    """Crea evoluciones grupales, verifica la estructura
    de la respuesta (creadas/fallidas), que cada creada contiene campos
    esperados, y luego hace GET puntual por cada evolución creada."""
    # Pedimos crear evoluciones para varios usuarios; ajustar IDs según la DB de pruebas
    requested_ids = [9, 8]
    payload = {
        "ids_usuario": requested_ids,
        "observacion": "Evolucion grupal de prueba combinada"
    }

    resp = create_evoluciones_grupales(payload)
    print(resp.text)
    assert resp.status_code == 201
    data = resp.json()

    # Verificar formato general
    assert 'creadas' in data and isinstance(data['creadas'], list)
    assert 'fallidas' in data and isinstance(data['fallidas'], list)

    # Verificar que todos los ids solicitados aparecen en creadas o fallidas
    creados_ids = {c['id_usuario'] for c in data['creadas'] if 'id_usuario' in c}
    fallidos_ids = {f['id_usuario'] for f in data['fallidas'] if 'id_usuario' in f}
    assert creados_ids.union(fallidos_ids).issuperset(set(requested_ids))

    # Para cada creada, verificar campos esperados y luego hacer GET puntual
    expected_keys = {
        'observacion', 'id_turno', 'tipo', 'creada_por', 'id_evolucion',
        'id_usuario', 'fecha_creacion', 'marcada_erronea', 'motivo_erronea',
        'marcada_erronea_por', 'id_diagnostico_multiaxial'
    }

    for creada in data['creadas']:
        assert expected_keys.issubset(set(creada.keys()))

        id_usuario = creada['id_usuario']
        id_evolucion = creada['id_evolucion']

        # Hacer GET puntual y verificar que exista
        resp_get = get_evolucion(id_usuario, id_evolucion)
        print(resp_get.text)
        assert resp_get.status_code == 200
        detalle = resp_get.json()
        assert detalle['id_evolucion'] == id_evolucion
        assert detalle['id_usuario'] == id_usuario
    
#SOT helpers

def create_sot(id_usuario, payload):
    return requests.post(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}/sots", json=payload, headers=HEADERS_PSIQUIATRA)

def update_sot(id_usuario, id_sot, payload):
    return requests.put(ENDPOINT_PACIENTES + f"/pacientes/{id_usuario}/sots/{id_sot}", json=payload, headers=HEADERS_PSIQUIATRA)

#Tests SOT

def test_can_create_sot():
    #POST /pacientes/{id_usuario}/sots debe devolver 201 y la estructura esperada
    id_usuario = 9
    payload = {
        "motivo": "string",
        "fecha": "2025-11-21",
        "hora": "17:00:34.246Z",
        "observacion": "string"
    }

    resp = create_sot(id_usuario, payload)
    print(resp.text)
    assert resp.status_code == 201
    data = resp.json()

    # Campos básicos que deben coincidir con el payload
    assert data.get('motivo') == payload['motivo']
    assert data.get('observacion') == payload['observacion']
    # fecha y hora suelen llegar en formato ISO; verificar presencia
    assert 'fecha' in data
    assert 'hora' in data

    # Identificador retornado
    assert isinstance(data.get('id_sot'), int)

    # Campos de auditoría presentes en la respuesta del POST
    assert isinstance(data.get('creado_por'), int)
    assert 'fecha_creacion' in data
    assert 'motivo_modificado' in data
    assert 'modificado_por' in data
    assert 'fecha_modificacion' in data
    assert isinstance(data.get('modificado'), bool)

    # Ahora hacer GET al listado de SOTs del paciente y verificar que el SOT creado está presente
    resp_list = list_sots(id_usuario)
    print(resp_list.text)
    assert resp_list.status_code == 200
    sots = resp_list.json()
    # Buscar el SOT recién creado por id_sot
    encontrado = next((s for s in sots if s.get('id_sot') == data.get('id_sot')), None)
    assert encontrado is not None, "SOT creado no encontrado en el listado del paciente"

    # Verificar campos del SOT listado coinciden con los del POST/respuesta
    assert encontrado.get('motivo') == data.get('motivo')
    assert encontrado.get('observacion') == data.get('observacion')
    assert encontrado.get('id_sot') == data.get('id_sot')
    assert encontrado.get('id_usuario_paciente') == id_usuario

    # Verificar campos de auditoría según el formato de listado: 'creacion' y 'modificacion'
    assert 'creacion' in encontrado and isinstance(encontrado['creacion'], dict)
    creacion = encontrado['creacion']
    assert 'nombre' in creacion and 'id_usuario' in creacion and 'fecha' in creacion
    # En el listado 'modificacion' puede ser null
    assert encontrado.get('modificacion') is None or isinstance(encontrado.get('modificacion'), dict)

def test_cant_create_sot_wrong_patient():
    """POST /pacientes/-99/sots debe devolver 400 cuando el paciente no existe."""
    id_usuario = -99
    payload = {
        "motivo": "prueba motivo",
        "fecha": "2025-11-21",
        "hora": "12:00:00",
        "observacion": "creando SOT para paciente inexistente"
    }

    resp = create_sot(id_usuario, payload)
    print(resp.text)
    assert resp.status_code == 400

def test_cant_create_sot_missing_data():
   
    id_usuario = 9
    payload = { #falta el campo motivo
        "fecha": "2025-11-21",
        "hora": "12:00:00",
        "observacion": "creando SOT para paciente inexistente"
    }

    resp = create_sot(id_usuario, payload)
    print(resp.text)
    assert resp.status_code == 422

def test_cant_get_sot_wrong_patient():
    """GET /pacientes/{id_usuario}/sots para paciente inexistente debe devolver 404."""
    id_usuario = -99
    resp = list_sots(id_usuario)
    print(resp.text)
    assert resp.status_code == 404

def test_can_update_sot():
    """Crea un SOT, obtiene su id y luego hace PUT /pacientes/{id_usuario}/sots/{id_sot} para actualizarlo y validar la respuesta"""
    id_usuario = 9
    # Primero creamos un SOT para obtener un id real
    create_payload = {
        "motivo": "string",
        "fecha": "2025-11-21",
        "hora": "17:13:11.868Z",
        "observacion": "string"
    }

    resp_create = create_sot(id_usuario, create_payload)
    print(resp_create.text)
    assert resp_create.status_code == 201
    data_create = resp_create.json()
    id_sot = data_create.get('id_sot')
    assert isinstance(id_sot, int)

    # Ahora actualizamos el SOT recién creado
    payload = {
        "motivo": "string",
        "observacion": "string",
        "fecha": "2025-11-21",
        "hora": "17:13:11.868Z",
        "motivo_modificado": "string"
    }

    resp = update_sot(id_usuario, id_sot, payload)
    print(resp.text)
    assert resp.status_code == 200
    data = resp.json()

    # Campos principales
    assert data.get('motivo') == payload['motivo']
    assert data.get('observacion') == payload['observacion']
    assert data.get('fecha') == payload['fecha']
    # hora en la respuesta puede venir con micros; comprobar prefijo
    assert 'hora' in data and str(data['hora']).startswith('17:13:11.868')
    assert data.get('id_sot') == id_sot
    assert data.get('id_usuario_paciente') == id_usuario

    # Verificar campos de auditoría y modificación
    assert isinstance(data.get('creado_por'), int)
    assert 'fecha_creacion' in data
    assert data.get('motivo_modificado') == payload['motivo_modificado']
    assert isinstance(data.get('modificado_por'), int)
    assert 'fecha_modificacion' in data
    assert data.get('modificado') is True

    # Ahora hacer GET del listado de SOTs para el paciente y verificar el SOT actualizado
    resp_list = list_sots(id_usuario)
    print(resp_list.text)
    assert resp_list.status_code == 200
    sots = resp_list.json()

    encontrado = next((s for s in sots if s.get('id_sot') == id_sot), None)
    assert encontrado is not None, "SOT actualizado no encontrado en listado"

    # Verificar campos principales del SOT obtenido por GET
    assert encontrado.get('motivo') == payload['motivo']
    assert encontrado.get('observacion') == payload['observacion']
    assert encontrado.get('fecha') == payload['fecha']
    assert 'hora' in encontrado and str(encontrado['hora']).startswith('17:13:11.868')
    assert encontrado.get('id_sot') == id_sot
    assert encontrado.get('id_usuario_paciente') == id_usuario

    # Verificar estructura de auditoría: creacion y modificacion
    assert 'creacion' in encontrado and isinstance(encontrado['creacion'], dict)
    cre = encontrado['creacion']
    assert 'nombre' in cre and 'id_usuario' in cre and 'fecha' in cre

    # modificacion debe ser un dict con motivo igual al enviado
    assert encontrado.get('modificacion') is not None and isinstance(encontrado['modificacion'], dict)
    mod = encontrado['modificacion']
    assert mod.get('motivo') == payload['motivo_modificado']
    assert 'nombre' in mod and 'id_usuario' in mod and 'fecha' in mod

def test_cant_update_sot_wrong_patient():
    id_usuario = 9
     # Primero creamos un SOT para obtener un id real
    create_payload = {
        "motivo": "string",
        "fecha": "2025-11-21",
        "hora": "17:13:11.868Z",
        "observacion": "string"
    }

    resp_create = create_sot(id_usuario, create_payload)
    print(resp_create.text)
    assert resp_create.status_code == 201
    data_create = resp_create.json()
    id_sot = data_create.get('id_sot')
    assert isinstance(id_sot, int)

    id_usuario = -99
    payload = {
        "motivo": "string",
        "observacion": "string",
        "fecha": "2025-11-21",
        "hora": "17:13:11.868Z",
        "motivo_modificado": "string"
    }

    resp = update_sot(id_usuario, id_sot, payload)
    print(resp.text)
    assert resp.status_code == 404

def test_cant_update_wrong_sot():
    id_usuario = 9
    id_sot = -99
    payload = {
        "motivo": "string",
        "observacion": "string",
        "fecha": "2025-11-21",
        "hora": "17:13:11.868Z",
        "motivo_modificado": "string"
    }

    resp = update_sot(id_usuario, id_sot, payload)
    print(resp.text)
    assert resp.status_code == 404

#------------------------
"""
def test_can_post_paciente_foto():
    id_usuario = 9  # Asegurarse de que este ID exista en la base de datos de prueba
    foto_url = "http://example.com/foto.jpg"
    response = post_paciente_foto(id_usuario, "\""+ foto_url + "\"") # Atención al formato del body
    print(response.text)  # para ver más info en caso de error
    assert response.status_code == 200
    data = response.json()
    assert data['foto_url'] == foto_url

def test_can_get_paciente_foto():
    id_usuario = 9  # Asegurarse de que este ID exista en la base de datos de prueba
    foto_url = "http://example.com/foto.jpg"
    response = get_paciente_foto(id_usuario)
    print(response.text)  # para ver más info en caso de error
    assert response.status_code == 200
    data = response.json()
    assert data['foto_url'] == foto_url

def test_can_delete_paciente_foto():
    id_usuario = 9  # Asegurarse de que este ID exista en la base de datos de prueba
    response = delete_paciente_foto(id_usuario)
    print(response.text)  # para ver más info en caso de error
    assert response.status_code == 200
    data = response.json()
    assert data['detail'] == "Foto eliminada"

    #get_response_after_delete = requests.get(ENDPOINT + f"/pacientes/{id_usuario}/foto")
    #print(get_response_after_delete.text)  # para ver más info en caso de error
    #assert get_response_after_delete.status_code == 200
    #data_after_delete = get_response_after_delete.json()
    #assert data_after_delete['foto_url'] is None

"""
#------------------------


def test_limpiar_usuarios():
    """Limpia los usuarios creados en los tests."""
    response = refresh_users()
    assert response.status_code == 200