import React, { useDeferredValue, useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';

const PDF_URL = '/uploads/R2023-MECH-CURRICULUM-AND-SYLLABUS.pdf';
const SEMESTER_OPTIONS = [
  'All Semesters', 'Semester I', 'Semester II', 'Semester III', 'Semester IV',
  'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII',
];
const CATEGORY_LABELS = {
  HS: 'Humanities and Social Sciences',
  BS: 'Basic Science',
  ES: 'Engineering Science',
  PC: 'Professional Core',
  PCS: 'Professional Core (as printed in PDF)',
  PE: 'Professional Elective',
  OE: 'Open Elective',
  EEC: 'Employability Enhancement Course',
  MC: 'Mandatory Course',
  MT: 'Mandatory Course',
  IKS: 'Indian Knowledge System',
  UHV: 'Universal Human Values',
  EVS: 'Environmental Science',
  SDG: 'Sustainable Development Goal',
  'GENDER SENSITIZATION': 'Gender Sensitization',
};

const getProgramRegions = (text = '') => {
  const sections = [
    { title: 'Knowledge and Attitude Profile (WK)', start: /Knowledge and Attitude Profile \(WK\)/i, end: /Program(?:me)? Outcomes \(POs\):/i },
    { title: 'Programme Outcomes (POs)', start: /Program(?:me)? Outcomes \(POs\):/i, end: /Programme Educational Objectives/i },
    { title: 'Programme Educational Objectives (PEOs)', start: /Programme Educational Objectives/i, end: /Programme Specific Outcomes \(PSOs\)/i },
    { title: 'Programme Specific Outcomes (PSOs)', start: /Programme Specific Outcomes \(PSOs\)/i, end: /Mapping PEOs, POs & PSOs/i },
  ];
  return sections.map(({ title, start: startPattern, end: endPattern }) => {
    const match = startPattern.exec(text);
    if (!match) return { title, content: '' };
    const start = match.index;
    const rest = text.slice(start + match[0].length);
    const end = endPattern?.exec(rest);
    return { title, content: `${match[0]}${rest.slice(0, end ? end.index : undefined).trim()}` };
  }).filter((section) => section.content);
};

const CourseCard = ({ course, onOpen }) => (
  <article className="official-course-card">
    <div className="official-course-card-topline">
      <span className="official-course-code">{course.courseCode || 'ELECTIVE SLOT'}</span>
      <span className="official-course-category">{CATEGORY_LABELS[course.category] || course.category || 'Category verification needed'}</span>
    </div>
    <h3>{course.courseName}</h3>
    <div className="official-course-hours" aria-label="Lecture, tutorial, practical and credit hours">
      <span><small>L</small>{course.lectureHours ?? '—'}</span>
      <span><small>T</small>{course.tutorialHours ?? '—'}</span>
      <span><small>P</small>{course.practicalHours ?? '—'}</span>
      <span><small>C</small>{course.credits ?? '—'}</span>
    </div>
    {course.offeringDepartment && <p className="course-verification-note">Offering department: {course.offeringDepartment}</p>}
    {!course.detailsAvailable && <p className="course-verification-note">Course detail page not present or not matched in the source PDF. Verify with the official document.</p>}
    {course.courseCode ? (
      <button className="btn btn-outline btn-sm" onClick={() => onOpen(course.courseCode)}>
        <span>View Syllabus</span><ChevronRight size={15} />
      </button>
    ) : <span className="course-slot-note">Course code is not specified in the curriculum table.</span>}
  </article>
);

export const CurriculumPage = ({ mode = 'curriculum', onNavigate }) => {
  const { isStudent } = useAuth();
  const [curriculum, setCurriculum] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [semester, setSemester] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const deferredQuery = useDeferredValue(query);
  const isSyllabus = mode === 'syllabus';
  const isRegulation = mode === 'regulation';

  useEffect(() => {
    if (!isStudent) return undefined;
    let active = true;
    api.getStudentProfile()
      .then((result) => { if (active) setStudentProfile(result.student || null); })
      .catch(() => { if (active) setStudentProfile(null); });
    return () => { active = false; };
  }, [isStudent]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (semester !== 'ALL') params.semester = semester;
        if (category !== 'ALL') params.category = category;
        if (deferredQuery.trim()) params.query = deferredQuery.trim();
        const result = await api.getCurriculum(params);
        if (active) setCurriculum(result);
      } catch (err) {
        if (active) setError(err.message || 'Unable to load the official curriculum. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [semester, category, deferredQuery]);

  const currentStudyStart = ({ 'I Year': 1, 'II Year': 3, 'III Year': 5, 'IV Year': 7 })[studentProfile?.yearOfStudy];
  useEffect(() => {
    if (isSyllabus && currentStudyStart && semester === 'ALL') setSemester(String(currentStudyStart));
  }, [isSyllabus, currentStudyStart, semester]);

  const openCourse = (courseCode) => onNavigate(`syllabus-course-${courseCode}`);
  const pdfUrl = curriculum?.sourceDocument?.fileUrl || PDF_URL;
  const title = isSyllabus ? 'R2023 Course Syllabus' : isRegulation ? 'Regulation 2023' : 'B.E. Mechanical Engineering Curriculum';

  if (loading && !curriculum) {
    return <div className="interior-page-container"><BlueprintGrid /><div className="feed-loading-state"><div className="spinner" /><p>Loading official curriculum data…</p></div></div>;
  }

  return (
    <div className="interior-page-container official-academics-page">
      <BlueprintGrid />
      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="OFFICIAL CURRICULUM & SYLLABUS" code="REG-2023" variant="blue" />
          <div className="curriculum-breadcrumb">Academics <ChevronRight size={13} /> {title}</div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">Coimbatore Institute of Engineering and Technology · Students admitted from 2023–2024 onwards · Choice Based Credit System{studentProfile?.batch ? ` · My batch: ${studentProfile.batch} → Regulation ${curriculum.regulation}` : ''}</p>
        </div>
        <div className="official-pdf-actions">
          <a className="btn btn-primary" href={pdfUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /><span>View Official PDF</span></a>
          <a className="btn btn-secondary" href={pdfUrl} download><Download size={15} /><span>Download PDF</span></a>
        </div>
      </section>

      <nav className="page-width official-academics-tabs" aria-label="Academic documents">
        <button className={!isSyllabus && !isRegulation ? 'active' : ''} onClick={() => onNavigate('curriculum')}><Layers size={15} /> Curriculum</button>
        <button className={isSyllabus ? 'active' : ''} onClick={() => onNavigate('syllabus')}><BookOpen size={15} /> Syllabus</button>
        <button className={isRegulation ? 'active' : ''} onClick={() => onNavigate('regulation')}><FileText size={15} /> Regulation</button>
      </nav>

      {error && <div className="page-width official-data-error"><AlertCircle size={17} />{error}</div>}
      {curriculum && (
        <>
          {!isSyllabus && (
            <section className="page-width official-programme-band">
              <div className="official-programme-icon"><GraduationCap size={22} /></div>
              <div><span>PROGRAMME</span><h2>{curriculum.programme}</h2><p>Regulation {curriculum.regulation} · {curriculum.system}</p></div>
              <div className="official-page-count"><strong>{curriculum.sourceDocument?.pageCount || 265}</strong><span>official pages</span></div>
            </section>
          )}

          {!isSyllabus && !isRegulation && (
            <section className="page-width official-credit-grid">
              {[
                ['Total credits', curriculum.creditSummary?.total],
                ['Theory', curriculum.creditSummary?.theory],
                ['Laboratory', curriculum.creditSummary?.laboratory],
                ['Projects', curriculum.creditSummary?.projects],
                ['Internship', curriculum.creditSummary?.internship],
                ['Electives', curriculum.creditSummary?.electives],
              ].map(([label, value]) => <div key={label} className="official-credit-stat"><strong>{value ?? '—'}</strong><span>{label}</span></div>)}
            </section>
          )}

          {isRegulation && (
            <section className="page-width regulation-source-panel">
              <h2>Regulation 2023 overview</h2>
              <p>The official document applies to students admitted from 2023–2024 onwards and uses the Choice Based Credit System.</p>
              <p>Programme educational objectives, programme outcomes, programme-specific outcomes, and the knowledge and attitude profile below are transcribed from the source document.</p>
              <div className="official-outcomes-grid">
                {getProgramRegions(curriculum.programmeInformationText).map((section) => (
                  <details key={section.title} className="official-outcome-section">
                    <summary>{section.title}</summary><pre>{section.content}</pre>
                  </details>
                ))}
              </div>
              <div className="credit-audit-note"><AlertCircle size={16} /><span>{curriculum.extractionNotes?.join(' ')}</span></div>
            </section>
          )}

          {isSyllabus ? (
            <section className="page-width official-syllabus-browser">
              <div className="official-filter-row">
                <label className="official-search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search code, course name, or syllabus text" /></label>
                <label className="official-filter"><Filter size={15} /><select value={semester} onChange={(event) => setSemester(event.target.value)} aria-label="Filter by semester">{SEMESTER_OPTIONS.map((item, index) => <option key={item} value={index === 0 ? 'ALL' : String(index)}>{item}</option>)}</select></label>
                <label className="official-filter"><Layers size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by course category"><option value="ALL">All Categories</option>{(curriculum.categories || []).map((item) => <option key={item} value={item}>{CATEGORY_LABELS[item] || item}</option>)}</select></label>
                <label className="official-filter"><CalendarDays size={15} /><select defaultValue="2023–2024 onwards" aria-label="Academic year"><option>2023–2024 onwards</option></select></label>
              </div>
              <div className="official-results-count">{curriculum.courses.length + (semester === 'ALL' ? (curriculum.electiveCatalog?.length || 0) : 0)} course rows and offerings in the selected results</div>
              {curriculum.courses.length ? <div className="official-course-grid">{curriculum.courses.map((course, index) => <CourseCard key={`${course.courseCode}-${index}`} course={course} onOpen={openCourse} />)}</div> : <div className="official-empty-results">No courses match these filters.</div>}
              {!!curriculum.electiveCatalog?.length && semester === 'ALL' && (category === 'ALL' || category === 'PE' || category === 'OE') && (
                <section className="official-elective-catalog">
                  <h2>Additional course offerings</h2>
                  <p>These codes are listed in the official elective and mandatory-course tables. The PDF does not assign each option to an individual student’s elective slot.</p>
                  <div className="official-course-grid">{curriculum.electiveCatalog.filter((course) => category === 'ALL' || course.category === category).map((course, index) => <CourseCard key={`${course.courseCode}-${index}`} course={course} onOpen={openCourse} />)}</div>
                </section>
              )}
            </section>
          ) : (
            <section className="page-width official-semesters-section">
              <div className="official-section-heading"><div><span>CURRICULUM STRUCTURE</span><h2>Semester-wise course structure</h2></div><button className="btn btn-outline btn-sm" onClick={() => onNavigate('syllabus')}><BookOpen size={15} /> Browse all syllabi</button></div>
              <div className="official-semester-grid">
                {curriculum.semesters.map((semesterItem) => (
                  <details key={semesterItem.number} className="official-semester" open={!isRegulation && semesterItem.number === (currentStudyStart || 1)}>
                    <summary><span className="semester-number">{String(semesterItem.number).padStart(2, '0')}</span><span className="semester-title">{semesterItem.name}</span><span className="semester-credit-total">{semesterItem.courses.reduce((total, course) => total + (Number(course.credits) || 0), 0)} cr</span></summary>
                    <div className="official-course-grid">{semesterItem.courses.map((course, index) => <CourseCard key={`${course.courseCode || course.courseName}-${index}`} course={course} onOpen={openCourse} />)}</div>
                  </details>
                ))}
              </div>
              {!isRegulation && <details className="official-source-outcomes"><summary>Official programme information: PEOs, POs, PSOs and WK</summary><pre>{curriculum.programmeInformationText}</pre></details>}
              <details className="official-source-outcomes"><summary>Credit distribution verification note</summary><div className="credit-audit-note"><AlertCircle size={16} /><span>{curriculum.extractionNotes?.join(' ')}</span></div><pre>{curriculum.creditSummarySourceText}</pre></details>
            </section>
          )}

          <section className="page-width official-pdf-viewer-section">
            <div className="official-section-heading"><div><span>SOURCE DOCUMENT</span><h2>Official Regulation 2023 PDF</h2></div><a className="btn btn-secondary btn-sm" href={pdfUrl} download><Download size={14} /> Download original</a></div>
            <iframe title="Official R2023 Mechanical Engineering curriculum and syllabus PDF" src={`${pdfUrl}#view=FitH`} loading="lazy" />
          </section>
        </>
      )}
    </div>
  );
};

export const CourseSyllabusPage = ({ courseCode, onBack, onNavigate }) => {
  const [course, setCourse] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(PDF_URL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getCurriculumCourse(courseCode)
      .then((result) => { if (active) { setCourse(result.course); setDocumentUrl(result.sourceDocument?.fileUrl || PDF_URL); } })
      .catch((err) => { if (active) setError(err.message || 'Unable to load this course syllabus.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseCode]);

  return (
    <div className="interior-page-container official-academics-page">
      <BlueprintGrid />
      <section className="page-header-band page-width">
        <div className="header-meta"><TechBadge label="OFFICIAL COURSE SYLLABUS" code="REG-2023" variant="blue" /><div className="curriculum-breadcrumb"><button onClick={onBack}>Syllabus</button><ChevronRight size={13} /> {courseCode}</div><h1 className="page-title">{course?.officialTitle || course?.courseName || courseCode}</h1><p className="page-subtitle">B.E. Mechanical Engineering · Regulation 2023 · Official source transcription</p></div>
        <div className="official-pdf-actions"><button className="btn btn-secondary" onClick={onBack}><ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> Back to Syllabus</button><button className="btn btn-outline" onClick={() => onNavigate('curriculum')}>Curriculum</button></div>
      </section>
      {loading ? <div className="feed-loading-state"><div className="spinner" /><p>Loading course details…</p></div> : error ? <div className="page-width official-data-error"><AlertCircle size={17} />{error}</div> : course && (
        <>
          <section className="page-width official-course-detail-meta">
            <span className="official-course-code">{course.courseCode}</span><span className="official-course-category">{CATEGORY_LABELS[course.category] || course.category || 'Category not in extracted semester table'}</span><span>{course.semester ? `Semester ${['I','II','III','IV','V','VI','VII','VIII'][course.semester - 1]}` : 'Elective / common course'}</span>
            <div className="official-course-hours"><span><small>L</small>{course.lectureHours ?? '—'}</span><span><small>T</small>{course.tutorialHours ?? '—'}</span><span><small>P</small>{course.practicalHours ?? '—'}</span><span><small>C</small>{course.credits ?? '—'}</span></div>
          </section>
          {course.verificationNote && <div className="page-width credit-audit-note"><AlertCircle size={16} /><span>{course.verificationNote}</span></div>}
          <section className="page-width official-course-source-text"><div className="official-section-heading"><div><span>VERBATIM EXTRACT</span><h2>Course information from source pages {course.sourcePages?.join('–') || ''}</h2></div></div><pre>{course.detailsText || 'No detailed course page could be matched. Use the official PDF viewer below and flag this course for administrator verification.'}</pre></section>
          <section className="page-width official-pdf-viewer-section"><div className="official-section-heading"><div><span>OFFICIAL REFERENCE</span><h2>Open the full original document</h2></div><a className="btn btn-primary btn-sm" href={`${documentUrl}#page=${course.sourcePages?.[0] || 1}`} target="_blank" rel="noreferrer"><ExternalLink size={14} /> View source page</a></div><iframe title={`Official source PDF for ${course.courseCode}`} src={`${documentUrl}#page=${course.sourcePages?.[0] || 1}&view=FitH`} loading="lazy" /></section>
        </>
      )}
    </div>
  );
};
