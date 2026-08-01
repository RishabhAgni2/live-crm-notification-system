import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { Bell, Users, Building, Briefcase, LogOut } from 'lucide-react';
import { API_URL } from '../config.js';

const DashboardLayout = () => {
  const { user, token, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });
      return () => {
        socket.off('new_notification');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="app-container">
      <div className="sidebar glass-panel">
        <h2 style={{ marginBottom: '2rem' }}>Live CRM</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link
            to="/companies"
            className={`btn-secondary ${location.pathname.includes('/companies') ? 'btn-primary' : ''}`}
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            <Building size={18} /> Companies
          </Link>
          <Link
            to="/contacts"
            className={`btn-secondary ${location.pathname.includes('/contacts') ? 'btn-primary' : ''}`}
            style={{ textAlign: 'left', justifyContent: 'flex-start' }}
          >
            <Users size={18} /> Contacts
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              to="/assignments"
              className={`btn-secondary ${location.pathname.includes('/assignments') ? 'btn-primary' : ''}`}
              style={{ textAlign: 'left', justifyContent: 'flex-start' }}
            >
              <Briefcase size={18} /> Assignments
            </Link>
          )}
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <div className="flex items-center gap-2 mb-4">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {user?.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{user?.name}</div>
              <div className="text-muted text-sm">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
          <div />
          <div style={{ position: 'relative' }}>
            <button
              className="btn-secondary"
              style={{ padding: '0.5rem', borderRadius: '50%' }}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <Bell size={24} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {showDropdown && (
              <div
                className="glass-card animate-slide-in"
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  zIndex: 50,
                  padding: 0,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--glass-border)',
                    fontWeight: 600,
                  }}
                >
                  Notifications
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: '1rem',
                          borderBottom: '1px solid var(--glass-border)',
                          background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{n.message}</div>
                        <div className="flex justify-between items-center text-sm text-muted">
                          {new Date(n.createdAt).toLocaleTimeString()}
                          {!n.isRead && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-color)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                              }}
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
