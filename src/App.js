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

function App() {
  return (
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
  );
}

export default App;