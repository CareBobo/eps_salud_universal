import mysql.connector
from config import db_config

def get_connection():
    try:
        return mysql.connector.connect(**db_config)
    except mysql.connector.Error as err:
        print(f"Error al conectar a la base de datos: {err}")
        raise

# Obtener todos los doctores
def get_doctors():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM doctor")
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Obtener un doctor por identificación
def get_doctor_by_identificacion(identificacion):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM doctor WHERE identificacion = %s", (identificacion,))
    doctor = cursor.fetchone()
    cursor.close()
    conn.close()
    return doctor

# Obtener un doctor por identificación y contraseña
def get_doctor_by_identificacion_and_password(identificacion, contrasena):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM doctor WHERE identificacion = %s AND contrasena = %s", (identificacion, contrasena))
    doctor = cursor.fetchone()
    cursor.close()
    conn.close()
    return doctor

# Eliminar doctor
def eliminar_doctor(id_doctor):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM doctor WHERE id_doctor = %s", (id_doctor,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print("Error eliminar_doctor:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Actualizar doctor
def actualizar_doctor(id_doctor, data):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        sql = """UPDATE doctor SET identificacion=%s, nombre=%s, apellido=%s, direccion=%s,
                 telefono=%s, especialidad=%s, jornada_laboral=%s, contraseña=%s WHERE id_doctor=%s"""
        cursor.execute(sql, (
            data.get('identificacion'),
            data.get('nombre'),
            data.get('apellido'),
            data.get('direccion'),
            data.get('telefono'),
            data.get('especialidad'),
            data.get('jornada_laboral'),
            data.get('contraseña'),
            id_doctor
        ))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print("Error actualizar_doctor:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Obtener todos los pacientes
def get_pacientes():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM paciente")
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Obtener un paciente por identificación
def get_paciente_by_identificacion(identificacion):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM paciente WHERE identificacion = %s", (identificacion,))
    paciente = cursor.fetchone()
    cursor.close()
    conn.close()
    return paciente

# Obtener un paciente por identificación y contraseña
def get_paciente_by_identificacion_and_password(identificacion, contrasena):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM paciente WHERE identificacion = %s AND contrasena = %s", (identificacion, contrasena))
    paciente = cursor.fetchone()
    cursor.close()
    conn.close()
    return paciente

# Eliminar paciente
def eliminar_paciente(id_paciente):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM paciente WHERE id_paciente = %s", (id_paciente,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print("Error eliminar_paciente:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Actualizar paciente
def actualizar_paciente(id_paciente, data):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        sql = """UPDATE paciente SET identificacion=%s, nombre=%s, apellido=%s, direccion=%s,
                 edad=%s, tipo_afiliacion=%s, fecha_ingreso=%s, contrasena=%s WHERE id_paciente=%s"""
        cursor.execute(sql, (
            data.get('identificacion'),
            data.get('nombre'),
            data.get('apellido'),
            data.get('direccion'),
            data.get('edad'),
            data.get('tipo_afiliacion'),
            data.get('fecha_ingreso'),
            data.get('contrasena'),
            id_paciente
        ))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print("Error actualizar_paciente:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Obtener todas las citas
def get_citas():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT c.id_cita, p.nombre AS paciente, d.nombre AS doctor, u.nombre AS unidad,
               c.fecha_cita, c.hora_cita
        FROM cita c
        JOIN paciente p ON c.id_paciente = p.id_paciente
        JOIN doctor d ON c.id_doctor = d.id_doctor
        JOIN unidad u ON c.id_unidad = u.id_unidad
    """)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Obtener las citas por doctor
def get_citas_por_doctor_fecha(id_doctor, fecha):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT c.id_cita, p.nombre AS paciente, u.nombre AS unidad, c.fecha_cita, c.hora_cita
        FROM cita c
        JOIN paciente p ON c.id_paciente = p.id_paciente
        JOIN unidad u ON c.id_unidad = u.id_unidad
        WHERE c.id_doctor = %s AND c.fecha_cita = %s
        ORDER BY c.hora_cita
    """, (id_doctor, fecha))
    results = cursor.fetchall()
    # Convertir fechas y horas a string para evitar problemas de serialización
    for cita in results:
        if 'fecha_cita' in cita and cita['fecha_cita'] is not None:
            cita['fecha_cita'] = str(cita['fecha_cita'])
        if 'hora_cita' in cita and cita['hora_cita'] is not None:
            cita['hora_cita'] = str(cita['hora_cita'])
    cursor.close()
    conn.close()
    return results

# Obtener las citas por paciente
def get_citas_por_paciente(id_paciente):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT c.id_cita, d.nombre AS doctor, u.nombre AS unidad, c.fecha_cita, c.hora_cita
        FROM cita c
        JOIN doctor d ON c.id_doctor = d.id_doctor
        JOIN unidad u ON c.id_unidad = u.id_unidad
        WHERE c.id_paciente = %s
        ORDER BY c.fecha_cita, c.hora_cita
    """, (id_paciente,))
    results = cursor.fetchall()
    # Convertir fechas y horas a string para evitar problemas de serialización
    for cita in results:
        if 'fecha_cita' in cita and cita['fecha_cita'] is not None:
            cita['fecha_cita'] = str(cita['fecha_cita'])
        if 'hora_cita' in cita and cita['hora_cita'] is not None:
            cita['hora_cita'] = str(cita['hora_cita'])
    cursor.close()
    conn.close()
    return results

# Obtener cita por id
def get_cita_por_id(id_cita):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cita WHERE id_cita = %s", (id_cita,))
    cita = cursor.fetchone()
    cursor.close()
    conn.close()
    return cita

def get_doctor_by_id(id_doctor):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM doctor WHERE id_doctor = %s", (id_doctor,))
    doctor = cursor.fetchone()
    cursor.close()
    conn.close()
    return doctor

def get_paciente_by_id(id_paciente):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM paciente WHERE id_paciente = %s", (id_paciente,))
    paciente = cursor.fetchone()
    cursor.close()
    conn.close()
    return paciente

def get_unidad_by_id(id_unidad):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM unidad WHERE id_unidad = %s", (id_unidad,))
    unidad = cursor.fetchone()
    cursor.close()
    conn.close()
    return unidad

def get_consulta_by_id(id_consulta):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM consulta WHERE id_consulta = %s", (id_consulta,))
    consulta = cursor.fetchone()
    cursor.close()
    conn.close()
    return consulta

def get_historia_by_id(id_historia):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM historia_clinica WHERE id_historia = %s", (id_historia,))
    historia = cursor.fetchone()
    cursor.close()
    conn.close()
    return historia

# Eliminar cita
def eliminar_cita(id_cita):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM cita WHERE id_cita = %s", (id_cita,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print("Error eliminar_cita:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Actualizar cita
def actualizar_cita(id_cita, data):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        sql = """UPDATE cita SET id_paciente=%s, id_doctor=%s, id_unidad=%s, fecha_cita=%s, hora_cita=%s
                 WHERE id_cita=%s"""
        cursor.execute(sql, (
            data.get('id_paciente'),
            data.get('id_doctor'),
            data.get('id_unidad'),
            data.get('fecha_cita'),
            data.get('hora_cita'),
            id_cita
        ))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print("Error actualizar_cita:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()
        
     #   obtener historia clinica
def obtener_historia_clinica(id_paciente):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id_historia, id_paciente, fecha_creacion, descripcion
        FROM historia_clinica
        WHERE id_paciente = %s
        ORDER BY fecha_creacion DESC
    """, (id_paciente,))
    results = cursor.fetchall()
    for h in results:
        if 'fecha_creacion' in h and h['fecha_creacion'] is not None:
            h['fecha_creacion'] = str(h['fecha_creacion'])
    cursor.close()
    conn.close()
    return results

