from typing import Any

from sqlalchemy.ext.declarative import as_declarative, declared_attr


@as_declarative()
class Base:
    """
    Base class for all SQLAlchemy models in the application.
    
    Provides common functionality for models including:
    - Auto generation of table names based on class name
    - Any common methods or properties that should be shared by all models
    
    This class is the base SQLAlchemy declarative base that is used
    for all model definitions.
    """
    id: Any
    __name__: str
    
    @declared_attr
    def __tablename__(cls) -> str:
        """
        Generate tablename automatically from the class name
        """
        return cls.__name__.lower()
