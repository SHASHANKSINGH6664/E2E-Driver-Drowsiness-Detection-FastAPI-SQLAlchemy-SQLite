def test_log_alert_success(client):
    payload = {
        "driver_id": "test_driver_01",
        "session_id": "test_session_01",
        "timestamp": "2026-06-27T10:00:00Z",
        "ear_value_at_trigger": 0.15,
        "consecutive_frames_failed": 30
    }

    response = client.post("/api/v1/log-alert", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "logged"
    assert "alert_id" in data


def test_log_alert_invalid_payload(client):
    
    payload = {"driver_id": "test_driver_01"}

    response = client.post("/api/v1/log-alert", json=payload)

    assert response.status_code == 422  