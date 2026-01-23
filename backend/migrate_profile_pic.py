import sqlite3
import os

db_path = "quizi.db" # Check if this is the correct path

if not os.path.exists(db_path):
    print(f"Database {db_path} not found.")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Add profile_picture column to users table
        cursor.execute("ALTER TABLE users ADD COLUMN profile_picture TEXT;")
        
        conn.commit()
        conn.close()
        print("Successfully added profile_picture column to users table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column profile_picture already exists.")
        else:
            print(f"Operational error: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
