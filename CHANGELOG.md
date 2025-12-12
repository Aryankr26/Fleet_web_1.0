# Changelog

All notable changes to the Fleet Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial production-ready setup
- Comprehensive documentation (audit/report.json)
- CI/CD workflows for GitHub Actions (ci.yml, build-and-publish.yml)
- Nginx configuration for production deployment
- ESLint and Prettier configuration
- Environment variable examples (.env.example files)
- FleetMap component integration in GeofencingPage
- Package.json scripts for lint, format, and preview

### Changed
- GeofencingPage now uses FleetMap component instead of static map image
- Environment variables standardized with VITE_ prefix for frontend
- Zoom controls in GeofencingPage updated for FleetMap compatibility

### Fixed
- Static map placeholder in GeofencingPage replaced with interactive map
- Vehicle coordinates converted from percentage-based to lat/lng

## [0.1.0] - 2025-12-12

### Added
- React + TypeScript frontend with Vite
- FastAPI backend with Socket.IO for real-time updates
- FleetMap component with react-leaflet and OpenStreetMap
- Redis pub/sub for telemetry distribution
- PostgreSQL database for data persistence
- Docker Compose development environment
- Millitrack API integration with 10s minimum poll interval
- Dashboard pages: Owner, Supervisor, Vehicle Tracking, Geofencing, Fuel Reports, Insights, Settings
- Authentication with JWT
- Background workers for polling and alerts
- Prometheus metrics endpoint
- Health check endpoint

### Security
- JWT-based authentication
- CORS configuration
- Environment-based secrets management
- Input validation with Pydantic

---

## How to Use This Changelog

### For Developers
- Add changes under [Unreleased] as you work
- Use categories: Added, Changed, Deprecated, Removed, Fixed, Security
- Move to versioned section when releasing

### For Users
- Check latest version for new features
- Read upgrade notes for breaking changes
- Review security section for important updates

### Release Process
1. Update [Unreleased] with all changes since last release
2. On release, move [Unreleased] content to new version section
3. Update version in package.json and backend version files
4. Create git tag: `git tag v1.0.0`
5. Push with tags: `git push && git push --tags`
