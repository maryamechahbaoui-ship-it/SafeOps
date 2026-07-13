import React from 'react';
import { 
  LayoutDashboard, Calendar, Wrench, Shield, Package, 
  Map, Users, UserCheck, FileClock, LogOut, ShieldAlert 
} from 'lucide-react';

export default function Layout({ user, currentView, setCurrentView, onLogout, onSwitchRole, children }) {
  
  // Define all possible menu items
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: <LayoutDashboard size={16} />, roles: ['responsable', 'superviseur', 'technicien'] },
    { id: 'plannings', label: 'Plannings Préventifs', icon: <Calendar size={16} />, roles: ['responsable', 'superviseur'] },
    { id: 'maintenance', label: 'Maintenance Curative', icon: <Wrench size={16} />, roles: ['responsable', 'superviseur'] },
    { id: 'interventions', label: 'Mes Interventions', icon: <ShieldAlert size={16} />, roles: ['technicien'] },
    { id: 'equipments', label: 'Parc Équipements', icon: <Shield size={16} />, roles: ['responsable', 'superviseur', 'technicien'] },
    { id: 'stocks', label: 'Gestion des Stocks', icon: <Package size={16} />, roles: ['responsable', 'superviseur'] },
    { id: 'sites', label: 'Gestion des Sites', icon: <Map size={16} />, roles: ['responsable'] },
    { id: 'supervisors', label: 'Gestion Superviseurs', icon: <Users size={16} />, roles: ['responsable'] },
    { id: 'users', label: 'Comptes Utilisateurs', icon: <UserCheck size={16} />, roles: ['responsable'] },
    { id: 'pv_history', label: 'Historique des PV', icon: <FileClock size={16} />, roles: ['responsable', 'superviseur', 'technicien'] }
  ];

  // Filter menu items for current user's role
  const visibleMenu = menuItems.filter(item => item.roles.includes(user.role));



  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="navbar">
        <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo_ocp.png" alt="OCP Logo" style={{ height: '42px', width: '42px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '4px', padding: '3px' }} />
          <div className="brand-details">
            <span className="brand-title">Gestion de la Maintenance Sûreté</span>
          </div>
        </div>

        <div className="navbar-actions">
          <span className="site-badge">{user.site_name}</span>
        </div>
      </header>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        
        {/* Left Sidebar */}
        <aside className="sidebar">
          <div>
            {/* Active Session Card */}
            <div className="session-card">
              <div className="session-label">Session Active</div>
              <div className="session-name">{user.full_name}</div>
              <div className="session-role">
                {user.role === 'responsable' 
                  ? 'Responsable Sûreté (Global)' 
                  : user.role === 'superviseur' 
                    ? 'Superviseur de Site' 
                    : 'Technicien EDET'}
              </div>
              <div className="session-site">
                <Map size={12} style={{ color: 'var(--primary)' }} />
                <span>Site: {user.site_name}</span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav>
              <ul className="sidebar-menu">
                {visibleMenu.map(item => (
                  <li key={item.id}>
                    <div 
                      onClick={() => setCurrentView(item.id)}
                      className={`menu-item ${currentView === item.id ? 'active' : ''}`}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            {/* Logout button */}
            <div 
              onClick={onLogout}
              className="menu-item" 
              style={{ color: 'var(--status-danger)', borderTop: '1px solid var(--border)', borderRadius: 0, marginTop: '1rem', paddingTop: '1rem' }}
            >
              <span className="menu-icon"><LogOut size={16} /></span>
              <span>Se déconnecter</span>
            </div>
            
            <div className="sidebar-footer">
              Réf OCP-SLA-SURETE • 2026
            </div>
          </div>
        </aside>

        {/* Page Content Panel */}
        <main className="content-container">
          {children}
        </main>

      </div>
    </div>
  );
}
