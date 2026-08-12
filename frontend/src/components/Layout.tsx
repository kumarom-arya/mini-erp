import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Package, FileText, FileSpreadsheet, CreditCard, Settings as SettingsIcon, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Products & Inventory', path: '/products', icon: <Package size={20} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE'] },
    { name: 'Sales Challans', path: '/challans', icon: <FileText size={20} />, roles: ['ADMIN', 'SALES'] },
    { name: 'Invoices', path: '/invoices', icon: <FileSpreadsheet size={20} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} />, roles: ['ADMIN', 'ACCOUNTS'] },
    { name: 'Employees', path: '/employees', icon: <Users size={20} />, roles: ['ADMIN'] },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} />, roles: ['ADMIN'] },
  ];

  const allowedNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>Mini ERP</h2>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {allowedNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  color: isActive ? '#fff' : 'var(--color-text-main)',
                  background: isActive ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))' : 'transparent',
                  boxShadow: isActive ? '0 4px 15px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)' : 'none',
                  textDecoration: 'none',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.025em',
                  transition: 'all var(--transition-bounce)'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600 }}>{user?.username}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Role: {user?.role}</div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="header">
          <h3>{allowedNavItems.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)))?.name || 'Dashboard'}</h3>
          <div>
            <span className="badge badge-neutral">{new Date().toLocaleDateString()}</span>
          </div>
        </header>
        
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
