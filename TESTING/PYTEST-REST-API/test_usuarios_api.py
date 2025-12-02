import requests


ENDPOINT = "http://localhost:8003"


#Helpers

def create_personal(payload):
	return requests.post(ENDPOINT + "/personal/", json=payload, headers=HEADERS_DIRECTOR)

def get_personal(id_usuario):
	return requests.get(ENDPOINT + f"/personal/{id_usuario}", headers=HEADERS_DIRECTOR)

def delete_personal(id_usuario, payload):
	return requests.delete(ENDPOINT + f"/personal/{id_usuario}", json=payload, headers=HEADERS_DIRECTOR)

def patch_personal(id_usuario, payload):
	return requests.patch(ENDPOINT + f"/personal/{id_usuario}", json=payload, headers=HEADERS_DIRECTOR)

#Tests

def test_health():
	"""GET /health debe devolver 200 y {"status":"ok"} """
	resp = requests.get(ENDPOINT + "/health")
	print(resp.text)
	assert resp.status_code == 200
	data = resp.json()
	assert isinstance(data, dict)
	assert data.get('status') == 'ok'


def test_cant_get_paciente_wrong_id():
	"""GET /personal/{id} con id inexistente debe devolver 404."""
	resp = get_personal(-99)
	print('GET /personal/-99 ->', resp.status_code, resp.text)
	assert resp.status_code == 404

def test_can_create_personal():
	#POST /personal/ debe devolver 201
	payload = {
		"nombre": "Osvaldo",
		"apellido": "Yasdas",
		"tipo": "psiquiatra",
		"matricula": "PAC123",
		"dni": "29911234",
		"genero": "hombre",
		"fecha_nacimiento": "1991-11-27",
		"telefono": "2995123456",
		"email": "osasdas@gmail.com"
	}

	resp = create_personal(payload)
	print(resp.text)
	assert resp.status_code == 201
	data = resp.json()
	assert isinstance(data, dict)
	assert isinstance(data.get('id_usuario'), int)

	# Ahora obtener el personal creado y verificar formato y campos
	id_usuario_creado = data.get('id_usuario')
	resp_get = get_personal(id_usuario_creado)
	print(resp_get.text)
	assert resp_get.status_code == 200
	p = resp_get.json()

	# Campos esperados básicos (coinciden con el payload)
	assert p.get('id_usuario') == id_usuario_creado
	# Legajo con formato PSQ-<4 digits>
	assert isinstance(p.get('legajo'), str)
	assert p.get('tipo') == payload['tipo']
	assert p.get('dni') == payload['dni']
	assert p.get('nombre') == payload['nombre']
	assert p.get('apellido') == payload['apellido']
	assert p.get('matricula') == payload['matricula']
	assert p.get('genero') == payload['genero']
	assert p.get('fecha_nacimiento') == payload['fecha_nacimiento']
	assert p.get('email') == payload['email']
	assert p.get('telefono') == payload['telefono']
	# foto_url puede ser null
	assert 'foto_url' in p

	# Alta debe ser un dict con fecha e id_usuario
	assert 'alta' in p and isinstance(p['alta'], dict)
	assert 'fecha' in p['alta'] and 'id_usuario' in p['alta']

	# Baja debe ser un object con fecha,id_usuario,motivo (puede ser nulls)
	assert 'baja' in p and isinstance(p['baja'], dict)
	assert set(p['baja'].keys()) >= {'fecha', 'id_usuario', 'motivo'}

	# Edicion debe ser un object con fecha e id_usuario (puede ser nulls)
	assert 'edicion' in p and isinstance(p['edicion'], dict)
	assert set(p['edicion'].keys()) >= {'fecha', 'id_usuario'}

def test_cant_create_personal_missing_fields():
	payload = {
		"nombre": "Osvaldo",
		"apellido": "Yasdas",
		"matricula": "PAC123",
		"dni": "29911234",# falta "tipo"
		"genero": "hombre",
		"fecha_nacimiento": "1991-11-27",
		"telefono": "2995123456",
		"email": "osasdas@gmail.com"
	}

	resp = create_personal(payload)
	print(resp.text)
	assert resp.status_code == 422

def test_cant_create_personal_duplicate_dni():
	# Primero crear un personal con un DNI
	payload = {
		"nombre": "Alvaro",
		"apellido": "Yasdas",
		"tipo": "psiquiatra",
		"matricula": "PAC1234",
		"dni": "29911333",
		"genero": "hombre",
		"fecha_nacimiento": "1991-11-27",
		"telefono": "234995123456",
		"email": "alvaro@example.com"
	}

	resp = create_personal(payload)
	print(resp.text)
	assert resp.status_code == 201

	# Ahora intentar crear otro con el mismo DNI
	resp_dup = create_personal(payload)
	print(resp_dup.text)
	assert resp_dup.status_code == 400

def test_can_get_personal_list():
	#GET /personal debe devolver 200 y una lista
	resp = requests.get(ENDPOINT + "/personal", headers=HEADERS_DIRECTOR)
	print(resp.text)
	assert resp.status_code == 200
	data = resp.json()
	assert isinstance(data, list)

