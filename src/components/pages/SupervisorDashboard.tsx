import { useRef, useState, useEffect } from 'react';
import { Navigation, Circle, Power, Clock, X, Share2, Filter, Download, ChevronRight, MapPin, Gauge, Calendar, History, Shield, FileCheck, Receipt, Fuel, CircleDot, ZoomIn, ZoomOut, Maximize2, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FleetMap } from '../FleetMap';
import type { Map as LeafletMap } from 'leaflet';

interface Vehicle {
  id: string;
  number: string;
  manufacturer: 'tata' | 'ashok' | 'militrack';
  status: 'moving' | 'stopped' | 'idling';
  statusText: string;
  speed: number;
  position: { top: string; left: string };
  rotation: number;
  address: string;
  lastUpdated: string;
  todayTrips: number;
  todayDistance: string;
  totalKm: string;
  driverName: string;
  driverMobile: string;
  serviceDue: string;
  cngPressure: string;
  vehicleModel: string;
  insurance: {
    status: 'valid' | 'expiring' | 'expired';
    expiryDate: string;
    daysRemaining: number;
  };
  pollution: {
    status: 'valid' | 'expiring' | 'expired';
    expiryDate: string;
    daysRemaining: number;
  };
  fitness: {
    status: 'valid' | 'expiring' | 'expired';
    expiryDate: string;
    daysRemaining: number;
  };
  tax: {
    status: 'paid' | 'due';
    nextDueDate: string;
    amount: string;
  };
  dieselExpense: {
    today: string;
    thisMonth: string;
  };
  tyreExpense: {
    lastReplacement: string;
    cost: string;
  };
}

