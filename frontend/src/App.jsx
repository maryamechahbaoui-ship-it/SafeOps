import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import PreventivePlanning from './views/PreventivePlanning';
import CurativeMaintenance from './views/CurativeMaintenance';
import TechnicianInterventions from './views/TechnicianInterventions';
import EquipmentPark from './views/EquipmentPark';
import StockManagement from './views/StockManagement';
import SiteManagement from './views/SiteManagement';
import SupervisorManagement from './views/SupervisorManagement';
import UserAccounts from './views/UserAccounts';
import PVHistory from './views/PVHistory';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');

  // Load session on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('ocp_user');
    const savedToken = localStorage.getItem('ocp_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('ocp_user', JSON.stringify(userData));
    localStorage.setItem('ocp_token', userToken);
    
    // Default starting view
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout error:', e.message);
    }
    setUser(null);
    setToken('');
    localStorage.removeItem('ocp_user');
    localStorage.removeItem('ocp_token');
  };



  // If not logged in, render the login page
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Render view based on selection
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} token={token} />;
      case 'plannings':
        return <PreventivePlanning user={user} token={token} />;
      case 'maintenance':
        return <CurativeMaintenance user={user} token={token} />;
      case 'interventions':
        return <TechnicianInterventions user={user} token={token} />;
      case 'equipments':
        return <EquipmentPark user={user} token={token} />;
      case 'stocks':
        return <StockManagement user={user} token={token} />;
      case 'sites':
        return <SiteManagement token={token} />;
      case 'supervisors':
        return <SupervisorManagement token={token} />;
      case 'users':
        return <UserAccounts token={token} />;
      case 'pv_history':
        return <PVHistory user={user} token={token} />;
      default:
        return <Dashboard user={user} token={token} />;
    }
  };

  return (
    <Layout
      user={user}
      currentView={currentView}
      setCurrentView={setCurrentView}
      onLogout={handleLogout}
    >
      {renderActiveView()}
    </Layout>
  );
}
