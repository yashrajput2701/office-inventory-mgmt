import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/orders" className="brand">Office Inventory</Link>
        <nav>
          {user?.role === 'CREATOR' && <Link to="/orders/new">+ New Request</Link>}
          <Link to="/change-password">Change Password</Link>
        </nav>
        <div className="user-info">
          <span>{user?.fullName} <em>({user?.role})</em></span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
