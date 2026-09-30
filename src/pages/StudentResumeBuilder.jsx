import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  FileText,
  Download,
  Printer,
  Save,
  Copy,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Eye,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const DEFAULT_SECTION_ORDER = ['summary', 'education', 'skills', 'projects', 'experience', 'certifications', 'achievements', 'workshops', 'leadership', 'languages', 'interests'];
const SECTION_LABELS = {
  summary: 'Summary',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  experience: 'Experience',
  certifications: 'Certifications',
  achievements: 'Achievements',
  workshops: 'Workshops',
  leadership: 'Leadership',
  languages: 'Languages',
  interests: 'Interests',
};

const TEMPLATE_OPTIONS = {
  ats: { label: 'ATS Professional', description: 'Minimal black-and-white, highly ATS-friendly', mode: 'single-column' },
  engineering: { label: 'Engineering', description: 'Technical styling suited for mechanical engineering roles', mode: 'engineering' },
  modern: { label: 'Modern', description: 'Clean two-column modern layout', mode: 'modern' },
};

const buildGeneratedSummary = (student) => {
  if (!student) return 'Mechanical Engineering student with a strong interest in design, analysis, and manufacturing innovation.';
  const skillText = (student.skills || []).slice(0, 4).join(', ') || 'design, analysis, and manufacturing';
  const projectText = (student.projects || []).slice(0, 2).map((project) => project.title).filter(Boolean).join(' and ') || 'technical engineering projects';

  return `Mechanical Engineering student at CIET College, Coimbatore, focused on ${skillText}. Skilled in developing ${projectText} with a practical interest in design, simulation, manufacturing, and problem-solving for industry-ready engineering applications.`;
};

const emptyResumeDraft = (student) => ({
  studentId: student?.id || '',
  title: `${student?.name ? student.name.split(' ')[0] : 'My'} Mechanical Resume`,
  template: 'ats',
  summary: student?.about || buildGeneratedSummary(student),
  selectedSkills: (student?.skills || []).slice(0, 10),
  selectedProjects: (student?.projects || []).slice(0, 3).map((project) => project.id || project.title),
  selectedCertificates: (student?.certificates || []).slice(0, 2).map((certificate) => certificate.id || certificate.title),
  selectedAchievements: (student?.achievements || []).slice(0, 4),
  selectedActivities: (student?.eventsParticipated || []).slice(0, 4),
  selectedExperience: [],
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  visibleSections: [...DEFAULT_SECTION_ORDER],
  accentColor: '#2563eb',
  atsMode: false,
  fontSize: 11,
  profilePhotoVisible: true,
  pageMargins: 'normal',
  resumeType: 'student',
  customSummary: student?.about || buildGeneratedSummary(student),
});

