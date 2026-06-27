from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone

from database.session import Base

# Table mapping using Base = declarative_base
class Alert(Base):
    __tablename__ = "alerts"

    id= Column(Integer, primary_key=True, index=True, autoincrement=True)
    driver_id= Column(String(64), nullable=False,index=True)
    session_id= Column(String(128),nullable=True, index=True)
    timestamp= Column(DateTime,nullable=False)
    ear_value_at_trigger= Column(Float, nullable=False)
    consecutive_frames_failed= Column(Integer, nullable=False)
    created_at= Column(DateTime,default=lambda: datetime.now(timezone.utc))