from flask import Flask, jsonify, request, render_template, session, abort, redirect, url_for
from functools import wraps
import models

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta_aqui'  # Cambia por una clave segura

# Página principal: redirige a login o dashboard según sesión
@app.route('/')
def home():
    if 'user_id' in session and 'role' in session:
        if session['role'] == 'doctor':
            return redirect(url_for('doctor_dashboard'))
        elif session['role'] == 'paciente':
            return redirect(url_for('paciente_dashboard'))
        elif session['role'] == 'admin':
            return redirect(url_for('admin_dashboard'))
    return redirect(url_for('login_get'))

# Mostrar formulario login
@app.route('/login', methods=['GET'])
def login_get():
    return render_template('login.html')

# Procesar login
@app.route('/login', methods=['POST'])
def login_post():
    data = request.get_json()
    identificacion = data.get('identificacion')
    contrasena = data.get('contrasena')
    tipo = data.get('tipo')

    if not identificacion or not contrasena or not tipo:
        return jsonify({"error": "Faltan datos"}), 400

    if tipo == 'doctor':
        doctor = models.get_doctor_by_identificacion_and_password(identificacion, contrasena)
        if doctor:
            session['user_id'] = doctor['id_doctor']
            session['role'] = 'doctor'
            return jsonify({"message": "Login exitoso", "role": "doctor", "redirect_url": url_for('doctor_dashboard')})
        else:
            return jsonify({"error": "Credenciales inválidas para doctor"}), 401

    elif tipo == 'paciente':
        paciente = models.get_paciente_by_identificacion_and_password(identificacion, contrasena)
        if paciente:
            session['user_id'] = paciente['id_paciente']
            session['role'] = 'paciente'
            return jsonify({"message": "Login exitoso", "role": "paciente", "redirect_url": url_for('paciente_dashboard')})
        else:
            return jsonify({"error": "Credenciales inválidas para paciente"}), 401

    elif tipo == 'admin':
        admin = models.get_admin_by_identificacion_and_password(identificacion, contrasena)
        if admin:
            session['user_id'] = admin['id_admin']
            session['role'] = 'admin'
            return jsonify({"message": "Login exitoso", "role": "admin", "redirect_url": url_for('admin_dashboard')})
        else:
            return jsonify({"error": "Credenciales inválidas para administrador"}), 401

    else:
        return jsonify({"error": "Tipo de usuario inválido"}), 400

# Logout
@app.route('/logout', methods=['GET', 'POST'])
def logout():
    session.clear()
    return redirect(url_for('login_get'))

