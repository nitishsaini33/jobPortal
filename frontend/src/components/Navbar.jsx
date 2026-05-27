import { useState } from 'react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-icon">💼</span>
          <span className="brand-text">SmartHire</span>
        </Link>

        {/* Mobile menu toggle button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="nav-link nav-link-primary" onClick={closeMenu}>Sign Up</Link>
            </>
          ) : (
            <>
              {isRecruiter ? (
                <>
                  <Link to="/recruiter/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
                  <Link to="/recruiter/jobs/new" className="nav-link" onClick={closeMenu}>Post Job</Link>
                  <Link to="/recruiter/search" className="nav-link" onClick={closeMenu}>Search Candidates</Link>
                </>
              ) : (
                <>
                  <Link to="/applicant/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
                  <Link to="/applicant/jobs" className="nav-link" onClick={closeMenu}>Browse Jobs</Link>
                </>
              )}
              <div className="nav-user">
                <span className="nav-greeting">Hi, {user?.fullName?.split(' ')[0]}</span>
                <span className="nav-role-badge">{isRecruiter ? 'Recruiter' : 'Applicant'}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm nav-logout-btn">
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
