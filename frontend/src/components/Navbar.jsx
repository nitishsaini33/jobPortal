import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Responsive navigation bar with:
 * - Brand logo
 * - Role-aware navigation links
 * - User greeting and logout button
 * - Mobile hamburger menu
 */
export default function Navbar() {
  const { user, isAuthenticated, isRecruiter, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">💼</span>
          <span className="brand-text">SmartHire</span>
        </Link>

        <div className="navbar-links">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link nav-link-primary">Sign Up</Link>
            </>
          ) : (
            <>
              {isRecruiter ? (
                <>
                  <Link to="/recruiter/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/recruiter/jobs/new" className="nav-link">Post Job</Link>
                  <Link to="/recruiter/search" className="nav-link">Search Candidates</Link>
                </>
              ) : (
                <>
                  <Link to="/applicant/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/applicant/jobs" className="nav-link">Browse Jobs</Link>
                </>
              )}
              <div className="nav-user">
                <span className="nav-greeting">Hi, {user?.fullName?.split(' ')[0]}</span>
                <span className="nav-role-badge">{isRecruiter ? 'Recruiter' : 'Applicant'}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
