import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Mail,
  Phone,
  Share2,
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
  Download,
  FolderGit2,
  CheckCircle,
  Tag,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { InstagramIcon, LinkedInIcon, GitHubIcon } from '../components/SocialIcons';
import { api } from '../services/api';
import { BlueprintGrid, TechBadge, SectionDivider } from '../components/MechanicalDecor';
import { useToast } from '../components/Toast';

export const StudentPublicProfile = ({ registerNumber, onBack }) => {
  const { addToast } = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'certificates' | 'achievements' | 'gallery'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getStudentByReg(registerNumber);
        setStudent(data);
      } catch (err) {
        console.error('Failed to load student profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (registerNumber) {
      fetchProfile();
    }
  }, [registerNumber]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      addToast('Profile portfolio link copied to clipboard!', 'success');
    } else {
      addToast(`Share URL: ${url}`, 'info');
    }
  };

  if (loading) {
    return (
      <div className="interior-page-container">
        <BlueprintGrid />
        <div className="feed-loading-state" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
          <p>Loading student portfolio record for {registerNumber}...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="interior-page-container">
        <BlueprintGrid />
        <div className="page-width empty-state-box" style={{ margin: '80px auto' }}>
          <h2>Student Profile Not Found</h2>
          <p>No student with registration number <strong>{registerNumber}</strong> exists in the database.</p>
          <button className="btn btn-primary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Return to Student Directory</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-portfolio-page">
      <BlueprintGrid />

      {/* Top Navigation & Share Bar */}
      <div className="page-width profile-top-bar">
        <button className="back-link-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Students</span>
        </button>

        <div className="share-actions">
          <button className="btn btn-outline btn-sm" onClick={handleShare}>
            <Share2 size={14} />
            <span>Share Portfolio</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <section className="page-width student-hero-card">
        <div className="student-hero-inner">
          <div className="student-profile-photo-wrapper">
            <img
              src={student.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'}
              alt={student.name}
              className="student-profile-large-img"
            />
            <div className="student-status-badge">
              <span className="dot" />
              <span>CIET MECH</span>
            </div>
          </div>

          <div className="student-bio-block">
            <div className="student-meta-strip">
              <span className="reg-badge">{student.registerNumber}</span>
              <span className="batch-badge">Batch {student.batch}</span>
              <span className="year-badge">{student.yearOfStudy} · Sec {student.section}</span>
            </div>

            <h1 className="student-profile-title">{student.name}</h1>
            <p className="student-tagline">Department of Mechanical Engineering, CIET Coimbatore</p>

            <p className="student-full-about">{student.about}</p>

            {/* Social & Contact Row */}
            <div className="student-contact-social-row">
              {student.email && (
                <a href={`mailto:${student.email}`} className="contact-chip">
                  <Mail size={14} />
                  <span>{student.email}</span>
                </a>
              )}
              {student.phone && (
                <a href={`tel:${student.phone}`} className="contact-chip">
                  <Phone size={14} />
                  <span>{student.phone}</span>
                </a>
              )}
              {student.socialLinks?.linkedin && (
                <a
                  href={student.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-chip linkedin"
                  title="LinkedIn Profile"
                >
                  <LinkedInIcon size={15} />
                  <span>LinkedIn</span>
                </a>
              )}
              {student.socialLinks?.github && (
                <a
                  href={student.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-chip github"
                  title="GitHub Profile"
                >
                  <GitHubIcon size={15} />
                  <span>GitHub</span>
                </a>
              )}
              {student.socialLinks?.instagram && (
                <a
                  href={student.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-chip instagram"
                  title="Instagram Profile"
                >
                  <InstagramIcon size={15} />
                  <span>Instagram</span>
                </a>
              )}
            </div>

            {/* Technical Skills List */}
            {student.skills && student.skills.length > 0 && (
              <div className="profile-skills-block">
                <span className="skills-heading">Technical Competencies & Tools:</span>
                <div className="skills-badge-wrap">
                  {student.skills.map((skill, index) => (
                    <span key={index} className="skill-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs Navigation: Projects, Certificates, Achievements, Gallery */}
      <section className="page-width portfolio-tabs-strip">
        <button
          className={`portfolio-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderGit2 size={16} />
          <span>Projects ({(student.projects || []).length})</span>
        </button>

        <button
          className={`portfolio-tab ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          <Award size={16} />
          <span>Certifications ({(student.certificates || []).length})</span>
        </button>

        <button
          className={`portfolio-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <Sparkles size={16} />
          <span>Achievements & Events ({(student.achievements || []).length})</span>
        </button>

        <button
          className={`portfolio-tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <Tag size={16} />
          <span>Project Gallery ({(student.galleryImages || []).length})</span>
        </button>
      </section>

      {/* TAB CONTENT: PROJECTS */}
      {activeTab === 'projects' && (
        <section className="page-width portfolio-content-section">
          {(!student.projects || student.projects.length === 0) ? (
            <div className="empty-state-box">
              <p>No engineering projects listed yet.</p>
            </div>
          ) : (
            <div className="portfolio-projects-grid">
              {student.projects.map((proj, idx) => (
                <div key={idx} className="project-display-card">
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
                        <strong>Stack / Tools:</strong> {proj.techStack}
                      </div>
                    )}
                    <div className="project-links-row">
                      {proj.github && (
                        <a
                          href={proj.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          <GitHubIcon size={14} />
                          <span>Code Repository</span>
                        </a>
                      )}
                      {proj.liveDemo && (
                        <a
                          href={proj.liveDemo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          <ExternalLink size={14} />
                          <span>Demo / Report</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <section className="page-width portfolio-content-section">
          {(!student.certificates || student.certificates.length === 0) ? (
            <div className="empty-state-box">
              <p>No certificates uploaded yet.</p>
            </div>
          ) : (
            <div className="portfolio-certificates-grid">
              {student.certificates.map((cert, idx) => (
                <div key={idx} className="cert-display-card">
                  <div className="cert-icon-wrapper">
                    <Award size={24} />
                  </div>
                  <div className="cert-body">
                    <span className="cert-date">{cert.date}</span>
                    <h4 className="cert-title">{cert.title}</h4>
                    <p className="cert-org">Issued by: <strong>{cert.issuingOrganization}</strong></p>
                    {cert.description && <p className="cert-desc">{cert.description}</p>}
                    {cert.fileUrl && (
                      <a
                        href={cert.fileUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <Download size={13} />
                        <span>Download Credential</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT: ACHIEVEMENTS & EVENT PARTICIPATION */}
      {activeTab === 'achievements' && (
        <section className="page-width portfolio-content-section">
          <div className="achievements-two-column">
            <div className="achievements-col">
              <h3 className="section-subtitle">
                <Sparkles size={18} />
                <span>Honors & Awards</span>
              </h3>
              {(!student.achievements || student.achievements.length === 0) ? (
                <p className="empty-text">No awards recorded.</p>
              ) : (
                <ul className="achievements-list">
                  {student.achievements.map((ach, idx) => (
                    <li key={idx} className="achievement-item">
                      <CheckCircle size={16} className="check-icon" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="achievements-col">
              <h3 className="section-subtitle">
                <Calendar size={18} />
                <span>Symposia & Events Participated</span>
              </h3>
              {(!student.eventsParticipated || student.eventsParticipated.length === 0) ? (
                <p className="empty-text">No event records listed.</p>
              ) : (
                <ul className="achievements-list">
                  {student.eventsParticipated.map((ev, idx) => (
                    <li key={idx} className="achievement-item">
                      <Wrench size={15} className="wrench-icon" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB CONTENT: GALLERY */}
      {activeTab === 'gallery' && (
        <section className="page-width portfolio-content-section">
          {(!student.galleryImages || student.galleryImages.length === 0) ? (
            <div className="empty-state-box">
              <p>No project prototype captures uploaded yet.</p>
            </div>
          ) : (
            <div className="student-gallery-grid">
              {student.galleryImages.map((img, idx) => (
                <div key={idx} className="student-gallery-item">
                  <img src={img} alt={`Student prototype ${idx + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
