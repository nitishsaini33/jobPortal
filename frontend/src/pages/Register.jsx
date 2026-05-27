import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

/**
 * Registration page with role selection (Recruiter/Applicant),
 * form validation, and automatic login after registration.
 */
export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'APPLICANT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.phone,
        formData.role
      );
      const redirectTo = data.roles.includes('RECRUITER')
        ? '/recruiter/dashboard'
        : '/applicant/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card auth-card-register">
          <div className="auth-header">
            <div className="auth-icon">🚀</div>
            <h1>Create Account</h1>
            <p>Join SmartHire and start your journey</p>
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
            {/* Role Selection */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${formData.role === 'APPLICANT' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'APPLICANT' })}
              >
                <span className="role-icon">👤</span>
                <span className="role-label">Applicant</span>
                <span className="role-desc">Find your dream job</span>
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'RECRUITER' ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'RECRUITER' })}
              >
                <span className="role-icon">🏢</span>
                <span className="role-label">Recruiter</span>
                <span className="role-desc">Find top talent</span>
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone (Optional)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-sm"></span> Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
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
