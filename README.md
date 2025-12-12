# Fleet Management System

A production-ready, real-time fleet management solution with web and mobile interfaces.

## 🚀 Features

- **Real-time Vehicle Tracking**: Live GPS tracking with OpenStreetMap
- **Interactive Dashboard**: Multiple views for owners, supervisors, and operators
- **Geofencing**: Create and monitor virtual boundaries with alerts
- **Real-time Updates**: WebSocket/Socket.IO for instant telemetry
- **Fuel Monitoring**: Track fuel consumption and detect anomalies
- **Comprehensive Reports**: Analytics, insights, and historical data
- **Mobile App**: React Native app for iOS and Android
- **Production Ready**: Docker, CI/CD, monitoring, and documentation

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Leaflet
- **Backend**: FastAPI + Socket.IO + Redis + PostgreSQL
- **Mobile**: React Native + Expo
- **Infrastructure**: Docker + Nginx + GitHub Actions

## 📦 Quick Start

### Prerequisites

- Node.js 20.x or higher
- Docker and Docker Compose (recommended)
- OR: Python 3.11+, PostgreSQL 16+, Redis 7.4+

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/Fleet_1.0.git
cd Fleet_1.0

# Frontend setup
cp .env.example .env
npm install

# Backend setup
cd backend
cp .env.example .env
# Edit .env and set your configuration

# Start all services (backend, redis, postgres)
docker compose -f docker-compose.dev.yml up --build

# In another terminal, start frontend
cd ..
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:8000  
API Docs: http://localhost:8000/docs

### Option 2: Local Development

```bash
# Frontend
npm install
cp .env.example .env
npm run dev

# Backend (in another terminal)
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database and Redis URLs
uvicorn app.main:app --reload
```

## 📱 Mobile App

```bash
cd mobile
npm install
npx expo start
```

See [mobile/README.md](mobile/README.md) for detailed instructions.

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend
pytest -v
```

## 🎨 Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) - System design and dataflow
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [Changelog](CHANGELOG.md) - Version history
- [API Documentation](http://localhost:8000/docs) - Interactive API docs (when backend is running)

## 🔧 Configuration

### Frontend Environment Variables

Create `.env` in the root directory:

```env
VITE_BACKEND_URL=http://localhost:8000
```

### Backend Environment Variables

Create `backend/.env`:

```env
LOG_LEVEL=info
MILLITRACK_TOKEN=your_token_here
REDIS_URL=redis://localhost:6379/0
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fleet
JWT_SECRET=change-this-to-a-secure-random-value
```

See `.env.example` files for all available options.

## 🚢 Deployment

### Docker Compose (Simple)

```bash
docker compose -f backend/docker-compose.dev.yml up -d
```

### Production Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Kubernetes manifests
- Nginx configuration
- SSL setup with Let's Encrypt
- Environment-specific configurations
- Scaling and monitoring

## 🔐 Security

- JWT-based authentication
- Environment-based secrets
- CORS configuration
- Input validation with Pydantic
- Rate limiting (planned)

**⚠️ IMPORTANT**: Change default secrets before deploying to production!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original design: [Figma Fleet Management Dashboard](https://www.figma.com/design/vEtI3rYNOL0AVv7sfixyjJ/Fleet-Management-Dashboard-Design)
- OpenStreetMap for map tiles
- FastAPI, React, and all open-source contributors

## 📞 Support

- Issues: [GitHub Issues](https://github.com/yourusername/Fleet_1.0/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/Fleet_1.0/discussions)

## 🗺️ Roadmap

- [x] Real-time tracking with Socket.IO
- [x] Interactive maps with Leaflet
- [x] Geofencing management
- [x] Docker development environment
- [x] CI/CD pipelines
- [ ] Mobile app (in progress - see mobile/README.md)
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Multi-tenant support
- [ ] API rate limiting
- [ ] Internationalization (i18n)
