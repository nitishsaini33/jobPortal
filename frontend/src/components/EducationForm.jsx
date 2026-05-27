import { useState } from 'react';

const QUALIFICATIONS = [
  'PhD',
  'Post Graduation',
  'Graduation',
  'Diploma',
  'Intermediate (12th)',
  'High School (10th)',
  'Certification',
  'Vocational Training',
  'Others',
];

const COURSES_BY_QUALIFICATION = {
  'PhD': [
    'PhD in Computer Science', 'PhD in Mathematics', 'PhD in Physics', 'PhD in Chemistry',
    'PhD in Biology', 'PhD in Economics', 'PhD in Management', 'PhD in Engineering',
    'PhD in Medical Sciences', 'PhD in Literature', 'PhD in Psychology', 'Others',
  ],
  'Post Graduation': [
    'M.Tech / ME', 'MCA', 'M.Sc', 'M.Com', 'MBA', 'MA', 'M.Pharm', 'LLM', 'M.Arch',
    'M.Ed', 'MS (Master of Surgery)', 'MD (Doctor of Medicine)', 'MDS',
    'M.Des', 'M.Phil', 'PGDM', 'PGDCA', 'Others',
  ],
  'Graduation': [
    'B.Tech / BE', 'BCA', 'B.Sc', 'B.Com', 'BBA', 'BA', 'B.Pharm', 'LLB', 'B.Arch',
    'B.Ed', 'MBBS', 'BDS', 'B.Des', 'BHM (Hotel Management)', 'B.Voc',
    'BAMS', 'BHMS', 'BPT (Physiotherapy)', 'B.Plan', 'Others',
  ],
  'Diploma': [
    'Polytechnic', 'Diploma in Computer Engineering', 'Diploma in IT',
    'Diploma in Mechanical Engineering', 'Diploma in Civil Engineering',
    'Diploma in Electrical Engineering', 'Diploma in Electronics',
    'Diploma in Fashion Designing', 'Diploma in Animation & Multimedia',
    'Diploma in Hotel Management', 'Diploma in Nursing',
    'Diploma in Data Science', 'Diploma in Cyber Security',
    'Diploma in Cloud Computing', 'Diploma in AI & ML', 'Others',
  ],
  'Certification': [
    'Data Science', 'Artificial Intelligence', 'Machine Learning',
    'Cyber Security', 'Cloud Computing (AWS/Azure/GCP)', 'DevOps',
    'Full Stack Development', 'Digital Marketing', 'Project Management (PMP)',
    'CA (Chartered Accountant)', 'CS (Company Secretary)', 'CFA',
    'CCNA / CCNP', 'Salesforce', 'SAP', 'Scrum Master', 'Others',
  ],
  'Vocational Training': [
    'ITI - Electrician', 'ITI - Fitter', 'ITI - Mechanic', 'ITI - Welder',
    'ITI - Plumber', 'ITI - Turner', 'ITI - Draughtsman',
    'Fashion Designing', 'Animation & Multimedia', 'Web Development',
    'Desktop Publishing (DTP)', 'Tally / Accounting', 'Others',
  ],
  'Intermediate (12th)': [
    'Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts / Humanities',
    'Vocational Stream', 'Others',
  ],
  'High School (10th)': [],
  'Others': [],
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i + 5);

const EMPTY_ENTRY = {
  qualification: '',
  course: '',
  customCourse: '',
  institution: '',
  startYear: '',
  endYear: '',
  currentlyStudying: false,
  grade: '',
};

