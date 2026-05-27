import { useState } from 'react';
import { applicationsAPI } from '../../api/axios';

const STATUS_OPTIONS = ['', 'APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEWED', 'OFFERED', 'REJECTED'];

/**
 * Advanced candidate search for recruiters.
 * Filters candidates across all jobs by:
 * - Skills (FULLTEXT search)
 * - Experience range
 * - Application status
 * - Specific job
 */
export default function CandidateSearch() {
  const [filters, setFilters] = useState({
    skills: '',
    experienceMin: '',
    experienceMax: '',
    status: '',
    jobId: '',
  });
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (p = 0) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = {
        page: p,
        size: 10,
        ...(filters.skills && { skills: filters.skills }),
        ...(filters.experienceMin && { experienceMin: Number(filters.experienceMin) }),
        ...(filters.experienceMax && { experienceMax: Number(filters.experienceMax) }),
        ...(filters.status && { status: filters.status }),
        ...(filters.jobId && { jobId: Number(filters.jobId) }),
      };
      const res = await applicationsAPI.searchCandidates(params);
      setResults(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
      setPage(res.data.number);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (appId, name) => {
    try {
      const res = await applicationsAPI.downloadResume(appId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download resume');
    }
  };

  const handleChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🔍 Candidate Search</h1>
        <p>Find the perfect candidates across all your job postings</p>
      </div>

      {/* Search Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div className="search-bar" style={{ marginBottom: '1rem' }}>
            <input
              name="skills"
              value={filters.skills}
              onChange={handleChange}
              placeholder="Search by skills (e.g. Java, React, Python)..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary" onClick={() => handleSearch()}>
              Search
            </button>
          </div>
          <div className="filter-row">
            <input name="experienceMin" type="number" value={filters.experienceMin}
              onChange={handleChange} placeholder="Min exp (years)" style={{ width: '150px' }} />
            <input name="experienceMax" type="number" value={filters.experienceMax}
              onChange={handleChange} placeholder="Max exp (years)" style={{ width: '150px' }} />
            <select name="status" value={filters.status} onChange={handleChange}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.filter(Boolean).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input name="jobId" type="number" value={filters.jobId}
              onChange={handleChange} placeholder="Job ID (optional)" style={{ width: '150px' }} />
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="loading-screen" style={{ padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : !searched ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Search for Candidates</h3>
          <p>Use the filters above to find candidates matching your requirements. Optimized with FULLTEXT search for fast results.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <h3>No candidates found</h3>
          <p>Try adjusting your search filters or broadening your criteria.</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-header">
            <h2>Results ({totalElements} candidates found)</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Applied For</th>
                <th>Skills</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Resume</th>
              </tr>
            </thead>
            <tbody>
              {results.map((app) => (
                <tr key={app.id} style={{ animation: 'slideIn 0.3s ease' }}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {app.applicantName}
                  </td>
                  <td>{app.applicantEmail}</td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{app.jobTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.jobCompany}</div>
                    </div>
                  </td>
                  <td>
                    <div className="job-card-skills">
                      {app.skills?.split(',').slice(0, 4).map((skill, i) => (
                        <span key={i} className="skill-tag">{skill.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td>{app.experienceYears} yrs</td>
                  <td>
                    <span className={`badge badge-${app.status?.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    {app.hasResume ? (
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => handleDownloadResume(app.id, app.applicantName)}>
                        📄
                      </button>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 0} onClick={() => handleSearch(page - 1)}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={i === page ? 'active' : ''}
                  onClick={() => handleSearch(i)}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages - 1}
                onClick={() => handleSearch(page + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
