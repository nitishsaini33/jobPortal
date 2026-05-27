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
  const [showPassword, setShowPassword] = useState(false);
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
            <div className="auth-logo">
              <span className="auth-logo-icon">💼</span>
              <span className="auth-logo-text">SmartHire</span>
            </div>
            <h1>Create Account</h1>
            <p>Join SmartHire and start your journey</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <GoogleAuthButton />

          <div className="auth-divider">
            <span>or register with email</span>
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
              <div className="input-icon-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  autoFocus
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="input-with-icon"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                    className="input-with-icon"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    className="input-with-icon"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone (Optional)</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">📱</span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="input-with-icon"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-sm"></span> Creating account...
                </span>
              ) : (
                <>Create Account <span className="btn-arrow">→</span></>
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
