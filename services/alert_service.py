from sqlalchemy.orm import Session
from typing import List, Optional

from database.models import Alert
from api.schemas import AlertIn


# creat alert that will  be inserted in Database
def create_alert(session: Session, alert_data: AlertIn) -> Alert:
    db_alert = Alert(
        driver_id = alert_data.driver_id,
        session_id= alert_data.session_id,
        timestamp = alert_data.timestamp,
        ear_value_at_trigger = alert_data.ear_value_at_trigger,
        consecutive_frames_failed= alert_data.consecutive_frames_failed,
    )
    session.add(db_alert)     # store in memory
    session.commit()          # initialize row in database
    session.refresh(db_alert) # reload so that "db_alert.id" and "created_at: are filled in database
    return db_alert 

# THIS PIECE OF CODE CAN BE USED IN EXTENSTION OF PROJECT

# # GET method: used to get all the alerts of specific driver
# # limit, offset,skip is used for pagination: dividing large dataset into smaller , heps to retrieve portion of records
# #limit = max number of record
# #if skip = n, offset(skip) tells to skip the first n records, 
# def get_alerts_by_driver(
#     session: Session,
#     driver_id: str,
#     limit: int = 50,
#     skip: int = 0
# ) -> List[Alert]:
#     return (
#         session.query(Alert)
#         .filter(Alert.driver_id == driver_id)
#         .order_by(Alert.timestamp.desc()) # order all the alerts by time
#         .offset(skip)
#         .limit(limit)
#         .all() # without this, this will return query of records instead of list of records 
#     )

# # if driver_id is not given in get method, then this gives all the alerts in database
# def get_all_alerts(
#     session: Session,
#     limit: int = 100,
#     skip: int = 0
# ) -> List[Alert]:
#     return (
#         session.query(Alert)
#         .order_by(Alert.timestamp.desc())
#         .offset(skip)
#         .limit(limit)
#         .all()
#     )

# # each record is saved with unique id, we can fetch that record using id in this function
# def get_alert_by_id(session: Session, alert_id: int) -> Optional[Alert]:
#     return session.query(Alert).filter(Alert.id == alert_id).first()