# Fleet Management System - New Features Guide

## Overview
This guide explains the newly implemented features for the Fleet Management System owner dashboard.

## Features Implemented

### 1. User Management (Settings Page)

The Settings page now includes complete user management functionality with backend integration.

#### Accessing User Management:
1. Log in as an owner
2. Navigate to **Settings** → **User Access** tab

#### Available Operations:

**Add New User:**
- Click the "Add New User" button
- Fill in the form:
  - Username (required)
  - Email (optional)
  - Password (required, minimum 6 characters)
  - Role (select from: Owner, Supervisor, Operator)
- Click "Create User"
- Success/error notification will appear

**Edit User:**
- Click the edit button (pencil icon) next to any user
- Update:
  - Status (Active/Inactive)
  - Role (Owner/Supervisor/Operator)
- Click "Update User"
- Success/error notification will appear

**Delete User:**
- Click the delete button (trash icon) next to any user
- Confirm deletion in the dialog
- Note: Cannot delete the owner role if it's the last owner
- Note: Cannot delete yourself
- Success/error notification will appear

### 2. Vehicle Management

A dedicated vehicle management page allows owners to manage their fleet.

#### Accessing Vehicle Management:
1. Log in as an owner
2. Navigate to the **Vehicle Management** page (if added to navigation)
3. Or access programmatically through `onNavigate('vehicle-management')`

#### Available Operations:

**Add New Vehicle:**
- Click the "Add Vehicle" button
- Fill in the form:
  - Vehicle IMEI (required) - Unique identifier
  - Vehicle Label (optional) - Friendly name or description
- Click "Add Vehicle"
- Success/error notification will appear
- Vehicle list will update automatically

**Edit Vehicle:**
- Click the edit button (pencil icon) next to any vehicle
- Update the vehicle label
- Click "Update Vehicle"
- Success/error notification will appear
- Vehicle list will update automatically

**Delete Vehicle:**
- Click the delete button (trash icon) next to any vehicle
- Confirm deletion in the dialog
- Success/error notification will appear
- Vehicle list will update automatically

## API Endpoints

### User Management APIs
- `GET /api/users` - List all users (authenticated users)
- `POST /api/users` - Create new user (owner only)
- `PATCH /api/users/{user_id}` - Update user (owner only)
- `DELETE /api/users/{user_id}` - Delete user (owner only)

### Vehicle Management APIs
- `GET /api/vehicles` - List all vehicles (authenticated users)
- `POST /api/vehicles` - Create new vehicle (owner only)
- `PATCH /api/vehicles/{imei}` - Update vehicle (owner only)
- `DELETE /api/vehicles/{imei}` - Delete vehicle (owner only)

## Security & Permissions

### Role-Based Access Control:
- **Owner**: Full access to all CRUD operations
- **Supervisor**: Read-only access (can view but not modify)
- **Operator**: Read-only access (can view but not modify)

### Authentication:
- All API endpoints require JWT token authentication
- Token is stored in localStorage and automatically included in requests
- Invalid or expired tokens will result in 401 Unauthorized errors

### Safety Features:
- Cannot delete the last owner user
- Cannot delete yourself
- Confirmation dialogs for all delete operations
- Input validation before API calls
- Error messages display specific issues

## Technical Implementation

### Frontend Structure:
```
src/
├── lib/
│   └── api.ts                 # API client with type-safe interfaces
├── components/
│   ├── VehicleManagement.tsx  # Reusable vehicle management component
│   └── pages/
│       ├── Settings.tsx       # Settings page with user management
│       └── VehicleManagementPage.tsx  # Vehicle management page
```

### Backend Structure:
```
backend/app/
├── api/
│   ├── users.py              # User management endpoints
│   └── vehicles.py           # Vehicle management endpoints
├── db_sqlite.py              # Database operations
└── security.py               # Authentication & authorization
```

### Type Safety:
All API calls use TypeScript interfaces for type checking:
- `User` interface for user data
- `Vehicle` interface for vehicle data
- Request/Response types for all operations

## Error Handling

The system includes comprehensive error handling:

1. **Network Errors**: Displays "Failed to connect" messages
2. **Validation Errors**: Shows specific field validation messages
3. **Permission Errors**: Displays "owner_required" or "unauthorized" messages
4. **Not Found Errors**: Shows "not_found" messages
5. **Conflict Errors**: Displays messages like "username_taken" or "vehicle_already_exists"

All errors are displayed as toast notifications with clear, user-friendly messages.

## Development

### Running the Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Running the Frontend:
```bash
npm install
npm run dev
```

### Building for Production:
```bash
npm run build
```

### Testing:
1. Ensure backend is running
2. Create an owner user account (if not exists)
3. Log in as owner
4. Test all CRUD operations for users and vehicles
5. Verify proper error messages
6. Check toast notifications appear correctly

## Environment Variables

### Frontend:
- `VITE_API_URL`: Backend API base URL (default: http://localhost:8000)

### Backend:
- `DATABASE_URL`: PostgreSQL connection string (optional, uses SQLite if not set)
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_ALGORITHM`: Algorithm for JWT (default: HS256)

## Troubleshooting

### "Cannot find module" errors:
- Run `npm install` to ensure all dependencies are installed

### "Unauthorized" errors:
- Ensure you're logged in with an owner account
- Check that the JWT token is valid and not expired
- Verify CORS settings allow your frontend origin

### "Failed to fetch" errors:
- Ensure backend server is running
- Check `VITE_API_URL` environment variable
- Verify network connectivity

### Build errors:
- Run `npm run build` to check for compilation errors
- Fix any TypeScript type errors
- Ensure all imports are correct

## Support

For issues or questions:
1. Check the console for detailed error messages
2. Verify backend logs for API errors
3. Ensure all required environment variables are set
4. Contact the development team with specific error details
