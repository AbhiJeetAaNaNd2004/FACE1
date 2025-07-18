import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import logging
from typing import Generator

# Create Base for SQLAlchemy models
Base = declarative_base()

# Database configuration for SQLite
DATABASE_URL = "sqlite:///./test.db"

# Create engine with SQLite settings
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db_session(database_url: str = None) -> Generator:
    """Get database session generator for dependency injection"""
    if database_url:
        # Create a new engine for the provided URL
        temp_engine = create_engine(database_url)
        temp_session = sessionmaker(autocommit=False, autoflush=False, bind=temp_engine)
        db = temp_session()
    else:
        db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()

def close_db_session(db):
    """Close database session safely"""
    try:
        db.close()
    except Exception as e:
        logging.error(f"Error closing database session: {e}")

def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logging.info("Database tables created successfully")
    except Exception as e:
        logging.error(f"Error creating database tables: {e}")
        raise e

def get_db():
    """Get database session for dependency injection"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()