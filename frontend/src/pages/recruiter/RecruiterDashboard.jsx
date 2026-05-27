import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI } from '../../api/axios';
import JobForm from './JobForm';

/**
 * Recruiter Dashboard — main hub showing:
 * - Summary stats (total jobs, total applicants, shortlisted, pending)
 * - Job postings table with CRUD actions
 * - Quick access to applicant tracking and candidate search
 */
export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [stats, setStats] = useState({ totalJobs: 0, totalApplicants: 0, shortlisted: 0, pending: 0 });

  const location = useLocation();
  const navigate = useNavigate();

  const fetchJobs = async (p = 0) => {
    setLoading(true);
    try {
      const res = await jobsAPI.getMyJobs(p, 10);
      setJobs(res.data.content);
      setTotalPages(res.data.totalPages);
      setPage(res.data.number);

      // Compute stats
      const totalJobs = res.data.totalElements;
      const totalApplicants = res.data.content.reduce((sum, j) => sum + j.applicationCount, 0);
      setStats(prev => ({ ...prev, totalJobs, totalApplicants }));
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  // Open the form automatically if the URL is /recruiter/jobs/new
  useEffect(() => {
    if (location.pathname === '/recruiter/jobs/new') {
      setEditingJob(null);
      setShowJobForm(true);
    }
  }, [location.pathname]);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await jobsAPI.deleteJob(jobId);
      fetchJobs(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleFormClose = (saved) => {
    setShowJobForm(false);
    setEditingJob(null);
    if (location.pathname === '/recruiter/jobs/new') {
      navigate('/recruiter/dashboard', { replace: true });
    }
    if (saved) fetchJobs(page);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return '—';
    const fmt = (v) => `$${(v / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Recruiter Dashboard</h1>
        <p>Manage your job postings and track applicants</p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon purple">📋</div>
          <div className="stat-info">
            <h3>{stats.totalJobs}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan">👥</div>
          <div className="stat-info">
            <h3>{stats.totalApplicants}</h3>
            <p>Total Applicants</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <h3>{stats.shortlisted}</h3>
            <p>Shortlisted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">⏳</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending Review</p>
          </div>
        </div>
      </div>

      {/* Job Postings Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>My Job Postings</h2>
          <button className="btn btn-primary" onClick={() => navigate('/recruiter/jobs/new')}>
            + Post New Job
          </button>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h3>No job postings yet</h3>
            <p>Create your first job posting to start attracting candidates.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }}
              onClick={() => navigate('/recruiter/jobs/new')}>
              + Post New Job
            </button>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Salary</th>
                  <th>Applicants</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td data-label="Job Title" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{job.title}</td>
                    <td data-label="Company">{job.company}</td>
                    <td data-label="Location">{job.location || '—'}</td>
                    <td data-label="Type">
                      <span className="badge badge-applied">
                        {job.employmentType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td data-label="Salary">{formatSalary(job.salaryMin, job.salaryMax)}</td>
                    <td data-label="Applicants">
                      <Link to={`/recruiter/applicants/${job.id}`}
                        style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>
                        {job.applicationCount}
                      </Link>
                    </td>
                    <td data-label="Status">
                      <span className={`badge badge-${job.status?.toLowerCase()}`}>
                        {job.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(job)}
                          title="Edit">✏️</button>
                        <Link to={`/recruiter/applicants/${job.id}`} className="btn btn-ghost btn-sm"
                          title="View Applicants">👥</Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(job.id)}
                          title="Delete" style={{ color: 'var(--color-error)' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 0} onClick={() => fetchJobs(page - 1)}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={i === page ? 'active' : ''}
                    onClick={() => fetchJobs(i)}>{i + 1}</button>
                ))}
                <button disabled={page === totalPages - 1} onClick={() => fetchJobs(page + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          job={editingJob}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
