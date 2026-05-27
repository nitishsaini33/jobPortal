import { useState, useEffect } from 'react';
import { usersAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('basic');

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
      setResumeFile(null);

      // Update local storage user if name changed
      if (user && user.fullName !== res.data.fullName) {
        const updatedUser = { ...user, fullName: res.data.fullName };
        localStorage.setItem('smarthire_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'background', label: 'Background', icon: '🎓' },
    { id: 'links', label: 'Links & Resume', icon: '🔗' },
  ];

  const skillList = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  if (loading) {
    return (
      <div className="dashboard" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Profile Header */}
      <div className="profile-hero">
        <div className="profile-hero-bg"></div>
        <div className="profile-hero-content">
          <div className="profile-avatar">
            {formData.fullName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="profile-hero-info">
            <h1>{formData.fullName || 'Your Name'}</h1>
            <p className="profile-hero-email">✉️ {formData.email}</p>
            <div className="profile-hero-badges">
              {formData.phone && <span className="profile-badge">📱 {formData.phone}</span>}
              {formData.dob && <span className="profile-badge">🎂 {new Date(formData.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              {existingResumeUrl && <span className="profile-badge profile-badge-success">📄 Resume Uploaded</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Skill pills preview */}
      {skillList.length > 0 && (
        <div className="profile-skills-preview">
          {skillList.map((skill, i) => (
            <span key={i} className="skill-tag">{skill}</span>
          ))}
        </div>
      )}

      {/* Success/Error Message */}
      {message.text && (
        <div className={`profile-message profile-message-${message.type}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="profile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            <span className="profile-tab-icon">{tab.icon}</span>
            <span className="profile-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="profile-section-card">

          {/* Tab: Basic Info */}
          {activeTab === 'basic' && (
            <div className="profile-tab-content">
              <div className="profile-section-header">
                <h3>👤 Basic Information</h3>
                <p>Your personal details and contact information</p>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Full Name</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">🙍</span>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="input-with-icon" />
                  </div>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Email Address</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">✉️</span>
                    <input type="email" name="email" value={formData.email} disabled className="input-with-icon" style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Contact Number</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">📱</span>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" className="input-with-icon" />
                  </div>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date of Birth</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">📅</span>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-with-icon" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Professional */}
          {activeTab === 'professional' && (
            <div className="profile-tab-content">
              <div className="profile-section-header">
                <h3>💼 Professional Summary</h3>
                <p>Tell recruiters about yourself and your skills</p>
              </div>
              <div className="form-group">
                <label>About Me</label>
                <textarea
                  name="profileSummary"
                  value={formData.profileSummary}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Write a compelling summary about your professional background, career goals, and what makes you unique..."
                />
              </div>
              <div className="form-group">
                <label>Skills (comma separated)</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">🛠️</span>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. Java, React, SQL, Project Management"
                    className="input-with-icon"
                  />
                </div>
              </div>
              {skillList.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '-0.5rem' }}>
                  {skillList.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Background */}
          {activeTab === 'background' && (
            <div className="profile-tab-content">
              <div className="profile-section-header">
                <h3>🎓 Education & Experience</h3>
                <p>Your academic and professional background</p>
              </div>
              <div className="form-group">
                <label>🎓 Education</label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  rows="4"
                  placeholder={"B.S. in Computer Science\nUniversity of Technology (2018-2022)\nGPA: 3.8/4.0"}
                />
              </div>
              <div className="form-group">
                <label>💼 Experience</label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows="4"
                  placeholder={"Software Engineer at TechCorp\nJan 2022 - Present\n• Built scalable APIs serving 1M+ requests/day"}
                />
              </div>
            </div>
          )}

          {/* Tab: Links & Resume */}
          {activeTab === 'links' && (
            <div className="profile-tab-content">
              <div className="profile-section-header">
                <h3>🔗 Social Links & Resume</h3>
                <p>Connect your online presence and upload your resume</p>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>LinkedIn</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">🔗</span>
                    <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/username" className="input-with-icon" />
                  </div>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>GitHub</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">💻</span>
                    <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="https://github.com/username" className="input-with-icon" />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Portfolio / Personal Website</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">🌐</span>
                  <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://myportfolio.com" className="input-with-icon" />
                </div>
              </div>

              <div className="profile-resume-section">
                <div className="profile-resume-info">
                  <span className="profile-resume-icon">📄</span>
                  <div>
                    <strong>Master Resume</strong>
                    <p>Upload your latest resume (PDF, DOCX)</p>
                  </div>
                </div>
                <input type="file" id="resumeUpload" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                <label htmlFor="resumeUpload" className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
                  {resumeFile ? `📎 ${resumeFile.name}` : 'Choose File'}
                </label>
              </div>
              {existingResumeUrl && !resumeFile && (
                <div className="profile-resume-status">
                  ✅ A resume is currently uploaded. Uploading a new one will replace it.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="profile-save-bar">
          <div className="profile-save-hint">
            {activeTab !== 'links' && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => {
                const idx = tabs.findIndex(t => t.id === activeTab);
                if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
              }}>
                Next: {tabs[tabs.findIndex(t => t.id === activeTab) + 1]?.label} →
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-auth-submit" disabled={saving}>
            {saving ? (
              <span className="btn-loading"><span className="spinner-sm"></span> Saving...</span>
            ) : (
              <>💾 Save Profile</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
