import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Printer, FileText, LogOut } from 'lucide-react';

const MainLayout = () => {
  return (
    <div className="app-container">
      <nav className="sidebar">
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>PrintManager</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Admin Dashboard</p>
        </div>
        
        <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
            style={({isActive}) => navItemStyle(isActive)}
          >
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          
          <NavLink 
            to="/printers" 
            className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
            style={({isActive}) => navItemStyle(isActive)}
          >
            <Printer size={20} /> Filas de Impressão
          </NavLink>
          
          <NavLink 
            to="/reports" 
            className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
            style={({isActive}) => navItemStyle(isActive)}
          >
            <FileText size={20} /> Relatórios
          </NavLink>
        </div>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--glass-border)' }}>
          <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--error)' }}>
            <LogOut size={20} /> Sair
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

// Inline styles for simplicity in this phase
const navItemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  color: isActive ? '#fff' : 'var(--text-muted)',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 500,
  background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
  border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
  transition: 'all 0.3s ease'
});

export default MainLayout;
