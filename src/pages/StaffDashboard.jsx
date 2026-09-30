import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Upload,
  UserCheck,
  Search,
  PlusCircle,
  Trash2,
  Edit,
  ExternalLink,
  Download,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
  Eye,
  X,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';

export const StaffDashboard = ({ onNavigate }) => {
  const { user, isStaff, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'events' | 'uploads' | 'profile'
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchStudent, setSearchStudent] = useState('');
  const [viewingStudent, setViewingStudent] = useState(null);

  // New Event Form State
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('09:30 AM');
  const [eventVenue, setEventVenue] = useState('CIET Mechanical Workshop');
  const [eventCategory, setEventCategory] = useState('Workshops');
  const [eventRegLink, setEventRegLink] = useState('');
  const [eventPosterFile, setEventPosterFile] = useState(null);
  const [eventBrochureFile, setEventBrochureFile] = useState(null);
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Upload Management State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementDesc, setAnnouncementDesc] = useState('');
  const [announcementImageFile, setAnnouncementImageFile] = useState(null);
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);

  // Staff Profile State
  const [staffProfile, setStaffProfile] = useState({
    name: user?.name || '',
    designation: 'Associate Professor',
    qualification: 'M.E., Ph.D.',
    specialization: 'Thermal Systems / CAD',
    experience: '12 Years',
    email: user?.email || '',
    phone: user?.phone || '',
    about: '',
    publications: '',
    areasOfInterest: ['Thermal Systems', 'CAD/CAM', 'Renewable Energy'],
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Load initial data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [batchData, studentData, eventData, staffData] = await Promise.all([
        api.getBatches(),
        api.getStudents(),
        api.getEvents(),
        api.getStaff(),
      ]);
      setBatches(batchData || []);
      setStudents(studentData || []);
      setEvents(eventData || []);

      // If current staff member exists, preload profile
      if (staffData && user) {
        const found = staffData.find((s) => s.email === user.email || s.id === user.staffId);
        if (found) {
          setStaffProfile({
            ...found,
            areasOfInterest: Array.isArray(found.areasOfInterest) ? found.areasOfInterest : [],
          });
        }
      }
    } catch (err) {
      console.error('Failed to load staff dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter students based on selected batch and search
  const filteredStudents = students.filter((s) => {
    const matchesBatch =
      selectedBatch === 'ALL' ||
      s.batch === selectedBatch ||
      s.academicYear === selectedBatch ||
      (s.batch && s.batch.replace(/\s+/g, '') === selectedBatch.replace(/\s+/g, ''));

    const matchesSearch =
      !searchStudent ||
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.skills && s.skills.some((sk) => sk.toLowerCase().includes(searchStudent.toLowerCase())));

    return matchesBatch && matchesSearch;
  });

  // Handler: Create Event with Poster & Brochure upload
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmittingEvent(true);
    try {
      let posterUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85';
      let brochureUrl = '';

      if (eventPosterFile) {
        const posterRes = await api.uploadFile(eventPosterFile);
        posterUrl = posterRes.file.url;
      }
      if (eventBrochureFile) {
        const brochureRes = await api.uploadFile(eventBrochureFile);
        brochureUrl = brochureRes.file.url;
      }

      await api.createEvent({
        title: eventTitle,
        description: eventDesc,
        date: eventDate,
        time: eventTime,
        venue: eventVenue,
        category: eventCategory,
        registrationLink: eventRegLink,
        poster: posterUrl,
        brochure: brochureUrl,
        organizers: `${user?.name || 'Faculty'}, Department of Mechanical Engineering`,
        status: 'upcoming',
      });

      addToast('Event published successfully! It is now live on the Feed and Events page.', 'success');
      setShowEventForm(false);
      setEventTitle('');
      setEventDesc('');
      setEventDate('');
      setEventPosterFile(null);
      setEventBrochureFile(null);
      loadDashboardData();
    } catch (err) {
      addToast(err.message || 'Failed to publish event.', 'error');
    } finally {
      setSubmittingEvent(false);
    }
  };

  // Handler: Delete Event
  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to remove this event?')) return;
    try {
      await api.deleteEvent(id);
      addToast('Event deleted.', 'info');
      loadDashboardData();
    } catch (err) {
      addToast(err.message || 'Failed to delete event.', 'error');
    }
  };

  // Handler: Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setSubmittingAnnouncement(true);
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=85';
      if (announcementImageFile) {
        const res = await api.uploadFile(announcementImageFile);
        imageUrl = res.file.url;
      }

      await api.createAnnouncement({
        title: announcementTitle,
        description: announcementDesc,
        date: new Date().toISOString().slice(0, 10),
        uploadedBy: user?.name || 'Staff Desk',
        department: 'Mechanical Engineering',
        image: imageUrl,
      });

      addToast('Announcement posted! It now appears on the Department Feed.', 'success');
      setAnnouncementTitle('');
      setAnnouncementDesc('');
      setAnnouncementImageFile(null);
    } catch (err) {
      addToast(err.message || 'Failed to post announcement.', 'error');
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  // Handler: Save Staff Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (staffProfile.id) {
        await api.updateStaff(staffProfile.id, staffProfile);
      } else {
        await api.createStaff(staffProfile);
      }
      addToast('Faculty profile updated successfully.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="interior-page-container dashboard-page">
      <BlueprintGrid />

      {/* Header Band */}
      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="STAFF MANAGEMENT CONSOLE" code="ME-DASH-STF" variant="amber" />
          <h1 className="page-title">Faculty & Staff Dashboard</h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.name}</strong>. Manage academic batches, track student portfolios, publish symposium events, and upload department resources.
          </p>
        </div>

        <div className="dashboard-stats-strip">
          <div className="dash-stat-pill">
            <strong>{students.length}</strong>
            <span>Total Students</span>
          </div>
          <div className="dash-stat-pill">
            <strong>{batches.length}</strong>
            <span>Active Batches</span>
          </div>
          <div className="dash-stat-pill">
            <strong>{events.length}</strong>
            <span>Events Listed</span>
          </div>
        </div>
      </section>

      <section className="page-width official-dashboard-academic-links">
        <button className="dash-tab-btn" onClick={() => onNavigate('curriculum')}>
          <GraduationCap size={16} /><span>View Official Curriculum</span>
        </button>
        <button className="dash-tab-btn" onClick={() => onNavigate('syllabus')}>
          <BookOpen size={16} /><span>Search Course Syllabi</span>
        </button>
      </section>

      {/* Dashboard Tabs Bar */}
      <section className="page-width dashboard-nav-strip">
        <button
          className={`dash-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={16} />
          <span>Batch Students Management</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar size={16} />
          <span>Event & Symposium Manager</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
        >
          <Upload size={16} />
          <span>Post Announcement / Resources</span>
        </button>

        <button
          className={`dash-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserCheck size={16} />
          <span>Edit My Faculty Profile</span>
        </button>
      </section>

      {/* TAB 1: BATCH-WISE STUDENT MANAGEMENT */}
      {activeTab === 'students' && (
        <section className="page-width dashboard-content-section">
          {/* Batch Selector Toolbar */}
          <div className="dashboard-batch-toolbar">
            <div className="batch-pick-box">
              <label>Select Academic Batch to Inspect:</label>
              <div className="batch-chips-container">
                <button
                  className={`batch-chip-btn ${selectedBatch === 'ALL' ? 'active' : ''}`}
                  onClick={() => setSelectedBatch('ALL')}
                >
                  All Batches ({students.length})
                </button>
                {batches.map((b) => (
                  <button
                    key={b.id}
                    className={`batch-chip-btn ${selectedBatch === b.label ? 'active' : ''}`}
                    onClick={() => setSelectedBatch(b.label)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="search-field-wrap" style={{ maxWidth: '380px' }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search students by name, reg no, or skill..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>
          </div>

          {/* Student Table / Cards */}
          <div className="dashboard-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Register Number</th>
                  <th>Batch / Year</th>
                  <th>Section</th>
                  <th>Core Skills</th>
                  <th>Projects & Certs</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty-cell">
                      No students found for batch "{selectedBatch}".
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr key={st.id}>
                      <td>
                        <div className="table-user-cell">
                          <img
                            src={st.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                            alt=""
                            className="table-avatar"
                          />
                          <div>
                            <strong>{st.name}</strong>
                            <small>{st.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="mono-badge">{st.registerNumber}</span>
                      </td>
                      <td>
                        <div>{st.batch}</div>
                        <small className="muted-text">{st.yearOfStudy}</small>
                      </td>
                      <td>Section {st.section || 'A'}</td>
                      <td>
                        <div className="table-tags-wrap">
                          {(st.skills || []).slice(0, 3).map((sk, i) => (
                            <span key={i} className="skill-chip-sm">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="metrics-pill">
                          {(st.projects || []).length} Proj · {(st.certificates || []).length} Certs
                        </span>
                      </td>
                      <td>
                        <div className="table-action-btns">
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => setViewingStudent(st)}
                            title="Quick View Details"
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => onNavigate(`student-profile-${st.registerNumber}`)}
                            title="Open Public Shareable Portfolio"
                          >
                            <ArrowUpRight size={13} />
                            <span>Portfolio</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: EVENT MANAGEMENT */}
      {activeTab === 'events' && (
        <section className="page-width dashboard-content-section">
          <div className="section-head-with-action">
            <div>
              <h2>Events & Symposium Manager</h2>
              <p>Events published here automatically broadcast to the Department Feed and public Events calendar.</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowEventForm(!showEventForm)}
            >
              <PlusCircle size={16} />
              <span>{showEventForm ? 'Cancel Creation' : 'Create New Event'}</span>
            </button>
          </div>

          {/* New Event Form */}
          {showEventForm && (
            <div className="dashboard-card-form">
              <h3>Publish New Department Event</h3>
              <form onSubmit={handleCreateEvent} className="auth-form">
                <div className="form-group">
                  <label>Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MECHATHON ’26 / 36-Hour Autonomous Mobility Sprint"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full agenda, judging rubrics, eligibility, and prize pool..."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Event Date</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Time / Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM – 04:30 PM"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={eventCategory}
                      onChange={(e) => setEventCategory(e.target.value)}
                    >
                      <option value="Hackathon / Innovation">Hackathon / Innovation</option>
                      <option value="Workshops">Workshops</option>
                      <option value="Seminars">Seminars</option>
                      <option value="Industrial Visits">Industrial Visits</option>
                      <option value="Competitions">Competitions</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Campus Venue</label>
                    <input
                      type="text"
                      placeholder="e.g. Advanced CAD Lab, Mechanical Block, CIET"
                      value={eventVenue}
                      onChange={(e) => setEventVenue(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Online Registration Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://ciet.ac.in/register/..."
                      value={eventRegLink}
                      onChange={(e) => setEventRegLink(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Event Poster Image (JPG, PNG, WEBP)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEventPosterFile(e.target.files[0])}
                    />
                  </div>

                  <div className="form-group">
                    <label>Official Brochure Document (PDF)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setEventBrochureFile(e.target.files[0])}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={submittingEvent}
                >
                  <span>{submittingEvent ? 'Publishing Event...' : 'Publish Event to Feed & Website'}</span>
                  <ArrowUpRight size={16} />
                </button>
              </form>
            </div>
          )}

          {/* Events List */}
          <div className="dashboard-items-grid">
            {events.map((ev) => (
              <div key={ev.id} className="dash-item-card">
                <img
                  src={ev.poster || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85'}
                  alt=""
                  className="dash-item-thumb"
                />
                <div className="dash-item-body">
                  <span className="dash-tag">{ev.category}</span>
                  <h4>{ev.title}</h4>
                  <div className="dash-meta-line">
                    <Clock size={13} />
                    <span>{ev.date} · {ev.venue}</span>
                  </div>
                  <p className="dash-desc">{ev.description.slice(0, 110)}...</p>

                  <div className="dash-card-bottom">
                    <span className="status-indicator">{ev.status}</span>
                    <button
                      className="btn-danger-icon"
                      onClick={() => handleDeleteEvent(ev.id)}
                      title="Delete Event"
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

      {/* TAB 3: ANNOUNCEMENTS & BROCHURES UPLOAD */}
      {activeTab === 'uploads' && (
        <section className="page-width dashboard-content-section">
          <div className="upload-panels-row">
            {/* Announcement Broadcast Form */}
            <div className="dashboard-card-form" style={{ flex: 1 }}>
              <div className="card-kicker">
                <Sparkles size={16} />
                <span>DYNAMIC FEED BROADCAST</span>
              </div>
              <h3>Publish Department Announcement</h3>
              <p className="muted-text">
                Broadcast messages, recruitment notices, or seminar updates directly into the Department Feed.
              </p>

              <form onSubmit={handleCreateAnnouncement} className="auth-form" style={{ marginTop: '16px' }}>
                <div className="form-group">
                  <label>Announcement Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAE BAJA 2027 Driver Selection Trials"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Notice Content</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide full announcement details, deadlines, and contact information..."
                    value={announcementDesc}
                    onChange={(e) => setAnnouncementDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Banner Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAnnouncementImageFile(e.target.files[0])}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={submittingAnnouncement}
                >
                  <span>{submittingAnnouncement ? 'Publishing...' : 'Broadcast to Feed'}</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: FACULTY PROFILE MANAGEMENT */}
      {activeTab === 'profile' && (
        <section className="page-width dashboard-content-section">
          <div className="dashboard-card-form" style={{ maxWidth: '780px', margin: '0 auto' }}>
            <div className="card-kicker">
              <UserCheck size={16} />
              <span>FACULTY CREDENTIALS</span>
            </div>
            <h3>Edit My Faculty Profile</h3>
            <p className="muted-text">
              Keep your research publications, qualifications, and areas of interest up to date for student mentorship.
            </p>

            <form onSubmit={handleSaveProfile} className="auth-form" style={{ marginTop: '20px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={staffProfile.name}
                    onChange={(e) => setStaffProfile({ ...staffProfile, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    required
                    value={staffProfile.designation}
                    onChange={(e) => setStaffProfile({ ...staffProfile, designation: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Academic Qualification</label>
                  <input
                    type="text"
                    required
                    value={staffProfile.qualification}
                    onChange={(e) => setStaffProfile({ ...staffProfile, qualification: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    required
                    value={staffProfile.specialization}
                    onChange={(e) => setStaffProfile({ ...staffProfile, specialization: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teaching & Industry Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 Years"
                    value={staffProfile.experience}
                    onChange={(e) => setStaffProfile({ ...staffProfile, experience: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    value={staffProfile.phone}
                    onChange={(e) => setStaffProfile({ ...staffProfile, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>About / Academic Philosophy</label>
                <textarea
                  rows={3}
                  value={staffProfile.about}
                  onChange={(e) => setStaffProfile({ ...staffProfile, about: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Journal Publications & Patents</label>
                <textarea
                  rows={3}
                  placeholder="List indexed papers, patents, and text book publications..."
                  value={staffProfile.publications}
                  onChange={(e) => setStaffProfile({ ...staffProfile, publications: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Research Areas (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Electric Vehicles, CFD, Thermal Storage"
                  value={Array.isArray(staffProfile.areasOfInterest) ? staffProfile.areasOfInterest.join(', ') : ''}
                  onChange={(e) =>
                    setStaffProfile({
                      ...staffProfile,
                      areasOfInterest: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Student Inspect Modal */}
      {viewingStudent && (
        <div className="modal-backdrop" onClick={() => setViewingStudent(null)}>
          <div className="modal-window student-inspect-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setViewingStudent(null)}>
              <X size={20} />
            </button>

            <div className="inspect-head">
              <img
                src={viewingStudent.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
                alt=""
                className="inspect-avatar"
              />
              <div>
                <h2>{viewingStudent.name}</h2>
                <div className="inspect-meta">
                  <span className="mono-badge">{viewingStudent.registerNumber}</span>
                  <span>Batch {viewingStudent.batch}</span>
                  <span>Sec {viewingStudent.section} · {viewingStudent.yearOfStudy}</span>
                </div>
              </div>
            </div>

            <div className="inspect-body">
              <p><strong>Bio:</strong> {viewingStudent.about}</p>
              <p><strong>Contact:</strong> {viewingStudent.email} · {viewingStudent.phone}</p>

              <h4>Skills</h4>
              <div className="skills-badge-wrap">
                {(viewingStudent.skills || []).map((sk, i) => (
                  <span key={i} className="skill-chip">{sk}</span>
                ))}
              </div>

              <h4>Projects ({(viewingStudent.projects || []).length})</h4>
              {(viewingStudent.projects || []).map((p, i) => (
                <div key={i} className="inspect-proj-card">
                  <strong>{p.title}</strong>
                  <p>{p.description}</p>
                </div>
              ))}

              <h4>Certificates ({(viewingStudent.certificates || []).length})</h4>
              {(viewingStudent.certificates || []).map((c, i) => (
                <div key={i} className="inspect-cert-item">
                  <span>{c.title} — <em>{c.issuingOrganization}</em></span>
                </div>
              ))}
            </div>

            <div className="inspect-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const reg = viewingStudent.registerNumber;
                  setViewingStudent(null);
                  onNavigate(`student-profile-${reg}`);
                }}
              >
                <span>Open Full Public Portfolio</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
