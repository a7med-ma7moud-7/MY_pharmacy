import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Compass, Home as HomeIcon } from 'lucide-react';

// Layout & Modals
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartModal from './components/cart/CartModal';
import FloatingAIChat from './components/chat/FloatingAIChat';
import ScrollToTop from './components/common/ScrollToTop';

// Pages
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

function NotFound() {
  return (
    <div className="py-20 px-4 text-center bg-slate-50 min-h-[70vh] flex flex-col items-center justify-center animate-fadeIn">
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

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen bg-slate-50">
            <Navbar />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctors/:id" element={<DoctorDetail />} />
                <Route path="/medicines" element={<Medicines />} />
                <Route path="/medicines/:id" element={<MedicineDetail />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/orders/track" element={<TrackOrder />} />
                <Route path="/ai-chat" element={<AIChat />} />
                <Route path="/ratings" element={<Ratings />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
            <CartModal />
            <FloatingAIChat />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
