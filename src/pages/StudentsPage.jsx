import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Users,
  GraduationCap,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Code,
  Tag,
  Mail,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';

export const StudentsPage = ({ onNavigate }) => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const allowedBatch = '2024 — 2028';
  const [selectedBatch, setSelectedBatch] = useState(allowedBatch);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentRes, batchRes] = await Promise.all([
          api.getStudents(),
          api.getBatches(),
        ]);
        setStudents(studentRes || []);
        setBatches(batchRes || []);
      } catch (err) {
        console.error('Error fetching students data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesBatch =
        selectedBatch === 'ALL' ||
        student.batch === selectedBatch ||
        student.academicYear === selectedBatch ||
        (student.batch && student.batch.replace(/\s+/g, '') === selectedBatch.replace(/\s+/g, ''));

      const matchesSection =
        selectedSection === 'ALL' || student.section === selectedSection;

      const matchesYear =
        selectedYear === 'ALL' || student.yearOfStudy === selectedYear;

      const matchesSearch =
        !searchQuery ||
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registerNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.skills &&
          student.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesBatch && matchesSection && matchesYear && matchesSearch;
    });
  }, [students, selectedBatch, selectedSection, selectedYear, searchQuery]);

  return (
    <div className="interior-page-container">
      <BlueprintGrid />

      {/* Page Header */}
      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="DEPARTMENT STUDENT DATABASE" code="ME-STU-03" variant="blue" />
          <h1 className="page-title">Student Directory & Portfolios</h1>
          <p className="page-subtitle">
            Browse engineering talents, verified skillsets, design project records, and certified achievements across academic batches.
          </p>
        </div>
      </section>

      {/* Single Batch View */}
      <section className="batch-toolbar-section page-width">
        <div className="batch-selection-strip">
          <span className="batch-strip-label">Academic Batch:</span>
          <div className="batch-chips-container">
            <button className="batch-chip-btn active" type="button" disabled>
              {allowedBatch} ({students.length})
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="student-filters-row">
          <div className="student-search-input-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, register number (e.g. 23ME014), or skill (CAD, CFD)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-dropdowns">
            <div className="select-pill">
              <label>Section:</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="ALL">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>

            <div className="select-pill">
              <label>Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="ALL">All Years</option>
                <option value="I Year">I Year</option>
                <option value="II Year">II Year</option>
                <option value="III Year">III Year</option>
                <option value="IV Year">IV Year</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Student Cards Grid */}
      <section className="page-width students-grid-section">
        {loading ? (
          <div className="feed-loading-state">
            <div className="spinner" />
            <p>Loading student batch directory...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state-box">
            <Users size={36} />
            <h3>No student records found</h3>
            <p>Try selecting a different academic batch or clearing search filters.</p>
          </div>
        ) : (
          <div className="students-cards-grid">
            {filteredStudents.map((student) => (
              <article
                key={student.id}
                className="student-card-modern"
                onClick={() => onNavigate(`student-profile-${student.registerNumber}`)}
              >
                <div className="student-card-header">
                  <div className="student-avatar-frame">
                    <img
                      src={student.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                      alt={student.name}
                      className="student-avatar-img"
                      loading="lazy"
                    />
                  </div>
                  <div className="student-header-meta">
                    <span className="student-regno-pill">{student.registerNumber}</span>
                    <span className="student-batch-label">{student.batch}</span>
                  </div>
                </div>

                <div className="student-card-main">
                  <h3 className="student-name">{student.name}</h3>
                  <div className="student-sub-line">
                    <span>{student.yearOfStudy || 'Undergraduate'}</span>
                    <span>·</span>
                    <span>Sec {student.section || 'A'}</span>
                  </div>

                  <p className="student-about-snip">{student.about}</p>

                  {/* Skills Badges */}
                  {student.skills && student.skills.length > 0 && (
                    <div className="student-skills-tags">
                      {student.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="skill-tag-pill">
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 4 && (
                        <span className="skill-tag-more">+{student.skills.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Project Count & Achievements Counter */}
                  <div className="student-quick-stats">
                    <div className="stat-unit">
                      <strong>{(student.projects || []).length}</strong>
                      <span>Projects</span>
                    </div>
                    <div className="stat-unit">
                      <strong>{(student.certificates || []).length}</strong>
                      <span>Certs</span>
                    </div>
                    <div className="stat-unit">
                      <strong>{(student.achievements || []).length}</strong>
                      <span>Awards</span>
                    </div>
                  </div>
                </div>

                <div className="student-card-footer">
                  <span className="view-portfolio-prompt">
                    <span>View Public Portfolio</span>
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
