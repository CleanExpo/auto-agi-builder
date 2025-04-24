"""
Quadrants package for the Executive System Manager.
Contains the four quadrants of the system:
- Requirements & Planning
- Backend & API
- Frontend & UI
- Testing & Deployment
"""

from .requirements import RequirementsQuadrant
from .backend import BackendQuadrant
from .frontend import FrontendQuadrant
from .testing import TestingQuadrant

__all__ = [
    'RequirementsQuadrant',
    'BackendQuadrant',
    'FrontendQuadrant',
    'TestingQuadrant'
]
