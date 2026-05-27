import { useState, useRef } from 'react';

const SUGGESTED_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js',
  'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
  'HTML', 'CSS', 'Tailwind CSS', 'SASS', 'Bootstrap',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD',
  'Git', 'GitHub', 'Linux', 'REST API', 'GraphQL',
  'Machine Learning', 'Deep Learning', 'Data Science', 'AI', 'NLP',
  'React Native', 'Flutter', 'Android', 'iOS',
  'Spring Boot', 'Django', 'Flask', 'Express.js', '.NET',
  'Figma', 'Adobe XD', 'UI/UX Design',
  'Agile', 'Scrum', 'Project Management', 'Communication', 'Leadership',
  'Excel', 'Power BI', 'Tableau', 'Data Analysis',
  'Cyber Security', 'DevOps', 'Blockchain', 'Cloud Computing',
];

export default function SkillsInput({ skills, onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Parse skills from comma-separated string
  const skillList = skills
    ? skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const updateSkills = (newList) => {
    onChange(newList.join(', '));
  };

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (skillList.some(s => s.toLowerCase() === trimmed.toLowerCase())) return;
    updateSkills([...skillList, trimmed]);
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeSkill = (index) => {
    updateSkills(skillList.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && skillList.length > 0) {
      removeSkill(skillList.length - 1);
    }
  };

  const filteredSuggestions = inputValue.length >= 1
    ? SUGGESTED_SKILLS.filter(
        s => s.toLowerCase().includes(inputValue.toLowerCase()) &&
             !skillList.some(sk => sk.toLowerCase() === s.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <div className="skills-input-container">
      <div
        className="skills-chip-area"
        onClick={() => inputRef.current?.focus()}
      >
        {skillList.map((skill, i) => (
          <span key={i} className="skill-chip">
            {skill}
            <button
              type="button"
              className="skill-chip-remove"
              onClick={(e) => { e.stopPropagation(); removeSkill(i); }}
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={skillList.length === 0 ? 'Type a skill and press Enter...' : 'Add more...'}
          className="skills-chip-input"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="skills-suggestions">
          {filteredSuggestions.map((suggestion, i) => (
            <button
              key={i}
              type="button"
              className="skills-suggestion-item"
              onMouseDown={(e) => { e.preventDefault(); addSkill(suggestion); }}
            >
              <span className="skills-suggestion-plus">+</span>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <div className="skills-hint">
        Press <kbd>Enter</kbd> or <kbd>,</kbd> to add • <kbd>Backspace</kbd> to remove last
      </div>
    </div>
  );
}
