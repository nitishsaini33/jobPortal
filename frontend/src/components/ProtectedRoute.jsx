import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component that:
 * 1. Redirects to /login if not authenticated
 * 2. Optionally checks for a required role (RECRUITER or APPLICANT)
 * 3. Shows a loading spinner while auth state is being restored
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isRecruiter, isApplicant, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'RECRUITER' && !isRecruiter) {
    return <Navigate to="/applicant/dashboard" replace />;
  }

  if (requiredRole === 'APPLICANT' && !isApplicant) {
    return <Navigate to="/recruiter/dashboard" replace />;
  }

  return children;
}
