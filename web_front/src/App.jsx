import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartModal from './components/cart/CartModal';
import FloatingAIChat from './components/chat/FloatingAIChat';

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

// 404 Not Found Component
const NotFound = () => (
  <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
    <div className="py-5">
      <h1 className="display-1 fw-bold text-success mb-3">404</h1>
      <h3 className="fw-bold text-secondary mb-3">الصفحة المطلوبة غير موجودة</h3>
      <p className="text-muted mb-4">
        عذراً، الصفحة التي تبحث عنها قد تم نقلها أو حذفها أو أنها غير متاحة حالياً.
      </p>
      <a
        href="/"
        className="btn text-white px-4 py-2 rounded-pill shadow-sm"
        style={{ backgroundColor: 'var(--main-color, #0f6848)' }}
      >
        العودة إلى الصفحة الرئيسية
      </a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100 bg-light text-dark font-cairo">
            {/* Top Navigation */}
            <Navbar />

            {/* Shopping Cart Drawer / Modal */}
            <CartModal />

            {/* Floating AI Assistant Widget */}
            <FloatingAIChat />

            {/* Main Application Content */}
            <main className="flex-grow-1">
              <Routes>
                {/* Home */}
                <Route path="/" element={<Home />} />

                {/* Doctors */}
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctors/:id" element={<DoctorDetail />} />

                {/* Medicines */}
                <Route path="/medicines" element={<Medicines />} />
                <Route path="/medicines/:id" element={<MedicineDetail />} />

                {/* Appointments */}
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/appointments/create/:doctorId" element={<Appointments />} />

                {/* Orders / Tracking */}
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/orders/status" element={<Navigate to="/track-order" replace />} />

                {/* AI Chat */}
                <Route path="/ai-chat" element={<AIChat />} />

                {/* Reviews / Ratings */}
                <Route path="/rate" element={<Ratings />} />

                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
