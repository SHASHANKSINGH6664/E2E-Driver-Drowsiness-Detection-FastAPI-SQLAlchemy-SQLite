import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database.session import engine, Base
import database.models 

from api.routes.alerts import router as alerts_router


# CREATE TABLE

Base.metadata.create_all(bind=engine)   



app = FastAPI(
    title="Drowsiness Detection API",
    description="Receives drowsiness alerts from the browser client and stores them.",
    version="1.0.0"
)


#CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


#ROUTE

app.include_router(alerts_router, prefix="/api/v1")


# serve all static file to /static eg. audio,html,app
if os.path.exists("client"):
    app.mount("/static", StaticFiles(directory="client"), name="static")

    @app.get("/")
    def serve_frontend():
        return FileResponse("client/index.html")


#Check

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}