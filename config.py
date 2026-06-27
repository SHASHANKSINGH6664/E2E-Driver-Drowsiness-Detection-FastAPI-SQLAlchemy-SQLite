import os
from dotenv import load_dotenv

load_dotenv() #load from .env file


# if not in .env then it will take value by default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./alerts.db")
EAR_THRESHOLD = float(os.getenv("EAR_THRESHOLD", "0.18"))
CONSEC_FRAMES = int(os.getenv("CONSEC_FRAMES", "25"))