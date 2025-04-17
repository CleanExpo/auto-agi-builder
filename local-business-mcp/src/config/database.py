"""
Database configuration and session management for the Local Business MCP application.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager

from src.config.settings import DATABASE_URL

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


@contextmanager
def get_db_session() -> Session:
    """
    Context manager for database sessions.
    Ensures that sessions are properly closed after use, even if exceptions occur.
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db() -> None:
    """
    Initialize the database by creating all tables.
    """
    Base.metadata.create_all(bind=engine)
