from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Create engine based on database URL from settings
engine = create_engine(
    settings.DATABASE_URL, 
    pool_pre_ping=True,
    echo=settings.DB_ECHO_LOG
)

# Create session factory bound to the engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator:
    """
    Dependency function to get a SQLAlchemy database session

    Yields a SQLAlchemy session and ensures proper cleanup after use.
    This should be used as a FastAPI dependency in route functions.

    Example:
        @app.get("/users")
        def read_users(db: Session = Depends(get_db)):
            return db.query(models.User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
