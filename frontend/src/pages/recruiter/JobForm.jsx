import { useState, useEffect } from 'react';
import { jobsAPI } from '../../api/axios';

/**
 * Modal form for creating or editing a job posting.
 * Handles all fields: title, description, company, location,
 * employment type, salary range, skills, experience range, and status.
 */
export default function JobForm({ job, onClose }) {
  const isEditing = !!job;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    employmentType: 'FULL_TIME',
    salaryMin: '',
    salaryMax: '',
    requiredSkills: '',
    experienceMinYears: 0,
    experienceMaxYears: '',
    status: 'OPEN',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        company: job.company || '',
        location: job.location || '',
        employmentType: job.employmentType || 'FULL_TIME',
        salaryMin: job.salaryMin || '',
        salaryMax: job.salaryMax || '',
        requiredSkills: job.requiredSkills || '',
        experienceMinYears: job.experienceMinYears || 0,
        experienceMaxYears: job.experienceMaxYears || '',
        status: job.status || 'OPEN',
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      ...formData,
      salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
      salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
      experienceMinYears: Number(formData.experienceMinYears) || 0,
      experienceMaxYears: formData.experienceMaxYears ? Number(formData.experienceMaxYears) : null,
    };

    try {
      if (isEditing) {
        await jobsAPI.updateJob(job.id, payload);
      } else {
        await jobsAPI.createJob(payload);
      }
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job posting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? '✏️ Edit Job Posting' : '📝 Create New Job'}</h2>
          <button className="btn btn-ghost" onClick={() => onClose(false)}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

            <div className="form-group">
              <label htmlFor="job-title">Job Title *</label>
              <input id="job-title" name="title" value={formData.title}
                onChange={handleChange} placeholder="e.g. Senior Software Engineer" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="job-company">Company *</label>
                <input id="job-company" name="company" value={formData.company}
                  onChange={handleChange} placeholder="e.g. TechCorp Inc." required />
              </div>
              <div className="form-group">
                <label htmlFor="job-location">Location</label>
                <input id="job-location" name="location" value={formData.location}
                  onChange={handleChange} placeholder="e.g. New York, NY / Remote" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="job-description">Description *</label>
              <textarea id="job-description" name="description" value={formData.description}
                onChange={handleChange} placeholder="Describe the role, responsibilities, and requirements..."
                rows={5} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="job-type">Employment Type</label>
                <select id="job-type" name="employmentType" value={formData.employmentType}
                  onChange={handleChange}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="job-status">Status</label>
                <select id="job-status" name="status" value={formData.status} onChange={handleChange}>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="job-salary-min">Min Salary ($)</label>
                <input id="job-salary-min" name="salaryMin" type="number" value={formData.salaryMin}
                  onChange={handleChange} placeholder="50000" />
              </div>
              <div className="form-group">
                <label htmlFor="job-salary-max">Max Salary ($)</label>
                <input id="job-salary-max" name="salaryMax" type="number" value={formData.salaryMax}
                  onChange={handleChange} placeholder="120000" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="job-skills">Required Skills</label>
              <input id="job-skills" name="requiredSkills" value={formData.requiredSkills}
                onChange={handleChange} placeholder="e.g. Java, Spring Boot, React, AWS" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="job-exp-min">Min Experience (years)</label>
                <input id="job-exp-min" name="experienceMinYears" type="number"
                  value={formData.experienceMinYears} onChange={handleChange} min={0} />
              </div>
              <div className="form-group">
                <label htmlFor="job-exp-max">Max Experience (years)</label>
                <input id="job-exp-max" name="experienceMaxYears" type="number"
                  value={formData.experienceMaxYears} onChange={handleChange} placeholder="10" />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => onClose(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading"><span className="spinner-sm"></span> Saving...</span>
              ) : isEditing ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
