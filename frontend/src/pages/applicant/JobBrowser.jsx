import { useState, useEffect, useCallback } from 'react';
import { jobsAPI, applicationsAPI } from '../../api/axios';
import { getCachedData, setCachedData } from '../../utils/cache';
import { useAuth } from '../../context/AuthContext';
import ApplicationForm from './ApplicationForm';

/**
 * Job browser for applicants with:
 * - Keyword search, skill filter, location filter, employment type filter
 * - Paginated job card grid
 * - Apply modal with resume upload
 */
export default function JobBrowser() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applyingJob, setApplyingJob] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  const [filters, setFilters] = useState({
    keyword: '',
    skills: '',
    location: '',
    employmentType: '',
    experienceMin: '',
    experienceMax: '',
  });
  const [activeFilters, setActiveFilters] = useState({});

  const fetchAppliedJobs = async () => {
    try {
      const res = await applicationsAPI.getMyApplications(0, 1000);
      const ids = new Set(res.data.content.map(app => app.jobId));
      setAppliedJobIds(ids);
    } catch (err) {
      console.error('Failed to fetch applied jobs:', err);
    }
  };

  const fetchJobs = useCallback(async (p = 0, filtersToUse = activeFilters) => {
    if (!user) return;
    const hasFilters = Object.values(filtersToUse).some(v => v !== '' && v !== undefined);
    const cacheKey = `cache_jobs_search_${user.id}_${p}_${JSON.stringify(filtersToUse)}`;
    
    // 1. Instantly load from cache if available
    const cached = getCachedData(cacheKey);
    if (cached) {
      setJobs(cached.content);
      setTotalPages(cached.totalPages);
      setTotalElements(cached.totalElements);
      setPage(cached.number);
      setLoading(false); // Stop loading spinner immediately
    } else {
      setLoading(true); // Only show spinner if no cache
    }

    try {
      // 2. Fetch fresh data in the background
      let res;
      if (hasFilters) {
        // Use search endpoint when filters are active
        const params = {
          page: p, size: 9,
          status: 'OPEN',
          ...Object.fromEntries(Object.entries(filtersToUse).filter(([, v]) => v !== '')),
        };
        res = await jobsAPI.searchJobs(params);
      } else {
        // Use simple getOpenJobs for default browse
        res = await jobsAPI.getOpenJobs(p, 9);
      }
      
      // 3. Update state with fresh data
      setJobs(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
      setPage(res.data.number);
      
      // 4. Save to cache
      setCachedData(cacheKey, res.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, user]);

  useEffect(() => { 
    fetchJobs(0, {}); 
    fetchAppliedJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleaned = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    setActiveFilters(cleaned);
    fetchJobs(0, cleaned);
  };

  const handleClearFilters = () => {
    setFilters({ keyword: '', skills: '', location: '', employmentType: '', experienceMin: '', experienceMax: '' });
    setActiveFilters({});
    fetchJobs(0, {});
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (v) => `$${(v / 1000).toFixed(0)}k`;
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🔍 Browse Jobs</h1>
        <p>Discover {totalElements} opportunities waiting for you</p>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch}>
        <div className="search-bar" style={{ marginBottom: '1rem' }}>
          <input
            value={filters.keyword}
            onChange={(e) => setFilters(p => ({ ...p, keyword: e.target.value }))}
            placeholder="Search by title, description..."
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {Object.keys(activeFilters).length > 0 && (
            <button type="button" className="btn btn-outline" onClick={handleClearFilters}>
              Clear
            </button>
          )}
        </div>
        <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
          <input
            value={filters.skills}
            onChange={(e) => setFilters(p => ({ ...p, skills: e.target.value }))}
            placeholder="Skills (e.g. Java, React)"
            style={{ flex: 1 }}
          />
          <input
            value={filters.location}
            onChange={(e) => setFilters(p => ({ ...p, location: e.target.value }))}
            placeholder="Location"
            style={{ width: '160px' }}
          />
          <select
            value={filters.employmentType}
            onChange={(e) => setFilters(p => ({ ...p, employmentType: e.target.value }))}
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
          <input
            type="number"
            value={filters.experienceMin}
            onChange={(e) => setFilters(p => ({ ...p, experienceMin: e.target.value }))}
            placeholder="Min exp (yrs)"
            style={{ width: '130px' }}
          />
          <input
            type="number"
            value={filters.experienceMax}
            onChange={(e) => setFilters(p => ({ ...p, experienceMax: e.target.value }))}
            placeholder="Max exp (yrs)"
            style={{ width: '130px' }}
          />
        </div>
      </form>

      {/* Job Grid */}
      {loading ? (
        <div className="loading-screen" style={{ padding: '4rem' }}>
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏜️</div>
          <h3>No jobs found</h3>
          <p>Try adjusting your search filters or check back later for new postings.</p>
          <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="job-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <div>
                    <div className="job-card-title">{job.title}</div>
                    <div className="job-card-company">🏢 {job.company}</div>
                  </div>
                  <span className={`badge badge-${job.status?.toLowerCase()}`}>
                    {job.status}
                  </span>
                </div>

                <div className="job-card-meta">
                  {job.location && <span>📍 {job.location}</span>}
                  <span>💼 {job.employmentType?.replace('_', ' ')}</span>
                  {job.experienceMinYears != null && (
                    <span>⏱ {job.experienceMinYears}
                      {job.experienceMaxYears ? `–${job.experienceMaxYears}` : '+'} yrs
                    </span>
                  )}
                  <span>📅 {formatDate(job.createdAt)}</span>
                  <span>👥 {job.applicationCount} applicants</span>
                </div>

                <p style={{
                  fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem'
                }}>
                  {job.description}
                </p>

                {job.requiredSkills && (
                  <div className="job-card-skills">
                    {job.requiredSkills.split(',').slice(0, 5).map((s, i) => (
                      <span key={i} className="skill-tag">{s.trim()}</span>
                    ))}
                    {job.requiredSkills.split(',').length > 5 && (
                      <span className="skill-tag" style={{ opacity: 0.6 }}>
                        +{job.requiredSkills.split(',').length - 5}
                      </span>
                    )}
                  </div>
                )}

                <div className="job-card-footer">
                  <span className="job-card-salary">
                    {formatSalary(job.salaryMin, job.salaryMax) || 'Salary not specified'}
                  </span>
                  {appliedJobIds.has(job.id) ? (
                    <button className="btn btn-outline btn-sm" disabled style={{ color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
                      Applied ✓
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setApplyingJob(job)}
                    >
                      Apply Now →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: '2rem' }}>
              <button disabled={page === 0} onClick={() => fetchJobs(page - 1)}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={i === page ? 'active' : ''}
                  onClick={() => fetchJobs(i)}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages - 1}
                onClick={() => fetchJobs(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Application Form Modal */}
      {applyingJob && (
        <ApplicationForm
          job={applyingJob}
          onClose={(applied) => {
            setApplyingJob(null);
            if (applied) {
              fetchAppliedJobs();
              fetchJobs(page);
            }
          }}
        />
      )}
    </div>
  );
}
