import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import TenantDashboard from "./pages/TenantDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EditListing from "./pages/EditListing";
import ListingDetail from "./pages/ListingDetail";

// Full-screen loader during auth check
const FullPageLoader = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
    <p className="text-slate-400 text-sm font-medium">Restoring Session...</p>
  </div>
);

// Protect routes — redirect to login if not authenticated, redirect if wrong role
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "OWNER") return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/tenant/dashboard" replace />;
  }
  return children;
};

// Redirect logged-in users away from login/register
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) {
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "OWNER") return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/tenant/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Listing Detail — any authenticated user */}
        <Route path="/listings/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />

        {/* Tenant Routes */}
        <Route path="/tenant/dashboard" element={<ProtectedRoute allowedRole="TENANT"><TenantDashboard /></ProtectedRoute>} />

        {/* Owner Routes */}
        <Route path="/owner/dashboard" element={<ProtectedRoute allowedRole="OWNER"><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/listings/:id/edit" element={<ProtectedRoute allowedRole="OWNER"><EditListing /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;