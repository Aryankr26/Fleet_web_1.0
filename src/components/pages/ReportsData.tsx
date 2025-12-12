import { useState } from 'react';
import { 
  Clock, 
  Wind, 
  Route, 
  Power, 
  AlertTriangle, 
  Wrench, 
  MapPin, 
  Download,
  FileText,
  FileSpreadsheet,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ReportCard {
  id: string;
  title: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
}

const reportCards: ReportCard[] = [
  {
    id: 'ignition',
    title: 'Ignition Hours',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Track vehicle ignition on/off hours'
  },
  {
    id: 'ac',
    title: 'AC Hours',
    icon: Wind,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    description: 'Monitor air conditioning usage'
  },
  {
    id: 'route-tracing',
    title: 'Route Tracing (Previous)',
    icon: Route,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'View historical route data'
  },
  {
    id: 'vehicle-onoff',
    title: 'Vehicle On/Off Data',
    icon: Power,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Vehicle power status logs'
  },
  {
    id: 'device-overstated',
    title: 'Device Overstated',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Device malfunction alerts'
  },
  {
    id: 'maintenance',
    title: 'Maintenance Logs',
    icon: Wrench,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Service and maintenance records'
  },
  {
    id: 'geofence',
    title: 'Geofence Reports',
    icon: MapPin,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Geofence entry/exit logs'
  }
];

// Sample data for each report type
const ignitionData = [
  { vehicle: 'RJ40PA2104', date: '2025-12-03', ignitionOn: '06:30 AM', ignitionOff: '08:45 PM', totalHours: '14.25' },
  { vehicle: 'RJ40PA2805', date: '2025-12-03', ignitionOn: '07:00 AM', ignitionOff: '07:30 PM', totalHours: '12.50' },
  { vehicle: 'RJ40PA2106', date: '2025-12-03', ignitionOn: '06:45 AM', ignitionOff: '09:00 PM', totalHours: '14.25' },
  { vehicle: 'RJ40PA2107', date: '2025-12-03', ignitionOn: '08:00 AM', ignitionOff: '06:00 PM', totalHours: '10.00' },
  { vehicle: 'RJ40PA2108', date: '2025-12-03', ignitionOn: '06:00 AM', ignitionOff: '08:00 PM', totalHours: '14.00' }
];

const acData = [
  { vehicle: 'RJ40PA2104', date: '2025-12-03', acOn: '06:35 AM', acOff: '08:40 PM', totalHours: '14.08', fuelConsumed: '18.5 L' },
  { vehicle: 'RJ40PA2805', date: '2025-12-03', acOn: '07:05 AM', acOff: '07:25 PM', totalHours: '12.33', fuelConsumed: '16.2 L' },
  { vehicle: 'RJ40PA2106', date: '2025-12-03', acOn: '06:50 AM', acOff: '08:55 PM', totalHours: '14.08', fuelConsumed: '18.8 L' },
  { vehicle: 'RJ40PA2107', date: '2025-12-03', acOn: '08:10 AM', acOff: '05:55 PM', totalHours: '9.75', fuelConsumed: '12.5 L' },
  { vehicle: 'RJ40PA2108', date: '2025-12-03', acOn: '06:10 AM', acOff: '07:50 PM', totalHours: '13.67', fuelConsumed: '17.9 L' }
];

const routeTracingData = [
  { vehicle: 'RJ40PA2104', date: '2025-12-02', route: 'Asavali → Lenskart', distance: '25 KM', duration: '1h 45m', avgSpeed: '42 km/h' },
  { vehicle: 'RJ40PA2805', date: '2025-12-02', route: 'Vikas Nagar → Lenskart', distance: '20 KM', duration: '1h 20m', avgSpeed: '38 km/h' },
  { vehicle: 'RJ40PA2106', date: '2025-12-02', route: 'SBI → Lenskart', distance: '21 KM', duration: '1h 30m', avgSpeed: '40 km/h' },
  { vehicle: 'RJ40PA2107', date: '2025-12-02', route: 'Central Market → Lenskart', distance: '40 KM', duration: '2h 15m', avgSpeed: '45 km/h' },
  { vehicle: 'RJ40PA2108', date: '2025-12-02', route: 'Toll Tax → Lenskart', distance: '30 KM', duration: '1h 50m', avgSpeed: '43 km/h' }
];

const vehicleOnOffData = [
  { vehicle: 'RJ40PA2104', date: '2025-12-03', status: 'ON', time: '06:30 AM', location: 'Asavali', driver: 'Rajesh Kumar' },
  { vehicle: 'RJ40PA2104', date: '2025-12-03', status: 'OFF', time: '08:45 PM', location: 'Lenskart', driver: 'Rajesh Kumar' },
  { vehicle: 'RJ40PA2805', date: '2025-12-03', status: 'ON', time: '07:00 AM', location: 'Vikas Nagar', driver: 'Sumesh Sharma' },
  { vehicle: 'RJ40PA2805', date: '2025-12-03', status: 'OFF', time: '07:30 PM', location: 'Lenskart', driver: 'Sumesh Sharma' },
  { vehicle: 'RJ40PA2106', date: '2025-12-03', status: 'ON', time: '06:45 AM', location: 'SBI', driver: 'Shastri Verma' }
];

const deviceOverstatedData = [
  { vehicle: 'RJ40PA2107', date: '2025-12-02', issue: 'GPS Signal Lost', severity: 'High', duration: '15 mins', status: 'Resolved' },
  { vehicle: 'RJ40PA2109', date: '2025-12-01', issue: 'Temperature Sensor Error', severity: 'Medium', duration: '8 mins', status: 'Resolved' },
  { vehicle: 'RJ40PA2111', date: '2025-11-30', issue: 'Communication Timeout', severity: 'Low', duration: '5 mins', status: 'Resolved' },
  { vehicle: 'RJ40PA2116', date: '2025-11-29', issue: 'Device Restart', severity: 'Medium', duration: '3 mins', status: 'Resolved' },
  { vehicle: 'RJ40PA2123', date: '2025-11-28', issue: 'Battery Low Warning', severity: 'High', duration: '20 mins', status: 'Pending' }
];

const maintenanceData = [
  { vehicle: 'RJ40PA2104', date: '2025-11-25', type: 'Oil Change', cost: '₹2,500', nextDue: '2026-02-25', status: 'Completed' },
  { vehicle: 'RJ40PA2805', date: '2025-11-20', type: 'Tire Replacement', cost: '₹8,000', nextDue: '2026-05-20', status: 'Completed' },
  { vehicle: 'RJ40PA2106', date: '2025-11-15', type: 'Brake Service', cost: '₹3,500', nextDue: '2026-02-15', status: 'Completed' },
  { vehicle: 'RJ40PA2107', date: '2025-12-01', type: 'General Service', cost: '₹5,500', nextDue: '2026-03-01', status: 'Completed' },
  { vehicle: 'RJ40PA2108', date: '2025-11-10', type: 'AC Service', cost: '₹4,200', nextDue: '2026-02-10', status: 'Completed' }
];

const geofenceData = [
  { vehicle: 'RJ40PA2104', date: '2025-12-03', geofence: 'Lenskart Factory', event: 'Entry', time: '08:30 AM', duration: '8h 15m' },
  { vehicle: 'RJ40PA2104', date: '2025-12-03', geofence: 'Lenskart Factory', event: 'Exit', time: '04:45 PM', duration: '-' },
  { vehicle: 'RJ40PA2805', date: '2025-12-03', geofence: 'Lenskart Factory', event: 'Entry', time: '08:15 AM', duration: '7h 30m' },
  { vehicle: 'RJ40PA2106', date: '2025-12-03', geofence: 'Lenskart Factory', event: 'Entry', time: '08:45 AM', duration: '8h 00m' },
  { vehicle: 'RJ40PA2107', date: '2025-12-03', geofence: 'Lenskart Factory', event: 'Violation', time: '09:15 AM', duration: '-' }
];

export function ReportsData() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleDownloadPDF = () => {
    alert('Downloading PDF report...');
    // In real application, this would generate and download a PDF
  };

  const handleDownloadExcel = () => {
    alert('Downloading Excel report...');
    // In real application, this would generate and download an Excel file
  };

  const renderReportData = () => {
    switch (selectedReport) {
      case 'ignition':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Ignition Hours Report</h2>
                <p className="text-slate-600">Vehicle ignition activity logs</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left font-semibold text-slate-700">Vehicle Number</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Date</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Ignition ON</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Ignition OFF</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {ignitionData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-3 font-medium">{item.vehicle}</td>
                      <td className="p-3">{item.date}</td>
                      <td className="p-3">{item.ignitionOn}</td>
                      <td className="p-3">{item.ignitionOff}</td>
                      <td className="p-3 font-semibold text-blue-600">{item.totalHours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'ac':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">AC Hours Report</h2>
                <p className="text-slate-600">Air conditioning usage and fuel consumption</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left font-semibold text-slate-700">Vehicle Number</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Date</th>
                    <th className="p-3 text-left font-semibold text-slate-700">AC ON</th>
                    <th className="p-3 text-left font-semibold text-slate-700">AC OFF</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Total Hours</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Fuel Consumed</th>
                  </tr>
                </thead>
                <tbody>
                  {acData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-3 font-medium">{item.vehicle}</td>
                      <td className="p-3">{item.date}</td>
                      <td className="p-3">{item.acOn}</td>
                      <td className="p-3">{item.acOff}</td>
                      <td className="p-3 font-semibold text-cyan-600">{item.totalHours} hrs</td>
                      <td className="p-3 font-semibold text-orange-600">{item.fuelConsumed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'route-tracing':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Route Tracing Report</h2>
                <p className="text-slate-600">Previous route history and performance</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left font-semibold text-slate-700">Vehicle Number</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Date</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Route</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Distance</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Duration</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Avg Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {routeTracingData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-3 font-medium">{item.vehicle}</td>
                      <td className="p-3">{item.date}</td>
                      <td className="p-3">{item.route}</td>
                      <td className="p-3 font-semibold text-purple-600">{item.distance}</td>
                      <td className="p-3">{item.duration}</td>
                      <td className="p-3">{item.avgSpeed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'vehicle-onoff':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Vehicle On/Off Data</h2>
                <p className="text-slate-600">Vehicle power status change logs</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left font-semibold text-slate-700">Vehicle Number</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Date</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Status</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Time</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Location</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleOnOffData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-3 font-medium">{item.vehicle}</td>
                      <td className="p-3">{item.date}</td>
                      <td className="p-3">
                        <Badge className={item.status === 'ON' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-3">{item.time}</td>
                      <td className="p-3">{item.location}</td>
                      <td className="p-3">{item.driver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'device-overstated':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Device Overstated Report</h2>
                <p className="text-slate-600">Device malfunction and error logs</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left font-semibold text-slate-700">Vehicle Number</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Date</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Issue</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Severity</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Duration</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deviceOverstatedData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-3 font-medium">{item.vehicle}</td>
                      <td className="p-3">{item.date}</td>
                      <td className="p-3">{item.issue}</td>
                      <td className="p-3">
                        <Badge className={
                          item.severity === 'High' ? 'bg-red-100 text-red-700' :
                          item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {item.severity}
                        </Badge>
                      </td>
                      <td className="p-3">{item.duration}</td>
                      <td className="p-3">
                        <Badge className={item.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Maintenance Logs</h2>
                <p className="text-slate-600">Service and maintenance history</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left font-semibold text-slate-700">Vehicle Number</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Date</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Service Type</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Cost</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Next Due</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-3 font-medium">{item.vehicle}</td>
                      <td className="p-3">{item.date}</td>
                      <td className="p-3">{item.type}</td>
                      <td className="p-3 font-semibold text-red-600">{item.cost}</td>
                      <td className="p-3">{item.nextDue}</td>
                      <td className="p-3">
                        <Badge className="bg-green-100 text-green-700">
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'geofence':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Geofence Reports</h2>
                <p className="text-slate-600">Geofence entry, exit, and violation logs</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadPDF} className="bg-red-600 hover:bg-red-700 text-white">
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button onClick={handleDownloadExcel} className="bg-green-600 hover:bg-green-700 text-white">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left font-semibold text-slate-700">Vehicle Number</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Date</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Geofence</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Event</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Time</th>
                    <th className="p-3 text-left font-semibold text-slate-700">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {geofenceData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-3 font-medium">{item.vehicle}</td>
                      <td className="p-3">{item.date}</td>
                      <td className="p-3">{item.geofence}</td>
                      <td className="p-3">
                        <Badge className={
                          item.event === 'Entry' ? 'bg-green-100 text-green-700' :
                          item.event === 'Exit' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {item.event}
                        </Badge>
                      </td>
                      <td className="p-3">{item.time}</td>
                      <td className="p-3">{item.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (selectedReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => setSelectedReport(null)}
            variant="ghost"
            className="mb-6 hover:bg-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <Card className="shadow-xl">
            <CardContent className="p-6">
              {renderReportData()}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Reports & Data</h1>
          <p className="text-slate-600">Access detailed vehicle and fleet reports</p>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reportCards.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-500 animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedReport(report.id)}
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 ${report.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${report.color}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                    <span>View Report</span>
                    <Download className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
