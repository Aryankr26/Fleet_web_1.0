import { Navigation, MapPin } from 'lucide-react';
import { FleetMap } from '../FleetMap';

export function VehicleTracking() {
  const vehicles = [
    { id: 'TN-01-AB-1234', lat: 28.6139, lng: 77.2090 },
    { id: 'TN-01-AB-1236', lat: 28.6201, lng: 77.2182 },
    { id: 'TN-01-AB-1235', lat: 28.6042, lng: 77.2301 },
    { id: 'TN-01-AB-1240', lat: 28.5932, lng: 77.2019 },
    { id: 'TN-01-AB-1238', lat: 28.6334, lng: 77.1912 },
    { id: 'TN-01-AB-1239', lat: 28.6269, lng: 77.2418 },
    { id: 'TN-01-AB-1237', lat: 28.5894, lng: 77.2257 },
    { id: 'TN-01-AB-1241', lat: 28.6422, lng: 77.2265 },
  ];

  return (
    <div className="absolute inset-0 bg-slate-100">
      <FleetMap className="absolute inset-0" center={[28.6139, 77.209]} zoom={12} vehicles={vehicles} />

      {/* Map Legend */}
      <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl">
        <h4 className="text-sm text-slate-900 mb-3">Live Fleet Status</h4>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-green-500 p-2 rounded-full">
              <Navigation className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-slate-700">Moving (5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-500 p-2 rounded-full">
              <Navigation className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-slate-700">Idle (2)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-red-500 p-2 rounded-full">
              <Navigation className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-slate-700">Warning (1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-500 p-2 rounded-full">
              <Navigation className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-slate-700">Stopped (1)</span>
          </div>
        </div>
      </div>

      {/* Map Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-8 py-4 rounded-lg shadow-xl">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-[#10b981]" />
          <div>
            <h3 className="text-slate-900">Live Fleet Tracking</h3>
            <p className="text-xs text-slate-600">Real-time employee transportation monitoring</p>
          </div>
        </div>
      </div>
    </div>
  );
}