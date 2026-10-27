import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DoctorList } from './pages/Doctors/DoctorList';
import { MedicineList } from './pages/Medicines/MedicineList';
import { AppointmentList } from './pages/Appointments/AppointmentList';
import { OrderList } from './pages/Orders/OrderList';
import { ReportsView } from './pages/Reports/ReportsView';
import { UserList } from './pages/Users/UserList';

export function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/doctors" element={<DoctorList />} />
              <Route path="/medicines" element={<MedicineList />} />
              <Route path="/appointments" element={<AppointmentList />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/reports" element={<ReportsView />} />
              <Route path="/users" element={<UserList />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
