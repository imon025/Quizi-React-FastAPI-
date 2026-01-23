import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# 1. Setup paths to import models and find the DB
# Get the absolute path of the 'backend' directory (where this script lives)
backend_dir = os.path.dirname(os.path.abspath(__file__))
# Get the absolute path of the project root
project_root = os.path.dirname(backend_dir)

# Add project root to sys.path so we can import 'backend.models'
if project_root not in sys.path:
    sys.path.append(project_root)

# 2. Define the absolute database path
# Since uvicorn runs from project root, the DB is likely at root/quizi.db
db_path = os.path.join(project_root, "quizi.db")

# Fallback: check if it's in the backend folder
if not os.path.exists(db_path):
    db_path = os.path.join(backend_dir, "quizi.db")

DATABASE_URL = f"sqlite:///{db_path}"
print(f"Using database at: {db_path}")

# 3. Import models
try:
    from backend import models
except ImportError:
    # If standard import fails, try direct import if in backend folder
    sys.path.append(backend_dir)
    import models

# 4. Setup Session
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def view_data():
    db: Session = SessionLocal()
    try:
        model_classes = [
            models.User, 
            models.Course, 
            models.Enrollment, 
            models.Quiz, 
            models.Question, 
            models.Result, 
            models.Notification, 
            models.LeaveRequest
        ]

        for model_class in model_classes:
            table_name = model_class.__tablename__
            print(f"\n{'='*20} TABLE: {table_name.upper()} {'='*20}")
            
            try:
                data = db.query(model_class).all()
            except Exception as e:
                print(f"Error querying {table_name}: {e}")
                continue

            if not data:
                print(f"No data found in {table_name}.")
                continue

            # Print column headers
            columns = [column.name for column in model_class.__table__.columns]
            header = " | ".join(columns)
            print(header)
            print("-" * len(header))

            for record in data:
                row = []
                for col in columns:
                    val = getattr(record, col)
                    # Truncate long strings for better display
                    if isinstance(val, str) and len(val) > 40:
                        val = val[:37] + "..."
                    row.append(str(val))
                print(" | ".join(row))
            
    finally:
        db.close()

if __name__ == "__main__":
    view_data()
