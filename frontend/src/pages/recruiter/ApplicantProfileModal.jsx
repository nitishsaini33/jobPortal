import { useState, useEffect } from 'react';
import { usersAPI } from '../../api/axios';

/**
 * Modal to display an applicant's full profile to recruiters.
 */
export default function ApplicantProfileModal({ applicantId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersAPI.getProfileById(applicantId);
        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load candidate profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [applicantId]);

  // Helper to safely parse JSON arrays (e.g. skills or education if stored as JSON)
  const renderList = (text) => {
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) return null;
        
        // Handle structured education array
        if (parsed[0].qualification) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {parsed.map((edu, idx) => (
                <div key={idx} style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {edu.qualification} {edu.course ? `— ${edu.course}` : ''}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {edu.institution} • {edu.startYear} - {edu.currentlyStudying ? 'Present' : edu.endYear}
                  </div>
                  {edu.grade && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Grade: {edu.grade}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }

        // Handle tags (skills)
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {parsed.map((item, idx) => (
              <span key={idx} style={{
                padding: '4px 10px',
                background: 'rgba(99,102,241,0.1)',
                color: 'var(--color-primary-light)',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                {item}
              </span>
            ))}
          </div>
        );
      }
    } catch (e) {
      // If it's not JSON, return standard comma separated text or paragraphs
      return <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{text}</p>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div>
            <h2>Candidate Profile</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading profile...
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : !profile ? (
            <div className="alert alert-error">Profile not found</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Header Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 600, color: 'white'
                }}>
                  {profile.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{profile.fullName}</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>📧 {profile.email}</span>
                    {profile.phone && <span>📱 {profile.phone}</span>}
                  </div>
                </div>
              </div>

              {/* Summary */}
              {profile.profileSummary && (
                <div>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Professional Summary</h4>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{profile.profileSummary}</p>
                </div>
              )}

              {/* Skills */}
              {profile.skills && (
                <div>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Skills</h4>
                  {renderList(profile.skills)}
                </div>
              )}

              {/* Experience */}
              {profile.experience && (
                <div>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Experience</h4>
                  {renderList(profile.experience)}
                </div>
              )}

              {/* Education */}
              {profile.education && (
                <div>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Education</h4>
                  {renderList(profile.education)}
                </div>
              )}

              {/* Links */}
              {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
                <div>
                  <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Links</h4>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {profile.linkedinUrl && (
                      <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-light)' }}>
                        LinkedIn ↗
                      </a>
                    )}
                    {profile.githubUrl && (
                      <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-light)' }}>
                        GitHub ↗
                      </a>
                    )}
                    {profile.portfolioUrl && (
                      <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-light)' }}>
                        Portfolio ↗
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
