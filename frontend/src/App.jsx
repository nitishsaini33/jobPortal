import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import ApplicantList from './pages/recruiter/ApplicantList';
import CandidateSearch from './pages/recruiter/CandidateSearch';

// Applicant pages
import ApplicantDashboard from './pages/applicant/ApplicantDashboard';
import JobBrowser from './pages/applicant/JobBrowser';

/**
 * Root application with full routing:
 *
 * Public:
 *   /login     — Login page (redirects if already authenticated)
 *   /register  — Register page (redirects if already authenticated)
 *
 * Recruiter (ROLE_RECRUITER):
 *   /recruiter/dashboard        — Dashboard + job management
 *   /recruiter/applicants/:id   — Applicant tracking for a job
 *   /recruiter/search           — Advanced candidate search
 *
 * Applicant (ROLE_APPLICANT):
 *   /applicant/dashboard — Dashboard + application tracker
 *   /applicant/jobs      — Job browser + apply modal
 *
 * / → redirect to appropriate dashboard or /login
 */
export default function App() {
  const { isAuthenticated, isRecruiter, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen" style={{ height: '100vh' }}>
        <div className="spinner"></div>
        <p>Loading SmartHire...</p>
      </div>
    );
  }

  const defaultDash = isRecruiter ? '/recruiter/dashboard' : '/applicant/dashboard';

  return (
    <>
      <Navbar />
      <Routes>
        {/* ── Public Routes ── */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <Register />}
        />

        {/* ── Recruiter Routes ── */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/jobs/new"
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/applicants/:jobId"
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <ApplicantList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/search"
          element={
            <ProtectedRoute requiredRole="RECRUITER">
              <CandidateSearch />
            </ProtectedRoute>
          }
        />

        {/* ── Applicant Routes ── */}
        <Route
          path="/applicant/dashboard"
          element={
            <ProtectedRoute requiredRole="APPLICANT">
              <ApplicantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicant/jobs"
          element={
            <ProtectedRoute requiredRole="APPLICANT">
              <JobBrowser />
            </ProtectedRoute>
          }
        />

        {/* ── Default ── */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to={defaultDash} replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* ── 404 fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
