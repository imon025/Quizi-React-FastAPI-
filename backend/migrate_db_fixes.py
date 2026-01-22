
import sqlite3
import os

DB_FILES = ["quizi.db", "../quizi.db", "sql_app.db"]

def migrate_db(db_path):
    if not os.path.exists(db_path):
        print(f"Skipping {db_path} (not found)")
        return

    print(f"Migrating {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get existing columns
    cursor.execute("PRAGMA table_info(quizzes)")
    columns = [info[1] for info in cursor.fetchall()]
    
    print(f"Existing columns: {columns}")

    # Add eye_tracking_enabled if missing
    if "eye_tracking_enabled" not in columns:
        print("Adding eye_tracking_enabled column...")
        try:
            cursor.execute("ALTER TABLE quizzes ADD COLUMN eye_tracking_enabled BOOLEAN DEFAULT 0")
        except Exception as e:
            print(f"Error adding eye_tracking_enabled: {e}")
    else:
        print("eye_tracking_enabled already exists.")

    # Add violation_limit if missing
    if "violation_limit" not in columns:
        print("Adding violation_limit column...")
        try:
            cursor.execute("ALTER TABLE quizzes ADD COLUMN violation_limit INTEGER DEFAULT 5")
        except Exception as e:
            print(f"Error adding violation_limit: {e}")
    else:
        print("violation_limit already exists.")

    conn.commit()
    conn.close()
    print(f"Finished {db_path}.\n")

if __name__ == "__main__":
    # Run from backend directory
    for db in DB_FILES:
        migrate_db(db)
