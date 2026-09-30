import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  UserCheck,
  Calendar,
  Layers,
  Settings,
  PlusCircle,
  Trash2,
  Edit,
  Save,
  Mail,
  Phone,
  CheckCircle,
  X,
  BookOpen,
  FileText,
  Upload,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';
import { InstagramIcon } from '../components/SocialIcons';

export const AdminDashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'students' | 'staff' | 'settings' | 'feed'
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [deptInfo, setDeptInfo] = useState({});
  const [curriculumCourses, setCurriculumCourses] = useState([]);
  const [curriculumDocument, setCurriculumDocument] = useState(null);
  const [pendingCurriculumDocument, setPendingCurriculumDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCourseCode, setEditingCourseCode] = useState('');
  const [curriculumPdfFile, setCurriculumPdfFile] = useState(null);
  const [courseForm, setCourseForm] = useState({ courseCode: '', courseName: '', semester: '1', category: 'PC', lectureHours: '3', tutorialHours: '0', practicalHours: '0', credits: '3', detailsText: '' });

  // New Batch Form
  const [newBatchLabel, setNewBatchLabel] = useState('');
  const [newBatchYear, setNewBatchYear] = useState('');
  const [newBatchDesc, setNewBatchDesc] = useState('');

  // Department Settings Form
  const [visionText, setVisionText] = useState('');
  const [missionText, setMissionText] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // New Staff Modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('Assistant Professor');
  const [staffSpec, setStaffSpec] = useState('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [b, s, st, ev, an, d, curriculum] = await Promise.all([
        api.getBatches(),
        api.getStudents(),
        api.getStaff(),
        api.getEvents(),
        api.getAnnouncements(),
        api.getDepartmentInfo(),
        api.getAdminCurriculum(),
      ]);
      setBatches(b || []);
      setStudents(s || []);
      setStaff(st || []);
      setEvents(ev || []);
      setAnnouncements(an || []);
      setDeptInfo(d || {});
      setCurriculumCourses(curriculum?.courses || []);
      setCurriculumDocument(curriculum?.sourceDocument || null);
      setPendingCurriculumDocument(curriculum?.pendingDocument || null);

      if (d) {
        setVisionText(d.vision || '');
        setMissionText(Array.isArray(d.mission) ? d.mission.join('\n') : (d.mission || ''));
        setInstagramUrl(d.instagramUrl || 'https://instagram.com/ciet_mech_official');
        setContactEmail(d.contactEmail || 'mech@ciet.ac.in');
        setContactPhone(d.contactPhone || '+91 422 2970701');
      }
    } catch (err) {
      console.error('Admin data load failure:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- Handlers: Batches ---
  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!newBatchLabel || !newBatchYear) {
      addToast('Batch label and academic year are required.', 'error');
      return;
    }
    try {
      await api.createBatch({
        id: newBatchYear.trim(),
        label: newBatchLabel.trim(),
        academicYear: newBatchYear.trim(),
        description: newBatchDesc,
        active: true,
      });
      addToast(`Batch ${newBatchLabel} created successfully!`, 'success');
      setNewBatchLabel('');
      setNewBatchYear('');
      setNewBatchDesc('');
      loadAllData();
    } catch (err) {
      addToast(err.message || 'Error creating batch.', 'error');
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm(`Delete batch ${batchId}?`)) return;
    try {
      await api.deleteBatch(batchId);
      addToast('Batch deleted.', 'info');
      loadAllData();
    } catch (err) {
      addToast(err.message || 'Failed to delete batch.', 'error');
    }
  };

  // --- Handlers: Staff ---
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createStaff({
        name: staffName,
        email: staffEmail,
        designation: staffRole,
        specialization: staffSpec,
        qualification: 'M.E., Ph.D.',
        experience: '5 Years',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        about: 'Faculty member in Mechanical Engineering.',
        areasOfInterest: [staffSpec],
      });
      addToast(`Faculty member ${staffName} added!`, 'success');
      setShowAddStaffModal(false);
      setStaffName('');
      setStaffEmail('');
      setStaffSpec('');
      loadAllData();
    } catch (err) {
      addToast(err.message || 'Failed to add staff.', 'error');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Remove this faculty record?')) return;
    try {
      await api.deleteStaff(staffId);
      addToast('Faculty member removed.', 'info');
      loadAllData();
    } catch (err) {
      addToast('Error removing staff.', 'error');
    }
  };

  // --- Handlers: Students ---
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Delete this student portfolio record?')) return;
    try {
      await api.deleteStudent(studentId);
      addToast('Student record deleted.', 'info');
      loadAllData();
    } catch (err) {
      addToast('Error deleting student.', 'error');
    }
  };

  // --- Handlers: Department Settings (Vision, Mission, Configurable Instagram URL) ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updatedMission = missionText
        .split('\n')
        .map((m) => m.trim())
        .filter(Boolean);

      const updated = {
        ...deptInfo,
        vision: visionText,
        mission: updatedMission,
        instagramUrl: instagramUrl,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
      };

      await api.updateDepartmentInfo(updated);
      setDeptInfo(updated);
      addToast('Department information and Instagram link updated successfully across the site and footer!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update department settings.', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- Handlers: Announcement deletion ---
  const handleDeleteAnnouncement = async (id) => {
    try {
      await api.deleteAnnouncement(id);
      addToast('Announcement removed from Feed.', 'info');
      loadAllData();
    } catch (err) {
      addToast('Failed to delete announcement.', 'error');
    }
  };

  const refreshCurriculum = async () => {
    const result = await api.getAdminCurriculum();
    setCurriculumCourses(result.courses || []);
    setCurriculumDocument(result.sourceDocument || null);
    setPendingCurriculumDocument(result.pendingDocument || null);
  };

  const handleSaveCurriculumCourse = async (event) => {
    event.preventDefault();
    const payload = {
      ...courseForm,
      semester: courseForm.semester ? Number(courseForm.semester) : null,
      lectureHours: Number(courseForm.lectureHours),
      tutorialHours: Number(courseForm.tutorialHours),
      practicalHours: Number(courseForm.practicalHours),
      credits: Number(courseForm.credits),
    };
    try {
      if (editingCourseCode) {
        const { courseCode, ...updates } = payload;
        await api.updateCurriculumCourse(editingCourseCode, updates);
      } else {
        await api.createCurriculumCourse(payload);
      }
      setEditingCourseCode('');
      setCourseForm({ courseCode: '', courseName: '', semester: '1', category: 'PC', lectureHours: '3', tutorialHours: '0', practicalHours: '0', credits: '3', detailsText: '' });
      await refreshCurriculum();
      addToast('Curriculum course saved.', 'success');
    } catch (err) {
      addToast(err.message || 'Unable to save the curriculum course.', 'error');
    }
  };

  const handleEditCurriculumCourse = (course) => {
    setEditingCourseCode(course.courseCode);
    setCourseForm({
      courseCode: course.courseCode,
      courseName: course.courseName || '',
      semester: course.semester ? String(course.semester) : '',
      category: course.category || '',
      lectureHours: String(course.lectureHours ?? 0),
      tutorialHours: String(course.tutorialHours ?? 0),
      practicalHours: String(course.practicalHours ?? 0),
      credits: String(course.credits ?? 0),
      detailsText: course.detailsText || '',
    });
  };

  const handleDeleteCurriculumCourse = async (courseCode) => {
    if (!window.confirm(`Remove ${courseCode} from the published catalogue?`)) return;
    try {
      await api.deleteCurriculumCourse(courseCode);
      await refreshCurriculum();
      addToast('Course removed from the published catalogue.', 'info');
    } catch (err) {
      addToast(err.message || 'Unable to remove the course.', 'error');
    }
  };

  const handleReplaceCurriculumPdf = async (event) => {
    event.preventDefault();
    if (!curriculumPdfFile) return;
    try {
      const result = await api.replaceCurriculumPdf(curriculumPdfFile);
      setPendingCurriculumDocument(result.pendingDocument);
      setCurriculumPdfFile(null);
      event.target.reset();
      addToast('Official PDF replaced; the previous file remains archived.', 'success');
    } catch (err) {
      addToast(err.message || 'Unable to replace the official PDF.', 'error');
    }
  };

  return (
    <div className="interior-page-container dashboard-page">
      <BlueprintGrid />

      {/* Header Band */}
      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="DEPARTMENT ROOT CONTROL" code="ME-ADMIN-SYS" variant="purple" />
          <h1 className="page-title">Admin Control Center</h1>
          <p className="page-subtitle">
            Centralized administrative oversight of academic batches, faculty roster, student databases, department vision/mission, and live feed broadcasts.
          </p>
        </div>

        <div className="dashboard-stats-strip">
          <div className="dash-stat-pill">
            <strong>{batches.length}</strong>
            <span>Batches</span>
          </div>
          <div className="dash-stat-pill">
            <strong>{students.length}</strong>
            <span>Students</span>
          </div>
          <div className="dash-stat-pill">
            <strong>{staff.length}</strong>
            <span>Faculty</span>
          </div>
          <div className="dash-stat-pill">
            <strong>{events.length}</strong>
            <span>Events</span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="page-width dashboard-nav-strip">
        <button
          className={`dash-tab-btn ${activeTab === 'batches' ? 'active' : ''}`}
          onClick={() => setActiveTab('batches')}
        >
          <Layers size={16} />
          <span>Batch Database Manager</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={16} />
          <span>Student Directory ({students.length})</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          <UserCheck size={16} />
          <span>Faculty Roster ({staff.length})</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={16} />
          <span>Vision, Mission & Instagram Settings</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <Calendar size={16} />
          <span>Announcements & Feed Control</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
          onClick={() => setActiveTab('curriculum')}
        >
          <BookOpen size={16} />
          <span>Curriculum & Syllabus Management</span>
        </button>
      </section>

      {/* TAB 1: BATCHES */}
      {activeTab === 'batches' && (
        <section className="page-width dashboard-content-section">
          <div className="section-head-with-action">
            <div>
              <h2>Year-Wise Academic Batches</h2>
              <p>Add new batches seamlessly without changing code. Students will automatically map into these batches.</p>
            </div>
          </div>

          {/* Add Batch Form */}
          <div className="dashboard-card-form" style={{ marginTop: '16px' }}>
            <h4>Add New Batch</h4>
            <form onSubmit={handleAddBatch} className="auth-form" style={{ marginTop: '12px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Batch Display Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2027 — 2031"
                    value={newBatchLabel}
                    onChange={(e) => setNewBatchLabel(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Academic Year Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2027-2031"
                    value={newBatchYear}
                    onChange={(e) => setNewBatchYear(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Incoming First Year Batch"
                    value={newBatchDesc}
                    onChange={(e) => setNewBatchDesc(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                <span>Add Batch to Database</span>
              </button>
            </form>
          </div>

          {/* Batches Table */}
          <div className="dashboard-table-container" style={{ marginTop: '20px' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Batch Label</th>
                  <th>Academic Code</th>
                  <th>Description</th>
                  <th>Enrolled Students</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => {
                  const count = students.filter((s) => s.batch === b.label || s.academicYear === b.id).length;
                  return (
                    <tr key={b.id}>
                      <td><strong>{b.label}</strong></td>
                      <td><span className="mono-badge">{b.academicYear}</span></td>
                      <td>{b.description || 'Active Undergraduate Batch'}</td>
                      <td><span className="metrics-pill">{count} Enrolled</span></td>
                      <td>
                        <button
                          className="btn-danger-icon"
                          onClick={() => handleDeleteBatch(b.id)}
                          title="Delete Batch"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: STUDENTS */}
      {activeTab === 'students' && (
        <section className="page-width dashboard-content-section">
          <h2>Student Records Across All Batches</h2>
          <div className="dashboard-table-container" style={{ marginTop: '16px' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Reg No</th>
                  <th>Batch</th>
                  <th>Section</th>
                  <th>Skills</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <strong>{st.name}</strong><br />
                      <small className="muted-text">{st.email}</small>
                    </td>
                    <td><span className="mono-badge">{st.registerNumber}</span></td>
                    <td>{st.batch}</td>
                    <td>Section {st.section || 'A'}</td>
                    <td>{(st.skills || []).slice(0, 3).join(', ')}</td>
                    <td>
                      <div className="table-action-btns">
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => onNavigate(`student-profile-${st.registerNumber}`)}
                        >
                          Portfolio
                        </button>
                        <button
                          className="btn-danger-icon"
                          onClick={() => handleDeleteStudent(st.id)}
                          title="Remove student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: STAFF */}
      {activeTab === 'staff' && (
        <section className="page-width dashboard-content-section">
          <div className="section-head-with-action">
            <h2>Faculty Roster Management</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddStaffModal(true)}
            >
              <PlusCircle size={16} />
              <span>Add Faculty Member</span>
            </button>
          </div>

          <div className="dashboard-table-container" style={{ marginTop: '16px' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Designation</th>
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((m) => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.designation}</td>
                    <td>{m.specialization}</td>
                    <td>{m.email}</td>
                    <td>
                      <button
                        className="btn-danger-icon"
                        onClick={() => handleDeleteStaff(m.id)}
                        title="Remove faculty"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Staff Modal */}
          {showAddStaffModal && (
            <div className="modal-backdrop" onClick={() => setShowAddStaffModal(false)}>
              <div className="modal-window upload-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setShowAddStaffModal(false)}>
                  <X size={20} />
                </button>
                <h3>Add Faculty Member</h3>
                <form onSubmit={handleAddStaffSubmit} className="auth-form">
                  <div className="form-group">
                    <label>Faculty Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Dr. / Prof."
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="name@ciet.ac.in"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Designation</label>
                    <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)}>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor">Professor</option>
                      <option value="Head of Department">Head of Department</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vehicle Dynamics & Powertrain"
                      value={staffSpec}
                      onChange={(e) => setStaffSpec(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    <span>Add Faculty Record</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 4: DEPARTMENT SETTINGS & INSTAGRAM */}
      {activeTab === 'settings' && (
        <section className="page-width dashboard-content-section">
          <div className="dashboard-card-form" style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div className="card-kicker">
              <Settings size={16} />
              <span>DEPARTMENT IDENTITY & SOCIAL CHANNELS</span>
            </div>
            <h3>Department Vision, Mission & Contact Configuration</h3>
            <p className="muted-text">
              Update editable Vision & Mission texts and configure the official Instagram URL referenced in the website footer.
            </p>

            <form onSubmit={handleSaveSettings} className="auth-form" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Department Vision</label>
                <textarea
                  rows={3}
                  required
                  value={visionText}
                  onChange={(e) => setVisionText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Department Mission (One statement per line)</label>
                <textarea
                  rows={5}
                  required
                  value={missionText}
                  onChange={(e) => setMissionText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>
                  <InstagramIcon size={15} className="inline-social-icon" />
                  Official Instagram URL (Footer Link)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://instagram.com/ciet_mech_official"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                />
                <small className="muted-text">
                  This Instagram URL opens directly when visitors click the Instagram icon in the site footer.
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Department Phone</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                <span>{savingSettings ? 'Saving Settings...' : 'Save Department Settings'}</span>
                <Save size={15} />
              </button>
            </form>
          </div>
        </section>
      )}

      {/* TAB 5: FEED & ANNOUNCEMENTS */}
      {activeTab === 'feed' && (
        <section className="page-width dashboard-content-section">
          <h2>Active Feed Announcements</h2>
          <div className="dashboard-items-grid" style={{ marginTop: '16px' }}>
            {announcements.map((an) => (
              <div key={an.id} className="dash-item-card">
                <div className="dash-item-body">
                  <span className="dash-tag">{an.department}</span>
                  <h4>{an.title}</h4>
                  <p className="dash-desc">{an.description}</p>
                  <div className="dash-card-bottom">
                    <span className="dash-meta-line">{an.date} · {an.uploadedBy}</span>
                    <button
                      className="btn-danger-icon"
                      onClick={() => handleDeleteAnnouncement(an.id)}
                      title="Remove announcement"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'curriculum' && (
        <section className="page-width dashboard-content-section curriculum-admin-section">
          <div className="section-head-with-action">
            <div>
              <h2>Curriculum & Syllabus Management</h2>
              <p>Manage the R2023 searchable catalogue. Verify any edited or newly added content against an approved source before publishing.</p>
            </div>
            <div className="curriculum-admin-links">
              <button className="btn btn-outline btn-sm" onClick={() => onNavigate('curriculum')}>View public curriculum</button>
              <button className="btn btn-outline btn-sm" onClick={() => onNavigate('syllabus')}>Search syllabi</button>
            </div>
          </div>

          <div className="dashboard-card-form curriculum-admin-document">
            <div className="card-kicker"><FileText size={16} /><span>OFFICIAL SOURCE DOCUMENT</span></div>
            <p>{curriculumDocument?.fileName || 'R2023 MECH CURRICULUM AND SYLLABUS.pdf'}</p>
            <div className="curriculum-admin-links">
              <a className="btn btn-secondary btn-sm" href={curriculumDocument?.fileUrl || '/uploads/R2023-MECH-CURRICULUM-AND-SYLLABUS.pdf'} target="_blank" rel="noreferrer">View current PDF</a>
              <form className="curriculum-pdf-upload" onSubmit={handleReplaceCurriculumPdf}>
                <input type="file" accept="application/pdf,.pdf" required onChange={(event) => setCurriculumPdfFile(event.target.files?.[0] || null)} />
                <button className="btn btn-primary btn-sm" type="submit" disabled={!curriculumPdfFile}><Upload size={14} />Stage replacement</button>
              </form>
            </div>
            {pendingCurriculumDocument && <div className="credit-audit-note"><FileText size={16} /><span>Pending re-import: {pendingCurriculumDocument.fileName}. The active public PDF and structured syllabus remain unchanged until this document is re-imported and verified. Run <code>python scripts/import_r2023_curriculum.py &quot;{pendingCurriculumDocument.fileUrl.replace('/uploads/', 'uploads/').split('?')[0]}&quot; data/r2023-curriculum.json</code> to regenerate the local data.</span></div>}
          </div>

          <div className="dashboard-card-form curriculum-admin-form">
            <div className="section-head-with-action">
              <div><h3>{editingCourseCode ? `Edit ${editingCourseCode}` : 'Add a course'}</h3><p>All supplied values are stored in the local curriculum JSON data file.</p></div>
              {editingCourseCode && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingCourseCode(''); setCourseForm({ courseCode: '', courseName: '', semester: '1', category: 'PC', lectureHours: '3', tutorialHours: '0', practicalHours: '0', credits: '3', detailsText: '' }); }}>Cancel edit</button>}
            </div>
            <form className="auth-form" onSubmit={handleSaveCurriculumCourse}>
              <div className="form-row">
                <div className="form-group"><label>Course code</label><input required disabled={Boolean(editingCourseCode)} value={courseForm.courseCode} onChange={(event) => setCourseForm({ ...courseForm, courseCode: event.target.value.toUpperCase() })} placeholder="U23ME..." /></div>
                <div className="form-group"><label>Course name</label><input required value={courseForm.courseName} onChange={(event) => setCourseForm({ ...courseForm, courseName: event.target.value })} /></div>
                <div className="form-group"><label>Semester</label><select value={courseForm.semester} onChange={(event) => setCourseForm({ ...courseForm, semester: event.target.value })}>{editingCourseCode && <option value="">Not assigned / elective pool</option>}{Array.from({ length: 8 }, (_, index) => <option key={index + 1} value={index + 1}>Semester {['I','II','III','IV','V','VI','VII','VIII'][index]}</option>)}</select></div>
                <div className="form-group"><label>Category</label><select value={courseForm.category} onChange={(event) => setCourseForm({ ...courseForm, category: event.target.value })}>{['HS','BS','ES','PC','PCS','PE','OE','EEC','MT','MC','IKS','UHV','EVS','SDG','GENDER SENSITIZATION'].map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
              </div>
              <div className="form-row curriculum-ltpc-fields">
                {['lectureHours','tutorialHours','practicalHours','credits'].map((field, index) => <div className="form-group" key={field}><label>{['L','T','P','C'][index]}</label><input type="number" min="0" value={courseForm[field]} onChange={(event) => setCourseForm({ ...courseForm, [field]: event.target.value })} /></div>)}
              </div>
              <div className="form-group"><label>Official course text / syllabus extraction</label><textarea rows={8} value={courseForm.detailsText} onChange={(event) => setCourseForm({ ...courseForm, detailsText: event.target.value })} placeholder="Paste or edit course content only when verified against the approved official source." /></div>
              <button className="btn btn-primary" type="submit"><Save size={15} /><span>{editingCourseCode ? 'Save course changes' : 'Add course'}</span></button>
            </form>
          </div>

          <div className="curriculum-admin-course-list">
            <div className="section-head-with-action"><div><h2>Imported courses ({curriculumCourses.length})</h2><p>Regulation 2023 · Published by default from the supplied PDF</p></div></div>
            {curriculumCourses.map((course) => (
              <article className="curriculum-admin-course-row" key={course.courseCode}>
                <div className="curriculum-admin-course-info"><strong>{course.courseCode}</strong><span>{course.courseName}</span><small>{course.semester ? `Semester ${['I','II','III','IV','V','VI','VII','VIII'][course.semester - 1]}` : 'Elective offering'} · {course.category || 'verify category'} · {course.credits ?? '—'} credits</small></div>
                <div className="curriculum-admin-course-actions">
                  <span className={`curriculum-published-status ${course.published === false ? 'unpublished' : ''}`}>{course.published === false ? 'Unpublished' : 'Official / Published'}</span>
                  <button className="btn btn-secondary btn-xs" onClick={() => handleEditCurriculumCourse(course)}><Edit size={13} />Edit</button>
                  <button className="btn btn-outline btn-xs" onClick={() => api.updateCurriculumCourse(course.courseCode, { published: course.published === false }).then(refreshCurriculum).catch((err) => addToast(err.message, 'error'))}>{course.published === false ? 'Publish' : 'Unpublish'}</button>
                  <button className="btn-danger-icon" onClick={() => handleDeleteCurriculumCourse(course.courseCode)} title={`Delete ${course.courseCode}`}><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
