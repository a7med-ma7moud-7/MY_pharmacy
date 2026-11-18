import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

// Layout
import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PharmacyList } from './pages/Pharmacies/PharmacyList';
import { DoctorList } from './pages/Doctors/DoctorList';
import { MedicineList } from './pages/Medicines/MedicineList';
import { AppointmentList } from './pages/Appointments/AppointmentList';
import { OrderList } from './pages/Orders/OrderList';
import { ReportsView } from './pages/Reports/ReportsView';
import { UserList } from './pages/Users/UserList';
import { AiChatList } from './pages/AiChats/AiChatList';
import { DoctorModerationView } from './pages/Moderation/DoctorModerationView';

function RoleHomeRedirect() {
  const { isPharmacy } = useAdminAuth();
  return <Navigate to={isPharmacy ? '/medicines' : '/dashboard'} replace />;
}

function SuperAdminRoute({ children }) {
  const { isPharmacy } = useAdminAuth();
  if (isPharmacy) {
    return <Navigate to="/medicines" replace />;
  }
  return children;
}

export function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AdminAuthProvider>
            <NotificationProvider>
              <Routes>
                {/* Public Auth Route (Super Admin & Provisioned Pharmacies — No Self-Registration) */}
                <Route path="/login" element={<Login />} />

                {/* Protected Dashboard Routes */}
                <Route element={<AdminLayout />}>
                  <Route path="/" element={<RoleHomeRedirect />} />

                  {/* Shared Scoped Routes (Scoped to Pharmacy's own Inventory & Orders when role=pharmacy) */}
                  <Route path="/medicines" element={<MedicineList />} />
                  <Route path="/orders" element={<OrderList />} />

                  {/* Exclusive Super Admin Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <SuperAdminRoute>
                        <Dashboard />
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/pharmacies"
                    element={
                      <SuperAdminRoute>
                        <PharmacyList />
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/doctors"
                    element={
                      <SuperAdminRoute>
                        <DoctorList />
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/doctor-moderation"
                    element={
                      <SuperAdminRoute>
                        <DoctorModerationView />
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/appointments"
                    element={
                      <SuperAdminRoute>
                        <AppointmentList />
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <SuperAdminRoute>
                        <ReportsView />
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/ai-chats"
                    element={
                      <SuperAdminRoute>
                        <AiChatList />
                      </SuperAdminRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <SuperAdminRoute>
                        <UserList />
                      </SuperAdminRoute>
                    }
                  />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<RoleHomeRedirect />} />
              </Routes>
            </NotificationProvider>
          </AdminAuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
