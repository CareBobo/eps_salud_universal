import mysql.connector
from config import db_config

def test_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        if conn.is_connected():
            print("Conexión exitosa a la base de datos MySQL")
            conn.close()
        else:
            print("No se pudo conectar a la base de datos")
    except mysql.connector.Error as err:
        print(f"Error en la conexión: {err}")

if __name__ == "__main__":
    test_connection()
