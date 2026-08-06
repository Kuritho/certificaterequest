// src/App.js - Add decorative elements
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './pages/Register';
import UserDashboard from './pages/user/Dashboard';
import RequestCertificate from './pages/user/RequestCertificate';
import AdminDashboard from './pages/admin/Dashboard';
import ReviewRequests from './pages/admin/ReviewRequests';
import PostAnnouncement from './pages/admin/PostAnnouncement';
import Reports from './pages/admin/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Decorative Church Elements Component (add this)
function ChurchDecorations() {
  return (
    <>
      {/* Stained Glass Effect - Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: `
          radial-gradient(circle at 10% 20%, rgba(197, 165, 90, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 90% 80%, rgba(139, 26, 26, 0.03) 0%, transparent 50%)
        `
      }} />
    </>
  );
}

function App() {
  return (
    <>
      <ChurchDecorations />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" />} />

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