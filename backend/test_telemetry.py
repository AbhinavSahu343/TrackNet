from backend.services.telemetry_service import insert_telemetry


telemetry = {
    "timestamp": "2026-08-24T10:00:00+05:30",
    "route": "Mumbai-Delhi",
    "location": "Mumbai",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "distance_km": 0,
    "network": "Jio",
    "signal_strength": 82,
    "latency_ms": 40,
    "packet_loss_percent": 1.5,
    "download_speed_mbps": 42,
    "upload_speed_mbps": 12
}


result = insert_telemetry(telemetry)

print("Telemetry inserted successfully")
print(result)