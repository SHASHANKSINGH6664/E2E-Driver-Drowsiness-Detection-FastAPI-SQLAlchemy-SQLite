from fastapi import APIRouter, HTTPException
# from typing import List, Optional

from database.session import SessionDep
from api.schemas import AlertIn, AlertOut #, AlertRecord
from services import alert_service


router = APIRouter()


# POST /api/v1/log-alert 

@router.post("/log-alert", response_model=AlertOut)
def log_alert(alert: AlertIn, session: SessionDep):
    try:
        saved = alert_service.create_alert(session=session, alert_data=alert)
        return AlertOut(status="logged", alert_id=saved.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save alert: {str(e)}")


# THIS PIECE OF CODE CAN BE USED IN EXTENSTION OF PROJECT

# # GET /api/v1/alerts

# @router.get("/alerts", response_model=List[AlertRecord])
# def get_alerts(
#     session: SessionDep,
#     driver_id: Optional[str] = None,
#     limit: int = 50,
#     skip: int = 0
# ):
#     if driver_id:
#         return alert_service.get_alerts_by_driver(
#             session=session, driver_id=driver_id, limit=limit, skip=skip
#         )
#     return alert_service.get_all_alerts(session=session, limit=limit, skip=skip)


# # GET /api/v1/alerts/{alert_id}

# @router.get("/alerts/{alert_id}", response_model=AlertRecord)
# def get_single_alert(alert_id: int, session: SessionDep):
#     alert = alert_service.get_alert_by_id(session=session, alert_id=alert_id)
#     if alert is None:
#         raise HTTPException(status_code=404, detail="Alert not found.")
#     return alert