import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Companies from './pages/Companies.jsx';
import Contacts from './pages/Contacts.jsx';
import Assignments from './pages/Assignments.jsx';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <div className="animate-slide-in">
                <h1>Welcome to the Live CRM</h1>
                <p className="text-muted mt-4">
                  Manage your companies, contacts, and stay updated with live notifications.
                </p>
              </div>
            }
          />
          <Route path="companies" element={<Companies />} />
          <Route path="contacts" element={<Contacts />} />
          <Route
            path="assignments"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Assignments />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
