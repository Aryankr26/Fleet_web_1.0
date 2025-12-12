import { useState } from 'react';
import { Building2, ChevronRight, MapPin, ArrowLeftRight, Navigation, TrendingUp, Map, Edit, X, Search, User } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import lenskartLogo from 'figma:asset/a64c707e2ad5b7f6de3ec30f2cffcba1858b49dc.png';

interface Company {
  id: string;
  name: string;
  logo: string;
  totalRoutes: number;
  totalDistance: number;
  activeVehicles: number;
}

interface Route {
  id: string;
  vehicleNumber: string;
  route: string;
  distance: string;
  stops: string[];
  status: 'Stopped' | 'Idle' | 'Moving';
  startPoint?: { lat: number; lng: number; name: string };
  endPoint?: { lat: number; lng: number; name: string };
  driverName: string;
}

interface CompanyRoutesProps {
  onNavigate?: (page: string, vehicleId?: string) => void;
}

const companies: Company[] = [
  {
    id: 'lenskart',
    name: 'Lenskart',
    logo: lenskartLogo,
    totalRoutes: 11,
    totalDistance: 284,
    activeVehicles: 11
  },
  {
    id: 'company2',
    name: 'Tech Solutions Ltd',
    logo: '💻',
    totalRoutes: 8,
    totalDistance: 220,
    activeVehicles: 8
  },
  {
    id: 'company3',
    name: 'Manufacturing Co',
    logo: '🏭',
    totalRoutes: 6,
    totalDistance: 180,
    activeVehicles: 6
  }
];

const lenskartRoutes: Route[] = [
  {
    id: '1',
    vehicleNumber: 'RJ40PA2104',
    route: 'Asavali → Sector-15 → Sector-13 → Gandhi Kutir → Mansa Chowk → Lenskart',
    distance: '25 KM U/D',
    stops: ['Asavali', 'Sector-15', 'Sector-13', 'Gandhi Kutir', 'Mansa Chowk', 'Lenskart'],
    status: 'Moving',
    driverName: 'Rajesh Kumar'
  },
  {
    id: '2',
    vehicleNumber: 'RJ40PA2805 / 1659',
    route: 'Vikas Nagar → Ravindram Hotel → Lenskart',
    distance: '20 KM U/D',
    stops: ['Vikas Nagar', 'Ravindram Hotel', 'Lenskart'],
    status: 'Idle',
    driverName: 'Sumesh Sharma'
  },
  {
    id: '3',
    vehicleNumber: 'RJ40PA2106',
    route: 'SBI → UIT Thana → Capital Mall → Satal Khas → Lenskart',
    distance: '21 KM U/D',
    stops: ['SBI', 'UIT Thana', 'Capital Mall', 'Satal Khas', 'Lenskart'],
    status: 'Idle',
    driverName: 'Shastri Verma'
  },
  {
    id: '4',
    vehicleNumber: 'RJ40PA2107',
    route: 'Central Market → Bagwali → Lenskart',
    distance: '40 KM U/D',
    stops: ['Central Market', 'Bagwali', 'Lenskart'],
    status: 'Stopped',
    driverName: 'Aman Singh'
  },
  {
    id: '5',
    vehicleNumber: 'RJ40PA2108',
    route: 'Toll Tax → Bypass Bhiwadi → Nagina Garden → Lenskart',
    distance: '30 KM U/D',
    stops: ['Toll Tax', 'Bypass Bhiwadi', 'Nagina Garden', 'Lenskart'],
    status: 'Moving',
    driverName: 'Yadav Prasad'
  },
  {
    id: '6',
    vehicleNumber: 'RJ40PA2109',
    route: 'Bhiwadi Mode → Lenskart',
    distance: '15 KM U/D',
    stops: ['Bhiwadi Mode', 'Lenskart'],
    status: 'Idle',
    driverName: 'Vikram Patel'
  },
  {
    id: '7',
    vehicleNumber: 'RJ40PA2110 / 1650',
    route: 'Capital Greens → Patel Medical → C Shift → Complete Satal Khas Cover → G Shift → Nagina Garden → Lenskart',
    distance: '15 KM U/D',
    stops: ['Capital Greens', 'Patel Medical', 'C Shift', 'Complete Satal Khas Cover', 'G Shift', 'Nagina Garden', 'Lenskart'],
    status: 'Idle',
    driverName: 'Arjun Gupta'
  },
  {
    id: '8',
    vehicleNumber: 'RJ40PA2111',
    route: 'Helicopter Building → Yadav Misthan Bhandar → Bijli Board → Bhagat Singh Chowk → Highway → Ravindram Hotel → Lenskart',
    distance: '38 KM U/D',
    stops: ['Helicopter Building', 'Yadav Misthan Bhandar', 'Bijli Board', 'Bhagat Singh Chowk', 'Highway', 'Ravindram Hotel', 'Lenskart'],
    status: 'Stopped',
    driverName: 'Deepak Yadav'
  },
  {
    id: '9',
    vehicleNumber: 'RJ40PA2116',
    route: 'Hetram Chowk → Alampur Mandir → Lenskart',
    distance: '16 KM U/D',
    stops: ['Hetram Chowk', 'Alampur Mandir', 'Lenskart'],
    status: 'Moving',
    driverName: 'Rohit Joshi'
  },
  {
    id: '10',
    vehicleNumber: 'RJ40PA2123',
    route: 'UIT Sector-05 → 96 → Captain Chowk → Parshuram Chowk → Lenskart',
    distance: '18 KM U/D',
    stops: ['UIT Sector-05', '96', 'Captain Chowk', 'Parshuram Chowk', 'Lenskart'],
    status: 'Idle',
    driverName: 'Suresh Reddy'
  },
  {
    id: '11',
    vehicleNumber: 'RJ40PA2126',
    route: 'Gopali Chowk → Bus Stand → Kasana PG-2 → Bus Stand → Gurudwara → Market → Gwalka Mode → Abdula Market → Mustan Colony → Company',
    distance: '46 KM U/D',
    stops: ['Gopali Chowk', 'Bus Stand', 'Kasana PG-2', 'Bus Stand', 'Gurudwara', 'Market', 'Gwalka Mode', 'Abdula Market', 'Mustan Colony', 'Company'],
    status: 'Idle',
    driverName: 'Manoj Kumar'
  }
];

