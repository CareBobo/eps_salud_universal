import mysql.connector
from config import db_config

def listar_bases():
    cfg = db_config.copy()
    # Quitamos la base de datos para conectarnos solo al servidor
    if 'database' in cfg:
        cfg.pop('database')
    try:
        conn = mysql.connector.connect(**cfg)
        cursor = conn.cursor()
        cursor.execute("SHOW DATABASES")
        bases = cursor.fetchall()
        print("Bases de datos disponibles:")
        for base in bases:
            print(base[0])
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"Error: {err}")

if __name__ == "__main__":
    listar_bases()