export default function EducationForm({ educationJson, onChange }) {
  // Parse entries from JSON string or default to one empty entry
  const parseEntries = (json) => {
    if (!json) return [{ ...EMPTY_ENTRY }];
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ ...EMPTY_ENTRY }];
    } catch {
      // Legacy: if it's plain text, put it as the first entry's institution
      return [{ ...EMPTY_ENTRY, institution: json }];
    }
  };

  const [entries, setEntries] = useState(() => parseEntries(educationJson));

  const updateEntries = (newEntries) => {
    setEntries(newEntries);
    onChange(JSON.stringify(newEntries));
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };

    // Reset course when qualification changes
    if (field === 'qualification') {
      updated[index].course = '';
      updated[index].customCourse = '';
    }

    // Clear end year if currently studying
    if (field === 'currentlyStudying' && value) {
      updated[index].endYear = '';
    }

    updateEntries(updated);
  };

  const addEntry = () => {
    updateEntries([...entries, { ...EMPTY_ENTRY }]);
  };

  const removeEntry = (index) => {
    if (entries.length <= 1) return;
    const updated = entries.filter((_, i) => i !== index);
    updateEntries(updated);
  };

  const getInstitutionLabel = (qualification) => {
    if (['High School (10th)', 'Intermediate (12th)'].includes(qualification)) {
      return 'School Name';
    }
    return 'College / University Name';
  };

  const getAvailableCourses = (qualification) => {
    return COURSES_BY_QUALIFICATION[qualification] || [];
  };

  const getEndYearOptions = (startYear) => {
    if (!startYear) return YEARS;
    return YEARS.filter(y => y >= parseInt(startYear));
  };

  return (
    <div className="edu-form">
      {entries.map((entry, index) => (
        <div key={index} className="edu-entry">
          <div className="edu-entry-header">
            <span className="edu-entry-number">🎓 Education {index + 1}</span>
            {entries.length > 1 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeEntry(index)}
                style={{ color: 'var(--color-error)' }}
              >
                ✕ Remove
              </button>
            )}
          </div>

          {/* Row 1: Qualification & Course */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Qualification <span className="required">*</span></label>
              <select
                value={entry.qualification}
                onChange={(e) => updateEntry(index, 'qualification', e.target.value)}
              >
                <option value="">Select Qualification</option>
                {QUALIFICATIONS.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Course</label>
              {getAvailableCourses(entry.qualification).length > 0 ? (
                <select
                  value={entry.course}
                  onChange={(e) => updateEntry(index, 'course', e.target.value)}
                  disabled={!entry.qualification}
                >
                  <option value="">Select Course</option>
                  {getAvailableCourses(entry.qualification).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={entry.customCourse}
                  onChange={(e) => updateEntry(index, 'customCourse', e.target.value)}
                  placeholder="Enter your course / stream"
                />
              )}
            </div>
          </div>

          {/* Custom Course (when "Others" selected) */}
          {entry.course === 'Others' && (
            <div className="form-group">
              <label>Specify Course</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">📝</span>
                <input
                  type="text"
                  value={entry.customCourse}
                  onChange={(e) => updateEntry(index, 'customCourse', e.target.value)}
                  placeholder="Enter your course name"
                  className="input-with-icon"
                />
              </div>
            </div>
          )}

          {/* Row 2: Institution */}
          <div className="form-group">
            <label>{getInstitutionLabel(entry.qualification)}</label>
            <div className="input-icon-wrapper">
              <span className="input-icon">🏫</span>
              <input
                type="text"
                value={entry.institution}
                onChange={(e) => updateEntry(index, 'institution', e.target.value)}
                placeholder={
                  ['High School (10th)', 'Intermediate (12th)'].includes(entry.qualification)
                    ? 'e.g. Delhi Public School'
                    : 'e.g. IIT Delhi, University of Mumbai'
                }
                className="input-with-icon"
              />
            </div>
          </div>

          {/* Row 3: Duration & Grade */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Start Year</label>
              <select
                value={entry.startYear}
                onChange={(e) => updateEntry(index, 'startYear', e.target.value)}
              >
                <option value="">From</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>End Year</label>
              <select
                value={entry.endYear}
                onChange={(e) => updateEntry(index, 'endYear', e.target.value)}
                disabled={entry.currentlyStudying}
              >
                <option value="">{entry.currentlyStudying ? 'Present' : 'To'}</option>
                {getEndYearOptions(entry.startYear).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Percentage / CGPA</label>
              <input
                type="text"
                value={entry.grade}
                onChange={(e) => updateEntry(index, 'grade', e.target.value)}
                placeholder="e.g. 85% or 8.5 CGPA"
              />
            </div>
          </div>

          {/* Currently Studying */}
          <label className="edu-checkbox-label">
            <input
              type="checkbox"
              checked={entry.currentlyStudying}
              onChange={(e) => updateEntry(index, 'currentlyStudying', e.target.checked)}
            />
            <span>Currently studying here</span>
          </label>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline edu-add-btn"
        onClick={addEntry}
      >
        + Add Another Education
      </button>
    </div>
  );
}
