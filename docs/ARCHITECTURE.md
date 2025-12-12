# Fleet Management System - Architecture

## System Overview

The Fleet Management System is a real-time vehicle tracking and management platform built with modern web technologies, providing live telemetry, geofencing, alerts, and comprehensive analytics.

## Technology Stack

### Frontend (Web Application)
- **Framework**: React 18.3.1 with TypeScript 5.7.2
- **Build Tool**: Vite 6.3.5 (fast HMR, optimized builds)
- **UI Library**: Radix UI primitives + Tailwind CSS
- **Maps**: Leaflet 1.9.4 + react-leaflet 4.2.1
- **Real-time**: Socket.IO Client 4.8.1
- **State Management**: React Hooks (useState, useEffect, useRef)
- **HTTP Client**: Axios + Fetch API
- **Testing**: Jest 29.7 + React Testing Library

### Backend (API Server)
- **Framework**: FastAPI (Python async web framework)
- **Real-time**: Python Socket.IO + WebSockets
- **Database**: PostgreSQL 16 (persistent storage)
- **Cache/PubSub**: Redis 7.4 (telemetry distribution)
- **ORM**: SQLAlchemy (async)
- **Validation**: Pydantic models
- **Authentication**: JWT (HS256)
- **API Docs**: OpenAPI/Swagger (auto-generated)
- **Metrics**: Prometheus client
- **Testing**: pytest + pytest-asyncio

### Mobile Application
- **Framework**: React Native + Expo (cross-platform)
- **Maps**: react-native-maps
- **Navigation**: React Navigation
- **Storage**: AsyncStorage (offline cache)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus metrics endpoint

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├──────────────┬──────────────────┬───────────────────────────────┤
│              │                  │                               │
│  Web Browser │   Mobile App     │   Admin Dashboard            │
│  (React +    │  (React Native   │   (React + Vite)             │
│   Vite)      │   + Expo)        │                              │
│              │                  │                               │
└──────┬───────┴────────┬─────────┴────────┬─────────────────────┘
       │                │                  │
       │ HTTPS/WSS      │ HTTPS/WSS        │ HTTPS/WSS
       │                │                  │
       └────────────────┴──────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Nginx Reverse       │
            │   Proxy + SSL         │
            │   - Load Balancing    │
            │   - SSL Termination   │
            │   - Request Routing   │
            └───────────┬───────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────────┐       ┌──────────────────────┐
│  Static Assets    │       │  Backend Services    │
│  (Frontend Build) │       │  (FastAPI + Socket.IO│
│  - index.html     │       │   + Workers)         │
│  - JS bundles     │       └──────────┬───────────┘
│  - CSS files      │                  │
│  - Images         │                  │
└───────────────────┘                  │
                        ┌──────────────┴──────────────┐
                        │                             │
                        ▼                             ▼
            ┌──────────────────┐        ┌─────────────────────┐
            │   PostgreSQL     │        │   Redis             │
            │   (Persistent    │        │   (Cache + PubSub)  │
            │    Data)         │        │                     │
            └──────────────────┘        └─────────────────────┘
```

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── FleetMap.tsx           # Core map component (Leaflet)
│   ├── pages/
│   │   ├── OwnerDashboard.tsx      # Owner view
│   │   ├── SupervisorDashboard.tsx # Supervisor view
│   │   ├── VehicleTracking.tsx     # Real-time tracking
│   │   ├── GeofencingPage.tsx      # Geofence management
│   │   ├── FuelReports.tsx         # Fuel analytics
│   │   ├── InsightsPage.tsx        # Data insights
│   │   └── Settings.tsx            # User settings
│   └── ui/                    # Reusable UI components
├── App.tsx                    # Main app router
└── main.tsx                   # Entry point
```

### Backend Services

```
backend/
├── app/
│   ├── main.py              # FastAPI app + Socket.IO
│   ├── api/                 # REST endpoints
│   │   ├── auth.py          # Authentication
│   │   ├── vehicles.py      # Vehicle CRUD
│   │   ├── geofences.py     # Geofence management
│   │   └── endpoints.py     # Misc endpoints
│   ├── poller.py            # Millitrack API poller
│   ├── alerts_worker.py     # Alert processing
│   ├── simulate.py          # Test data generator
│   ├── models.py            # SQLAlchemy models
│   ├── db.py                # Database connection
│   ├── redis_client.py      # Redis pub/sub
│   ├── security.py          # JWT utilities
│   └── settings.py          # Configuration
├── tests/                   # Unit tests
└── alembic/                 # Database migrations
```

## Data Flow Diagrams

### 1. Telemetry Ingestion Pipeline