# Decorador para proteger rutas
def require_login(role=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if 'user_id' not in session or 'role' not in session:
                return redirect(url_for('login_get'))
            if role and session['role'] != role and session['role'] != 'admin':
                abort(403)  # Permitir acceso a admin siempre
            return func(*args, **kwargs)
        return wrapper
    return decorator

# Dashboards
@app.route('/admin_dashboard')
@require_login(role='admin')
def admin_dashboard():
    return render_template('admin_dashboard.html', role=session.get('role'))

@app.route('/doctor_dashboard')
@require_login(role='doctor')
def doctor_dashboard():
    return render_template('doctor_dashboard.html', role=session.get('role'))

@app.route('/paciente_dashboard')
@require_login(role='paciente')
def paciente_dashboard():
    return render_template(
        'paciente_dashboard.html',
        role=session.get('role'),
        user_id=session.get('user_id')  # <-- Esto es lo importante
    )
# --- API protegidas ---

# Solo doctor o admin
@app.route('/doctores', methods=['GET'])
@require_login(role='doctor')
def listar_doctores():
    doctores = models.get_doctors()
    return jsonify(doctores)

# Solo doctor o admin
@app.route('/pacientes', methods=['GET'])
@require_login(role='doctor')
def listar_pacientes():
    pacientes = models.get_pacientes()
    return jsonify(pacientes)

# Doctor o paciente (cada uno ve sus citas)
@app.route('/citas', methods=['GET'])
@require_login()
def listar_citas():
    user_id = session['user_id']
    role = session['role']
    if role == 'doctor':
        citas = models.get_citas_por_doctor(user_id)
    elif role == 'paciente':
        citas = models.get_citas_por_paciente(user_id)
    else:
        abort(403)
    return jsonify(citas)

# Solo doctor o admin
@app.route('/consultas', methods=['GET'])
@require_login(role='doctor')
def listar_consultas():
    consultas = models.get_consultas()
    return jsonify(consultas)

# Solo admin
@app.route('/unidades', methods=['GET'])
@require_login(role='admin')
def listar_unidades():
    unidades = models.get_unidades()
    return jsonify(unidades)

# Historia clínica: paciente solo puede ver la suya
@app.route('/historias/<int:id_paciente>', methods=['GET'])
@require_login()
def obtener_historia_clinica(id_paciente):
    # Solo el paciente dueño o un doctor/admin pueden ver la historia
    if session['role'] == 'paciente' and session['user_id'] != id_paciente:
        abort(403)
    historia = models.obtener_historia_clinica(id_paciente)
    if historia is None:
        return jsonify([])  # O un mensaje de error si prefieres
    return jsonify(historia)

# Citas por doctor y fecha (solo el doctor dueño)
@app.route('/citas/doctor/<int:id_doctor>/fecha/<fecha>', methods=['GET'])
@require_login(role='doctor')
def citas_por_doctor_fecha(id_doctor, fecha):
    if id_doctor != session['user_id']:
        abort(403)
    citas = models.get_citas_por_doctor_fecha(id_doctor, fecha)
    if citas is None:
        return jsonify({"error": "Error al obtener citas"}), 500
    return jsonify(citas)

# Obtener un doctor por ID
@app.route('/doctores/<int:id_doctor>', methods=['GET'])
@require_login(role='admin')
def obtener_doctor(id_doctor):
    doctor = models.get_doctor_by_id(id_doctor)
    if doctor:
        return jsonify(doctor)
    else:
        return jsonify({'error': 'Doctor no encontrado'}), 404

# Obtener un paciente por ID
@app.route('/pacientes/<int:id_paciente>', methods=['GET'])
@require_login(role='admin')
def obtener_paciente(id_paciente):
    paciente = models.get_paciente_by_id(id_paciente)
    if paciente:
        return jsonify(paciente)
    else:
        return jsonify({'error': 'Paciente no encontrado'}), 404

# Obtener una unidad por ID
@app.route('/unidades/<int:id_unidad>', methods=['GET'])
@require_login(role='admin')
def obtener_unidad(id_unidad):
    unidad = models.get_unidad_by_id(id_unidad)
    if unidad:
        return jsonify(unidad)
    else:
        return jsonify({'error': 'Unidad no encontrada'}), 404

# Obtener una consulta por ID
@app.route('/consultas/<int:id_consulta>', methods=['GET'])
@require_login(role='doctor')
def obtener_consulta(id_consulta):
    consulta = models.get_consulta_by_id(id_consulta)
    if consulta:
        return jsonify(consulta)
    else:
        return jsonify({'error': 'Consulta no encontrada'}), 404
    
    
@app.route('/historias/id/<int:id_historia>', methods=['GET'])
@require_login(role='doctor')
def obtener_historia_por_id(id_historia):
    historia = models.get_historia_by_id(id_historia)
    if historia:
        return jsonify(historia)
    else:
        return jsonify({'error': 'Historia clínica no encontrada'}), 404

# --- Rutas de creación ---

# Solo doctor o admin
@app.route('/doctores', methods=['POST'])
@require_login(role='doctor')
def crear_doctor():
    data = request.get_json()
    conn = models.get_connection()
    cursor = conn.cursor()
    try:
        sql = """INSERT INTO doctor (identificacion, nombre, apellido, direccion, telefono, especialidad, jornada_laboral, contrasena)
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
        cursor.execute(sql, (
            data['identificacion'],
            data['nombre'],
            data['apellido'],
            data.get('direccion'),
            data.get('telefono'),
            data.get('especialidad'),
            data.get('jornada_laboral'),
            data['contrasena']
        ))
        conn.commit()
        return {"message": "Doctor creado"}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()
        
@app.route('/historias', methods=['POST'])
@require_login(role='doctor')
def crear_historia():
    data = request.get_json()
    id_paciente = data.get('id_paciente')
    fecha_creacion = data.get('fecha_creacion')
    descripcion = data.get('descripcion')
    if not id_paciente or not fecha_creacion or not descripcion:
        return jsonify({'error': 'Datos incompletos'}), 400
    exito = models.crear_historia_clinica(id_paciente, fecha_creacion, descripcion)
    if exito:
        return jsonify({'mensaje': 'Historia clínica creada'}), 201
    else:
        return jsonify({'error': 'No se pudo crear la historia clínica'}), 500

# Solo admin
@app.route('/pacientes', methods=['POST'])
@require_login(role='admin')
def crear_paciente():
    data = request.get_json()
    conn = models.get_connection()
    cursor = conn.cursor()
    try:
        sql = """INSERT INTO paciente (identificacion, nombre, apellido, direccion, edad, tipo_afiliacion, fecha_ingreso, contrasena)
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
        cursor.execute(sql, (
            data['identificacion'],
            data['nombre'],
            data['apellido'],
            data.get('direccion'),
            data.get('edad'),
            data.get('tipo_afiliacion'),
            data.get('fecha_ingreso'),
            data['contrasena']
        ))
        conn.commit()
        return {"message": "Paciente creado"}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

# Solo admin
@app.route('/unidades', methods=['POST'])
@require_login(role='admin')
def crear_unidad():
    data = request.get_json()
    conn = models.get_connection()
    cursor = conn.cursor()
    try:
        sql = """INSERT INTO unidad (nombre, planta, id_doctor_responsable)
                 VALUES (%s, %s, %s)"""
        cursor.execute(sql, (
            data['nombre'],
            data['planta'],
            data['id_doctor_responsable']
        ))
        conn.commit()
        return {"message": "Unidad creada"}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

# Solo doctor o admin
@app.route('/consultas', methods=['POST'])
@require_login(role='doctor')
def crear_consulta():
    data = request.get_json()
    conn = models.get_connection()
    cursor = conn.cursor()
    try:
        sql = """INSERT INTO consulta (id_cita, fecha_atencion, sintomas, tratamiento)
                 VALUES (%s, %s, %s, %s)"""
        cursor.execute(sql, (
            data['id_cita'],
            data['fecha_atencion'],
            data['sintomas'],
            data['tratamiento']
        ))
        conn.commit()
        return {"message": "Consulta creada"}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

# Solo paciente
@app.route('/citas', methods=['POST'])
def crear_cita():
    if 'user_id' not in session or session.get('role') != 'paciente':
        return jsonify({'error': 'No autorizado'}), 403
    data = request.get_json()
    user_id = session['user_id']

    # Agrega estos prints para depuración
    print('user_id en sesión:', user_id)
    print('id_paciente recibido:', data.get('id_paciente'))
    print('tipo user_id:', type(user_id), 'tipo id_paciente:', type(data.get('id_paciente')))

    if int(user_id) != int(data.get('id_paciente')):
        abort(403)
    conn = models.get_connection()
    cursor = conn.cursor()
    try:
        sql = """INSERT INTO cita (id_paciente, id_doctor, id_unidad, fecha_cita, hora_cita)
                 VALUES (%s, %s, %s, %s, %s)"""
        cursor.execute(sql, (
            data['id_paciente'],
            data['id_doctor'],
            data['id_unidad'],
            data['fecha_cita'],
            data['hora_cita']
        ))
        conn.commit()
        return {"message": "Cita creada"}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

# Solo admin
@app.route('/admin', methods=['POST'])
@require_login(role='admin')
def crear_admin():
    data = request.get_json()
    conn = models.get_connection()
    cursor = conn.cursor()
    try:
        sql = """INSERT INTO administradores (identificacion, nombre, apellido, direccion, telefono, contrasena)
                 VALUES (%s, %s, %s, %s, %s, %s)"""
        cursor.execute(sql, (
            data['identificacion'],
            data['nombre'],
            data['apellido'],
            data.get('direccion'),
            data.get('telefono'),
            data['contrasena']
        ))
        conn.commit()
        return {"message": "Administrador creado"}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

# ----------------------------
# Rutas para Eliminar y Actualizar
# ----------------------------

# -------- Admin -----------

# Eliminar Doctor
@app.route('/doctores/<int:id_doctor>', methods=['DELETE'])
@require_login(role='admin')
def eliminar_doctor(id_doctor):
    try:
        success = models.eliminar_doctor(id_doctor)
        if success:
            return jsonify({"message": "Doctor eliminado"}), 200
        else:
            return jsonify({"error": "No se pudo eliminar"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Actualizar Doctor
@app.route('/doctores/<int:id_doctor>', methods=['PUT'])
@require_login(role='admin')
def actualizar_doctor(id_doctor):
    data = request.get_json()
    try:
        success = models.actualizar_doctor(id_doctor, data)
        if success:
            return jsonify({"message": "Doctor actualizado"}), 200
        else:
            return jsonify({"error": "No se pudo actualizar"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Eliminar Paciente
@app.route('/pacientes/<int:id_paciente>', methods=['DELETE'])
@require_login(role='admin')
def eliminar_paciente(id_paciente):
    try:
        success = models.eliminar_paciente(id_paciente)
        if success:
            return jsonify({"message": "Paciente eliminado"}), 200
        else:
            return jsonify({"error": "No se pudo eliminar"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Actualizar Paciente
@app.route('/pacientes/<int:id>', methods=['PUT'])
@require_login(role='admin')
def actualizar_paciente(id):
    data = request.get_json()
    conn = models.get_connection()
    cursor = conn.cursor()
    try:
        sql = """
            UPDATE paciente SET
            identificacion=%s,
            nombre=%s,
            apellido=%s,
            direccion=%s,
            edad=%s,
            tipo_afiliacion=%s,
            fecha_ingreso=%s,
            contrasena=%s
            WHERE id_paciente=%s
        """
        cursor.execute(sql, (
            data['identificacion'],
            data['nombre'],
            data['apellido'],
            data.get('direccion'),
            data.get('edad'),
            data.get('tipo_afiliacion'),
            data.get('fecha_ingreso'),
            data['contrasena'],
            id
        ))
        conn.commit()
        return {"message": "Paciente actualizado"}, 200
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

# Eliminar Unidad
@app.route('/unidades/<int:id_unidad>', methods=['DELETE'])
@require_login(role='admin')
def eliminar_unidad(id_unidad):
    try:
        success = models.eliminar_unidad(id_unidad)
        if success:
            return jsonify({"message": "Unidad eliminada"}), 200
        else:
            return jsonify({"error": "No se pudo eliminar"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Actualizar Unidad
@app.route('/unidades/<int:id_unidad>', methods=['PUT'])
@require_login(role='admin')
def actualizar_unidad(id_unidad):
    data = request.get_json()
    try:
        success = models.actualizar_unidad(id_unidad, data)
        if success:
            return jsonify({"message": "Unidad actualizada"}), 200
        else:
            return jsonify({"error": "No se pudo actualizar"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------- Doctor -----------

# Eliminar Consulta
@app.route('/consultas/<int:id_consulta>', methods=['DELETE'])
@require_login(role='doctor')
def eliminar_consulta(id_consulta):
    try:
        success = models.eliminar_consulta(id_consulta)
        if success:
            return jsonify({"message": "Consulta eliminada"}), 200
        else:
            return jsonify({"error": "No se pudo eliminar"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Actualizar Consulta
@app.route('/consultas/<int:id_consulta>', methods=['PUT'])
@require_login(role='doctor')
def actualizar_consulta(id_consulta):
    data = request.get_json()
    try:
        success = models.actualizar_consulta(id_consulta, data)
        if success:
            return jsonify({"message": "Consulta actualizada"}), 200
        else:
            return jsonify({"error": "No se pudo actualizar"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------- Paciente -----------

# Obtener cita por id para validación de propiedad
@app.route('/citas/<int:id_cita>', methods=['GET'])
@require_login(role='paciente')
def obtener_cita_por_id(id_cita):
    cita = models.get_cita_por_id(id_cita)
    if not cita or cita['id_paciente'] != session['user_id']:
        abort(403)
    return jsonify(cita)

# Eliminar Cita
@app.route('/citas/<int:id_cita>', methods=['DELETE'])
@require_login(role='paciente')
def eliminar_cita(id_cita):
    cita = models.get_cita_por_id(id_cita)
    if not cita or cita['id_paciente'] != session['user_id']:
        abort(403)
    try:
        success = models.eliminar_cita(id_cita)
        if success:
            return jsonify({"message": "Cita eliminada"}), 200
        else:
            return jsonify({"error": "No se pudo eliminar la cita"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Actualizar Cita
@app.route('/citas/<int:id_cita>', methods=['PUT'])
@require_login(role='paciente')
def actualizar_cita(id_cita):
    cita = models.get_cita_por_id(id_cita)
    if not cita or cita['id_paciente'] != session['user_id']:
        abort(403)
    data = request.get_json()
    try:
        success = models.actualizar_cita(id_cita, data)
        if success:
            return jsonify({"message": "Cita actualizada"}), 200
        else:
            return jsonify({"error": "No se pudo actualizar la cita"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)