// ─── Euclidean distance between two MediaPipe landmarks ───────────────────────
// Each landmark: { x: 0..1, y: 0..1, z: depth }
// We use only x and y — same as Python which works in 2D pixel space.
//
// Python equivalent:
//   np.linalg.norm(np.array(landmarks[a]) - np.array(landmarks[b]))

function distance(p1, p2) {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    return Math.sqrt(dx * dx + dy * dy)
}


// ─── Eye landmark indices — identical to your Python main.py ──────────────────

const LEFT_EYE_IDX  = [362, 385, 387, 263, 373, 380]
const RIGHT_EYE_IDX = [33,  160, 158, 133, 153, 144]


// ─── EAR formula — direct port of calculate_ear() from main.py ───────────────
//
// Python:
//   v1 = np.linalg.norm(landmarks[idx[1]] - landmarks[idx[5]])
//   v2 = np.linalg.norm(landmarks[idx[2]] - landmarks[idx[4]])
//   h  = np.linalg.norm(landmarks[idx[0]] - landmarks[idx[3]])
//   return (v1 + v2) / (2.0 * h)

function calculateEAR(landmarks, indices) {
    const p1 = landmarks[indices[0]]   // outer corner
    const p2 = landmarks[indices[1]]   // top outer
    const p3 = landmarks[indices[2]]   // top inner
    const p4 = landmarks[indices[3]]   // inner corner
    const p5 = landmarks[indices[4]]   // bottom inner
    const p6 = landmarks[indices[5]]   // bottom outer

    const v1 = distance(p2, p6)        // vertical 1
    const v2 = distance(p3, p5)        // vertical 2
    const h  = distance(p1, p4)        // horizontal

    return (v1 + v2) / (2.0 * h)
}


// ─── Average EAR across both eyes ─────────────────────────────────────────────
//
// Python equivalent:
//   avg_ear = (left_ear + right_ear) / 2.0

function getAvgEAR(landmarks) {
    const leftEAR  = calculateEAR(landmarks, LEFT_EYE_IDX)
    const rightEAR = calculateEAR(landmarks, RIGHT_EYE_IDX)
    return (leftEAR + rightEAR) / 2.0
}