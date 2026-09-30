import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Download,
  ExternalLink,
  Target,
  Compass,
  FileText,
  Layers,
  ChevronDown,
  CheckCircle,
  Filter,
  Shield,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { BlueprintGrid, TechBadge, SectionDivider } from '../components/MechanicalDecor';

export const AcademicsPage = ({ initialSection = 'curriculum' }) => {
  const [deptInfo, setDeptInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialSection); // 'curriculum' | 'vision-mission' | 'syllabus' | 'regulations'
  const [selectedRegulation, setSelectedRegulation] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [syllabusQuery, setSyllabusQuery] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const data = await api.getDepartmentInfo();
        setDeptInfo(data);
      } catch (err) {
        console.error('Failed to load academic data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  useEffect(() => {
    if (initialSection) {
      setActiveTab(initialSection);
    }
  }, [initialSection]);

  const {
    vision = '',
    mission = [],
    curriculum = [],
    syllabus = [],
    regulations = [],
  } = deptInfo || {};

  const filteredSyllabi = useMemo(() => {
    return syllabus.filter((s) => {
      const matchesReg =
        selectedRegulation === 'ALL' || s.regulation === selectedRegulation;
      const matchesSem =
        selectedSemester === 'ALL' || s.semester === selectedSemester;
      const matchesQuery =
        !syllabusQuery ||
        s.title.toLowerCase().includes(syllabusQuery.toLowerCase()) ||
        s.subject.toLowerCase().includes(syllabusQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(syllabusQuery.toLowerCase());

      return matchesReg && matchesSem && matchesQuery;
    });
  }, [syllabus, selectedRegulation, selectedSemester, syllabusQuery]);

  if (loading) {
    return (
      <div className="interior-page-container">
        <BlueprintGrid />
        <div className="feed-loading-state" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
          <p>Loading academic curriculum and regulations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interior-page-container academics-page">
      <BlueprintGrid />

      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="DEPARTMENT ACADEMICS & SYLLABI" code="ME-ACD-10" variant="blue" />
          <h1 className="page-title">Curriculum & Academics</h1>
          <p className="page-subtitle">
            Autonomous curriculum frameworks, detailed course syllabi with downloadable PDF manuals, and official academic regulations for B.E. Mechanical Engineering.
          </p>
        </div>
      </section>

      {/* Main Academics Navigation Tabs */}
      <section className="page-width academics-tab-bar">
        <button
          className={`acad-tab-btn ${activeTab === 'vision-mission' ? 'active' : ''}`}
          onClick={() => setActiveTab('vision-mission')}
        >
          <Target size={16} />
          <span>Vision & Mission</span>
        </button>

        <button
          className={`acad-tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
          onClick={() => setActiveTab('curriculum')}
        >
          <Layers size={16} />
          <span>Curriculum Structure</span>
        </button>

        <button
          className={`acad-tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
          onClick={() => setActiveTab('syllabus')}
        >
          <BookOpen size={16} />
          <span>Course Syllabi ({syllabus.length})</span>
        </button>

        <button
          className={`acad-tab-btn ${activeTab === 'regulations' ? 'active' : ''}`}
          onClick={() => setActiveTab('regulations')}
        >
          <Shield size={16} />
          <span>Academic Regulations ({regulations.length})</span>
        </button>
      </section>

      {/* TAB 1: VISION & MISSION */}
      {activeTab === 'vision-mission' && (
        <section className="page-width vision-mission-section">
          <div className="vision-card">
            <div className="card-kicker">
              <Compass size={20} />
              <span>DEPARTMENT VISION</span>
            </div>
            <p className="vision-quote">"{vision}"</p>
            <div className="vision-meta">CIET Coimbatore · Mechanical Engineering</div>
          </div>

          <div className="mission-card">
            <div className="card-kicker">
              <Target size={20} />
              <span>DEPARTMENT MISSION</span>
            </div>
            <div className="mission-list">
              {Array.isArray(mission) ? (
                mission.map((item, idx) => (
                  <div key={idx} className="mission-point">
                    <span className="mission-num">0{idx + 1}</span>
                    <p>{item}</p>
                  </div>
                ))
              ) : (
                <p>{mission}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: CURRICULUM STRUCTURE */}
      {activeTab === 'curriculum' && (
        <section className="page-width curriculum-structure-section">
          <div className="section-intro">
            <h2>Four-Year Undergraduate Curriculum Map (Semesters I to VIII)</h2>
            <p>Designed in compliance with AICTE model curriculum, incorporating Choice Based Credit System (CBCS) and outcome-based engineering education.</p>
          </div>

          <div className="curriculum-semesters-grid">
            {curriculum.map((sem, idx) => (
              <div key={idx} className="semester-card">
                <div className="sem-header">
                  <span className="sem-index">SEM 0{idx + 1}</span>
                  <h3>{sem.semester}</h3>
                </div>
                <ul className="course-items-list">
                  {sem.courses?.map((course, cIdx) => (
                    <li key={cIdx} className="course-item">
                      <CheckCircle size={14} className="course-bullet" />
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: SYLLABUS BROWSER */}
      {activeTab === 'syllabus' && (
        <section className="page-width syllabus-browser-section">
          <div className="section-intro">
            <h2>Organized Syllabi Database</h2>
            <p>Filter course outlines by academic regulation, semester, or subject code to download official PDF course files.</p>
          </div>

          {/* Syllabus Filters */}
          <div className="syllabus-filters-bar">
            <div className="search-field-wrap">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search subject code (e.g. ME3301), title, or keywords..."
                value={syllabusQuery}
                onChange={(e) => setSyllabusQuery(e.target.value)}
              />
            </div>

            <div className="filter-select-group">
              <div className="select-pill">
                <label>Regulation:</label>
                <select
                  value={selectedRegulation}
                  onChange={(e) => setSelectedRegulation(e.target.value)}
                >
                  <option value="ALL">All Regulations</option>
                  <option value="R2021">R2021</option>
                  <option value="R2024">R2024 (Industry 4.0)</option>
                </select>
              </div>

              <div className="select-pill">
                <label>Semester:</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="ALL">All Semesters</option>
                  <option value="Semester III">Semester III</option>
                  <option value="Semester V">Semester V</option>
                  <option value="Semester VI">Semester VI</option>
                  <option value="Semester VII">Semester VII</option>
                </select>
              </div>
            </div>
          </div>

          {/* Syllabus Cards */}
          <div className="syllabus-cards-grid">
            {filteredSyllabi.map((syl) => (
              <div key={syl.id} className="syllabus-card-modern">
                <div className="syl-header-strip">
                  <span className="syl-code-pill">{syl.subject}</span>
                  <span className="syl-reg-pill">{syl.regulation}</span>
                  <span className="syl-sem-pill">{syl.semester}</span>
                </div>

                <h3 className="syl-title">{syl.title}</h3>
                <p className="syl-desc">{syl.description}</p>

                <div className="syl-meta-row">
                  <span>Credits: <strong>{syl.credits || 4}</strong></span>
                  <span>Academic Year: <strong>{syl.academicYear}</strong></span>
                </div>

                <div className="syl-download-btn-row">
                  <a
                    href={syl.pdfUrl || '/uploads/sample-brochure.pdf'}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    <Download size={14} />
                    <span>Download Syllabus PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: ACADEMIC REGULATIONS */}
      {activeTab === 'regulations' && (
        <section className="page-width regulations-section">
          <div className="section-intro">
            <h2>Official Academic Regulations</h2>
            <p>Guidelines on curricula, credit distribution, attendance norms, grading criteria, and graduation requirements.</p>
          </div>

          <div className="regulations-list-grid">
            {regulations.map((reg) => (
              <div key={reg.id} className="regulation-card">
                <div className="reg-icon-frame">
                  <FileText size={26} />
                </div>
                <div className="reg-content">
                  <div className="reg-header-line">
                    <span className="reg-tag">{reg.regulation}</span>
                    <span className="reg-year">{reg.academicYear}</span>
                  </div>
                  <h3 className="reg-title">{reg.title}</h3>
                  <p className="reg-summary">{reg.summary}</p>
                  <div className="reg-effective-date">Effective: {reg.effectiveDate}</div>
                </div>
                <div className="reg-action">
                  <a
                    href={reg.downloadLink || '/uploads/sample-brochure.pdf'}
                    download
                    className="btn btn-primary btn-sm"
                  >
                    <Download size={14} />
                    <span>Download Manual</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
