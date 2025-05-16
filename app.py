from flask import Flask, jsonify, request, render_template
import models

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')  # Esto sirve tu archivo templates/index.html

# Tus rutas existentes
@app.route('/doctores', methods=['GET'])
def listar_doctores():
    doctores = models.get_doctors()
    return jsonify(doctores)

@app.route('/pacientes', methods=['GET'])
def listar_pacientes():
    pacientes = models.get_pacientes()
    return jsonify(pacientes)

@app.route('/pacientes', methods=['POST'])
def crear_paciente():
    data = request.get_json()
    conn = models.get_connection()
    cursor = conn.cursor()
    try:
        sql = """INSERT INTO paciente (identificacion, nombre, apellido, direccion, edad, tipo_afiliacion, fecha_ingreso, contraseña)
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

@app.route('/doctores', methods=['POST'])
def crear_doctor():
    data = request.get_json()
    conn = models.get_connection()
    cursor = conn.cursor()
    try:
        sql = """INSERT INTO doctor (identificacion, nombre, apellido, direccion, telefono, especialidad, jornada_laboral, contraseña)
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
        cursor.execute(sql, (
            data['identificacion'],
            data['nombre'],
            data['apellido'],
            data.get('direccion'),
            data.get('telefono'),
            data.get('especialidad'),
            data.get('jornada_laboral'),
            data['contraseña']
        ))
        conn.commit()
        return {"message": "Doctor creado"}, 201
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}, 400
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
