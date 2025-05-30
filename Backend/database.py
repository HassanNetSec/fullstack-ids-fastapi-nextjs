from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
# postgresql://user:password@localhost:portNumber/dbname
# Database connection URL
DATABASE_URL = "postgresql://postgres:pgadmin4@localhost:5432/Intrusion_Detection_System"

# Create engine
engine = create_engine(DATABASE_URL)

# SessionLocal for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