```
┌─────────────────┐
│  Millitrack API │ (External vendor)
└────────┬────────┘
         │
         │ HTTP GET (every 10s min)
         ▼
┌─────────────────────────┐
│  Poller Worker          │
│  (Background Task)      │
│  - Fetch data           │
│  - Normalize payload    │
│  - Validate data        │
└────────┬────────────────┘
         │
         │ Publish to channel
         ▼
┌─────────────────────────┐       ┌──────────────────┐
│  Redis Channel          │────→  │  PostgreSQL      │
│  "telemetry"            │       │  telemetry_raw   │
│  (Pub/Sub)              │       │  (Persistence)   │
└────────┬────────────────┘       └──────────────────┘
         │
         │ Subscribe
         ├──────────┬──────────┬──────────┐
         ▼          ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌─────────┐
    │Socket.IO│ │WebSocket│ │Alerts │ │Other   │
    │Broadcast│ │Broadcast│ │Worker │ │Workers │
    └────┬───┘ └────┬───┘ └────┬───┘ └────┬────┘
         │          │          │          │
         └──────────┴──────────┴──────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Connected Clients   │
         │  (Web + Mobile)      │
         └──────────────────────┘
```

### 2. Geofence Alert Flow

```
┌──────────────────┐
│ Vehicle Update   │ (from telemetry channel)
│ {imei, lat, lon} │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Alert Worker             │
│ (Redis Subscriber)       │
└────────┬─────────────────┘
         │
         │ 1. Load geofences from DB
         │ 2. Check if vehicle inside/outside
         │ 3. Apply time windows
         │ 4. Detect violations
         ▼
┌──────────────────────────┐
│ Is Alert Triggered?      │
│ - Entry/Exit events      │
│ - Late arrival           │
│ - Unauthorized zone      │
└────────┬─────────────────┘
         │ Yes
         ▼
┌──────────────────────────┐       ┌───────────────────┐
│ Redis Channel "alerts"   │────→  │ PostgreSQL        │
│ Publish alert event      │       │ alerts table      │
└────────┬─────────────────┘       └───────────────────┘
         │
         │ Broadcast to clients
         ├────────────┬─────────────┐
         ▼            ▼             ▼
    ┌────────┐  ┌─────────┐  ┌───────────┐
    │Web UI  │  │Email/SMS│  │Push Notif │
    │Alert   │  │Service  │  │(Mobile)   │
    └────────┘  └─────────┘  └───────────┘
```

### 3. Authentication Flow

```
┌──────────────┐
│ User Login   │
│ Request      │
└──────┬───────┘
       │
       │ POST /api/auth/login
       │ {username, password}
       ▼
┌──────────────────────┐
│ FastAPI Auth         │
│ Endpoint             │
└──────┬───────────────┘
       │
       │ 1. Query PostgreSQL users table
       │ 2. Verify password hash
       ▼
┌──────────────────────┐
│ Credentials Valid?   │
└──────┬───────────────┘
       │ Yes
       ▼
┌──────────────────────┐
│ Generate JWT Token   │
│ - User ID            │
│ - Expiry (60 min)    │
│ - HS256 signature    │
└──────┬───────────────┘
       │
       │ Return {token, user_info}
       ▼
┌──────────────────────┐
│ Client Storage       │
│ - localStorage (web) │
│ - SecureStore (mobile│
└──────┬───────────────┘
       │
       │ Subsequent requests
       │ Header: Authorization: Bearer <token>
       ▼
┌──────────────────────┐
│ JWT Verification     │
│ Middleware           │
│ - Decode token       │
│ - Verify signature   │
│ - Check expiry       │
└──────────────────────┘
```

## Database Schema

### Core Tables

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- owner, supervisor, driver
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    imei VARCHAR(255) UNIQUE NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    fuel_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_vehicles_imei ON vehicles(imei);
CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);

