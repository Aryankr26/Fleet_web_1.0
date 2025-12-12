# Fleet Management Backend

FastAPI-based backend for the Fleet Management System with real-time telemetry, geofencing, and alerts.

## Features

- **Real-time Telemetry**: WebSocket/Socket.IO for live vehicle updates
- **Millitrack Integration**: Polls Millitrack API with rate limit respect (10s minimum)
- **Redis Pub/Sub**: Distributes telemetry to multiple backend instances
- **PostgreSQL**: Persistent storage for vehicles, geofences, users, alerts
- **Alembic Migrations**: Database schema versioning
- **JWT Authentication**: Secure API access
- **OpenAPI Documentation**: Auto-generated API docs at `/docs`
- **Prometheus Metrics**: Monitoring endpoint at `/metrics`
- **Background Workers**: Poller, alert processor, simulator

## Quick Start

### Docker Compose (Recommended)

**Unix/Linux/macOS:**
\`\`\`bash
cd backend
cp .env.example .env
# Edit .env (set MILLITRACK_TOKEN if you have one)
docker compose -f docker-compose.dev.yml up --build
\`\`\`

**Windows PowerShell:**
\`\`\`powershell
Set-Location backend
Copy-Item .env.example .env -Force
# Edit .env (set MILLITRACK_TOKEN if you have one)
docker compose -f docker-compose.dev.yml up --build
\`\`\`

**Access:**
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health
- Metrics: http://localhost:8000/metrics
- Socket.IO: http://localhost:8000/socket.io
- WebSocket: ws://localhost:8000/ws

### Local Development (Without Docker)

**Unix/Linux/macOS:**
\`\`\`bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Configure .env with your database and Redis URLs

# Run migrations (if using PostgreSQL)
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

**Windows PowerShell:**
\`\`\`powershell
Set-Location backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

Copy-Item .env.example .env -Force
# Configure .env with your database and Redis URLs

# Run migrations (if using PostgreSQL)
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

## Simulation Mode (No Millitrack Token)

If you don't have a Millitrack token, the backend can generate fake telemetry:

1. Set \`SIMULATE_ON_STARTUP=true\` in \`.env\`
2. Leave \`MILLITRACK_TOKEN\` empty
3. Start backend - it will simulate 7 vehicles in New Delhi area

## Resources

- **Main Documentation**: See \`../docs/ARCHITECTURE.md\` and \`../docs/DEPLOYMENT.md\`
- **API Docs**: http://localhost:8000/docs (when running)
- **GitHub Issues**: https://github.com/yourusername/Fleet_1.0/issues

## License

MIT License - see ../LICENSE file