export function SupervisorDashboard({ onNavigate, selectedVehicleId }: { onNavigate?: (page: string, vehicleId?: string) => void; selectedVehicleId?: string }) {
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const baseZoom = 11;
  const [mapZoom, setMapZoom] = useState(baseZoom);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const [detailPopupVehicle, setDetailPopupVehicle] = useState<Vehicle | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'moving' | 'stopped' | 'idling' | 'offline' | 'geofence' | 'unsubscribed'>('all');

  const handleZoomIn = () => {
    setMapZoom((prev) => {
      const next = Math.min(prev + 1, 18);
      leafletMapRef.current?.setZoom(next);
      return next;
    });
  };

  const handleZoomOut = () => {
    setMapZoom((prev) => {
      const next = Math.max(prev - 1, 3);
      leafletMapRef.current?.setZoom(next);
      return next;
    });
  };

  const handleResetZoom = () => {
    setMapZoom(baseZoom);
    leafletMapRef.current?.setZoom(baseZoom);
  };

  const vehicles: Vehicle[] = [
    { 
      id: '1', 
      number: 'HR55AN2175',
      manufacturer: 'tata',
      status: 'moving', 
      statusText: 'Active',
      speed: 42,
      position: { top: '35%', left: '44%' },
      rotation: 45,
      address: 'Sector 18, Gurugram, Haryana',
      lastUpdated: '2 mins ago',
      todayTrips: 3,
      todayDistance: '124 km',
      totalKm: '1500 km',
      driverName: 'John Doe',
      driverMobile: '9876543210',
      serviceDue: '15 days',
      cngPressure: '200 psi',
      vehicleModel: 'Model A',
      insurance: { status: 'valid', expiryDate: '15 Jan 2026', daysRemaining: 61 },
      pollution: { status: 'valid', expiryDate: '10 Feb 2026', daysRemaining: 87 },
      fitness: { status: 'valid', expiryDate: '20 Mar 2026', daysRemaining: 125 },
      tax: { status: 'paid', nextDueDate: '30 Mar 2026', amount: '₹12,500' },
      dieselExpense: { today: '₹1,850', thisMonth: '₹45,200' },
      tyreExpense: { lastReplacement: '5 Oct 2025', cost: '₹28,000' }
    },
    { 
      id: '2', 
      number: 'HR47E2573',
      manufacturer: 'ashok',
      status: 'stopped', 
      statusText: 'Stopped',
      speed: 0,
      position: { top: '40%', left: '50%' },
      rotation: 0,
      address: 'IFFCO Chowk, Gurugram, Haryana',
      lastUpdated: '15 mins ago',
      todayTrips: 2,
      todayDistance: '87 km',
      totalKm: '1200 km',
      driverName: 'Jane Smith',
      driverMobile: '9876543211',
      serviceDue: '20 days',
      cngPressure: '190 psi',
      vehicleModel: 'Model B',
      insurance: { status: 'expiring', expiryDate: '25 Nov 2025', daysRemaining: 10 },
      pollution: { status: 'valid', expiryDate: '5 Jan 2026', daysRemaining: 51 },
      fitness: { status: 'valid', expiryDate: '15 Feb 2026', daysRemaining: 92 },
      tax: { status: 'paid', nextDueDate: '15 Feb 2026', amount: '₹11,800' },
      dieselExpense: { today: '₹1,450', thisMonth: '₹38,900' },
      tyreExpense: { lastReplacement: '12 Sep 2025', cost: '₹26,500' }
    },
    { 
      id: '3', 
      number: 'UP32BN9021',
      manufacturer: 'militrack',
      status: 'idling', 
      statusText: 'Idle',
      speed: 0,
      position: { top: '38%', left: '54%' },
      rotation: 180,
      address: 'Greater Noida Industrial Area, UP',
      lastUpdated: '5 mins ago',
      todayTrips: 4,
      todayDistance: '156 km',
      totalKm: '1800 km',
      driverName: 'Alice Johnson',
      driverMobile: '9876543212',
      serviceDue: '10 days',
      cngPressure: '210 psi',
      vehicleModel: 'Model C',
      insurance: { status: 'valid', expiryDate: '20 Feb 2026', daysRemaining: 97 },
      pollution: { status: 'expiring', expiryDate: '22 Nov 2025', daysRemaining: 7 },
      fitness: { status: 'valid', expiryDate: '10 Apr 2026', daysRemaining: 146 },
      tax: { status: 'paid', nextDueDate: '20 May 2026', amount: '₹13,200' },
      dieselExpense: { today: '₹2,100', thisMonth: '₹52,800' },
      tyreExpense: { lastReplacement: '18 Aug 2025', cost: '₹30,000' }
    },
    { 
      id: '4', 
      number: 'MP04CE7712',
      manufacturer: 'tata',
      status: 'moving', 
      statusText: 'Active',
      speed: 38,
      position: { top: '52%', left: '38%' },
      rotation: 270,
      address: 'Pithampur Industrial Area, MP',
      lastUpdated: '1 min ago',
      todayTrips: 2,
      todayDistance: '98 km',
      totalKm: '1600 km',
      driverName: 'Bob Brown',
      driverMobile: '9876543213',
      serviceDue: '25 days',
      cngPressure: '180 psi',
      vehicleModel: 'Model D',
      insurance: { status: 'valid', expiryDate: '5 Mar 2026', daysRemaining: 110 },
      pollution: { status: 'valid', expiryDate: '30 Jan 2026', daysRemaining: 76 },
      fitness: { status: 'valid', expiryDate: '15 Jun 2026', daysRemaining: 212 },
      tax: { status: 'paid', nextDueDate: '10 Jun 2026', amount: '₹12,000' },
      dieselExpense: { today: '₹1,650', thisMonth: '₹41,300' },
      tyreExpense: { lastReplacement: '3 Jul 2025', cost: '₹27,500' }
    },
    { 
      id: '5', 
      number: 'MH12RK5521',
      manufacturer: 'ashok',
      status: 'stopped', 
      statusText: 'Stopped',
      speed: 0,
      position: { top: '65%', left: '48%' },
      rotation: 0,
      address: 'Pune Industrial Estate, MH',
      lastUpdated: '8 mins ago',
      todayTrips: 3,
      todayDistance: '112 km',
      totalKm: '1700 km',
      driverName: 'Charlie Davis',
      driverMobile: '9876543214',
      serviceDue: '30 days',
      cngPressure: '170 psi',
      vehicleModel: 'Model E',
      insurance: { status: 'valid', expiryDate: '12 Apr 2026', daysRemaining: 148 },
      pollution: { status: 'valid', expiryDate: '18 Mar 2026', daysRemaining: 123 },
      fitness: { status: 'expiring', expiryDate: '28 Nov 2025', daysRemaining: 13 },
      tax: { status: 'paid', nextDueDate: '25 Apr 2026', amount: '₹13,500' },
      dieselExpense: { today: '₹1,900', thisMonth: '₹47,600' },
      tyreExpense: { lastReplacement: '22 Jun 2025', cost: '₹29,200' }
    },
    { 
      id: '6', 
      number: 'HR55AM8082',
      manufacturer: 'militrack',
      status: 'moving', 
      statusText: 'Active',
      speed: 45,
      position: { top: '33%', left: '46%' },
      rotation: 90,
      address: 'Manesar Industrial Hub, Haryana',
      lastUpdated: '3 mins ago',
      todayTrips: 2,
      todayDistance: '76 km',
      totalKm: '1400 km',
      driverName: 'David Wilson',
      driverMobile: '9876543215',
      serviceDue: '5 days',
      cngPressure: '220 psi',
      vehicleModel: 'Model F',
      insurance: { status: 'valid', expiryDate: '8 May 2026', daysRemaining: 174 },
      pollution: { status: 'valid', expiryDate: '2 Apr 2026', daysRemaining: 138 },
      fitness: { status: 'valid', expiryDate: '22 Jul 2026', daysRemaining: 249 },
      tax: { status: 'paid', nextDueDate: '15 Jul 2026', amount: '₹11,200' },
      dieselExpense: { today: '₹1,320', thisMonth: '₹34,800' },
      tyreExpense: { lastReplacement: '9 Sep 2025', cost: '₹25,800' }
    },
    { 
      id: '7', 
      number: 'MH14GT2299',
      manufacturer: 'ashok',
      status: 'idling', 
      statusText: 'Idle',
      speed: 0,
      position: { top: '62%', left: '52%' },
      rotation: 45,
      address: 'Mumbai Port Area, MH',
      lastUpdated: '12 mins ago',
      todayTrips: 1,
      todayDistance: '45 km',
      totalKm: '1300 km',
      driverName: 'Eve White',
      driverMobile: '9876543216',
      serviceDue: '15 days',
      cngPressure: '210 psi',
      vehicleModel: 'Model G',
      insurance: { status: 'valid', expiryDate: '30 Jun 2026', daysRemaining: 227 },
      pollution: { status: 'valid', expiryDate: '14 May 2026', daysRemaining: 180 },
      fitness: { status: 'valid', expiryDate: '5 Aug 2026', daysRemaining: 263 },
      tax: { status: 'paid', nextDueDate: '8 Aug 2026', amount: '₹12,800' },
      dieselExpense: { today: '₹780', thisMonth: '₹22,400' },
      tyreExpense: { lastReplacement: '14 Oct 2025', cost: '₹26,000' }
    },
    { 
      id: '8', 
      number: 'UP14DT9921',
      manufacturer: 'tata',
      status: 'moving', 
      statusText: 'Active',
      speed: 51,
      position: { top: '36%', left: '52%' },
      rotation: 135,
      address: 'Noida Sector 62, UP',
      lastUpdated: '1 min ago',
      todayTrips: 3,
      todayDistance: '134 km',
      totalKm: '1200 km',
      driverName: 'Frank Green',
      driverMobile: '9876543217',
      serviceDue: '20 days',
      cngPressure: '190 psi',
      vehicleModel: 'Model H',
      insurance: { status: 'expired', expiryDate: '10 Nov 2025', daysRemaining: -5 },
      pollution: { status: 'valid', expiryDate: '25 Dec 2025', daysRemaining: 40 },
      fitness: { status: 'valid', expiryDate: '18 Jan 2026', daysRemaining: 64 },
      tax: { status: 'due', nextDueDate: '20 Nov 2025', amount: '₹14,500' },
      dieselExpense: { today: '₹2,300', thisMonth: '₹58,700' },
      tyreExpense: { lastReplacement: '1 Aug 2025', cost: '₹31,500' }
    },
    { 
      id: '9', 
      number: 'MP07BK4402',
      manufacturer: 'militrack',
      status: 'stopped', 
      statusText: 'Stopped',
      speed: 0,
      position: { top: '48%', left: '40%' },
      rotation: 0,
      address: 'Indore IT Park, MP',
      lastUpdated: '20 mins ago',
      todayTrips: 2,
      todayDistance: '89 km',
      totalKm: '1100 km',
      driverName: 'Grace Black',
      driverMobile: '9876543218',
      serviceDue: '25 days',
      cngPressure: '180 psi',
      vehicleModel: 'Model I',
      insurance: { status: 'valid', expiryDate: '22 Mar 2026', daysRemaining: 127 },
      pollution: { status: 'valid', expiryDate: '8 Feb 2026', daysRemaining: 85 },
      fitness: { status: 'valid', expiryDate: '30 Apr 2026', daysRemaining: 166 },
      tax: { status: 'paid', nextDueDate: '5 May 2026', amount: '₹11,500' },
      dieselExpense: { today: '₹1,550', thisMonth: '₹39,800' },
      tyreExpense: { lastReplacement: '25 Jul 2025', cost: '₹27,000' }
    },
    { 
      id: '10', 
      number: 'HR55AN1941',
      manufacturer: 'ashok',
      status: 'idling', 
      statusText: 'Idle',
      speed: 0,
      position: { top: '34%', left: '42%' },
      rotation: 225,
      address: 'Delhi-Jaipur Highway, Haryana',
      lastUpdated: '6 mins ago',
      todayTrips: 2,
      todayDistance: '67 km',
      totalKm: '1000 km',
      driverName: 'Henry Blue',
      driverMobile: '9876543219',
      serviceDue: '30 days',
      cngPressure: '170 psi',
      vehicleModel: 'Model J',
      insurance: { status: 'valid', expiryDate: '18 Jun 2026', daysRemaining: 215 },
      pollution: { status: 'expiring', expiryDate: '20 Nov 2025', daysRemaining: 5 },
      fitness: { status: 'valid', expiryDate: '12 Sep 2026', daysRemaining: 301 },
      tax: { status: 'paid', nextDueDate: '22 Sep 2026', amount: '₹10,800' },
      dieselExpense: { today: '₹1,180', thisMonth: '₹31,200' },
      tyreExpense: { lastReplacement: '16 Oct 2025', cost: '₹24,500' }
    },
    { 
      id: '11', 
      number: 'MH43DF2003',
      manufacturer: 'tata',
      status: 'moving', 
      statusText: 'Active',
      speed: 39,
      position: { top: '58%', left: '45%' },
      rotation: 315,
      address: 'Nashik Industrial Area, MH',
      lastUpdated: '4 mins ago',
      todayTrips: 3,
      todayDistance: '101 km',
      totalKm: '900 km',
      driverName: 'Isabella Red',
      driverMobile: '9876543220',
      serviceDue: '5 days',
      cngPressure: '220 psi',
      vehicleModel: 'Model K',
      insurance: { status: 'valid', expiryDate: '10 Jul 2026', daysRemaining: 237 },
      pollution: { status: 'valid', expiryDate: '28 Mar 2026', daysRemaining: 133 },
      fitness: { status: 'valid', expiryDate: '16 Oct 2026', daysRemaining: 335 },
      tax: { status: 'paid', nextDueDate: '28 Oct 2026', amount: '₹13,800' },
      dieselExpense: { today: '₹1,780', thisMonth: '₹44,500' },
      tyreExpense: { lastReplacement: '7 Sep 2025', cost: '₹28,800' }
    },
    { 
      id: '12', 
      number: 'UP16CP7788',
      manufacturer: 'militrack',
      status: 'stopped', 
      statusText: 'Stopped',
      speed: 0,
      position: { top: '42%', left: '56%' },
      rotation: 0,
      address: 'Lucknow Transport Hub, UP',
      lastUpdated: '10 mins ago',
      todayTrips: 1,
      todayDistance: '54 km',
      totalKm: '800 km',
      driverName: 'Jack Yellow',
      driverMobile: '9876543221',
      serviceDue: '15 days',
      cngPressure: '210 psi',
      vehicleModel: 'Model L',
      insurance: { status: 'valid', expiryDate: '3 Aug 2026', daysRemaining: 261 },
      pollution: { status: 'valid', expiryDate: '16 Apr 2026', daysRemaining: 152 },
      fitness: { status: 'valid', expiryDate: '24 Nov 2026', daysRemaining: 374 },
      tax: { status: 'paid', nextDueDate: '6 Dec 2026', amount: '₹12,200' },
      dieselExpense: { today: '₹950', thisMonth: '₹26,800' },
      tyreExpense: { lastReplacement: '29 Sep 2025', cost: '₹25,200' }
    },
    { 
      id: '13', 
      number: 'MP19KA6604',
      manufacturer: 'ashok',
      status: 'moving', 
      statusText: 'Active',
      speed: 47,
      position: { top: '55%', left: '42%' },
      rotation: 180,
      address: 'Bhopal Industrial Corridor, MP',
      lastUpdated: '2 mins ago',
      todayTrips: 2,
      todayDistance: '93 km',
      totalKm: '700 km',
      driverName: 'Katherine Purple',
      driverMobile: '9876543222',
      serviceDue: '20 days',
      cngPressure: '190 psi',
      vehicleModel: 'Model M',
      insurance: { status: 'valid', expiryDate: '14 Sep 2026', daysRemaining: 303 },
      pollution: { status: 'valid', expiryDate: '6 May 2026', daysRemaining: 172 },
      fitness: { status: 'valid', expiryDate: '2 Dec 2026', daysRemaining: 382 },
      tax: { status: 'paid', nextDueDate: '18 Dec 2026', amount: '₹11,000' },
      dieselExpense: { today: '₹1,630', thisMonth: '₹42,100' },
      tyreExpense: { lastReplacement: '11 Aug 2025', cost: '₹26,700' }
    },
    { 
      id: '14', 
      number: 'HR26DT9011',
      manufacturer: 'tata',
      status: 'idling', 
      statusText: 'Idle',
      speed: 0,
      position: { top: '37%', left: '48%' },
      rotation: 90,
      address: 'Faridabad Industrial Area, Haryana',
      lastUpdated: '7 mins ago',
      todayTrips: 3,
      todayDistance: '118 km',
      totalKm: '600 km',
      driverName: 'Liam Orange',
      driverMobile: '9876543223',
      serviceDue: '25 days',
      cngPressure: '180 psi',
      vehicleModel: 'Model N',
      insurance: { status: 'valid', expiryDate: '26 Oct 2026', daysRemaining: 345 },
      pollution: { status: 'valid', expiryDate: '19 Jun 2026', daysRemaining: 216 },
      fitness: { status: 'valid', expiryDate: '8 Jan 2027', daysRemaining: 419 },
      tax: { status: 'paid', nextDueDate: '15 Jan 2027', amount: '₹13,600' },
      dieselExpense: { today: '₹2,050', thisMonth: '₹51,400' },
      tyreExpense: { lastReplacement: '3 Oct 2025', cost: '₹29,800' }
    },
    { 
      id: '15', 
      number: 'MH01AX9920',
      manufacturer: 'militrack',
      status: 'moving', 
      statusText: 'Active',
      speed: 44,
      position: { top: '60%', left: '49%' },
      rotation: 270,
      address: 'Thane Industrial Zone, MH',
      lastUpdated: '3 mins ago',
      todayTrips: 4,
      todayDistance: '142 km',
      totalKm: '500 km',
      driverName: 'Mia Green',
      driverMobile: '9876543224',
      serviceDue: '30 days',
      cngPressure: '170 psi',
      vehicleModel: 'Model O',
      insurance: { status: 'valid', expiryDate: '4 Nov 2026', daysRemaining: 354 },
      pollution: { status: 'valid', expiryDate: '22 Jul 2026', daysRemaining: 249 },
      fitness: { status: 'valid', expiryDate: '14 Feb 2027', daysRemaining: 456 },
      tax: { status: 'paid', nextDueDate: '28 Feb 2027', amount: '₹10,500' },
      dieselExpense: { today: '₹2,450', thisMonth: '₹62,300' },
      tyreExpense: { lastReplacement: '20 Sep 2025', cost: '₹32,000' }
    },
    { 
      id: '16', 
      number: 'TN-09-CD-3421',
      manufacturer: 'tata',
      status: 'moving', 
      statusText: 'Active',
      speed: 52,
      position: { top: '71%', left: '55%' },
      rotation: 135,
      address: 'Chennai Port Area, TN',
      lastUpdated: '1 min ago',
      todayTrips: 3,
      todayDistance: '128 km',
      totalKm: '6500 km',
      driverName: 'Noah Silver',
      driverMobile: '9876543225',
      serviceDue: '11 days',
      cngPressure: '205 psi',
      vehicleModel: 'Model P',
      insurance: { status: 'valid', expiryDate: '28 Mar 2026', daysRemaining: 133 },
      pollution: { status: 'valid', expiryDate: '15 Apr 2026', daysRemaining: 151 },
      fitness: { status: 'valid', expiryDate: '10 Sep 2026', daysRemaining: 299 },
      tax: { status: 'paid', nextDueDate: '25 Mar 2027', amount: '₹14,200' },
      dieselExpense: { today: '₹2,420', thisMonth: '₹60,500' },
      tyreExpense: { lastReplacement: '5 Oct 2025', cost: '₹33,500' }
    },
    { 
      id: '17', 
      number: 'KA-51-MN-7788',
      manufacturer: 'ashok',
      status: 'stopped', 
      statusText: 'Stopped',
      speed: 0,
      position: { top: '68%', left: '42%' },
      rotation: 0,
      address: 'Bangalore Tech Park, KA',
      lastUpdated: '18 mins ago',
      todayTrips: 2,
      todayDistance: '72 km',
      totalKm: '4900 km',
      driverName: 'Olivia Gold',
      driverMobile: '9876543226',
      serviceDue: '24 days',
      cngPressure: '175 psi',
      vehicleModel: 'Model Q',
      insurance: { status: 'valid', expiryDate: '14 May 2026', daysRemaining: 180 },
      pollution: { status: 'valid', expiryDate: '22 Mar 2026', daysRemaining: 127 },
      fitness: { status: 'valid', expiryDate: '18 Jun 2026', daysRemaining: 215 },
      tax: { status: 'paid', nextDueDate: '10 Apr 2027', amount: '₹11,700' },
      dieselExpense: { today: '₹0', thisMonth: '₹37,900' },
      tyreExpense: { lastReplacement: '20 Sep 2025', cost: '₹26,300' }
    },
    { 
      id: '18', 
      number: 'RJ-14-PQ-5566',
      manufacturer: 'militrack',
      status: 'idling', 
      statusText: 'Idle',
      speed: 0,
      position: { top: '44%', left: '34%' },
      rotation: 225,
      address: 'Jaipur Industrial Zone, RJ',
      lastUpdated: '9 mins ago',
      todayTrips: 3,
      todayDistance: '96 km',
      totalKm: '5250 km',
      driverName: 'Peter Bronze',
      driverMobile: '9876543227',
      serviceDue: '19 days',
      cngPressure: '188 psi',
      vehicleModel: 'Model R',
      insurance: { status: 'expiring', expiryDate: '23 Nov 2025', daysRemaining: 8 },
      pollution: { status: 'valid', expiryDate: '10 Feb 2026', daysRemaining: 87 },
      fitness: { status: 'valid', expiryDate: '5 Jul 2026', daysRemaining: 232 },
      tax: { status: 'paid', nextDueDate: '20 May 2027', amount: '₹12,600' },
      dieselExpense: { today: '₹1,680', thisMonth: '₹42,800' },
      tyreExpense: { lastReplacement: '14 Aug 2025', cost: '₹28,900' }
    },
    { 
      id: '19', 
      number: 'GJ-01-RS-4433',
      manufacturer: 'tata',
      status: 'moving', 
      statusText: 'Active',
      speed: 48,
      position: { top: '54%', left: '28%' },
      rotation: 315,
      address: 'Ahmedabad Export Zone, GJ',
      lastUpdated: '2 mins ago',
      todayTrips: 4,
      todayDistance: '157 km',
      totalKm: '6350 km',
      driverName: 'Quinn Maroon',
      driverMobile: '9876543228',
      serviceDue: '6 days',
      cngPressure: '212 psi',
      vehicleModel: 'Model S',
      insurance: { status: 'valid', expiryDate: '2 Apr 2026', daysRemaining: 138 },
      pollution: { status: 'expiring', expiryDate: '21 Nov 2025', daysRemaining: 6 },
      fitness: { status: 'valid', expiryDate: '28 Oct 2026', daysRemaining: 347 },
      tax: { status: 'paid', nextDueDate: '8 Jun 2027', amount: '₹13,900' },
      dieselExpense: { today: '₹2,580', thisMonth: '₹64,500' },
      tyreExpense: { lastReplacement: '2 Nov 2025', cost: '₹34,200' }
    },
    { 
      id: '20', 
      number: 'DL-8C-TU-9988',
      manufacturer: 'ashok',
      status: 'stopped', 
      statusText: 'Stopped',
      speed: 0,
      position: { top: '32%', left: '47%' },
      rotation: 0,
      address: 'Delhi Logistics Hub, DL',
      lastUpdated: '25 mins ago',
      todayTrips: 1,
      todayDistance: '41 km',
      totalKm: '4650 km',
      driverName: 'Rachel Teal',
      driverMobile: '9876543229',
      serviceDue: '27 days',
      cngPressure: '168 psi',
      vehicleModel: 'Model T',
      insurance: { status: 'valid', expiryDate: '19 Jun 2026', daysRemaining: 216 },
      pollution: { status: 'valid', expiryDate: '8 Apr 2026', daysRemaining: 144 },
      fitness: { status: 'valid', expiryDate: '15 Aug 2026', daysRemaining: 273 },
      tax: { status: 'paid', nextDueDate: '30 Jul 2027', amount: '₹11,300' },
      dieselExpense: { today: '₹0', thisMonth: '₹29,400' },
      tyreExpense: { lastReplacement: '7 Jul 2025', cost: '₹24,800' }
    },
  ];

  const getStatusColor = (status: 'moving' | 'stopped' | 'idling') => {
    switch (status) {
      case 'moving':
        return '#27AE60';
      case 'stopped':
        return '#E53935';
      case 'idling':
        return '#F2B233';
    }
  };

  const getManufacturerColor = (manufacturer?: 'tata' | 'ashok' | 'militrack') => {
    if (!manufacturer) return '#64748B'; // Default grey
    switch (manufacturer) {
      case 'tata':
        return '#1976D2'; // Blue
      case 'ashok':
        return '#2E7D32'; // Dark Green
      case 'militrack':
        return '#D32F2F'; // Red
      default:
        return '#64748B';
    }
  };

  const getComplianceColor = (status: string) => {
    if (status === 'valid' || status === 'paid') return '#27AE60';
    if (status === 'expiring') return '#F2B233';
    return '#E53935';
  };

  // Auto-select vehicle when selectedVehicleId changes
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle) {
        setSelectedVehicle(vehicle);
      }
    }
  }, [selectedVehicleId]);

  // Calculate vehicle counts by status
  const vehicleCounts = {
    all: vehicles.length,
    moving: vehicles.filter(v => v.status === 'moving').length,
    stopped: vehicles.filter(v => v.status === 'stopped').length,
    idling: vehicles.filter(v => v.status === 'idling').length,
    offline: 2, // Mock data
    geofence: 3, // Mock data - vehicles within geofence
    unsubscribed: 5 // Mock data
  };

  // Filter vehicles based on selected status or specific vehicle ID
  const filteredVehicles = selectedVehicleId
    ? vehicles.filter(v => v.id === selectedVehicleId)
    : (statusFilter === 'all' ? vehicles : vehicles.filter(v => v.status === statusFilter));

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Map Background - Constrained to left side */}
      <div 
        className="absolute inset-y-0 left-0 right-[340px] overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <FleetMap
          className="w-full h-full"
          zoom={mapZoom}
          mapRef={leafletMapRef}
          onZoomChange={setMapZoom}
        />

        {/* Cluster Marker - New Delhi */}
        <div 
          className="absolute z-20 cursor-pointer hover:scale-105 transition-transform"
          style={{ 
            top: '34%', 
            left: '43%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1100,
          }}
        >
          <div 
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: '58px',
              height: '58px',
              backgroundColor: '#1565C0',
              boxShadow: '0 4px 12px rgba(13, 71, 161, 0.35), 0 2px 6px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Inner circle */}
            <div 
              className="flex items-center justify-center rounded-full"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#1976D2'
              }}
            >
              <span 
                style={{
                  color: '#FFFFFF',
                  fontSize: '20px',
                  fontWeight: 700,
                  fontFamily: 'Inter',
                  letterSpacing: '0.02em'
                }}
              >
                20
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Status Filter Bar */}
        <div
          className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20"
          style={{ zIndex: 1100 }}
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  if (onNavigate && selectedVehicleId) onNavigate('dashboard');
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  statusFilter === 'all' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">{vehicleCounts.all}</span>
                  <span className="text-xs">All</span>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setStatusFilter('moving');
                  if (onNavigate && selectedVehicleId) onNavigate('dashboard');
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  statusFilter === 'moving' 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">{vehicleCounts.moving}</span>
                  <span className="text-xs">Moving</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setStatusFilter('idling');
                  if (onNavigate && selectedVehicleId) onNavigate('dashboard');
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  statusFilter === 'idling' 
                    ? 'bg-yellow-500 text-white shadow-md' 
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">{vehicleCounts.idling}</span>
                  <span className="text-xs">Idle</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setStatusFilter('stopped');
                  if (onNavigate && selectedVehicleId) onNavigate('dashboard');
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  statusFilter === 'stopped' 
                    ? 'bg-red-500 text-white shadow-md' 
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">{vehicleCounts.stopped}</span>
                  <span className="text-xs">Stopped</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setStatusFilter('offline');
                  if (onNavigate && selectedVehicleId) onNavigate('dashboard');
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  statusFilter === 'offline' 
                    ? 'bg-gray-500 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">{vehicleCounts.offline}</span>
                  <span className="text-xs">Offline</span>
                </div>
              </button>

              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('vehicles');
                  }
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  statusFilter === 'geofence' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">{vehicleCounts.geofence}</span>
                  <span className="text-xs">Geofence</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setStatusFilter('unsubscribed');
                  if (onNavigate && selectedVehicleId) onNavigate('dashboard');
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  statusFilter === 'unsubscribed' 
                    ? 'bg-purple-500 text-white shadow-md' 
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">{vehicleCounts.unsubscribed}</span>
                  <span className="text-xs">Unsubscribed</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div
          className="absolute bottom-8 right-8 flex flex-col gap-2 z-20"
          style={{ zIndex: 1100 }}
        >
          <button
            onClick={handleZoomIn}
            className="w-12 h-12 bg-white hover:bg-slate-50 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={handleResetZoom}
            className="w-12 h-12 bg-white hover:bg-slate-50 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Reset Zoom"
          >
            <Maximize2 className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-12 h-12 bg-white hover:bg-slate-50 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-slate-700" />
          </button>
          <div className="w-12 bg-white rounded-lg shadow-lg px-2 py-2 text-center">
            <span className="text-xs text-slate-700">{Math.round((mapZoom / baseZoom) * 100)}%</span>
          </div>
        </div>

        {/* Vehicle Icons on Map */}
        {filteredVehicles.map((vehicle) => (
          <motion.div
            key={vehicle.id}
            className="absolute z-20 cursor-pointer"
            style={{
              top: vehicle.position.top,
              left: vehicle.position.left,
              transform: 'translate(-50%, -50%)',
              zIndex: 1100,
            }}
            animate={{
              top: vehicle.position.top,
              left: vehicle.position.left,
            }}
            transition={{
              duration: 2,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'loop',
            }}
            whileHover={{ scale: 1.15 }}
            onClick={() => setSelectedVehicle(vehicle)}
          >
            <div
              className="relative"
              style={{
                transform: `rotate(${vehicle.rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
            >
              <Navigation
                className="w-6 h-6 drop-shadow-lg"
                style={{
                  color: getStatusColor(vehicle.status),
                  fill: getStatusColor(vehicle.status),
                  strokeWidth: 1.5,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Info Overlay - Shown when vehicle is selected */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            className="absolute bottom-8 z-30"
            style={{ left: 'calc((100% - 340px) / 2 - 420px)' }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="bg-white rounded-[16px] border border-[#E1E6EF]"
              style={{
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                backdropFilter: 'blur(8px)',
                width: '840px'
              }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#E4E8EF] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: `${getStatusColor(selectedVehicle.status)}20`
                    }}
                  >
                    <Navigation
                      className="w-6 h-6"
                      style={{
                        color: getStatusColor(selectedVehicle.status),
                        fill: getStatusColor(selectedVehicle.status),
                        strokeWidth: 1.5
                      }}
                    />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#2A3547',
                        marginBottom: '2px'
                      }}
                    >
                      {selectedVehicle.number}
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#67727E'
                      }}
                    >
                      {selectedVehicle.vehicleModel}
                    </p>
                  </div>
                </div>
                <button
                  className="hover:opacity-70 transition-opacity"
                  onClick={() => setSelectedVehicle(null)}
                >
                  <X className="w-5 h-5" style={{ color: '#9AA3B2' }} />
                </button>
              </div>

              {/* Content - 3 Column Grid */}
              <div className="px-6 py-5 grid grid-cols-3 gap-6">
                {/* Column 1 - Status & Speed */}
                <div className="space-y-4">
                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(selectedVehicle.status) }}
                      />
                      <p
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#2A3547'
                        }}
                      >
                        {selectedVehicle.statusText}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      Current Speed
                    </p>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4" style={{ color: '#0D47A1' }} />
                      <p
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#2A3547'
                        }}
                      >
                        {selectedVehicle.speed} km/h
                      </p>
                    </div>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      Distance Today
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#2A3547'
                      }}
                    >
                      {selectedVehicle.todayDistance}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      Total Odometer
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#2A3547'
                      }}
                    >
                      {selectedVehicle.totalKm}
                    </p>
                  </div>
                </div>

                {/* Column 2 - Driver & Service */}
                <div className="space-y-4">
                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      Driver Name
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#2A3547'
                      }}
                    >
                      {selectedVehicle.driverName}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      Driver Mobile
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#0D47A1'
                      }}
                    >
                      +91 {selectedVehicle.driverMobile}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      Service Due
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: parseInt(selectedVehicle.serviceDue) <= 7 ? '#E53935' : '#27AE60'
                      }}
                    >
                      {selectedVehicle.serviceDue}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      CNG Pressure
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#2A3547'
                      }}
                    >
                      {selectedVehicle.cngPressure}
                    </p>
                  </div>
                </div>

                {/* Column 3 - Location */}
                <div className="space-y-4">
                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      Current Location
                    </p>
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#0D47A1' }} />
                      <p
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#2A3547',
                          lineHeight: '1.5'
                        }}
                      >
                        {selectedVehicle.address}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      Last Updated
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#67727E'
                      }}
                    >
                      {selectedVehicle.lastUpdated}
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#9AA3B2',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}
                    >
                      Trips Today
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#2A3547'
                      }}
                    >
                      {selectedVehicle.todayTrips} trips
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comprehensive Vehicle Detail Popup */}
      <AnimatePresence>
        {detailPopupVehicle && (
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailPopupVehicle(null)}
          >
            <motion.div
              className="bg-white rounded-[20px] border border-[#E1E6EF] mx-4"
              style={{
                boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
                maxWidth: '1100px',
                width: '95%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-[#E4E8EF] flex items-center justify-between sticky top-0 bg-white rounded-t-[20px]">
                <div>
                  <h2
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#2A3547',
                      marginBottom: '4px'
                    }}
                  >
                    Vehicle Details - {detailPopupVehicle.number}
                  </h2>
                  <p
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#67727E'
                    }}
                  >
                    Comprehensive vehicle performance and compliance data
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {onNavigate && (
                    <button
                      onClick={() => {
                        setDetailPopupVehicle(null);
                        onNavigate('dashboard', detailPopupVehicle.id);
                      }}
                      className="px-4 py-2 bg-[#27AE60] hover:bg-[#27AE60]/90 text-white rounded-lg transition-colors flex items-center gap-2"
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      <Map size={18} />
                      See On Map
                    </button>
                  )}
                  <button
                    className="hover:opacity-70 transition-opacity"
                    onClick={() => setDetailPopupVehicle(null)}
                  >
                    <X className="w-6 h-6" style={{ color: '#9AA3B2' }} />
                  </button>
                </div>
              </div>

              {/* Content - Vehicle Card */}
              <div className="px-8 py-6">
                <div className="bg-[#F9FBFF] border border-[#E1E6EF] rounded-[16px] p-6">
                  {/* Vehicle Header */}
                  <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#E4E8EF]">
                    <div
                      className="rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: `${getStatusColor(detailPopupVehicle.status)}20`
                      }}
                    >
                      <Navigation
                        className="w-7 h-7"
                        style={{
                          color: getStatusColor(detailPopupVehicle.status),
                          fill: getStatusColor(detailPopupVehicle.status),
                          strokeWidth: 1.5
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#2A3547',
                          marginBottom: '2px'
                        }}
                      >
                        {detailPopupVehicle.number}
                      </h3>
                      <p
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#67727E'
                        }}
                      >
                        {detailPopupVehicle.vehicleModel}
                      </p>
                    </div>
                  </div>

                  {/* 3 Column Grid */}
                  <div className="grid grid-cols-3 gap-8">
                    {/* Column 1 - Vehicle Performance */}
                    <div className="space-y-5">
                      <h4
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0D47A1',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          marginBottom: '12px'
                        }}
                      >
                        Vehicle Performance
                      </h4>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          Status
                        </p>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: getStatusColor(detailPopupVehicle.status) }}
                          />
                          <p
                            style={{
                              fontFamily: 'Inter',
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#2A3547'
                            }}
                          >
                            {detailPopupVehicle.statusText}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          Current Speed
                        </p>
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4" style={{ color: '#0D47A1' }} />
                          <p
                            style={{
                              fontFamily: 'Inter',
                              fontSize: '16px',
                              fontWeight: 700,
                              color: '#2A3547'
                            }}
                          >
                            {detailPopupVehicle.speed} km/h
                          </p>
                        </div>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          Distance Today
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#2A3547'
                          }}
                        >
                          {detailPopupVehicle.todayDistance}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          Total Odometer
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '16px',
                            fontWeight: 700,
                            color: '#2A3547'
                          }}
                        >
                          {detailPopupVehicle.totalKm}
                        </p>
                      </div>
                    </div>

                    {/* Column 2 - Driver & Maintenance */}
                    <div className="space-y-5">
                      <h4
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0D47A1',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          marginBottom: '12px'
                        }}
                      >
                        Driver & Maintenance
                      </h4>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          Driver Name
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#2A3547'
                          }}
                        >
                          {detailPopupVehicle.driverName}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          Driver Mobile
                        </p>
                        <a
                          href={`tel:+91${detailPopupVehicle.driverMobile}`}
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#0D47A1',
                            textDecoration: 'none'
                          }}
                          className="hover:underline"
                        >
                          +91 {detailPopupVehicle.driverMobile}
                        </a>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          Service Due
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: parseInt(detailPopupVehicle.serviceDue) <= 7 ? '#E53935' : '#27AE60'
                          }}
                        >
                          {detailPopupVehicle.serviceDue}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          CNG Pressure
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#2A3547'
                          }}
                        >
                          {detailPopupVehicle.cngPressure}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#E4E8EF]">
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '8px'
                          }}
                        >
                          Expenses
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              style={{
                                fontFamily: 'Inter',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#67727E'
                              }}
                            >
                              Diesel (Today)
                            </span>
                            <span
                              style={{
                                fontFamily: 'Inter',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#2A3547'
                              }}
                            >
                              {detailPopupVehicle.dieselExpense.today}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              style={{
                                fontFamily: 'Inter',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#67727E'
                              }}
                            >
                              Diesel (Month)
                            </span>
                            <span
                              style={{
                                fontFamily: 'Inter',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#2A3547'
                              }}
                            >
                              {detailPopupVehicle.dieselExpense.thisMonth}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span
                              style={{
                                fontFamily: 'Inter',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#67727E'
                              }}
                            >
                              Tyre (Last)
                            </span>
                            <span
                              style={{
                                fontFamily: 'Inter',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#2A3547'
                              }}
                            >
                              {detailPopupVehicle.tyreExpense.cost}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3 - Location & Compliance */}
                    <div className="space-y-5">
                      <h4
                        style={{
                          fontFamily: 'Inter',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#0D47A1',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          marginBottom: '12px'
                        }}
                      >
                        Location & Compliance
                      </h4>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          Current Location
                        </p>
                        <div className="flex gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#0D47A1' }} />
                          <p
                            style={{
                              fontFamily: 'Inter',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#2A3547',
                              lineHeight: '1.5'
                            }}
                          >
                            {detailPopupVehicle.address}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          Last Updated
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" style={{ color: '#67727E' }} />
                          <p
                            style={{
                              fontFamily: 'Inter',
                              fontSize: '14px',
                              fontWeight: 500,
                              color: '#67727E'
                            }}
                          >
                            {detailPopupVehicle.lastUpdated}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '6px'
                          }}
                        >
                          Trips Today
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#2A3547'
                          }}
                        >
                          {detailPopupVehicle.todayTrips} trips
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#E4E8EF]">
                        <p
                          style={{
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#9AA3B2',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '8px'
                          }}
                        >
                          Compliance Status
                        </p>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Shield className="w-4 h-4" style={{ color: getComplianceColor(detailPopupVehicle.insurance.status) }} />
                              <span
                                style={{
                                  fontFamily: 'Inter',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: '#2A3547'
                                }}
                              >
                                Insurance
                              </span>
                            </div>
                            <p
                              style={{
                                fontFamily: 'Inter',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: getComplianceColor(detailPopupVehicle.insurance.status),
                                marginLeft: '24px'
                              }}
                            >
                              {detailPopupVehicle.insurance.expiryDate} ({detailPopupVehicle.insurance.daysRemaining > 0 ? `${detailPopupVehicle.insurance.daysRemaining} days` : 'Expired'})
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <FileCheck className="w-4 h-4" style={{ color: getComplianceColor(detailPopupVehicle.pollution.status) }} />
                              <span
                                style={{
                                  fontFamily: 'Inter',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: '#2A3547'
                                }}
                              >
                                Pollution
                              </span>
                            </div>
                            <p
                              style={{
                                fontFamily: 'Inter',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: getComplianceColor(detailPopupVehicle.pollution.status),
                                marginLeft: '24px'
                              }}
                            >
                              {detailPopupVehicle.pollution.expiryDate} ({detailPopupVehicle.pollution.daysRemaining > 0 ? `${detailPopupVehicle.pollution.daysRemaining} days` : 'Expired'})
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CircleDot className="w-4 h-4" style={{ color: getComplianceColor(detailPopupVehicle.fitness.status) }} />
                              <span
                                style={{
                                  fontFamily: 'Inter',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: '#2A3547'
                                }}
                              >
                                Fitness
                              </span>
                            </div>
                            <p
                              style={{
                                fontFamily: 'Inter',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: getComplianceColor(detailPopupVehicle.fitness.status),
                                marginLeft: '24px'
                              }}
                            >
                              {detailPopupVehicle.fitness.expiryDate} ({detailPopupVehicle.fitness.daysRemaining} days)
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Receipt className="w-4 h-4" style={{ color: getComplianceColor(detailPopupVehicle.tax.status) }} />
                              <span
                                style={{
                                  fontFamily: 'Inter',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: '#2A3547'
                                }}
                              >
                                Tax Payment
                              </span>
                            </div>
                            <p
                              style={{
                                fontFamily: 'Inter',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: getComplianceColor(detailPopupVehicle.tax.status),
                                marginLeft: '24px'
                              }}
                            >
                              {detailPopupVehicle.tax.nextDueDate} - {detailPopupVehicle.tax.amount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="px-8 py-4 border-t border-[#E4E8EF] bg-[#F9FBFF] rounded-b-[20px]">
                <p
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#67727E',
                    textAlign: 'center'
                  }}
                >
                  Click outside to close
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicle Status Counter Popup - Floating Above Map */}
      <div className="absolute top-8 z-30" style={{ left: 'calc((100% - 340px) / 2 - 390px)' }}>
        <div 
          className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-[14px] border border-[#E1E6EF]"
          style={{ 
            boxShadow: '0 8px 20px rgba(0,0,0,0.10)',
            backdropFilter: 'blur(4px)'
          }}
        >
          {/* All */}
          <div 
            className="flex flex-col items-center justify-center gap-1 bg-[#F9FBFF] border border-[#E1E6EF] rounded-[10px]"
            style={{ 
              width: '105px', 
              height: '60px',
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.03)'
            }}
          >
            <Navigation className="h-3.5 w-3.5" style={{ color: '#0D47A1', strokeWidth: 1.5 }} />
            <p className="text-[12px] text-[#2A3547]" style={{ fontWeight: 500, letterSpacing: '0.01em' }}>All</p>
            <p className="text-[20px]" style={{ color: '#0D47A1', fontWeight: 700, letterSpacing: '0.01em' }}>94</p>
          </div>

          {/* Moving */}
          <div 
            className="flex flex-col items-center justify-center gap-1 bg-[#F9FBFF] border border-[#E1E6EF] rounded-[10px]"
            style={{ 
              width: '105px', 
              height: '60px',
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.03)'
            }}
          >
            <Navigation className="h-3.5 w-3.5" style={{ color: '#27AE60', strokeWidth: 1.5 }} />
            <p className="text-[12px] text-[#2A3547]" style={{ fontWeight: 500, letterSpacing: '0.01em' }}>Moving</p>
            <p className="text-[20px]" style={{ color: '#27AE60', fontWeight: 700, letterSpacing: '0.01em' }}>0</p>
          </div>

          {/* Stopped */}
          <div 
            className="flex flex-col items-center justify-center gap-1 bg-[#F9FBFF] border border-[#E1E6EF] rounded-[10px]"
            style={{ 
              width: '105px', 
              height: '60px',
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.03)'
            }}
          >
            <Circle className="h-3.5 w-3.5" style={{ color: '#E53935', strokeWidth: 1.5 }} />
            <p className="text-[12px] text-[#2A3547]" style={{ fontWeight: 500, letterSpacing: '0.01em' }}>Stopped</p>
            <p className="text-[20px]" style={{ color: '#E53935', fontWeight: 700, letterSpacing: '0.01em' }}>18</p>
          </div>

          {/* Idling */}
          <div 
            className="flex flex-col items-center justify-center gap-1 bg-[#F9FBFF] border border-[#E1E6EF] rounded-[10px]"
            style={{ 
              width: '105px', 
              height: '60px',
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.03)'
            }}
          >
            <Clock className="h-3.5 w-3.5" style={{ color: '#F2B233', strokeWidth: 1.5 }} />
            <p className="text-[12px] text-[#2A3547]" style={{ fontWeight: 500, letterSpacing: '0.01em' }}>Idling</p>
            <p className="text-[20px]" style={{ color: '#F2B233', fontWeight: 700, letterSpacing: '0.01em' }}>2</p>
          </div>

          {/* Offline */}
          <div 
            className="flex flex-col items-center justify-center gap-1 bg-[#F9FBFF] border border-[#E1E6EF] rounded-[10px]"
            style={{ 
              width: '105px', 
              height: '60px',
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.03)'
            }}
          >
            <Power className="h-3.5 w-3.5" style={{ color: '#9E9E9E', strokeWidth: 1.5 }} />
            <p className="text-[12px] text-[#2A3547]" style={{ fontWeight: 500, letterSpacing: '0.01em' }}>Offline</p>
            <p className="text-[20px]" style={{ color: '#9E9E9E', fontWeight: 700, letterSpacing: '0.01em' }}>6</p>
          </div>

          {/* Un-Subscribed */}
          <div 
            className="flex flex-col items-center justify-center gap-1 bg-[#F9FBFF] border border-[#E1E6EF] rounded-[10px]"
            style={{ 
              width: '105px', 
              height: '60px',
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.03)'
            }}
          >
            <X className="h-3.5 w-3.5" style={{ color: '#FB8C00', strokeWidth: 1.5 }} />
            <p className="text-[12px] text-[#2A3547]" style={{ fontWeight: 500, letterSpacing: '0.01em' }}>Un-Subscribed</p>
            <p className="text-[20px]" style={{ color: '#FB8C00', fontWeight: 700, letterSpacing: '0.01em' }}>68</p>
          </div>

          {/* Geofence */}
          <div 
            className="flex flex-col items-center justify-center gap-1 bg-[#F9FBFF] border border-[#E1E6EF] rounded-[10px]"
            style={{ 
              width: '105px', 
              height: '60px',
              boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.03)'
            }}
          >
            <Circle className="h-3.5 w-3.5" style={{ color: '#8E24AA', strokeWidth: 1.5 }} />
            <p className="text-[12px] text-[#2A3547]" style={{ fontWeight: 500, letterSpacing: '0.01em' }}>Geofence</p>
            <p className="text-[20px]" style={{ color: '#8E24AA', fontWeight: 700, letterSpacing: '0.01em' }}>0</p>
          </div>
        </div>
      </div>

      {/* Right Side Vehicle List Panel */}
      <div 
        className="absolute top-0 right-0 h-full bg-white border-l border-[#E4E8EF] flex flex-col"
        style={{ 
          width: '340px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
        }}
      >
        {/* Top Bar */}
        <div className="pt-5 px-[18px] pb-4 border-b border-[#E4E8EF]">
          {/* Tabs and Icons Row */}
          <div className="flex items-center justify-between mb-4">
            {/* Tabs */}
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('live')}
                className="relative pb-1"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: activeTab === 'live' ? '#0D47A1' : '#9AA3B2'
                }}
              >
                Live
                {activeTab === 'live' && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[#0D47A1]" 
                    style={{ height: '2px' }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className="relative pb-1"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: activeTab === 'history' ? '#0D47A1' : '#9AA3B2'
                }}
              >
                History
                {activeTab === 'history' && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-[#0D47A1]" 
                    style={{ height: '2px' }}
                  />
                )}
              </button>
            </div>

            {/* Action Icons */}
            <div className="flex items-center" style={{ gap: '16px' }}>
              <button className="hover:opacity-70 transition-opacity">
                <Share2 className="w-[18px] h-[18px]" style={{ color: '#2A3547' }} />
              </button>
              <button className="hover:opacity-70 transition-opacity">
                <Filter className="w-[18px] h-[18px]" style={{ color: '#2A3547' }} />
              </button>
              <button className="hover:opacity-70 transition-opacity">
                <Download className="w-[18px] h-[18px]" style={{ color: '#2A3547' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-[18px] py-5" style={{ gap: '14px' }}>
          <div className="space-y-[14px]">
            {vehicles
              .filter(vehicle => activeTab === 'live' ? vehicle.status === 'moving' : true)
              .map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setDetailPopupVehicle(vehicle);
                }}
                className={`flex items-center bg-[#F9FBFF] border rounded-[12px] p-3 cursor-pointer hover:bg-[#F0F4FF] transition-colors ${
                  selectedVehicle?.id === vehicle.id ? 'border-[#0D47A1] bg-[#E3F2FD]' : 'border-[#E1E6EF]'
                }`}
                style={{ 
                  height: '66px',
                  gap: '12px'
                }}
              >
                {/* Status Icon */}
                <div 
                  className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: `${getStatusColor(vehicle.status)}20`
                  }}
                >
                  <Circle 
                    className="w-4 h-4" 
                    style={{ 
                      color: getStatusColor(vehicle.status),
                      strokeWidth: 1.5,
                      fill: vehicle.status === 'stopped' ? getStatusColor(vehicle.status) : 'none'
                    }} 
                  />
                </div>

                {/* Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <p 
                    className="truncate"
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#2A3547'
                    }}
                  >
                    {vehicle.number}{' '}
                    <span 
                      style={{
                        fontSize: '11px',
                        fontWeight: 400,
                        color: getManufacturerColor(vehicle.manufacturer)
                      }}
                    >
                      ({vehicle.manufacturer})
                    </span>
                  </p>
                  <p 
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#67727E'
                    }}
                  >
                    {vehicle.statusText}
                  </p>
                </div>

                {/* Chevron Icon */}
                <ChevronRight 
                  className="w-[18px] h-[18px] flex-shrink-0" 
                  style={{ color: '#9AA3B2' }} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
