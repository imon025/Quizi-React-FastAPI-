import sqlite3
import os

DB_PATH = "/home/imonfarazi/Flutter Project Test/QuiziReact/Quizi/quizi.db"

# Check if DB exists
if not os.path.exists(DB_PATH):
    print(f"Error: Database file not found at {DB_PATH}")
    exit(1)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    # Check if column exists
    cursor.execute("PRAGMA table_info(quizzes)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if "max_questions" in columns:
        print("Column 'max_questions' already exists.")
    else:
        print("Adding column 'max_questions'...")
        cursor.execute("ALTER TABLE quizzes ADD COLUMN max_questions INTEGER DEFAULT 0")
        conn.commit()
        print("Column added successfully.")
        
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    conn.close()
