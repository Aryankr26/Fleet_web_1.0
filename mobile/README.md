# Fleet Management Mobile App

React Native mobile application for the Fleet Management System using Expo.

## Prerequisites

- Node.js 20.x or higher
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (optional)

## Installation

```bash
cd mobile
npm install
```

## Configuration

Create a `.env` file in the `mobile/` directory:

```
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

Replace `192.168.1.100` with your computer's local IP address (not localhost, as the mobile device needs to reach it).

## Development

```bash
# Start the development server
npx expo start

# Run on iOS simulator (Mac only)
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Open with Expo Go on physical device
# Scan the QR code with Expo Go app
```

## Features

- Real-time vehicle tracking on map
- Socket.IO connection for live telemetry
- Vehicle list with status indicators
- Login/authentication
- Geofence alerts
- Offline data caching

## Project Structure

```
mobile/
├── app/              # App screens (Expo Router)
│   ├── index.tsx     # Login screen
│   ├── map.tsx       # Map view
│   └── vehicles.tsx  # Vehicle list
├── components/       # Reusable components
│   ├── VehicleMarker.tsx
│   └── MapView.tsx
├── services/         # API and Socket.IO services
│   ├── api.ts
│   └── socket.ts
├── app.json          # Expo configuration
└── package.json
```

## Building for Production

### Android (APK)

```bash
npx expo build:android
```

### iOS (IPA - requires Apple Developer account)

```bash
npx expo build:ios
```

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Troubleshooting

### Cannot connect to backend

- Ensure your device and computer are on the same network
- Use your computer's local IP address, not `localhost`
- Check that backend is running on port 8000
- Verify firewall isn't blocking connections

### Expo Go crashes

- Try clearing Expo cache: `npx expo start -c`
- Update Expo Go app to latest version
- Restart development server

## Notes

This is a placeholder README. The full mobile app implementation will include:
- Expo-managed React Native project
- react-native-maps for map display
- Socket.IO client for real-time updates
- Secure token storage
- Push notifications
- Offline support

To implement the full mobile app, run:

```bash
# Initialize Expo project
npx create-expo-app@latest mobile --template blank-typescript

# Install dependencies
cd mobile
npm install @react-navigation/native expo-router
npm install react-native-maps expo-location
npm install socket.io-client axios
npm install @react-native-async-storage/async-storage
```

Then implement the screens and services as described in the project structure above.
