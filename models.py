import mysql.connector
from config import db_config

def get_connection():
    return mysql.connector.connect(**db_config)

def get_doctors():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM doctor")
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

def get_pacientes():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM paciente")
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results
