
import sqlite3
from backend.database import SQLALCHEMY_DATABASE_URL

# Extract file path from URL (sqlite:///./quizi.db -> ./quizi.db)
db_path = "./quizi.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    print("Migrating database...")
    
    # Add question_type to questions
    try:
        cursor.execute("ALTER TABLE questions ADD COLUMN question_type VARCHAR DEFAULT 'mcq'")
        print("Added question_type to questions")
    except sqlite3.OperationalError as e:
        print(f"Skipping questions column: {e}")

    # Add answers to results
    try:
        cursor.execute("ALTER TABLE results ADD COLUMN answers JSON")
        print("Added answers to results")
    except sqlite3.OperationalError as e:
        print(f"Skipping results answers column: {e}")

    # Add feedback to results
    try:
        cursor.execute("ALTER TABLE results ADD COLUMN feedback JSON")
        print("Added feedback to results")
    except sqlite3.OperationalError as e:
        print(f"Skipping results feedback column: {e}")

    conn.commit()
    print("Migration complete!")
except Exception as e:
    print(f"Migration failed: {e}")
finally:
    conn.close()
