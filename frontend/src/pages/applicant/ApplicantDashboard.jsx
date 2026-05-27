import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationsAPI } from '../../api/axios';
import { getCachedData, setCachedData } from '../../utils/cache';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  APPLIED: 'applied', REVIEWED: 'reviewed', SHORTLISTED: 'shortlisted',
  INTERVIEWED: 'interviewed', OFFERED: 'offered', REJECTED: 'rejected', WITHDRAWN: 'withdrawn'
};

/**
 * Applicant Dashboard — main hub showing:
 * - Summary stats (total applied, shortlisted, offered, under review)
 * - Application tracker table with status badges and timeline
 * - Quick links to browse jobs
 */
export default function ApplicantDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, shortlisted: 0, offered: 0, pending: 0 });

  const fetchApplications = async (p = 0) => {
    if (!user) return;
    const cacheKey = `cache_applicant_dashboard_${user.id}_${p}`;
    
    const cached = getCachedData(cacheKey);
    if (cached) {
      setApplications(cached.content);
      setTotalPages(cached.totalPages);
      setPage(cached.number);
      
      const total = cached.totalElements;
      const apps = cached.content;
      const shortlisted = apps.filter(a => a.status === 'SHORTLISTED').length;
      const offered = apps.filter(a => a.status === 'OFFERED').length;
      const pending = apps.filter(a => ['APPLIED', 'REVIEWED'].includes(a.status)).length;
      setStats({ total, shortlisted, offered, pending });
      
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const res = await applicationsAPI.getMyApplications(p, 10);
      const apps = res.data.content;
      setApplications(apps);
      setTotalPages(res.data.totalPages);
      setPage(res.data.number);

      // Compute stats from all fetched data
      const total = res.data.totalElements;
      const shortlisted = apps.filter(a => a.status === 'SHORTLISTED').length;
      const offered = apps.filter(a => a.status === 'OFFERED').length;
      const pending = apps.filter(a => ['APPLIED', 'REVIEWED'].includes(a.status)).length;
      setStats({ total, shortlisted, offered, pending });
      
      setCachedData(cacheKey, res.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await applicationsAPI.withdraw(appId);
      fetchApplications(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw application');
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getPipelineStep = (status) => {
    const steps = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'OFFERED'];
    return steps.indexOf(status);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p>Track your applications and discover new opportunities</p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon purple">📨</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Applied</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan">⭐</div>
          <div className="stat-info">
            <h3>{stats.shortlisted}</h3>
            <p>Shortlisted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🎉</div>
          <div className="stat-info">
            <h3>{stats.offered}</h3>
            <p>Offers Received</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">⏳</div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Under Review</p>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/applicant/jobs" className="btn btn-primary">
          🔍 Browse New Jobs
        </Link>
      </div>

      {/* Applications Tracker */}
      <div className="table-container">
        <div className="table-header">
          <h2>My Applications</h2>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ padding: '3rem' }}>
            <div className="spinner"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No applications yet</h3>
            <p>Start your job search and apply to positions that interest you.</p>
            <Link to="/applicant/jobs" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Browse Jobs
            </Link>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Applied</th>
                  <th>Pipeline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const step = getPipelineStep(app.status);
                  const totalSteps = 5;
                  const pct = app.status === 'OFFERED' ? 100
                    : app.status === 'REJECTED' || app.status === 'WITHDRAWN' ? 0
                    : Math.round((step / (totalSteps - 1)) * 100);

                  return (
                    <tr key={app.id}>
                      <td data-label="Job Title" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {app.jobTitle}
                      </td>
                      <td data-label="Company">{app.jobCompany}</td>
                      <td data-label="Applied">{formatDate(app.appliedAt)}</td>
                      <td data-label="Pipeline" style={{ minWidth: '140px' }}>
                        <div style={{
                          height: '6px', background: 'var(--border-color)',
                          borderRadius: '3px', overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: app.status === 'REJECTED' ? 'var(--color-error)'
                              : app.status === 'OFFERED' ? 'var(--color-success)'
                              : 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                            borderRadius: '3px',
                            transition: 'width 0.6s ease'
                          }} />
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          {pct}% complete
                        </div>
                      </td>
                      <td data-label="Status">
                        <span className={`badge badge-${STATUS_COLORS[app.status]}`}>
                          {app.status}
                        </span>
                        {app.recruiterNotes && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            💬 {app.recruiterNotes}
                          </div>
                        )}
                      </td>
                      <td data-label="Actions">
                        {!['WITHDRAWN', 'REJECTED', 'OFFERED'].includes(app.status) && (
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => handleWithdraw(app.id)}
                            style={{ color: 'var(--color-error)' }}
                            title="Withdraw Application">
                            Withdraw
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
    </div>
  );
}
