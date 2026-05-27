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
            <div className="auth-icon">🔐</div>
            <h1>Welcome Back</h1>
            <p>Sign in to your SmartHire account</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <GoogleAuthButton />

          <div style={{ textAlign: 'center', margin: '1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', position: 'relative' }}>
            <span style={{ background: 'var(--bg-card)', padding: '0 10px', position: 'relative', zIndex: 1 }}>OR</span>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border-color)', zIndex: 0 }}></div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-sm"></span> Signing in...
                </span>
              ) : (
                'Sign In'
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
          <div className="decoration-content">
            <h2>SmartHire Portal</h2>
            <p>Your intelligent recruitment companion. Connect talent with opportunity.</p>
            <div className="decoration-features">
              <div className="feature-item">✓ AI-Powered Candidate Search</div>
              <div className="feature-item">✓ Real-Time Application Tracking</div>
              <div className="feature-item">✓ Resume Management</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
