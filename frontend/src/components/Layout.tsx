import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Package, FileText, FileSpreadsheet, CreditCard, Settings as SettingsIcon, LogOut, ChevronRight } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Customers', path: '/customers', icon: <Users size={18} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Products & Inventory', path: '/products', icon: <Package size={18} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE'] },
    { name: 'Sales Challans', path: '/challans', icon: <FileText size={18} />, roles: ['ADMIN', 'SALES'] },
    { name: 'Invoices', path: '/invoices', icon: <FileSpreadsheet size={18} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={18} />, roles: ['ADMIN', 'ACCOUNTS'] },
    { name: 'Employees', path: '/employees', icon: <Users size={18} />, roles: ['ADMIN'] },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={18} />, roles: ['ADMIN'] },
  ];

  const allowedNavItems = navItems.filter(item => user && item.roles.includes(user.role));
  const currentPage = allowedNavItems.find(i => location.pathname === i.path || (i.path !== '/' && location.pathname.startsWith(i.path)));

  return (
    <div className="app-container">
      <aside className="sidebar">
        {/* Brand */}
        <div style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            flexShrink: 0
          }}>
            <Package size={18} color="white" />
          </div>
          <div>
            <div style={{
              fontWeight: 800,
              fontSize: '1.1rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #f1f5f9, var(--primary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Mini ERP
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto'
        }}>
          {allowedNavItems.map((item, index) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive
                    ? 'linear-gradient(135deg, var(--primary), #7c3aed)'
                    : 'transparent',
                  boxShadow: isActive
                    ? '0 4px 12px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : 'none',
                  textDecoration: 'none',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  letterSpacing: '0.01em',
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                  animation: `slideInLeft 0.3s var(--ease-out) ${index * 0.04}s both`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.name}</span>
                {isActive && (
                  <ChevronRight size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div style={{
          padding: '1rem 1rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--primary-deep), #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {user?.role}
              </div>
            </div>
          </div>
          <button
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}
            onClick={handleLogout}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            {currentPage?.name || 'Dashboard'}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
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