# Obtener todas las consultas
def get_consultas():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT co.id_consulta, p.nombre AS paciente, d.nombre AS doctor,
               co.fecha_atencion, co.sintomas, co.tratamiento
        FROM consulta co
        JOIN cita c ON co.id_cita = c.id_cita
        JOIN paciente p ON c.id_paciente = p.id_paciente
        JOIN doctor d ON c.id_doctor = d.id_doctor
    """)
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Eliminar consulta
def eliminar_consulta(id_consulta):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM consulta WHERE id_consulta = %s", (id_consulta,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print("Error eliminar_consulta:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Actualizar consulta
def actualizar_consulta(id_consulta, data):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        sql = """UPDATE consulta SET id_cita=%s, fecha_atencion=%s, sintomas=%s, tratamiento=%s
                 WHERE id_consulta=%s"""
        cursor.execute(sql, (
            data.get('id_cita'),
            data.get('fecha_atencion'),
            data.get('sintomas'),
            data.get('tratamiento'),
            id_consulta
        ))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print("Error actualizar_consulta:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Obtener todas las unidades
def get_unidades():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM unidad")
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Eliminar unidad
def eliminar_unidad(id_unidad):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM unidad WHERE id_unidad = %s", (id_unidad,))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print("Error eliminar_unidad:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Actualizar unidad
def actualizar_unidad(id_unidad, data):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        sql = """UPDATE unidad SET nombre=%s, planta=%s, id_doctor_responsable=%s WHERE id_unidad=%s"""
        cursor.execute(sql, (
            data.get('nombre'),
            data.get('planta'),
            data.get('id_doctor_responsable'),
            id_unidad
        ))
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print("Error actualizar_unidad:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# --------------------------------------------
# Nuevas funciones para Administradores
# --------------------------------------------

# Obtener un administrador por identificación y contraseña
def get_admin_by_identificacion_and_password(identificacion, contrasena):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM administradores WHERE identificacion = %s AND contrasena = %s", (identificacion, contrasena))
    admin = cursor.fetchone()
    cursor.close()
    conn.close()
    return admin

# Crear un nuevo administrador
def crear_admin(identificacion, nombre, apellido, direccion, telefono, contrasena):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        sql = """INSERT INTO administradores (identificacion, nombre, apellido, direccion, telefono, contrasena)
                 VALUES (%s, %s, %s, %s, %s, %s)"""
        cursor.execute(sql, (identificacion, nombre, apellido, direccion, telefono, contrasena))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error al crear administrador: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

# Crear una nueva cita
def crear_cita(id_paciente, id_doctor, id_unidad, fecha_cita, hora_cita):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        sql = """INSERT INTO cita (id_paciente, id_doctor, id_unidad, fecha_cita, hora_cita)
                 VALUES (%s, %s, %s, %s, %s)"""
        cursor.execute(sql, (id_paciente, id_doctor, id_unidad, fecha_cita, hora_cita))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error al crear cita: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()