export function CompanyRoutes({ onNavigate }: CompanyRoutesProps = {}) {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editingDriver, setEditingDriver] = useState<Route | null>(null);
  const [newDriverName, setNewDriverName] = useState('');
  const [startSearch, setStartSearch] = useState('');
  const [endSearch, setEndSearch] = useState('');
  const [startPin, setStartPin] = useState<{ lat: number; lng: number } | null>(null);
  const [endPin, setEndPin] = useState<{ lat: number; lng: number } | null>(null);

  const handleCompanyClick = (companyId: string) => {
    setSelectedCompany(companyId);
    setExpandedRoute(null);
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setExpandedRoute(null);
  };

  const toggleRouteExpand = (routeId: string) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };

  const handleSeeOnMap = (e: React.MouseEvent, vehicleNumber: string) => {
    e.stopPropagation(); // Prevent card expand/collapse
    if (onNavigate) {
      onNavigate('dashboard', vehicleNumber);
    }
  };

  const handleEditRoute = (e: React.MouseEvent, route: Route) => {
    e.stopPropagation(); // Prevent card expand/collapse
    setEditingRoute(route);
    // Initialize with existing data if available
    if (route.startPoint) {
      setStartPin({ lat: route.startPoint.lat, lng: route.startPoint.lng });
      setStartSearch(route.startPoint.name);
    }
    if (route.endPoint) {
      setEndPin({ lat: route.endPoint.lat, lng: route.endPoint.lng });
      setEndSearch(route.endPoint.name);
    }
  };

  const handleEditDriver = (e: React.MouseEvent, route: Route) => {
    e.stopPropagation(); // Prevent card expand/collapse
    setEditingDriver(route);
    setNewDriverName(route.driverName);
  };

  const handleCloseEdit = () => {
    setEditingRoute(null);
    setStartSearch('');
    setEndSearch('');
    setStartPin(null);
    setEndPin(null);
  };

  const handleCloseDriverEdit = () => {
    setEditingDriver(null);
    setNewDriverName('');
  };

  const handleSaveRoute = () => {
    // In a real application, this would save to backend
    console.log('Saving route:', {
      routeId: editingRoute?.id,
      startPin,
      endPin,
      startSearch,
      endSearch
    });
    handleCloseEdit();
  };

  const handleSaveDriver = () => {
    // In a real application, this would save to backend
    console.log('Saving driver:', {
      routeId: editingDriver?.id,
      newDriverName
    });
    handleCloseDriverEdit();
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>, type: 'start' | 'end') => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to approximate lat/lng (simplified for demo)
    const lat = 28.4 - (y / rect.height) * 0.2;
    const lng = 77.0 + (x / rect.width) * 0.2;
    
    if (type === 'start') {
      setStartPin({ lat, lng });
    } else {
      setEndPin({ lat, lng });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Moving':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'Idle':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
      case 'Stopped':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  // Companies List View
  if (!selectedCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fadeIn">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Company Routes</h1>
            <p className="text-slate-600">Manage and view routes for different companies</p>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company, index) => (
              <Card
                key={company.id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500 animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleCompanyClick(company.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform overflow-hidden p-2">
                        {company.id === 'lenskart' ? (
                          <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                        ) : (
                          <span>{company.logo}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {company.name}
                        </h3>
                        <p className="text-sm text-slate-500">Transportation Partner</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Navigation className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{company.totalRoutes}</p>
                      <p className="text-xs text-slate-600">Routes</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">{company.totalDistance}</p>
                      <p className="text-xs text-slate-600">Total KM</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{company.activeVehicles}</p>
                      <p className="text-xs text-slate-600">Vehicles</p>
                    </div>
                  </div>

                  <Badge className="mt-4 bg-green-100 text-green-700 hover:bg-green-200">
                    Active
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Route Details View (for Lenskart)
  const selectedCompanyData = companies.find(c => c.id === selectedCompany);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 animate-fadeIn">
          <Button
            onClick={handleBackToCompanies}
            variant="ghost"
            className="mb-4 hover:bg-slate-200"
          >
            ← Back to Companies
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-4xl shadow-xl overflow-hidden p-2">
              {selectedCompanyData?.id === 'lenskart' ? (
                <img src={selectedCompanyData.logo} alt={selectedCompanyData.name} className="w-full h-full object-contain" />
              ) : (
                <span>{selectedCompanyData?.logo}</span>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">{selectedCompanyData?.name}</h1>
              <p className="text-slate-600">Transportation Routes & Schedules</p>
            </div>
          </div>
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          {lenskartRoutes.map((route, index) => (
            <Card
              key={route.id}
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 cursor-pointer animate-slideUp"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => toggleRouteExpand(route.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Vehicle Number */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-900 text-white hover:bg-slate-800 text-sm px-3 py-1">
                          {route.vehicleNumber}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={(e) => handleSeeOnMap(e, route.vehicleNumber)}
                          className="h-7 px-2 bg-green-500 hover:bg-green-600 text-white flex items-center gap-1.5 shadow-md"
                        >
                          <Map className="w-3.5 h-3.5" />
                          <span className="text-xs">See on Map</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => handleEditRoute(e, route)}
                          className="h-7 px-2 bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1.5 shadow-md"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => handleEditDriver(e, route)}
                          className="h-7 px-2 bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1.5 shadow-md"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span className="text-xs">Driver</span>
                        </Button>
                      </div>
                      <Badge className={getStatusColor(route.status)}>
                        {route.status}
                      </Badge>
                    </div>

                    {/* Route */}
                    <div className="mb-3">
                      <p className="text-sm text-slate-500 mb-1">Route:</p>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-600">Driver: {route.driverName}</span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {route.route}
                      </p>
                    </div>

                    {/* Distance */}
                    <div className="flex items-center gap-2 text-blue-600">
                      <ArrowLeftRight className="w-4 h-4" />
                      <span className="font-bold">{route.distance}</span>
                      <span className="text-sm text-slate-500">(Round Trip)</span>
                    </div>

                    {/* Expanded View - Stops */}
                    {expandedRoute === route.id && (
                      <div className="mt-6 pt-6 border-t border-slate-200 animate-fadeIn">
                        <p className="text-sm font-semibold text-slate-700 mb-3">Route Stops ({route.stops.length})</p>
                        <div className="space-y-2">
                          {route.stops.map((stop, idx) => (
                            <div key={idx} className="flex items-center gap-3 animate-slideIn" style={{ animationDelay: `${idx * 50}ms` }}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 
                                  ? 'bg-green-500 text-white' 
                                  : idx === route.stops.length - 1 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-800">{stop}</p>
                                {idx === 0 && <p className="text-xs text-green-600">Starting Point</p>}
                                {idx === route.stops.length - 1 && <p className="text-xs text-red-600">Destination</p>}
                              </div>
                              <MapPin className="w-4 h-4 text-slate-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expand Icon */}
                  <div className={`ml-4 transition-transform duration-300 ${expandedRoute === route.id ? 'rotate-90' : ''}`}>
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Route Dialog */}
        {editingRoute && (
          <Dialog open={true} onOpenChange={handleCloseEdit}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" />
                  Edit Route - {editingRoute.vehicleNumber}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Starting Point Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Starting Point</h3>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={startSearch}
                      onChange={(e) => setStartSearch(e.target.value)}
                      placeholder="Search or select on map..."
                      className="pl-10"
                    />
                  </div>
                  
                  <div
                    className="w-full h-48 bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg relative cursor-crosshair border-2 border-slate-200 hover:border-blue-400 transition-colors overflow-hidden"
                    onClick={(e) => handleMapClick(e, 'start')}
                  >
                    {/* Grid pattern for map */}
                    <div className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                          linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }}
                    />
                    
                    {/* Pin marker */}
                    {startPin && (
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{ 
                          left: `${((startPin.lng - 77.0) / 0.2) * 100}%`, 
                          top: `${((28.4 - startPin.lat) / 0.2) * 100}%` 
                        }}
                      >
                        <div className="relative">
                          <MapPin className="w-8 h-8 text-green-500 fill-green-500 drop-shadow-lg" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                    
                    {!startPin && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">Click on map to set starting point</p>
                      </div>
                    )}
                  </div>
                  
                  {startPin && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <span className="font-semibold">Coordinates:</span> {startPin.lat.toFixed(4)}, {startPin.lng.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Destination Point Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Destination Point</h3>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={endSearch}
                      onChange={(e) => setEndSearch(e.target.value)}
                      placeholder="Search or select on map..."
                      className="pl-10"
                    />
                  </div>
                  
                  <div
                    className="w-full h-48 bg-gradient-to-br from-red-50 to-slate-100 rounded-lg relative cursor-crosshair border-2 border-slate-200 hover:border-red-400 transition-colors overflow-hidden"
                    onClick={(e) => handleMapClick(e, 'end')}
                  >
                    {/* Grid pattern for map */}
                    <div className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                          linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }}
                    />
                    
                    {/* Pin marker */}
                    {endPin && (
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{ 
                          left: `${((endPin.lng - 77.0) / 0.2) * 100}%`, 
                          top: `${((28.4 - endPin.lat) / 0.2) * 100}%` 
                        }}
                      >
                        <div className="relative">
                          <MapPin className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-lg" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                    
                    {!endPin && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-slate-400 text-sm">Click on map to set destination point</p>
                      </div>
                    )}
                  </div>
                  
                  {endPin && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <span className="font-semibold">Coordinates:</span> {endPin.lat.toFixed(4)}, {endPin.lng.toFixed(4)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button
                    onClick={handleCloseEdit}
                    variant="outline"
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveRoute}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    disabled={!startPin || !endPin}
                  >
                    Save Route
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Driver Dialog */}
        {editingDriver && (
          <Dialog open={true} onOpenChange={handleCloseDriverEdit}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Edit Driver - {editingDriver.vehicleNumber}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Driver Name Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Driver Name</h3>
                  </div>
                  
                  <Input
                    value={newDriverName}
                    onChange={(e) => setNewDriverName(e.target.value)}
                    placeholder="Enter driver name..."
                    className="pl-10"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button
                    onClick={handleCloseDriverEdit}
                    variant="outline"
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveDriver}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                    disabled={!newDriverName}
                  >
                    Save Driver
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}