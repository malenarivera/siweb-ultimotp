import requests
import pytest
from typing import Any, Dict

ENDPOINT_MEDICAMENTOS = "http://localhost:8002"
ENDPOINT_USUARIOS = "http://localhost:8003"

# Helpers
def get_medicamentos_resp():
	"""Helper: realiza GET a /medicamentos/obtenerMedicamentos y devuelve el objeto Response."""
	return requests.get(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/obtenerMedicamentos", headers=HEADERS_ENFERMERO)

def get_personal_list():
	"""Helper: devuelve la lista de personal (profesionales) desde el servicio de usuarios, o None si hay error."""
	resp = requests.get(f"{ENDPOINT_USUARIOS}/personal", headers=HEADERS_ENFERMERO)
	if resp.status_code != 200:
		return None
	return resp.json()

#Tests Recetas
def test_can_post_receta_if_medicamento_and_profesional_exist():
	"""POST /medicamentos/crearReceta debe devolver 201 si el medicamento y profesional existen.

	Se crea un medicamento de prueba, luego se intenta crear una receta con ese medicamento
	y un profesional supuesto existente. Finalmente se limpia el medicamento creado.
	"""
	# Crear medicamento de prueba
	medicamento_data = {
    "id_evolucion": 2,
    "id_medicamento": 2,
    "id_profesional": 2,
    "observaciones": "string"
    }

	# Verificar que el medicamento con el id indicado exista en el listado
	resp = get_medicamentos_resp()
	assert resp.status_code == 200, f"Esperado 200 al listar medicamentos, obtenido {resp.status_code} - {resp.text}"

	payload = resp.json()
	meds = payload.get("medicamentos", []) if isinstance(payload, dict) else []
	found = any(int(m.get("id_medicamento", -1)) == int(medicamento_data["id_medicamento"]) for m in meds)
	assert found, f"No se encontró medicamento con id {medicamento_data['id_medicamento']} en /medicamentos/obtenerMedicamentos"

	# Verificar que el profesional con el id indicado exista en el servicio de usuarios
	personal = get_personal_list()
	assert personal is not None, f"Error al listar personal desde {ENDPOINT_USUARIOS}/personal"
	found_prof = any(("id_usuario" in p and int(p["id_usuario"]) == int(medicamento_data["id_profesional"])) or ("id" in p and int(p["id"]) == int(medicamento_data["id_profesional"])) for p in personal)
	assert found_prof, f"No se encontró profesional con id {medicamento_data['id_profesional']} en {ENDPOINT_USUARIOS}/personal"

	# Intentar crear la receta usando el endpoint correspondiente
	post_resp = requests.post(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/receta/", json=medicamento_data, headers=HEADERS_PSIQUIATRA)
	assert post_resp.status_code == 201, f"Esperado 201 al crear receta, obtenido {post_resp.status_code} - {post_resp.text}"

	data = post_resp.json()
	# Verificar estructura de la respuesta
	for k in ["id_receta", "id_evolucion", "id_medicamento", "id_profesional", "estado", "observaciones", "fecha_creacion"]:
		assert k in data, f"Falta el dato {k} en la respuesta de creación de receta"

	# Verificar que los ids coincidan con los enviados
	assert int(data.get("id_evolucion")) == int(medicamento_data["id_evolucion"])
	assert int(data.get("id_medicamento")) == int(medicamento_data["id_medicamento"]) 
	assert int(data.get("id_profesional")) == int(medicamento_data["id_profesional"]) 

	# Verificar estado y observaciones
	assert data.get("estado") == "Asignada"
	assert data.get("observaciones") == medicamento_data["observaciones"]

def test_cant_post_receta_wrong_profesional():
	"""POST /medicamentos/receta/ con id_profesional inexistente debe devolver 400."""
	medicamento_data = {
		"id_evolucion": 1,
		"id_medicamento": 1,
		"id_profesional": -99,
		"observaciones": "prueba profesional inexistente"
	}

	post_resp = requests.post(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/receta/", json=medicamento_data, headers=HEADERS_PSIQUIATRA)
	print(post_resp.text)
	assert post_resp.status_code == 400

def test_cant_post_receta_wrong_medicamento():
	medicamento_data = {
		"id_evolucion": 1,
		"id_medicamento": -99,
		"id_profesional": 7,
		"observaciones": "prueba profesional inexistente"
	}

	post_resp = requests.post(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/receta/", json=medicamento_data, headers=HEADERS_PSIQUIATRA)
	print(post_resp.text)
	assert post_resp.status_code == 400

def test_can_patch_receta():
	"""Crea una receta y luego PATCH /medicamentos/receta/{id_receta}/estado con nuevo estado."""
	medicamento_data = {
		"id_evolucion": 2,
		"id_medicamento": 2,
		"id_profesional": 2,
		"observaciones": "prueba patch"
	}

	post_resp = requests.post(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/receta/", json=medicamento_data, headers=HEADERS_PSIQUIATRA)
	print(post_resp.text)
	assert post_resp.status_code == 201, f"Creación de receta falló: {post_resp.status_code} - {post_resp.text}"
	created = post_resp.json()
	id_receta = created.get("id_receta") or created.get("idReceta") or created.get("id")
	assert id_receta is not None, f"id_receta no presente en respuesta: {created}"

	patch_body = {"estado": "Medicamento ingresado"}
	patch_resp = requests.patch(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/receta/{id_receta}/estado", json=patch_body, headers=HEADERS_ENFERMERO)
	print(patch_resp.text)

	assert patch_resp.status_code == 200, f"Patch falló: {patch_resp.status_code} - {patch_resp.text}"

	patched = patch_resp.json()
	# Verificar que el estado fue actualizado
	estado = patched.get("estado") if isinstance(patched, dict) else None
	assert estado == "Medicamento ingresado", f"Estado esperado 'Medicamento ingresado', obtenido: {estado}"

def test_cant_patch_wrong_receta():
		id_receta = -99
		patch_body = {"estado": "Medicamento ingresado"}
		resp = requests.patch(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/receta/{id_receta}/estado", json=patch_body, headers=HEADERS_ENFERMERO)
		print(resp.text)
		assert resp.status_code == 400

def test_cant_patch_wrong_estado():
		id_receta = 1
		patch_body = {"estado": "Estado inválido"}
		resp = requests.patch(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/receta/{id_receta}/estado", json=patch_body, headers=HEADERS_ENFERMERO)
		print(resp.text)
		assert resp.status_code == 422

def test_get_recetas_buscarPorProfesional_filters_and_limit():
	"""GET /medicamentos/receta/buscarPorProfesional debe devolver 200 y una lista filtrada por profesional y estado."""
	# Id del profesional a testear (modificar aquí si quieres otro profesional)
	prof_id = 2
	cantidad = 5
	estado = "Asignada"

	params = {"idProfesional": prof_id, "cantidadATraer": cantidad, "estado": estado}
	resp = requests.get(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/receta/buscarPorProfesional", params=params, headers=HEADERS_ENFERMERO)
	assert resp.status_code == 200, f"Esperado 200, obtenido {resp.status_code} - {resp.text}"

	payload = resp.json()
	# La respuesta debe ser una lista
	assert isinstance(payload, list), f"Se esperaba una lista de recetas, pero se obtuvo: {type(payload)}"

	# Verificar que el tamaño no supere la cantidad solicitada
	assert len(payload) <= cantidad, f"La lista devuelve más de {cantidad} elementos"

	# Verificar que cada item tenga el id_profesional y estado solicitados
	for item in payload:
		# keys could be snake_case or camelCase, check both
		idp = item.get("id_profesional") if "id_profesional" in item else item.get("idProfesional")
		est = item.get("estado") if "estado" in item else item.get("estado_receta") if "estado_receta" in item else None
		assert idp is not None, f"Item sin id_profesional: {item}"
		assert int(idp) == prof_id, f"id_profesional mismatch: esperado {prof_id}, obtenido {idp}"
		if estado is not None:
			assert est == estado, f"estado mismatch: esperado {estado}, obtenido {est}"

#Tests Egreso

def test_can_post_egreso():
	# Primero registramos un ingreso válido para luego poder realizar el egreso
	ingreso_payload = {
		"id_medicamento": 1,
		"id_paciente": 9,
		"id_profesional": 7,
		"cantidad": 5,
		"motivo": "Ingreso para prueba",
		"fecha_creacion": "2023-07-09T12:00:00"
	}

	resp_ingreso = requests.post(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/registrarIngreso", json=ingreso_payload, headers=HEADERS_ENFERMERO)
	print('resp_ingreso', resp_ingreso.status_code, resp_ingreso.text)
	assert resp_ingreso.status_code == 200
	ingreso_data = resp_ingreso.json()
	assert isinstance(ingreso_data.get("id_ingreso"), int)

	# Ahora intentamos registrar un egreso
	egreso_payload = {
		"id_medicamento": 1,
		"id_paciente": 9,
		"id_profesional": 7,
		"cantidad": 5,
		"motivo": "Egreso para prueba",
		"id_receta": 1,
		"fecha_creacion": "2023-07-09T13:00:00"
	}

	resp_egreso = requests.post(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/registrarEgreso", json=egreso_payload, headers=HEADERS_ENFERMERO)
	print('resp_egreso', resp_egreso.status_code, resp_egreso.text)
	
	assert resp_egreso.status_code == 200
	egreso_data = resp_egreso.json()
	# Comprobaciones básicas sobre la respuesta
	assert egreso_data.get("id_medicamento") == egreso_payload["id_medicamento"]
	assert egreso_data.get("id_paciente") == egreso_payload["id_paciente"]
	assert egreso_data.get("id_profesional") == egreso_payload["id_profesional"]
	assert egreso_data.get("cantidad") == egreso_payload["cantidad"]

def test_cant_post_egreso_out_of_stock():
	# Primero registramos un ingreso válido para luego poder realizar el egreso
	ingreso_payload = {
		"id_medicamento": 1,
		"id_paciente": 9,
		"id_profesional": 7,
		"cantidad": 5,
		"motivo": "Ingreso para prueba",
		"fecha_creacion": "2023-07-09T12:00:00"
	}

	resp_ingreso = requests.post(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/registrarIngreso", json=ingreso_payload, headers=HEADERS_ENFERMERO)
	print('resp_ingreso', resp_ingreso.status_code, resp_ingreso.text)
	assert resp_ingreso.status_code == 200
	ingreso_data = resp_ingreso.json()
	assert isinstance(ingreso_data.get("id_ingreso"), int)

	# Ahora intentamos registrar un egreso
	egreso_payload = {
		"id_medicamento": 1,
		"id_paciente": 9,
		"id_profesional": 7,
		"cantidad": 700, # Más que el stock disponible
		"motivo": "Egreso para prueba",
		"id_receta": 1,
		"fecha_creacion": "2023-07-09T13:00:00"
	}

	resp_egreso = requests.post(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/registrarEgreso", json=egreso_payload, headers=HEADERS_ENFERMERO)
	print('resp_egreso', resp_egreso.status_code, resp_egreso.text)
	
	assert resp_egreso.status_code == 400


#Tests Ingreso

def test_can_post_ingreso():
	"""POST /medicamentos/registrarIngreso debe aceptar un ingreso y devolver 200 con los campos esperados."""
	payload = {
		"id_medicamento": 1,
		"id_paciente": 9,
		"id_profesional": 7,
		"cantidad": 10,
		"motivo": "string"
	}

	resp = requests.post(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/registrarIngreso", json=payload, headers=HEADERS_ENFERMERO)
	print(resp.text)
	assert resp.status_code == 200, f"Esperado 200, obtenido {resp.status_code} - {resp.text}"

	data = resp.json()
	# Verificar presencia de campos esperados
	expected_keys = ["id_ingreso", "id_medicamento", "id_paciente", "id_profesional", "cantidad", "motivo", "fecha_creacion"]
	for k in expected_keys:
		assert k in data, f"Falta la clave {k} en la respuesta de registrarIngreso"

	# Verificar que los ids coincidan
	assert int(data.get("id_medicamento")) == int(payload["id_medicamento"]) 
	assert int(data.get("id_paciente")) == int(payload["id_paciente"]) 
	assert int(data.get("id_profesional")) == int(payload["id_profesional"]) 

def test_cant_post_ingreso_wrong_ids():
	"""POST /medicamentos/registrarIngreso debe aceptar un ingreso y devolver 200 con los campos esperados."""
	payload = {
		"id_medicamento": -99,
		"id_paciente": -99,
		"id_profesional": -99,
		"cantidad": 10,
		"motivo": "string"
	}

	resp = requests.post(f"{ENDPOINT_MEDICAMENTOS}/medicamentos/registrarIngreso", json=payload, headers=HEADERS_ENFERMERO)
	print(resp.text)
	assert resp.status_code == 400


#Tests Medicamentos

def _validate_medicamento_shape(med: Dict[str, Any]): #Helper
	required_keys = [
		"id_medicamento",
		"laboratorio_titular",
		"nombre_comercial",
		"nombre_generico",
		"concentracion",
		"forma_farmaceutica",
		"presentacion",
		"stock",
		"fecha_creacion",
	]
	for k in required_keys:
		assert k in med, f"Falta la clave {k} en el medicamento"

	assert isinstance(med["id_medicamento"], int)
	assert isinstance(med["laboratorio_titular"], str)
	assert isinstance(med["nombre_comercial"], str)
	assert isinstance(med["nombre_generico"], str)
	assert isinstance(med["concentracion"], str)
	assert isinstance(med["forma_farmaceutica"], str)
	assert isinstance(med["presentacion"], str)
	assert isinstance(med["stock"], int)
	assert isinstance(med["fecha_creacion"], str)
	assert "T" in med["fecha_creacion"], "fecha_creacion no parece estar en formato ISO"

def test_get_medicamentos_obtenerMedicamentos_shape_and_status():
	"""GET /medicamentos/obtenerMedicamentos debe devolver 200 y la estructura esperada.

	Se verifica que la respuesta tenga las claves `medicamentos`, `total` y `limit`.
	Si hay al menos un medicamento, se valida la forma del primer elemento.
	"""
	
	resp = get_medicamentos_resp()
	assert resp.status_code == 200, f"Esperado 200, obtenido {resp.status_code} - {resp.text}"

	payload = resp.json()
	assert isinstance(payload, dict), "La respuesta JSON debe ser un objeto"
	assert "medicamentos" in payload and isinstance(payload["medicamentos"], list)
	assert "total" in payload and isinstance(payload["total"], int)
	assert "limit" in payload and isinstance(payload["limit"], int)

	meds = payload["medicamentos"]
	if meds:
		_validate_medicamento_shape(meds[0]) # Validar la forma del primer medicamento

