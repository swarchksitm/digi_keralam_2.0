// React import removed as strictly unused
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleRoute from './auth/RoleRoute';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TrainerRegister from './pages/auth/TrainerRegister';
import Unauthorized from './pages/Unauthorized';
import Accessibility from './pages/Accessibility';
import AdminDashboard from './pages/dashboard/AdminDashboard';


import TrainerDashboard from './pages/dashboard/TrainerDashboard';
import CitizenDashboard from './pages/dashboard/CitizenDashboard';
import SessionCreate from './pages/sessions/SessionCreate';
import LSGIDashboard from './pages/dashboard/LSGIDashboard';
import SessionAssign from './pages/sessions/SessionAssign';
import Profile from './pages/Profile';

import { Footer } from './components/layout/Footer';

import { useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const hideFooterRoutes = ['/login', '/register', '/register-trainer'];

  const showFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-trainer" element={<TrainerRegister />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/accessibility" element={<Accessibility />} />

          {/* Protected Common Routes */}
          <Route element={<RoleRoute allowedRoles={['KSITM_SUPER_ADMIN', 'LSGD_STATE_ADMIN', 'LSGD_DISTRICT_ADMIN', 'LSGI_ADMIN', 'DISTRICT_MASTER_TRAINER', 'LSGI_FIELD_TRAINER', 'CITIZEN']} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Protected Governance Routes */}
          <Route element={<RoleRoute allowedRoles={['KSITM_SUPER_ADMIN', 'LSGD_STATE_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Protected District Routes */}
          <Route element={<RoleRoute allowedRoles={['LSGD_DISTRICT_ADMIN']} />}>
            <Route path="/district/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Protected Master Trainer Routes */}
          <Route element={<RoleRoute allowedRoles={['DISTRICT_MASTER_TRAINER']} />}>
            <Route path="/master-trainer/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['LSGI_ADMIN']} />}>
            <Route path="/lsgi/dashboard" element={<LSGIDashboard />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={['DISTRICT_MASTER_TRAINER']} />}>
            <Route path="/district/sessions/create" element={<SessionCreate />} />
            <Route path="/district/sessions/:id/assign" element={<SessionAssign />} />
          </Route>

          {/* Protected Delivery Routes (Trainers) */}
          <Route element={<RoleRoute allowedRoles={['DISTRICT_MASTER_TRAINER', 'LSGI_FIELD_TRAINER']} />}>
            <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          </Route>

          {/* Protected Citizen Routes */}
          <Route element={<RoleRoute allowedRoles={['CITIZEN']} />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          </Route>

        </Routes>
      </div>
      {showFooter && <Footer />}
    </div>
  );
}

import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;
