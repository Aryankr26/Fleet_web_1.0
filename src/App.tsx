import { useState } from 'react';
import { LoginPage } from './components/pages/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OwnerDashboard } from './components/pages/OwnerDashboard';
import { SupervisorDashboard } from './components/pages/SupervisorDashboard';
import { GeofencingPage } from './components/pages/GeofencingPage';
import { FuelReports } from './components/pages/FuelReports';
import { ComplaintsPanel } from './components/pages/ComplaintsPanel';
import { Settings } from './components/pages/Settings';
import { ReportsData } from './components/pages/ReportsData';
import { CompanyRoutes } from './components/pages/CompanyRoutes';

export type UserRole = 'owner' | 'supervisor' | null;

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentPage('dashboard');
    setSelectedVehicleId(undefined);
  };

  const handleNavigate = (page: string, vehicleId?: string) => {
    setCurrentPage(page);
    setSelectedVehicleId(vehicleId);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return userRole === 'owner' ? <OwnerDashboard onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} /> : <SupervisorDashboard onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} />;
      case 'vehicles':
        return <GeofencingPage />;
      case 'fuel':
        return <FuelReports />;
      case 'complaints':
        return <ComplaintsPanel />;
      case 'settings':
        return <Settings />;
      case 'reports':
        return <ReportsData />;
      case 'routes':
        return <CompanyRoutes onNavigate={handleNavigate} />;
      default:
        return userRole === 'owner' ? <OwnerDashboard onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} /> : <SupervisorDashboard onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} />;
    }
  };

  return (
    <DashboardLayout
      userRole={userRole}
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderPage()}
    </DashboardLayout>
  );
}