def test_can_delete_usuario():
	# Crea un usuario, lo elimina y verifica motivo en el GET
	payload = {
		"nombre": "Martin_del",
		"apellido": "Test",
		"tipo": "psiquiatra",
		"matricula": "PACDEL",
		"dni": "99999999",
		"genero": "hombre",
		"fecha_nacimiento": "1990-01-01",
		"telefono": "2990000000",
		"email": "delete_test@example.com"
	}

	resp_create = create_personal(payload)
	print(resp_create.text)
	assert resp_create.status_code == 201
	data_create = resp_create.json()
	assert isinstance(data_create.get('id_usuario'), int)
	id_usuario = data_create.get('id_usuario')

	# borrar usuario
	motivo_payload = {"motivo": "Dado de Baja por renuncia"}
	resp_del = delete_personal(id_usuario, motivo_payload)
	print(resp_del.status_code, resp_del.text)
	assert resp_del.status_code == 204

	# Obtener usuario y verificar motivo en 'baja'
	resp_get = get_personal(id_usuario)
	print(resp_get.text)
	assert resp_get.status_code == 200
	p = resp_get.json()
	assert 'baja' in p and isinstance(p['baja'], dict)
	assert p['baja'].get('motivo') == motivo_payload['motivo']

def test_cant_delete_usuario_wrong_id():
	# Intentar borrar un usuario inexistente
	motivo_payload = {"motivo": "Intento de baja en usuario inexistente"}
	resp_del = delete_personal(-99, motivo_payload)
	print(resp_del.status_code, resp_del.text)
	assert resp_del.status_code == 404

def test_cant_delete_usuario_no_motivo():
	id_usuario = 2  # Asumimos que este usuario existe
		# borrar usuario
	motivo_payload = {} # Sin motivo
	resp_del = delete_personal(id_usuario, motivo_payload)
	print(resp_del.status_code, resp_del.text)
	assert resp_del.status_code == 422

def test_can_patch_personal():
	"""Crea un personal, intenta cambiar todos los campos vía PATCH, espera 200,
	luego GET y verifica que 'edicion.fecha' no sea null y que 'tipo' y 'dni' no cambiaron."""
	# Crear usuario inicial
	payload = {
		"nombre": "PatchTest",
		"apellido": "Original",
		"tipo": "psiquiatra",
		"matricula": "PACPATCH",
		"dni": "88888888",
		"genero": "hombre",
		"fecha_nacimiento": "1985-05-05",
		"telefono": "2991110000",
		"email": "patch_original@example.com"
	}

	resp_create = create_personal(payload)
	print(resp_create.text)
	assert resp_create.status_code == 201
	created = resp_create.json()
	id_usuario = created.get('id_usuario')
	assert isinstance(id_usuario, int)

	# Intentar modificar todos los campos, incluyendo tipo y dni (estos NO deben cambiar)
	patch_payload = {
		"nombre": "PatchTestMod",
		"apellido": "Modificado",
		"tipo": "medico",  # intento de cambio no permitido
		"matricula": "PACPATCH2",
		"dni": "77777777",  # intento de cambio no permitido
		"genero": "otro",
		"fecha_nacimiento": "1990-02-02",
		"telefono": "2992223333",
		"email": "patched@example.com"
	}

	resp_patch = patch_personal(id_usuario, patch_payload)
	print(resp_patch.text)
	assert resp_patch.status_code == 200
	updated = resp_patch.json()

	# GET y verificar condiciones
	resp_get = get_personal(id_usuario)
	print(resp_get.text)
	assert resp_get.status_code == 200
	p = resp_get.json()

	# 'edicion' debe existir y su 'fecha' no debe ser null
	assert 'edicion' in p and isinstance(p['edicion'], dict)
	assert p['edicion'].get('fecha') is not None

	# 'tipo' y 'dni' no deben haberse modificado
	assert p.get('tipo') == payload['tipo']
	assert p.get('dni') == payload['dni']

	# Los demás campos sí deben haber quedado actualizados
	assert p.get('nombre') == patch_payload['nombre']
	assert p.get('apellido') == patch_payload['apellido']
	assert p.get('matricula') == patch_payload['matricula']
	assert p.get('genero') == patch_payload['genero']
	assert p.get('fecha_nacimiento') == patch_payload['fecha_nacimiento']
	assert p.get('telefono') == patch_payload['telefono']
	assert p.get('email') == patch_payload['email']

def test_cant_patch_personal_wrong_id():
	"""Intentar hacer PATCH a un id_usuario inexistente debe devolver 404."""

	id_usuario = -99
	patch_payload = {
		"nombre": "NoExiste",
		"apellido": "NoExiste",
		"telefono": "2990000000",
		"email": "asdasd@example.com"
	}
	resp_patch = patch_personal(id_usuario, patch_payload)
	print(resp_patch.text)
	assert resp_patch.status_code == 404