export const StudentResumeBuilder = ({ onBack }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [student, setStudent] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeDraft, setResumeDraft] = useState(null);
  const [summaryMode, setSummaryMode] = useState('portfolio');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const profileRes = await api.getStudentProfile();
        const resumeRes = await api.getStudentResumes();
        const profile = profileRes.student || profileRes.portfolio || null;
        setStudent(profile);
        setResumes(resumeRes.resumes || []);

        if ((resumeRes.resumes || []).length > 0) {
          const first = resumeRes.resumes[0];
          setActiveResumeId(first.id);
          setResumeDraft({
            ...emptyResumeDraft(profile),
            ...first,
            selectedSkills: Array.isArray(first.selectedSkills) ? first.selectedSkills : (profile?.skills || []).slice(0, 10),
            selectedProjects: Array.isArray(first.selectedProjects) ? first.selectedProjects : (profile?.projects || []).slice(0, 3).map((project) => project.id || project.title),
            selectedCertificates: Array.isArray(first.selectedCertificates) ? first.selectedCertificates : (profile?.certificates || []).slice(0, 2).map((certificate) => certificate.id || certificate.title),
            selectedAchievements: Array.isArray(first.selectedAchievements) ? first.selectedAchievements : (profile?.achievements || []).slice(0, 4),
            selectedActivities: Array.isArray(first.selectedActivities) ? first.selectedActivities : (profile?.eventsParticipated || []).slice(0, 4),
            selectedExperience: Array.isArray(first.selectedExperience) ? first.selectedExperience : [],
            visibleSections: Array.isArray(first.visibleSections) && first.visibleSections.length ? first.visibleSections : [...DEFAULT_SECTION_ORDER],
            sectionOrder: Array.isArray(first.sectionOrder) && first.sectionOrder.length ? first.sectionOrder : [...DEFAULT_SECTION_ORDER],
            customSummary: first.summary || first.customSummary || profile?.about || buildGeneratedSummary(profile),
          });
        } else {
          const draft = emptyResumeDraft(profile);
          setActiveResumeId(null);
          setResumeDraft(draft);
        }
      } catch (err) {
        console.error('Failed to load student resume builder data:', err);
        addToast(err.message || 'Unable to load your resume data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [addToast]);

  const visibleSectionList = useMemo(() => {
    if (!resumeDraft) return [];
    const order = resumeDraft.sectionOrder || DEFAULT_SECTION_ORDER;
    return order.filter((section) => (resumeDraft.visibleSections || []).includes(section));
  }, [resumeDraft]);

  const activeResume = useMemo(
    () => resumes.find((item) => item.id === activeResumeId) || null,
    [resumes, activeResumeId]
  );

  const updateDraft = (updates) => {
    setResumeDraft((prev) => ({ ...(prev || emptyResumeDraft(student)), ...updates }));
  };

  const createNewResume = () => {
    const draft = emptyResumeDraft(student);
    setActiveResumeId(null);
    setResumeDraft(draft);
    setSummaryMode('portfolio');
  };

  const duplicateResume = async () => {
    if (!resumeDraft) return;
    const duplicate = { ...resumeDraft, id: undefined, title: `${resumeDraft.title || 'Resume'} Copy`, createdAt: undefined, updatedAt: undefined };
    try {
      setSaving(true);
      const res = await api.createStudentResume(duplicate);
      const nextResume = res.resume;
      setResumes((prev) => [nextResume, ...prev]);
      setActiveResumeId(nextResume.id);
      setResumeDraft({ ...emptyResumeDraft(student), ...nextResume });
      addToast('Resume duplicated successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Unable to duplicate resume.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveResume = async () => {
    if (!resumeDraft) return;
    try {
      setSaving(true);
      const payload = {
        ...resumeDraft,
        summary: resumeDraft.customSummary || resumeDraft.summary || buildGeneratedSummary(student),
        title: resumeDraft.title || `${student?.name || 'My'} Mechanical Resume`,
        selectedSkills: Array.isArray(resumeDraft.selectedSkills) ? resumeDraft.selectedSkills : [],
        selectedProjects: Array.isArray(resumeDraft.selectedProjects) ? resumeDraft.selectedProjects : [],
        selectedCertificates: Array.isArray(resumeDraft.selectedCertificates) ? resumeDraft.selectedCertificates : [],
        selectedAchievements: Array.isArray(resumeDraft.selectedAchievements) ? resumeDraft.selectedAchievements : [],
        selectedActivities: Array.isArray(resumeDraft.selectedActivities) ? resumeDraft.selectedActivities : [],
        visibleSections: resumeDraft.visibleSections || [...DEFAULT_SECTION_ORDER],
        sectionOrder: resumeDraft.sectionOrder || [...DEFAULT_SECTION_ORDER],
      };

      let res;
      if (activeResumeId) {
        res = await api.updateStudentResume(activeResumeId, payload);
      } else {
        res = await api.createStudentResume(payload);
        setActiveResumeId(res.resume.id);
      }

      setResumes((prev) => {
        const updated = prev.filter((item) => item.id !== res.resume.id);
        return [res.resume, ...updated];
      });

      setResumeDraft({ ...emptyResumeDraft(student), ...res.resume });
      addToast('Resume saved successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Unable to save resume.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteResume = async (resumeId) => {
    if (!resumeId) return;
    try {
      setSaving(true);
      await api.deleteStudentResume(resumeId);
      const remaining = resumes.filter((item) => item.id !== resumeId);
      setResumes(remaining);
      if (activeResumeId === resumeId) {
        setActiveResumeId(remaining[0]?.id || null);
        setResumeDraft(remaining[0] ? { ...emptyResumeDraft(student), ...remaining[0] } : emptyResumeDraft(student));
      }
      addToast('Resume deleted.', 'info');
    } catch (err) {
      addToast(err.message || 'Unable to delete resume.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectResume = (resume) => {
    setActiveResumeId(resume.id);
    setResumeDraft({ ...emptyResumeDraft(student), ...resume });
    setSummaryMode(resume.summary === student?.about ? 'portfolio' : 'custom');
  };

  const toggleSection = (section) => {
    setResumeDraft((prev) => {
      const current = new Set(prev.visibleSections || []);
      if (current.has(section)) current.delete(section);
      else current.add(section);
      return { ...prev, visibleSections: [...current] };
    });
  };

  const moveSection = (source, target) => {
    setResumeDraft((prev) => {
      if (!prev) return prev;
      const next = [...(prev.sectionOrder || DEFAULT_SECTION_ORDER)];
      const sourceIndex = next.indexOf(source);
      const targetIndex = next.indexOf(target);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, source);
      return { ...prev, sectionOrder: next };
    });
  };

  const summaryText = resumeDraft?.customSummary || resumeDraft?.summary || buildGeneratedSummary(student);

  const studentProjects = student?.projects || [];
  const studentCertificates = student?.certificates || [];
  const studentAchievements = student?.achievements || [];
  const studentActivities = student?.eventsParticipated || [];
  const skillList = student?.skills || [];

  const handleGeneratePdf = () => {
    if (!resumeDraft || !student) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    let cursorY = 52;

    const addSectionHeading = (heading) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(heading, margin, cursorY);
      cursorY += 18;
      doc.setDrawColor(21, 73, 140);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 10;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(student.name || 'Student Name', margin, cursorY);
    cursorY += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const contactText = [student.email || '', student.phone || '', 'Coimbatore, Tamil Nadu, India'];
    doc.text(contactText.filter(Boolean).join('   |   '), margin, cursorY);
    cursorY += 16;

    if (resumeDraft.visibleSections.includes('summary')) {
      addSectionHeading('Professional Summary');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - margin * 2);
      doc.text(summaryLines, margin, cursorY);
      cursorY += summaryLines.length * 12 + 10;
    }

    if (resumeDraft.visibleSections.includes('education')) {
      addSectionHeading('Education');
      doc.setFont('helvetica', 'bold');
      doc.text('Bachelor of Engineering (B.E.)', margin, cursorY);
      cursorY += 12;
      doc.setFont('helvetica', 'normal');
      doc.text('Mechanical Engineering', margin, cursorY);
      cursorY += 12;
      doc.text('CIET College, Coimbatore', margin, cursorY);
      cursorY += 12;
      doc.text(`${student.academicYear || '2023 - 2027'}  •  ${student.yearOfStudy || 'Final Year'}`, margin, cursorY);
      cursorY += 16;
    }

    if (resumeDraft.visibleSections.includes('skills')) {
      addSectionHeading('Technical Skills');
      const skillText = (resumeDraft.selectedSkills || []).length ? resumeDraft.selectedSkills.join(', ') : (student.skills || []).join(', ');
      const lines = doc.splitTextToSize(skillText, pageWidth - margin * 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 12 + 12;
    }

    if (resumeDraft.visibleSections.includes('projects')) {
      addSectionHeading('Projects');
      const chosen = studentProjects.filter((project) => (resumeDraft.selectedProjects || []).includes(project.id || project.title));
      const projectList = chosen.length ? chosen : studentProjects.slice(0, 2);
      projectList.forEach((project) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(project.title || 'Project', margin, cursorY);
        cursorY += 12;
        doc.setFont('helvetica', 'normal');
        const description = doc.splitTextToSize(project.description || 'Project description', pageWidth - margin * 2 - 16);
        doc.text(description, margin, cursorY);
        cursorY += description.length * 12 + 4;
        if (project.techStack) {
          const toolsLines = doc.splitTextToSize(`Tools: ${project.techStack}`, pageWidth - margin * 2);
          doc.text(toolsLines, margin, cursorY);
          cursorY += toolsLines.length * 12 + 8;
        }
      });
      if (cursorY > pageHeight - 80) {
        doc.addPage();
        cursorY = 60;
      }
    }

    if (resumeDraft.visibleSections.includes('certifications')) {
      addSectionHeading('Certifications');
      const certs = studentCertificates.filter((certificate) => (resumeDraft.selectedCertificates || []).includes(certificate.id || certificate.title));
      const safeCerts = certs.length ? certs : studentCertificates.slice(0, 2);
      safeCerts.forEach((certificate) => {
        doc.setFont('helvetica', 'bold');
        doc.text(certificate.title || 'Certificate', margin, cursorY);
        cursorY += 12;
        doc.setFont('helvetica', 'normal');
        doc.text(`${certificate.issuingOrganization || 'Issuing Organization'}  •  ${certificate.date || ''}`, margin, cursorY);
        cursorY += 14;
      });
    }

    if (resumeDraft.visibleSections.includes('achievements')) {
      addSectionHeading('Achievements');
      const lines = doc.splitTextToSize((resumeDraft.selectedAchievements || []).join(' • ') || studentAchievements.join(' • '), pageWidth - margin * 2);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 12 + 12;
    }

    const filename = `${(student.name || 'Student').replace(/\s+/g, '_')}_Mechanical_Resume.pdf`;
    doc.save(filename);
    addToast('PDF download started successfully.', 'success');
  };

  if (loading) {
    return (
      <div className="interior-page-container dashboard-page">
        <div className="page-width resume-builder-loading">
          <div className="spinner" />
          <p>Loading your resume data...</p>
        </div>
      </div>
    );
  }

  if (!student || !resumeDraft) {
    return (
      <div className="interior-page-container dashboard-page">
        <div className="page-width resume-builder-loading">
          <p>No student profile was found to build a resume.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interior-page-container dashboard-page">
      <section className="page-header-band page-width">
        <div className="header-meta">
          <span className="tech-badge badge-amber"><span className="badge-code">ME</span><span className="badge-dot" /><span className="badge-label">RESUME BUILDER</span></span>
          <h1 className="page-title">Student Resume Generator</h1>
          <p className="page-subtitle">Create, customize, and export a professional mechanical engineering resume from your live portfolio data.</p>
        </div>
        <div className="portfolio-preview-shortcut">
          <button className="btn btn-secondary" onClick={onBack || (() => window.history.back())}>
            <ArrowRight size={15} style={{ transform: 'rotate(180deg)' }} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </section>

      <div className="resume-builder-shell page-width">
        <aside className="resume-controls-panel">
          <div className="resume-panel-header">
            <div>
              <p className="panel-kicker">Resume setup</p>
              <h3>Configuration</h3>
            </div>
            <button className="btn btn-primary btn-sm" onClick={saveResume} disabled={saving}>
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>

          <div className="resume-saved-list">
            <div className="saved-header-row">
              <span>Saved resumes</span>
              <button className="mini-icon-btn" onClick={createNewResume} title="Create new resume">
                <Plus size={14} />
              </button>
            </div>

            {(resumes || []).map((resume) => (
              <div
                key={resume.id}
                className={`saved-resume-item ${activeResumeId === resume.id ? 'active' : ''}`}
              >
                <button type="button" className="saved-resume-item-main" onClick={() => selectResume(resume)}>
                  <div>
                    <strong>{resume.title || 'Resume'}</strong>
                    <small>{resume.template ? TEMPLATE_OPTIONS[resume.template]?.label : 'ATS'}</small>
                  </div>
                </button>
                <span className="resume-item-actions">
                  <button type="button" className="mini-icon-btn" onClick={() => duplicateResume()} title="Duplicate resume"><Copy size={12} /></button>
                  <button type="button" className="mini-icon-btn danger" onClick={() => deleteResume(resume.id)} title="Delete resume"><Trash2 size={12} /></button>
                </span>
              </div>
            ))}
          </div>

          <div className="resume-form-block">
            <label>Resume title</label>
            <input
              type="text"
              value={resumeDraft.title || ''}
              onChange={(event) => updateDraft({ title: event.target.value })}
            />
          </div>

          <div className="resume-form-block">
            <label>Template</label>
            <div className="template-grid">
              {Object.entries(TEMPLATE_OPTIONS).map(([key, template]) => (
                <button
                  key={key}
                  className={`template-option ${resumeDraft.template === key ? 'active' : ''}`}
                  onClick={() => updateDraft({ template: key })}
                >
                  <strong>{template.label}</strong>
                  <small>{template.description}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="resume-form-block">
            <label>Summary source</label>
            <div className="segmented-control">
              <button className={summaryMode === 'portfolio' ? 'active' : ''} onClick={() => { setSummaryMode('portfolio'); updateDraft({ customSummary: student.about || buildGeneratedSummary(student), summary: student.about || buildGeneratedSummary(student) }); }}>Use My Portfolio About</button>
              <button className={summaryMode === 'custom' ? 'active' : ''} onClick={() => { setSummaryMode('custom'); updateDraft({ customSummary: student.about || buildGeneratedSummary(student) }); }}>Generate Professional Summary</button>
            </div>
            <textarea
              rows={4}
              value={summaryText}
              onChange={(event) => {
                setSummaryMode('custom');
                updateDraft({ customSummary: event.target.value, summary: event.target.value });
              }}
            />
          </div>

          <div className="resume-form-block split-fields">
            <div>
              <label>Font size</label>
              <input type="range" min="10" max="13" value={resumeDraft.fontSize || 11} onChange={(event) => updateDraft({ fontSize: Number(event.target.value) })} />
            </div>
            <div>
              <label>Accent color</label>
              <input type="color" value={resumeDraft.accentColor || '#2563eb'} onChange={(event) => updateDraft({ accentColor: event.target.value })} />
            </div>
          </div>

          <div className="resume-form-block checkbox-list">
            <label className="checkbox-row">
              <input type="checkbox" checked={resumeDraft.atsMode || false} onChange={(event) => updateDraft({ atsMode: event.target.checked })} />
              <span>ATS Mode</span>
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={resumeDraft.profilePhotoVisible !== false} onChange={(event) => updateDraft({ profilePhotoVisible: event.target.checked })} />
              <span>Profile photo visible</span>
            </label>
          </div>

          <div className="resume-form-block">
            <label>Section visibility</label>
            <div className="section-toggle-list">
              {DEFAULT_SECTION_ORDER.map((section) => (
                <label key={section} className="checkbox-row">
                  <input type="checkbox" checked={(resumeDraft.visibleSections || []).includes(section)} onChange={() => toggleSection(section)} />
                  <span>{SECTION_LABELS[section]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="resume-form-block">
            <label>Section order</label>
            <div className="section-order-list">
              {(resumeDraft.sectionOrder || DEFAULT_SECTION_ORDER).map((section) => (
                <div key={section} className="section-order-item">
                  <span>{SECTION_LABELS[section]}</span>
                  <div className="order-actions">
                    <button type="button" onClick={() => moveSection(section, (resumeDraft.sectionOrder || DEFAULT_SECTION_ORDER)[Math.max(0, (resumeDraft.sectionOrder || DEFAULT_SECTION_ORDER).indexOf(section) - 1)])} disabled={(resumeDraft.sectionOrder || DEFAULT_SECTION_ORDER).indexOf(section) === 0}>↑</button>
                    <button type="button" onClick={() => moveSection(section, (resumeDraft.sectionOrder || DEFAULT_SECTION_ORDER)[Math.min((resumeDraft.sectionOrder || DEFAULT_SECTION_ORDER).length - 1, (resumeDraft.sectionOrder || DEFAULT_SECTION_ORDER).indexOf(section) + 1)])} disabled={(resumeDraft.sectionOrder || DEFAULT_SECTION_ORDER).indexOf(section) === (resumeDraft.sectionOrder || DEFAULT_SECTION_ORDER).length - 1}>↓</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="resume-preview-panel">
          <div className="resume-preview-toolbar">
            <button className="btn btn-primary" onClick={handleGeneratePdf}>
              <Download size={15} />
              <span>Download Resume PDF</span>
            </button>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={15} />
              <span>Print Resume</span>
            </button>
          </div>

          <div className={`resume-paper template-${resumeDraft.template || 'ats'} ${resumeDraft.atsMode ? 'ats-mode' : ''}`} style={{ fontSize: `${resumeDraft.fontSize || 11}px` }}>
            <div className="resume-header">
              {resumeDraft.profilePhotoVisible && student.profilePhoto && (
                <img className="resume-photo" src={student.profilePhoto} alt={student.name} />
              )}
              <div className="resume-header-copy">
                <h2>{student.name || 'Student Name'}</h2>
                <p>{student.registerNumber || 'Register Number'}</p>
                <p>Mechanical Engineering • CIET College, Coimbatore</p>
              </div>
            </div>

            <div className="resume-meta-row">
              <span>{student.email || 'student@ciet.ac.in'}</span>
              <span>{student.phone || '+91 00000 00000'}</span>
              <span>{student.location || 'Coimbatore, Tamil Nadu, India'}</span>
              <span>{student.socialLinks?.linkedin || 'linkedin.com'}</span>
            </div>

            {visibleSectionList.includes('summary') && (
              <section className="resume-section">
                <h4>Professional Summary</h4>
                <p>{summaryText}</p>
              </section>
            )}

            {visibleSectionList.includes('education') && (
              <section className="resume-section">
                <h4>Education</h4>
                <div className="resume-entry">
                  <strong>Bachelor of Engineering (B.E.)</strong>
                  <p>Mechanical Engineering</p>
                  <p>CIET College, Coimbatore</p>
                  <p>{student.academicYear || '2023 – 2027'} • CGPA: {student.cgpa || '8.5'}</p>
                </div>
              </section>
            )}

            {visibleSectionList.includes('skills') && (
              <section className="resume-section">
                <h4>Technical Skills</h4>
                <div className="tag-list">
                  {(resumeDraft.selectedSkills || []).length ? resumeDraft.selectedSkills.map((skill) => <span key={skill}>{skill}</span>) : (student.skills || []).slice(0, 10).map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              </section>
            )}

            {visibleSectionList.includes('projects') && (
              <section className="resume-section">
                <h4>Projects</h4>
                {(studentProjects.filter((project) => (resumeDraft.selectedProjects || []).includes(project.id || project.title)).length ? studentProjects.filter((project) => (resumeDraft.selectedProjects || []).includes(project.id || project.title)) : studentProjects.slice(0, 2)).map((project) => (
                  <div key={project.id || project.title} className="resume-entry">
                    <strong>{project.title}</strong>
                    <p>{project.description}</p>
                    <small>Tools: {project.techStack || 'Engineering tools'}</small>
                  </div>
                ))}
              </section>
            )}

            {visibleSectionList.includes('experience') && (
              <section className="resume-section">
                <h4>Internships / Experience</h4>
                {(student.internships || []).length ? student.internships.map((internship) => (
                  <div key={internship.company || internship.role} className="resume-entry">
                    <strong>{internship.role || 'Engineering Intern'}</strong>
                    <p>{internship.company || 'Industry Partner'}</p>
                    <p>{internship.duration || ''}</p>
                  </div>
                )) : <p className="resume-empty">No internship or work experience added yet.</p>}
              </section>
            )}

            {visibleSectionList.includes('certifications') && (
              <section className="resume-section">
                <h4>Certifications</h4>
                {(studentCertificates.filter((certificate) => (resumeDraft.selectedCertificates || []).includes(certificate.id || certificate.title)).length ? studentCertificates.filter((certificate) => (resumeDraft.selectedCertificates || []).includes(certificate.id || certificate.title)) : studentCertificates.slice(0, 2)).map((certificate) => (
                  <div key={certificate.id || certificate.title} className="resume-entry">
                    <strong>{certificate.title}</strong>
                    <p>{certificate.issuingOrganization}</p>
                    <small>{certificate.date || 'Date'} • {certificate.description || 'Professional certification'}</small>
                  </div>
                ))}
              </section>
            )}

            {visibleSectionList.includes('achievements') && (
              <section className="resume-section">
                <h4>Achievements</h4>
                <ul className="resume-bullet-list">
                  {((resumeDraft.selectedAchievements || []).length ? resumeDraft.selectedAchievements : studentAchievements).map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
              </section>
            )}

            {visibleSectionList.includes('workshops') && (
              <section className="resume-section">
                <h4>Workshops & Activities</h4>
                <ul className="resume-bullet-list">
                  {((resumeDraft.selectedActivities || []).length ? resumeDraft.selectedActivities : studentActivities).map((activity) => (
                    <li key={activity}>{activity}</li>
                  ))}
                </ul>
              </section>
            )}

            {visibleSectionList.includes('leadership') && (
              <section className="resume-section">
                <h4>Leadership & Activities</h4>
                <ul className="resume-bullet-list">
                  <li>SAE Club involvement and project leadership</li>
                  <li>Team-based engineering initiative participation</li>
                </ul>
              </section>
            )}

            {visibleSectionList.includes('languages') && (
              <section className="resume-section">
                <h4>Languages</h4>
                <div className="tag-list">
                  <span>English</span>
                  <span>Tamil</span>
                  <span>Hindi</span>
                </div>
              </section>
            )}

            {visibleSectionList.includes('interests') && (
              <section className="resume-section">
                <h4>Interests</h4>
                <div className="tag-list">
                  <span>Automotive Design</span>
                  <span>CAD & Simulation</span>
                  <span>Robotics</span>
                  <span>Manufacturing Innovation</span>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
