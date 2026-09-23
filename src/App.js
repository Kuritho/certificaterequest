// src/App.js
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import UserDashboard from './pages/user/Dashboard';
import RequestCertificate from './pages/user/RequestCertificate';
import AdminDashboard from './pages/admin/Dashboard';
import ReviewRequests from './pages/admin/ReviewRequests';
import PostAnnouncement from './pages/admin/PostAnnouncement';
import Reports from './pages/admin/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Modern Cathedral-Themed Background
function ChurchDecorations() {
  return (
    <div className="church-background" aria-hidden="true">
      {/* Layer 1: Divine light gradients */}
      <div className="bg-base-gradient"></div>

      {/* Layer 2: Cathedral vault arches */}
      <div className="cathedral-vault">
        <div className="vault-arch vault-arch-1"></div>
        <div className="vault-arch vault-arch-2"></div>
        <div className="vault-arch vault-arch-3"></div>
        <div className="vault-arch vault-arch-4"></div>
      </div>

      {/* Layer 3: Rose window */}
      <div className="rose-window">
        <div className="rose-center"></div>
        <div className="rose-petal petal-1"></div>
        <div className="rose-petal petal-2"></div>
        <div className="rose-petal petal-3"></div>
        <div className="rose-petal petal-4"></div>
        <div className="rose-petal petal-5"></div>
        <div className="rose-petal petal-6"></div>
        <div className="rose-petal petal-7"></div>
        <div className="rose-petal petal-8"></div>
      </div>

      {/* Layer 4: Stained glass windows */}
      <div className="stained-glass stained-glass-left">
        <div className="glass-arch">
          <div className="glass-pane pane-1"></div>
          <div className="glass-pane pane-2"></div>
          <div className="glass-pane pane-3"></div>
          <div className="glass-pane pane-4"></div>
          <div className="glass-pane pane-5"></div>
          <div className="glass-pane pane-6"></div>
        </div>
      </div>

      <div className="stained-glass stained-glass-right">
        <div className="glass-arch">
          <div className="glass-pane pane-1"></div>
          <div className="glass-pane pane-2"></div>
          <div className="glass-pane pane-3"></div>
          <div className="glass-pane pane-4"></div>
          <div className="glass-pane pane-5"></div>
          <div className="glass-pane pane-6"></div>
        </div>
      </div>

      {/* Layer 5: Light rays */}
      <div className="light-rays">
        <div className="ray ray-1"></div>
        <div className="ray ray-2"></div>
        <div className="ray ray-3"></div>
        <div className="ray ray-4"></div>
        <div className="ray ray-5"></div>
        <div className="ray ray-6"></div>
        <div className="ray ray-7"></div>
      </div>

      {/* Layer 6: Floating doves */}
      <div className="dove dove-1">
        <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5C50 5 35 20 15 25C15 25 5 28 5 35C5 42 15 40 25 38C25 38 20 50 15 55C15 55 30 50 50 40C50 40 55 55 65 55C65 55 60 45 60 40C70 45 85 50 85 50C80 40 75 35 75 35C85 38 95 35 95 28C95 21 85 22 85 22C70 22 55 15 50 5Z" fill="currentColor"/>
        </svg>
      </div>
      <div className="dove dove-2">
        <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5C50 5 35 20 15 25C15 25 5 28 5 35C5 42 15 40 25 38C25 38 20 50 15 55C15 55 30 50 50 40C50 40 55 55 65 55C65 55 60 45 60 40C70 45 85 50 85 50C80 40 75 35 75 35C85 38 95 35 95 28C95 21 85 22 85 22C70 22 55 15 50 5Z" fill="currentColor"/>
        </svg>
      </div>

      {/* Layer 7: Grain texture */}
      <div className="dot-pattern"></div>
    </div>
  );
}

function App() {
  return (
    <>
      <ChurchDecorations />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Protected routes with layout */}
        <Route element={<Layout />}>
          <Route path="/user/dashboard" element={
            <ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>
          } />
          <Route path="/user/request" element={
            <ProtectedRoute role="user"><RequestCertificate /></ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/review" element={
            <ProtectedRoute role="admin"><ReviewRequests /></ProtectedRoute>
          } />
          <Route path="/admin/post" element={
            <ProtectedRoute role="admin"><PostAnnouncement /></ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute role="admin"><Reports /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </>
  );
}

export default App;