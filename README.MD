# Driver Drowsiness Detection System

A real-time drowsiness detection system that runs entirely in the browser.
The ML model runs on the client's machine — no video frames are ever sent
over the network. Only alert events (small JSON payloads) are logged to
the server.

## How It Works

1. The browser captures webcam frames using `getUserMedia`
2. MediaPipe Face Mesh runs locally via WebAssembly — detects 478 face landmarks
3. Eye Aspect Ratio (EAR) is calculated from 6 landmarks per eye
4. If EAR drops below 0.18 for 25+ consecutive frames, an alert fires
5. The browser plays an alarm sound and shows a "WAKE UP" overlay
6. A small JSON payload (~200 bytes) is sent to the FastAPI server and logged

## Architecture

```
Browser (client)                      Server (FastAPI)
─────────────────────────────         ────────────────────────────
Camera → MediaPipe → EAR calc
Counter logic
Alarm + overlay (local)
POST alert JSON only on trigger  -->   POST /api/v1/log-alert
                                            ↓
                                        Validate (Pydantic)
                                            ↓
                                        Write to SQLite DB
                                            ↓
                                        Return alert_id
```

The server has no ML code. It only stores and serves alert history.

## Tech Stack

- **Client:** Vanilla JS, MediaPipe Face Mesh (WebAssembly via CDN)
- **Server:** FastAPI, SQLAlchemy, SQLite
- **Key libraries:** Pydantic v2 (validation), python-dotenv (config)

## Running Locally

**Requirements:** Python 3.9+, internet connection (for MediaPipe CDN)

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/drowsiness-detection
cd drowsiness-detection/server

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
uvicorn main:app --reload

# 4. Open your browser
# Go to http://localhost:8000
# Click START MONITORING
# Allow camera permission
```

## API Endpoints

| Method | Endpoint                | Description                                  |
|--------|--------------------------|-----------------------------------------------|
| POST   | `/api/v1/log-alert`     | Receives and stores a drowsiness alert       |
| GET    | `/health`               | Health check                                 |

### These are not implemented in current project, but can be used to extend the project
| Method | Endpoint                | Description                                  |
|--------|--------------------------|-----------------------------------------------|
| GET    | `/api/v1/alerts`        | Returns all alerts (filter by `?driver_id=`) |
| GET    | `/api/v1/alerts/{id}`   | Returns a single alert by ID                 |


## Database Schema

```
alerts table
├── id                          INTEGER   PRIMARY KEY
├── driver_id                   VARCHAR
├── session_id                  VARCHAR   (nullable)
├── timestamp                   DATETIME  (set by client)
├── ear_value_at_trigger        FLOAT
├── consecutive_frames_failed   INTEGER   (actual sleep duration in frames)
└── created_at                  DATETIME  (set by server)
```

## Key Design Decisions

**Edge Inference over Server-Side ML**

Sending 10 frames/second per driver to a server requires 150–400 KB/s
of continuous upload per driver. With edge inference, a fully awake driver
generates zero network traffic. The alert fires in under 1ms locally with
no round-trip latency — critical for a safety system.

**Works Offline**

If the internet drops (highway tunnel, rural road), detection keeps running.
The alarm fires locally. The server log is simply skipped.
