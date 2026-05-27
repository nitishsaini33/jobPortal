import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../../api/axios';
import ApplicantProfileModal from './ApplicantProfileModal';

const STATUS_OPTIONS = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'OFFERED', 'REJECTED'];

/**
 * Applicant tracking view for a specific job posting.
 * Recruiters can:
 * - View all applicants with filtering by status
 * - Update application statuses
 * - Download resumes
 * - Add recruiter notes
 */
export default function ApplicantList() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [viewingProfileId, setViewingProfileId] = useState(null);

  const fetchApplications = async (p = 0) => {
    setLoading(true);
    try {
      const res = await applicationsAPI.getApplicationsForJob(jobId, statusFilter, p, 10);
      setApplications(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(res.data.number);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [jobId, statusFilter]);

  const handleStatusUpdate = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await applicationsAPI.updateStatus(appId, { status: newStatus });
      fetchApplications(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDownloadResume = async (appId, applicantName) => {
    try {
      const res = await applicationsAPI.downloadResume(appId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${applicantName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download resume');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Applicant Tracking</h1>
          <p>
            {applications.length > 0
              ? `Viewing applicants for: ${applications[0]?.jobTitle}`
              : `Job ID: ${jobId}`}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/recruiter/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Status Filter */}
      <div className="filter-row">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Applications Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Applications ({applications.length})</h2>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No applications yet</h3>
            <p>No one has applied to this job posting yet, or no applications match your filter.</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Skills</th>
                  <th>Experience</th>
                  <th>Resume</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {app.applicantName}
                        </span>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          onClick={() => setViewingProfileId(app.applicantId)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                        >
                          👁️ Profile
                        </button>
                      </div>
                    </td>
                    <td>{app.applicantEmail}</td>
                    <td>
                      <div className="job-card-skills">
                        {app.skills?.split(',').slice(0, 3).map((skill, i) => (
                          <span key={i} className="skill-tag">{skill.trim()}</span>
                        ))}
                        {app.skills?.split(',').length > 3 && (
                          <span className="skill-tag" style={{ opacity: 0.6 }}>
                            +{app.skills.split(',').length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{app.experienceYears} yrs</td>
                    <td>
                      {app.hasResume ? (
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => handleDownloadResume(app.id, app.applicantName)}
                          title="Download Resume">
                          📄 Download
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                    <td>{formatDate(app.appliedAt)}</td>
                    <td>
                      <span className={`badge badge-${app.status?.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        disabled={updatingId === app.id}
                        style={{
                          padding: '0.375rem 0.5rem',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-primary)',
                          fontSize: '0.8rem',
                          fontFamily: 'inherit'
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 0} onClick={() => fetchApplications(page - 1)}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={i === page ? 'active' : ''}
                    onClick={() => fetchApplications(i)}>{i + 1}</button>
                ))}
                <button disabled={page === totalPages - 1}
                  onClick={() => fetchApplications(page + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
      {/* Applicant Profile Modal */}
      {viewingProfileId && (
        <ApplicantProfileModal 
          applicantId={viewingProfileId} 
          onClose={() => setViewingProfileId(null)} 
        />
      )}
    </div>
  );
}
