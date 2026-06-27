from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


# SEND BY CLIENT BROWSER
# incoming POST data
class AlertIn(BaseModel):
    driver_id:str = Field(..., min_length=1, max_length=64) # "..." is used to show that this field is required
    session_id:Optional[str]= Field(None, max_length=128)
    timestamp: datetime                        
    ear_value_at_trigger:float= Field(..., ge=0.0, le=1.0)
    consecutive_frames_failed: int = Field(..., ge=25) 


# RETURN AFTER SAVING ALERT
# POST response
class AlertOut(BaseModel):
    status:   str  
    alert_id: int



# THIS PIECE OF CODE CAN BE USED IN EXTENSTION OF PROJECT

# # READING ALERT
# # GET response
# class AlertRecord(BaseModel):
#     id:int
#     driver_id:str
#     session_id:Optional[str]
#     timestamp: datetime
#     ear_value_at_trigger:float
#     consecutive_frames_failed:int
#     created_at:datetime

#     model_config = {"from_attributes": True}  # lets Pydantic read SQLAlchemy objects directly