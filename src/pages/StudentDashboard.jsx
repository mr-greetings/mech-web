import React, { useState, useEffect } from 'react';
import {
  User,
  FolderGit2,
  Award,
  Sparkles,
  Tag,
  Upload,
  PlusCircle,
  Trash2,
  ExternalLink,
  Download,
  Share2,
  CheckCircle,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  X,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';

export const StudentDashboard = ({ onNavigate }) => {
  const { user, isStudent } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'projects' | 'certificates' | 'achievements' | 'gallery'
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [about, setAbout] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [instagram, setInstagram] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  // New Project Modal / Form
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectTech, setProjectTech] = useState('');
  const [projectGithub, setProjectGithub] = useState('');
  const [projectDemo, setProjectDemo] = useState('');
  const [projectImageFile, setProjectImageFile] = useState(null);

  // New Certificate Modal / Form
  const [showCertModal, setShowCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certDesc, setCertDesc] = useState('');
  const [certFile, setCertFile] = useState(null);

  // New Achievement
  const [achievementInput, setAchievementInput] = useState('');
  const [eventInput, setEventInput] = useState('');

  // Gallery image upload
  const [galleryFile, setGalleryFile] = useState(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const studentsList = await api.getStudents();
      // Match current student by register number or userId
      let currentStudent = studentsList.find(
        (s) => s.userId === user?.id || (user?.registerNumber && s.registerNumber === user?.registerNumber) || s.email === user?.email
      );

      if (!currentStudent && studentsList.length > 0) {
        currentStudent = studentsList[0];
      }

      if (currentStudent) {
        setStudent(currentStudent);
        setName(currentStudent.name || '');
        setPhone(currentStudent.phone || '');
        setAbout(currentStudent.about || '');
        setSkillsInput((currentStudent.skills || []).join(', '));
        setLinkedin(currentStudent.socialLinks?.linkedin || '');
        setGithub(currentStudent.socialLinks?.github || '');
        setInstagram(currentStudent.socialLinks?.instagram || '');
      }
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  useEffect(() => {
    if (!user || !isStudent) {
      if (onNavigate) {
        onNavigate('home');
      }
    }
  }, [user, isStudent, onNavigate]);

  if (!user || !isStudent) {
    return (
      <div className="interior-page-container dashboard-page">
        <div className="page-width resume-builder-loading">
          <p>Please log in as a student to access this dashboard.</p>
          <button className="btn btn-primary" onClick={() => onNavigate && onNavigate('home')}>
            Return home
          </button>
        </div>
      </div>
    );
  }

  // Handler: Save Profile Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    try {
      let photoUrl = student.profilePhoto;
      if (profilePhotoFile) {
        const uploadRes = await api.uploadFile(profilePhotoFile);
        photoUrl = uploadRes.file.url;
      }

      const updated = {
        ...student,
        name,
        phone,
        about,
        profilePhoto: photoUrl,
        skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
        socialLinks: {
          linkedin,
          github,
          instagram,
        },
      };

      await api.updateStudent(student.id, updated);
      setStudent(updated);
      addToast('Profile saved successfully! Public portfolio updated.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Add Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    try {
      let imgUrl = '';
      if (projectImageFile) {
        const res = await api.uploadFile(projectImageFile);
        imgUrl = res.file.url;
      }

      const newProject = {
        id: `proj-${Date.now()}`,
        title: projectTitle,
        description: projectDesc,
        techStack: projectTech,
        github: projectGithub,
        liveDemo: projectDemo,
        image: imgUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      };

      const updatedProjects = [newProject, ...(student.projects || [])];
      await api.updateStudent(student.id, { ...student, projects: updatedProjects });
      setStudent({ ...student, projects: updatedProjects });

      addToast('Project added to your portfolio!', 'success');
      setShowProjectModal(false);
      setProjectTitle('');
      setProjectDesc('');
      setProjectTech('');
      setProjectGithub('');
      setProjectDemo('');
      setProjectImageFile(null);
    } catch (err) {
      addToast(err.message || 'Failed to add project.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Delete Project
  const handleDeleteProject = async (projId) => {
    if (!student) return;
    const updated = (student.projects || []).filter((p) => p.id !== projId);
    try {
      await api.updateStudent(student.id, { ...student, projects: updated });
      setStudent({ ...student, projects: updated });
      addToast('Project deleted.', 'info');
    } catch (err) {
      addToast('Error removing project.', 'error');
    }
  };

  // Handler: Upload Certificate
  const handleAddCertificate = async (e) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    try {
      let fileUrl = '/uploads/sample-brochure.pdf';
      if (certFile) {
        const uploadRes = await api.uploadFile(certFile);
        fileUrl = uploadRes.file.url;
      }

      const certPayload = {
        title: certTitle,
        issuingOrganization: certOrg,
        date: certDate || new Date().toISOString().slice(0, 10),
        description: certDesc,
        studentId: student.id,
        studentName: student.name,
        category: 'Students',
        fileUrl,
      };

      await api.createCertificate(certPayload);

      addToast('Certificate uploaded and verified on your portfolio!', 'success');
      setShowCertModal(false);
      setCertTitle('');
      setCertOrg('');
      setCertDate('');
      setCertDesc('');
      setCertFile(null);
      fetchStudentData();
    } catch (err) {
      addToast(err.message || 'Failed to upload certificate.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Delete Certificate
  const handleDeleteCert = async (certId) => {
    try {
      await api.deleteCertificate(certId);
      const updated = (student.certificates || []).filter((c) => c.id !== certId);
      await api.updateStudent(student.id, { ...student, certificates: updated });
      setStudent({ ...student, certificates: updated });
      addToast('Certificate deleted.', 'info');
    } catch (err) {
      addToast('Failed to delete certificate.', 'error');
    }
  };

  // Handler: Add Achievement
  const handleAddAchievement = async (e) => {
    e.preventDefault();
    if (!achievementInput || !student) return;
    const updated = [achievementInput, ...(student.achievements || [])];
    try {
      await api.updateStudent(student.id, { ...student, achievements: updated });
      setStudent({ ...student, achievements: updated });
      setAchievementInput('');
      addToast('Achievement added!', 'success');
    } catch (err) {
      addToast('Failed to save achievement.', 'error');
    }
  };

  // Handler: Add Event Participation
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventInput || !student) return;
    const updated = [eventInput, ...(student.eventsParticipated || [])];
    try {
      await api.updateStudent(student.id, { ...student, eventsParticipated: updated });
      setStudent({ ...student, eventsParticipated: updated });
      setEventInput('');
      addToast('Event participation added!', 'success');
    } catch (err) {
      addToast('Failed to save event record.', 'error');
    }
  };

  // Handler: Upload Personal Gallery Photo
  const handleUploadGalleryPhoto = async (e) => {
    e.preventDefault();
    if (!galleryFile || !student) return;
    setSaving(true);
    try {
      const res = await api.uploadFile(galleryFile);
      const updatedGallery = [res.file.url, ...(student.galleryImages || [])];
      await api.updateStudent(student.id, { ...student, galleryImages: updatedGallery });
      setStudent({ ...student, galleryImages: updatedGallery });
      setGalleryFile(null);
      addToast('Prototype photo added to your personal gallery!', 'success');
    } catch (err) {
      addToast(err.message || 'Upload failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="interior-page-container">
        <BlueprintGrid />
        <div className="feed-loading-state" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
          <p>Loading student portfolio dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interior-page-container dashboard-page">
      <BlueprintGrid />

      {/* Header Band */}
      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="STUDENT PORTFOLIO STUDIO" code="ME-DASH-STU" variant="blue" />
          <h1 className="page-title">Student Portfolio Dashboard</h1>
          <p className="page-subtitle">
            Manage your personal engineering portfolio, upload credentials, showcase prototypes, and share your verified profile.
          </p>
        </div>

        <div className="portfolio-preview-shortcut" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('student-resume')}
          >
            <FileText size={15} />
            <span>Resume Generator</span>
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('curriculum')}>
            <GraduationCap size={15} />
            <span>My Curriculum</span>
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('syllabus')}>
            <BookOpen size={15} />
            <span>My Syllabus</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate(`student-profile-${student?.registerNumber || '23ME014'}`)}
          >
            <span>View Public Live Portfolio</span>
            <ExternalLink size={15} />
          </button>
        </div>
      </section>

      {/* Dashboard Navigation Tabs */}
      <section className="page-width dashboard-nav-strip">
        <button
          className={`dash-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} />
          <span>Profile & Bio</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderGit2 size={16} />
          <span>Projects ({(student?.projects || []).length})</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          <Award size={16} />
          <span>Certifications ({(student?.certificates || []).length})</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <Sparkles size={16} />
          <span>Achievements & Events</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <Tag size={16} />
          <span>Gallery Images</span>
        </button>
      </section>

      {/* TAB 1: PROFILE & BIO */}
      {activeTab === 'profile' && (
        <section className="page-width dashboard-content-section">
          <div className="dashboard-card-form" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-kicker">
              <User size={16} />
              <span>ACADEMIC PROFILE DETAILS</span>
            </div>
            <h3>Edit Student Information</h3>

            <form onSubmit={handleSaveProfile} className="auth-form" style={{ marginTop: '16px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Registration Number</label>
                  <input type="text" disabled value={student?.registerNumber || ''} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Batch</label>
                  <input type="text" disabled value={student?.batch || ''} />
                </div>
                <div className="form-group">
                  <label>Section & Year</label>
                  <input type="text" disabled value={`Sec ${student?.section || 'A'} · ${student?.yearOfStudy || ''}`} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Update Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePhotoFile(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>About Me / Professional Summary</label>
                <textarea
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Share your engineering focus, lab projects, and career aspirations..."
                />
              </div>

              <div className="form-group">
                <label>Technical Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. SolidWorks CSWP, ANSYS Fluent, Python, CNC Machining, ROS2"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Instagram URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </section>
      )}

      {/* TAB 2: PROJECTS MANAGEMENT */}
      {activeTab === 'projects' && (
        <section className="page-width dashboard-content-section">
          <div className="section-head-with-action">
            <div>
              <h2>Engineering Projects</h2>
              <p>Showcase machine designs, simulations, and working prototypes with code repositories.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowProjectModal(true)}
            >
              <PlusCircle size={16} />
              <span>Add New Project</span>
            </button>
          </div>

          <div className="portfolio-projects-grid" style={{ marginTop: '20px' }}>
            {(student?.projects || []).map((proj) => (
              <div key={proj.id} className="project-display-card">
                {proj.image && (
                  <div className="project-img-box">
                    <img src={proj.image} alt={proj.title} />
                  </div>
                )}
                <div className="project-card-body">
                  <h3 className="project-title">{proj.title}</h3>
                  <p className="project-desc">{proj.description}</p>
                  {proj.techStack && (
                    <div className="tech-stack-tag">
                      <strong>Tools:</strong> {proj.techStack}
                    </div>
                  )}
                  <div className="project-links-row">
                    <button
                      className="btn-danger-icon"
                      onClick={() => handleDeleteProject(proj.id)}
                      title="Delete project"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Project Modal */}
          {showProjectModal && (
            <div className="modal-backdrop" onClick={() => setShowProjectModal(false)}>
              <div className="modal-window upload-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowProjectModal(false)}>
                  <X size={20} />
                </button>
                <h3>Add Engineering Project</h3>
                <form onSubmit={handleAddProject} className="auth-form">
                  <div className="form-group">
                    <label>Project Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EV Powertrain Inverter Sizing"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Project Overview / Objectives</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain the mechanical engineering problem and outcome..."
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tools & Tech Stack</label>
                    <input
                      type="text"
                      placeholder="e.g. SolidWorks, ANSYS FEA, MATLAB"
                      value={projectTech}
                      onChange={(e) => setProjectTech(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>GitHub Repository</label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={projectGithub}
                        onChange={(e) => setProjectGithub(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Live Demo / Report Link</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={projectDemo}
                        onChange={(e) => setProjectDemo(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Project Image (JPG, PNG)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProjectImageFile(e.target.files[0])}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                    <span>{saving ? 'Uploading...' : 'Save Project'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: CERTIFICATES MANAGEMENT */}
      {activeTab === 'certificates' && (
        <section className="page-width dashboard-content-section">
          <div className="section-head-with-action">
            <div>
              <h2>My Certifications</h2>
              <p>Upload accredited software credentials, NPTEL scores, and workshop completion certificates.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowCertModal(true)}
            >
              <Upload size={16} />
              <span>Upload Certificate</span>
            </button>
          </div>

          <div className="portfolio-certificates-grid" style={{ marginTop: '20px' }}>
            {(student?.certificates || []).map((cert) => (
              <div key={cert.id} className="cert-display-card">
                <div className="cert-icon-wrapper">
                  <Award size={24} />
                </div>
                <div className="cert-body">
                  <span className="cert-date">{cert.date}</span>
                  <h4 className="cert-title">{cert.title}</h4>
                  <p className="cert-org">Issued by: <strong>{cert.issuingOrganization}</strong></p>
                  {cert.description && <p className="cert-desc">{cert.description}</p>}
                  <div className="cert-card-bottom-actions">
                    {cert.fileUrl && (
                      <a
                        href={cert.fileUrl}
                        download
                        className="btn btn-secondary btn-xs"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </a>
                    )}
                    <button
                      className="btn-danger-icon"
                      onClick={() => handleDeleteCert(cert.id)}
                      title="Delete Certificate"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Cert Modal */}
          {showCertModal && (
            <div className="modal-backdrop" onClick={() => setShowCertModal(false)}>
              <div className="modal-window upload-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowCertModal(false)}>
                  <X size={20} />
                </button>
                <h3>Upload Certificate</h3>
                <form onSubmit={handleAddCertificate} className="auth-form">
                  <div className="form-group">
                    <label>Certificate Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Certified SolidWorks Associate (CSWA)"
                      value={certTitle}
                      onChange={(e) => setCertTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Issuing Organization</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dassault Systèmes / NPTEL / Autodesk"
                      value={certOrg}
                      onChange={(e) => setCertOrg(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date of Issue</label>
                      <input
                        type="date"
                        value={certDate}
                        onChange={(e) => setCertDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Specialization covered, grade achieved..."
                      value={certDesc}
                      onChange={(e) => setCertDesc(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Certificate File (PDF or Image)</label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setCertFile(e.target.files[0])}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                    <span>{saving ? 'Uploading...' : 'Save Certificate'}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 4: ACHIEVEMENTS & EVENTS */}
      {activeTab === 'achievements' && (
        <section className="page-width dashboard-content-section">
          <div className="achievements-two-column">
            {/* Achievements column */}
            <div className="dashboard-card-form">
              <h3>Add Achievement / Honor</h3>
              <form onSubmit={handleAddAchievement} className="auth-form" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1st Place — National CAD Olympiad 2025"
                    value={achievementInput}
                    onChange={(e) => setAchievementInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">
                  <span>Add Achievement</span>
                </button>
              </form>

              <div className="achievements-list-block" style={{ marginTop: '20px' }}>
                <h4>Current Honors:</h4>
                <ul className="achievements-list">
                  {(student?.achievements || []).map((ach, idx) => (
                    <li key={idx} className="achievement-item">
                      <CheckCircle size={15} className="check-icon" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Event Participation column */}
            <div className="dashboard-card-form">
              <h3>Record Event Participation</h3>
              <form onSubmit={handleAddEvent} className="auth-form" style={{ marginTop: '12px' }}>
                <div className="form-group">
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAE BAJA India 2025 — Chassis Lead"
                    value={eventInput}
                    onChange={(e) => setEventInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">
                  <span>Add Event Record</span>
                </button>
              </form>

              <div className="achievements-list-block" style={{ marginTop: '20px' }}>
                <h4>Recorded Events:</h4>
                <ul className="achievements-list">
                  {(student?.eventsParticipated || []).map((ev, idx) => (
                    <li key={idx} className="achievement-item">
                      <CheckCircle size={15} className="check-icon" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 5: GALLERY IMAGES */}
      {activeTab === 'gallery' && (
        <section className="page-width dashboard-content-section">
          <div className="section-head-with-action">
            <div>
              <h2>Personal Project & Prototype Gallery</h2>
              <p>Upload photos of lab test rigs, chassis welding, 3D printed parts, or racing competitions.</p>
            </div>
          </div>

          <div className="dashboard-card-form" style={{ maxWidth: '500px', marginTop: '16px' }}>
            <h4>Upload New Photo</h4>
            <form onSubmit={handleUploadGalleryPhoto} className="auth-form" style={{ marginTop: '12px' }}>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setGalleryFile(e.target.files[0])}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                <span>{saving ? 'Uploading...' : 'Add to My Gallery'}</span>
              </button>
            </form>
          </div>

          <div className="student-gallery-grid" style={{ marginTop: '24px' }}>
            {(student?.galleryImages || []).map((img, idx) => (
              <div key={idx} className="student-gallery-item">
                <img src={img} alt={`Prototype ${idx + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
