"""
Models package initialization
Imports all models for Alembic autogenerate
"""
from models.drill import Drill
from models.exercise import Exercise
from models.tip import Tip
from models.training_program import TrainingProgram
from models.video import Video
from models.user import User
from models.analysis import Analysis

__all__ = ["Drill", "Exercise", "Tip", "TrainingProgram", "Video", "User", "Analysis"]
