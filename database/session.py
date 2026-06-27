from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base
from fastapi import Depends
from typing import Annotated

from config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} # SQLite run on single thread but FastAPI runs on multiple threads so it is important
    
)

Base = declarative_base()

def get_session():
    with Session(engine) as session:
        yield session

# This help to reduce work, we can just use this peice of code and make it shorter
SessionDep = Annotated[Session, Depends(get_session)]