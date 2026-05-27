import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Reusable Google Auth Button component.
 * Handles:
 * - Google OAuth flow
 * - Calling the backend with the token
 * - Role selection popup for brand new users
 * - Redirecting upon success
 */
export default function GoogleAuthButton() {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [credential, setCredential] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      // First attempt without a role
      const data = await googleLogin(credentialResponse.credential, null);
      redirectUser(data);
    } catch (err) {
      if (err.response?.data?.message === 'ROLE_REQUIRED') {
        // Need to ask the user for a role
        setCredential(credentialResponse.credential);
        setShowRoleModal(true);
      } else {
        setError(err.response?.data?.message || 'Google login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async (selectedRole) => {
    setError('');
    setLoading(true);
    try {
      const data = await googleLogin(credential, selectedRole);
      setShowRoleModal(false);
      redirectUser(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (data) => {
    const redirectTo = location.state?.from?.pathname ||
      (data.roles.includes('RECRUITER') ? '/recruiter/dashboard' : '/applicant/dashboard');
    navigate(redirectTo, { replace: true });
  };

  return (
    <>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('Google Login was unsuccessful.')}
          text="continue_with"
          width="320px"
          theme="filled_black"
          shape="rectangular"
        />
      </div>
      
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>Choose Your Role</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Welcome! Since this is your first time signing in with Google, please tell us how you'll be using SmartHire.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => handleRoleSelection('APPLICANT')}
                disabled={loading}
                style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}
              >
                👨‍💻 I'm looking for a job
              </button>
              
              <button 
                className="btn btn-primary" 
                onClick={() => handleRoleSelection('RECRUITER')}
                disabled={loading}
                style={{ padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}
              >
                🏢 I want to hire talent
              </button>
            </div>
            
            <button 
              className="btn btn-ghost" 
              style={{ marginTop: '1.5rem', width: '100%' }}
              onClick={() => setShowRoleModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
