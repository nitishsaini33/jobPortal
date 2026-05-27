import { useState, useEffect } from 'react';
import { usersAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { user, login } = useAuth(); // We might need to refresh auth context if name changes
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    profileSummary: '',
    skills: '',
    education: '',
    experience: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [existingResumeUrl, setExistingResumeUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getProfile();
      const data = res.data;
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        dob: data.dob || '',
        profileSummary: data.profileSummary || '',
        skills: data.skills || '',
        education: data.education || '',
        experience: data.experience || '',
        linkedinUrl: data.linkedinUrl || '',
        githubUrl: data.githubUrl || '',
        portfolioUrl: data.portfolioUrl || '',
      });
      setExistingResumeUrl(data.resumeUrl || '');
    } catch (err) {
      console.error('Failed to load profile', err);
      setMessage({ text: 'Failed to load profile data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await usersAPI.updateProfile(formData, resumeFile);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setExistingResumeUrl(res.data.resumeUrl || '');
      setResumeFile(null); // Clear file input
      
      // Update local storage user if name changed
      if (user && user.fullName !== res.data.fullName) {
        const updatedUser = { ...user, fullName: res.data.fullName };
        localStorage.setItem('smarthire_user', JSON.stringify(updatedUser));
        // Note: the AuthContext doesn't have an update method besides login/logout
        // For now, refreshing page or next login will sync it perfectly, but this updates local storage.
      }
      
    } catch (err) {
      console.error('Failed to update profile', err);
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and professional details</p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        {message.text && (
          <div style={{
            padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-sm)',
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            border: `1px solid ${message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Basic Details */}
          <section>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Basic Details
            </h3>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} disabled style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Contact Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
              </div>
            </div>
          </section>

          {/* About & Skills */}
          <section>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Professional Summary
            </h3>
            <div className="form-group">
              <label>About Me</label>
              <textarea 
                name="profileSummary" 
                value={formData.profileSummary} 
                onChange={handleChange} 
                rows="4" 
                placeholder="Write a brief summary about your professional background and career goals..." 
              />
            </div>
            <div className="form-group">
              <label>Skills (comma separated)</label>
              <input 
                type="text" 
                name="skills" 
                value={formData.skills} 
                onChange={handleChange} 
                placeholder="e.g. Java, React, SQL, Project Management" 
              />
            </div>
          </section>

          {/* Education & Experience */}
          <section>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Background
            </h3>
            <div className="form-group">
              <label>Education</label>
              <textarea 
                name="education" 
                value={formData.education} 
                onChange={handleChange} 
                rows="3" 
                placeholder="E.g. B.S. in Computer Science, University of Technology (2018-2022)" 
              />
            </div>
            <div className="form-group">
              <label>Experience</label>
              <textarea 
                name="experience" 
                value={formData.experience} 
                onChange={handleChange} 
                rows="3" 
                placeholder="E.g. Software Engineer at TechCorp (2022-Present)" 
              />
            </div>
          </section>

          {/* Social Links */}
          <section>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Social Links
            </h3>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>LinkedIn URL</label>
                <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>GitHub URL</label>
                <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://github.com/username" />
              </div>
            </div>
            <div className="form-group">
              <label>Portfolio / Personal Website</label>
              <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://myportfolio.com" />
            </div>
          </section>

          {/* Resume */}
          <section>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Resume
            </h3>
            <div className="form-group">
              <label>Upload Master Resume (PDF, DOCX)</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
              {existingResumeUrl && !resumeFile && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-success)' }}>
                  ✓ A resume is currently uploaded. Uploading a new one will replace it.
                </p>
              )}
            </div>
          </section>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