-- Telemetry raw data
CREATE TABLE telemetry_raw (
    id SERIAL PRIMARY KEY,
    imei VARCHAR(255) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION,
    ignition BOOLEAN,
    fuel DOUBLE PRECISION,
    timestamp BIGINT NOT NULL,
    raw_json TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_telemetry_imei ON telemetry_raw(imei);
CREATE INDEX idx_telemetry_timestamp ON telemetry_raw(timestamp);

-- Geofences table
CREATE TABLE geofences (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    geometry JSONB NOT NULL, -- {type: "circle", center: [lat, lng], radius: 500}
    time_window_start TIME,
    time_window_end TIME,
    active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_geofences_active ON geofences(active);

-- Alerts table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    geofence_id INTEGER REFERENCES geofences(id),
    alert_type VARCHAR(100) NOT NULL, -- entry, exit, late_arrival, fuel_drop
    message TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'info', -- info, warning, critical
    acknowledged BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_alerts_vehicle ON alerts(vehicle_id);
CREATE INDEX idx_alerts_created ON alerts(created_at);
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/{id}` - Get vehicle details
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle
- `GET /api/vehicles/{id}/telemetry` - Get vehicle telemetry history

### Geofences
- `GET /api/geofences` - List all geofences
- `GET /api/geofences/{id}` - Get geofence details
- `POST /api/geofences` - Create geofence
- `PUT /api/geofences/{id}` - Update geofence
- `DELETE /api/geofences/{id}` - Delete geofence

### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts/{id}/acknowledge` - Acknowledge alert

### Real-time
- `WS /socket.io/` - Socket.IO connection
- `WS /ws` - Plain WebSocket connection
- Events: `vehicle_update`, `alert`, `connect`, `disconnect`

### Monitoring
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: HS256 algorithm, 60-minute expiry
- **Password Hashing**: bcrypt with salt
- **Role-Based Access Control**: Owner, Supervisor, Driver roles
- **Token Refresh**: Refresh tokens for extended sessions

### Data Security
- **Input Validation**: Pydantic models validate all inputs
- **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
- **XSS Prevention**: React auto-escapes content
- **CORS**: Configured allowed origins
- **Rate Limiting**: Planned (not yet implemented)

### Environment Security
- **Secrets Management**: Environment variables, never in code
- **Database Credentials**: Strong passwords, rotated regularly
- **JWT Secret**: Cryptographically secure random value
- **HTTPS**: Required in production (Nginx SSL termination)

## Scalability Considerations

### Horizontal Scaling
- **Stateless Backend**: Can run multiple instances behind load balancer
- **Redis Pub/Sub**: Distributes telemetry across backend instances
- **Database Connection Pooling**: Efficient resource usage
- **CDN**: Static assets served from edge locations

### Performance Optimization
- **Frontend Code Splitting**: Dynamic imports for large components
- **Database Indexing**: Optimized queries on frequent lookups
- **Redis Caching**: Reduces database load
- **WebSocket Compression**: Reduces bandwidth usage

### Monitoring & Observability
- **Prometheus Metrics**: Request counts, durations, error rates
- **Health Checks**: Automated service health monitoring
- **Structured Logging**: JSON logs for easy parsing
- **Error Tracking**: Centralized error collection (planned)

## Technology Choices Rationale

### Why React + Vite?
- **Fast Development**: Hot Module Replacement (HMR)
- **Modern Build**: Optimized production builds
- **TypeScript Support**: Type safety and better IDE support
- **Large Ecosystem**: Extensive library availability

### Why FastAPI?
- **Async Support**: Non-blocking I/O for high concurrency
- **Auto Documentation**: OpenAPI/Swagger generated automatically
- **Type Safety**: Pydantic models catch errors early
- **Performance**: One of the fastest Python frameworks

### Why Socket.IO?
- **Reliability**: Auto-reconnect, fallback to polling
- **Cross-Platform**: Works in browsers and mobile apps
- **Namespaces**: Organize events logically
- **Broadcasting**: Easy pub/sub pattern

### Why PostgreSQL?
- **ACID Compliance**: Data integrity guaranteed
- **JSON Support**: Flexible schema with JSONB
- **Mature**: Stable, well-documented, large community
- **Performance**: Excellent query optimization

### Why Redis?
- **Speed**: In-memory data structure store
- **Pub/Sub**: Built-in message broker
- **Persistence**: Can persist data to disk
- **Simple**: Easy to set up and use

## Deployment Architecture

### Development
- Docker Compose with hot reload
- Local PostgreSQL and Redis
- Vite dev server with HMR

### Staging
- Docker containers on single server
- PostgreSQL and Redis in containers
- Nginx reverse proxy
- Let's Encrypt SSL

### Production
- Kubernetes cluster (recommended)
- Managed PostgreSQL (AWS RDS, Google Cloud SQL)
- Managed Redis (AWS ElastiCache, Redis Cloud)
- Nginx Ingress Controller
- Horizontal Pod Autoscaler
- Prometheus + Grafana monitoring

## Future Enhancements

1. **Mobile App**: Complete React Native implementation
2. **Push Notifications**: Firebase Cloud Messaging
3. **Advanced Analytics**: Machine learning for predictive maintenance
4. **Multi-Tenancy**: Support multiple organizations
5. **Offline Mode**: Progressive Web App (PWA) capabilities
6. **Video Streaming**: Dash cam integration
7. **Route Optimization**: AI-powered route planning
8. **Driver Behavior**: Scoring based on telemetry data
