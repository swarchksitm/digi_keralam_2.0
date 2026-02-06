// React import removed as strictly unused
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleRoute from './auth/RoleRoute';

import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import DistrictDashboard from './pages/dashboard/DistrictDashboard';
import TrainerDashboard from './pages/dashboard/TrainerDashboard';
import CitizenDashboard from './pages/dashboard/CitizenDashboard';
import SessionCreate from './pages/sessions/SessionCreate';
import SessionAssign from './pages/sessions/SessionAssign';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Governance Routes */}
        <Route element={<RoleRoute allowedRoles={['KSITM_SUPER_ADMIN', 'LSGD_STATE_ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Protected District Routes */}
        <Route element={<RoleRoute allowedRoles={['LSGD_DISTRICT_ADMIN']} />}>
          <Route path="/district/dashboard" element={<DistrictDashboard />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={['DISTRICT_MASTER_TRAINER']} />}>
          <Route path="/district/dashboard" element={<DistrictDashboard />} />
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
    </Router>
  );
}

export default App;
