import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Compass, Home as HomeIcon } from 'lucide-react';

// Layout & Modals
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartModal from './components/cart/CartModal';
import FloatingAIChat from './components/chat/FloatingAIChat';
import ScrollToTop from './components/common/ScrollToTop';
import SilkAmbientBg from './components/common/SilkAmbientBg';
import DoctorPortalLayout from './components/doctor/DoctorPortalLayout';

// Public & Patient Pages
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import Medicines from './pages/Medicines';
import MedicineDetail from './pages/MedicineDetail';
import Appointments from './pages/Appointments';
import TrackOrder from './pages/TrackOrder';
import AIChat from './pages/AIChat';
import Ratings from './pages/Ratings';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientChats from './pages/PatientChats';

// Doctor Portal Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorTreatedCases from './pages/doctor/DoctorTreatedCases';
import DoctorReviews from './pages/doctor/DoctorReviews';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorChat from './pages/doctor/DoctorChat';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorFollowUps from './pages/doctor/DoctorFollowUps';

function NotFound() {
  return (
    <div className="py-20 px-4 text-center bg-transparent min-h-[70vh] flex flex-col items-center justify-center animate-fadeIn">
      <div className="w-24 h-24 rounded-3xl bg-emerald-100 text-[#0f6848] flex items-center justify-center mb-6 shadow-inner animate-float">
        <Compass className="w-12 h-12" />
      </div>
      <span className="text-5xl font-extrabold font-almarai gradient-text mb-2">404</span>
      <h2 className="text-2xl font-extrabold font-almarai text-gray-900 mb-2">
        عذراً، الصفحة غير موجودة
      </h2>
      <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
        الصفحة التي تبحث عنها ربما تم نقلها أو حذفها أو أن الرابط الذي أدخلته غير صحيح.
      </p>
      <Link
        to="/"
        className="btn-main px-8 py-3 rounded-2xl font-bold text-sm inline-flex items-center gap-2 shadow-lg"
      >
        <HomeIcon className="w-4 h-4" />
        <span>العودة إلى الصفحة الرئيسية</span>
      </Link>
    </div>
  );
}

function PublicWebsiteShell() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartModal />
      <FloatingAIChat />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="relative isolate flex flex-col min-h-screen bg-transparent">
            <SilkAmbientBg />

            <Routes>
              {/* Protected Dedicated Doctor Portal */}
              <Route path="/doctor" element={<DoctorPortalLayout />}>
                <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="profile" element={<DoctorProfile />} />
                <Route path="cases" element={<DoctorTreatedCases />} />
                <Route path="reviews" element={<DoctorReviews />} />
                <Route path="patients" element={<DoctorPatients />} />
                <Route path="chat" element={<DoctorChat />} />
                <Route path="records" element={<DoctorMedicalRecords />} />
                <Route path="records/:patientKey" element={<DoctorMedicalRecords />} />
                <Route path="prescriptions" element={<DoctorPrescriptions />} />
                <Route path="follow-ups" element={<DoctorFollowUps />} />
              </Route>

              {/* Public Website & Patient Routes */}
              <Route element={<PublicWebsiteShell />}>
                <Route path="/" element={<Home />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctors/:id" element={<DoctorDetail />} />
                <Route path="/medicines" element={<Medicines />} />
                <Route path="/medicines/:id" element={<MedicineDetail />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/orders/track" element={<TrackOrder />} />
                <Route path="/ai-chat" element={<AIChat />} />
                <Route path="/my-chats" element={<PatientChats />} />
                <Route path="/ratings" element={<Ratings />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
