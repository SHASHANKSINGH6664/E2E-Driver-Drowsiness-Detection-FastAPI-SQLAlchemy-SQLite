// Config (matches server config.py)
const EAR_THRESHOLD = 0.18
const CONSEC_FRAMES = 25
const SERVER_URL    = "http://localhost:8000/api/v1/log-alert"
// const DRIVER_ID     = "driver_001" // todo: replace hardcoded id






// DOM elements
const video        = document.getElementById("video")
const canvas       = document.getElementById("canvas")
const ctx          = canvas.getContext("2d")
const earValueEl   = document.getElementById("ear-value")
const frameCountEl = document.getElementById("frame-count")
const alertOverlay = document.getElementById("alert-overlay")
const noFaceEl     = document.getElementById("no-face")
const statusEl     = document.getElementById("status")
const startBtn     = document.getElementById("start-btn")
const driverIdInput  = document.getElementById("driver-id-input") 
const driverIdHint = document.querySelector(".driver-id-hint")

// State
let localCounter = 0
let alertActive  = false
let DRIVER_ID = ""

// Audio
let audioContext = null
let alarmBuffer  = null



async function loadAlarm() {
    try {
        audioContext = new AudioContext()
        const response    = await fetch("/static/alarm.wav")
        const arrayBuffer = await response.arrayBuffer()
        alarmBuffer       = await audioContext.decodeAudioData(arrayBuffer)
        console.log("Alarm sound loaded.")
    } catch (e) {
        console.warn("alarm.wav not found or could not be decoded:", e)
    }
}

function playAlarm() {
    if (!audioContext || !alarmBuffer) return
    // fresh instance needed for each playback
    const source = audioContext.createBufferSource()
    source.buffer = alarmBuffer
    source.connect(audioContext.destination)
    source.start()
}

// Session handler (groups logs per page load)
function getSessionId() {
    if (!window._sessionId) {
        const ts     = Date.now()
        const random = Math.random().toString(36).substring(2, 8)
        window._sessionId = `sess_${ts}_${random}`
    }
    return window._sessionId
}

// Server sync (non-blocking)
async function postAlertToServer(framesCount) {
    const payload = {
        driver_id:                 DRIVER_ID,
        session_id:                getSessionId(),
        timestamp:                 new Date().toISOString(),
        ear_value_at_trigger:      parseFloat(earValueEl.textContent) || 0.0,
        consecutive_frames_failed: framesCount
    }

    console.log("Sending alert to server:", payload)

    try {
        const res  = await fetch(SERVER_URL, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(payload)
        })
        const data = await res.json()
        console.log("Server response:", data)
    } catch (e) {
        console.warn("Server unreachable — alert not logged:", e)
    }
}

// Alert toggles
function triggerAlert(avgEAR) {
    alertOverlay.classList.add("active")
    statusEl.textContent = "⚠ DROWSINESS DETECTED — WAKE UP!"
    statusEl.className   = "alert"

    if (!alertActive) {
        alertActive        = true
        playAlarm()
    }
}

function deactivateAlert(framesCount = 0) {
    if (alertActive) {
        postAlertToServer(framesCount)   // send final count on recovery
    }
    alertOverlay.classList.remove("active")
    statusEl.textContent = "Monitoring..."
    statusEl.className   = ""
    alertActive          = false
}

// MediaPipe setup
const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
})

faceMesh.setOptions({
    maxNumFaces:            1,
    refineLandmarks:        true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence:  0.5
})

// Processing loop
faceMesh.onResults((results) => {

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        noFaceEl.style.display = "block"
        earValueEl.textContent = "--"
        localCounter = 0
        deactivateAlert()
        return
    }

    noFaceEl.style.display = "none"

    const landmarks = results.multiFaceLandmarks[0]
    const avgEAR    = getAvgEAR(landmarks)   

    // UI update
    earValueEl.textContent = avgEAR.toFixed(3)
    earValueEl.style.color = avgEAR < EAR_THRESHOLD ? "#ff4444" : "#00ff88"

    // Counter checks
    if (avgEAR < EAR_THRESHOLD) {
        localCounter++
        frameCountEl.textContent = localCounter
        frameCountEl.style.color = "#ff4444"

        if (localCounter >= CONSEC_FRAMES) {
            triggerAlert(avgEAR)
        }
    } else {
        const finalCount = localCounter   // cache before reset
        localCounter = 0
        frameCountEl.textContent = 0
        frameCountEl.style.color = "#00ff88"
        deactivateAlert(finalCount)       
    }
})

// Feed loop
async function processFrame() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    await faceMesh.send({ image: canvas })
    requestAnimationFrame(processFrame)
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        video.srcObject = stream
        statusEl.textContent = "Loading face detection model..."

        video.onloadedmetadata = () => {
            statusEl.textContent = "Monitoring..."
            processFrame()
        }
    } catch (e) {
        statusEl.textContent = "Camera error — allow camera permission and refresh."
        console.error(e)
    }
}

// Init
startBtn.addEventListener("click", async () => {
    DRIVER_ID = driverIdInput.value.trim()
    startBtn.disabled    = true
    startBtn.textContent = "MONITORING..."
    await loadAlarm()
    startCamera()
})
driverIdInput.addEventListener("input", () => {
    const hasValue = driverIdInput.value.trim() !== ""
    startBtn.disabled = !hasValue
    driverIdHint.style.display = hasValue ? "none" : "block"
})