import { useState, useRef } from 'react';
import { applicationsAPI } from '../../api/axios';

/**
 * Application submission modal with:
 * - Job summary at the top
 * - Cover letter textarea
 * - Skills input
 * - Years of experience
 * - Drag-and-drop resume upload (PDF/DOCX)
 */
export default function ApplicationForm({ job, onClose }) {
  const [formData, setFormData] = useState({
    coverLetter: '',
    skills: '',
    experienceYears: 0,
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setError('Only PDF and DOCX files are accepted.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }
    setError('');
    setResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await applicationsAPI.apply(
        { jobId: job.id, ...formData, experienceYears: Number(formData.experienceYears) },
        resumeFile
      );
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={() => onClose(true)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '420px', textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ marginBottom: '0.75rem' }}>Application Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Your application for <strong style={{ color: 'var(--text-primary)' }}>{job.title}</strong> at{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{job.company}</strong> has been submitted.
            You can track its status in your dashboard.
          </p>
          <button className="btn btn-primary btn-full" onClick={() => onClose(true)}>
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Apply for Position</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {job.title} — {job.company}
            </p>
          </div>
          <button className="btn btn-ghost" onClick={() => onClose(false)}>✕</button>
        </div>

        {/* Job Quick Summary */}
        <div style={{
          margin: '0 1.5rem',
          padding: '0.875rem 1rem',
          background: 'rgba(99,102,241,0.07)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
          fontSize: '0.8rem', color: 'var(--text-secondary)'
        }}>
          {job.location && <span>📍 {job.location}</span>}
          <span>💼 {job.employmentType?.replace('_', ' ')}</span>
          {job.experienceMinYears != null && (
            <span>⏱ {job.experienceMinYears}{job.experienceMaxYears ? `–${job.experienceMaxYears}` : '+'} yrs exp</span>
          )}
          {(job.salaryMin || job.salaryMax) && (
            <span>💰 ${(job.salaryMin / 1000).toFixed(0)}k – ${(job.salaryMax / 1000).toFixed(0)}k</span>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div className="alert alert-error"><span>⚠️</span> {error}</div>
            )}

            {/* Resume Upload */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--text-secondary)', textTransform: 'uppercase',
                letterSpacing: '0.05em', marginBottom: '0.5rem'
              }}>
                Resume (PDF / DOCX)
              </label>
              <div
                className={`file-upload ${resumeFile ? 'has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                style={dragging ? { borderColor: 'var(--color-primary)', background: 'rgba(99,102,241,0.08)' } : {}}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <div className="file-upload-icon">
                  {resumeFile ? '✅' : '📄'}
                </div>
                {resumeFile ? (
                  <div>
                    <div className="file-upload-text" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                      {resumeFile.name}
                    </div>
                    <div className="file-upload-hint">
                      {(resumeFile.size / 1024).toFixed(0)} KB — Click to replace
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="file-upload-text">
                      Drag & drop your resume here, or <span style={{ color: 'var(--color-primary-light)' }}>browse</span>
                    </div>
                    <div className="file-upload-hint">PDF, DOC, DOCX — Max 10MB</div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="app-skills">Your Relevant Skills</label>
              <input
                id="app-skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. Java, Spring Boot, React, MySQL"
              />
            </div>

            <div className="form-group">
              <label htmlFor="app-exp">Years of Experience</label>
              <input
                id="app-exp"
                name="experienceYears"
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="app-cover">Cover Letter (Optional)</label>
              <textarea
                id="app-cover"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                rows={5}
                placeholder="Tell the recruiter why you're a great fit for this role..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => onClose(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-sm"></span> Submitting...
                </span>
              ) : '🚀 Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
