# Single-service deployment of the Field Service Callback system:
# backend API + the three web surfaces (intake / supervisor / technician) on one URL.
# Build context = this folder (field-service-callback/).
FROM python:3.11-slim

WORKDIR /app
COPY . /app

# Persistent data (tickets + logs) lives here; mount a volume to keep it across restarts.
ENV FSC_DATA_DIR=/data \
    FSC_PORT=8080 \
    FSC_NOTIFY_PROVIDER=log

EXPOSE 8080
VOLUME ["/data"]

# No third-party dependencies — Python stdlib only.
CMD ["python3", "server/reference_server.py"]
