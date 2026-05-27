import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

/**
 * Login page with email/password form, error handling,
 * and redirect to the appropriate dashboard based on role.
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      const redirectTo = location.state?.from?.pathname ||
        (data.roles.includes('RECRUITER') ? '/recruiter/dashboard' : '/applicant/dashboard');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="auth-logo-icon">💼</span>
              <span className="auth-logo-text">SmartHire</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <GoogleAuthButton />

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="input-with-icon"
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-sm"></span> Signing in...
                </span>
              ) : (
                <>Sign In <span className="btn-arrow">→</span></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Create one</Link>
            </p>
          </div>
        </div>

        <div className="auth-decoration">
          <div className="auth-decoration-bg">
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
          </div>
          <div className="decoration-content">
            <h2>SmartHire Portal</h2>
            <p>Your intelligent recruitment companion. Connect talent with opportunity seamlessly.</p>
            <div className="decoration-features">
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <div>
                  <strong>AI-Powered Search</strong>
                  <span>Find the perfect match instantly</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <div>
                  <strong>Real-Time Tracking</strong>
                  <span>Monitor applications live</span>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📄</span>
                <div>
                  <strong>Resume Management</strong>
                  <span>Smart profile builder</span>
                </div>
              </div>
            </div>

            <div className="decoration-stats">
              <div className="deco-stat">
                <strong>10K+</strong>
                <span>Active Jobs</span>
              </div>
              <div className="deco-stat">
                <strong>5K+</strong>
                <span>Companies</span>
              </div>
              <div className="deco-stat">
                <strong>50K+</strong>
                <span>Hires Made</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
