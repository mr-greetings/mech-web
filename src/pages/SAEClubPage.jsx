import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  Users,
  Wrench,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Shield,
  Zap,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { BlueprintGrid, TechBadge, SectionDivider } from '../components/MechanicalDecor';

export const SAEClubPage = ({ onNavigate }) => {
  const [saeData, setSaeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSae = async () => {
      try {
        setLoading(true);
        const data = await api.getSaeInfo();
        setSaeData(data);
      } catch (err) {
        console.error('Failed to load SAE info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSae();
  }, []);

  if (loading) {
    return (
      <div className="interior-page-container">
        <BlueprintGrid />
        <div className="feed-loading-state" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
          <p>Loading SAE Collegiate Club portal...</p>
        </div>
      </div>
    );
  }

  const {
    title = 'CIET SAE Collegiate Club',
    motto = 'Design. Build. Race. Inspire.',
    about = '',
    divisions = [],
    activities = [],
    events = [],
    members = [],
    achievements = [],
    projects = [],
    gallery = [],
    announcements = [],
  } = saeData || {};

  return (
    <div className="interior-page-container sae-portal-page">
      <BlueprintGrid />

      {/* Hero Header */}
      <section className="sae-hero-banner page-width">
        <div className="sae-hero-content">
          <div className="sae-tag-strip">
            <span className="sae-flame-badge">
              <Flame size={15} />
              <span>COLLEGIATE MOTORSPORT COLLECTIVE</span>
            </span>
            <span className="sae-affiliation">AFFILIATED TO SAEINDIA SOUTHERN SECTION</span>
          </div>

          <h1 className="sae-hero-title">{title}</h1>
          <p className="sae-motto-text">"{motto}"</p>
          <p className="sae-lead-text">{about}</p>

          <div className="sae-hero-actions">
            <button className="btn btn-primary" onClick={() => onNavigate('events')}>
              <span>View Racing Events</span>
              <ArrowUpRight size={16} />
            </button>
            <button className="btn btn-outline" onClick={() => onNavigate('gallery')}>
              <span>Workshop Gallery</span>
            </button>
          </div>
        </div>

        <div className="sae-hero-media">
          <img
            src="https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=85"
            alt="CIET SAE Racing Team in Action"
            className="sae-hero-img"
          />
        </div>
      </section>

      {/* Active Club Announcements if any */}
      {announcements && announcements.length > 0 && (
        <section className="page-width sae-announcements-bar">
          <div className="announcements-header">
            <Zap size={17} />
            <span>Latest Club Updates:</span>
          </div>
          <div className="announcements-list">
            {announcements.map((an, i) => (
              <div key={i} className="sae-announcement-chip">
                {an}
              </div>
            ))}
          </div>
        </section>
      )}

      <SectionDivider label="COMPETITIVE RACING DIVISIONS" />

      {/* Flagship Divisions Grid (BAJA, SUPRA, E-Kart, Aero Design) */}
      <section className="page-width sae-divisions-section">
        <div className="section-intro">
          <h2>Engineering Wings & Vehicle Categories</h2>
          <p>Four specialized student divisions designing vehicles according to strict international collegiate rulebooks.</p>
        </div>

        <div className="divisions-grid">
          {divisions.map((div, idx) => (
            <div key={idx} className="division-card">
              <div className="division-card-header">
                <span className="division-num">0{idx + 1}</span>
                <h3 className="division-name">{div.name}</h3>
              </div>
              <p className="division-desc">{div.description}</p>
              <div className="division-specs-box">
                <strong>Specs:</strong> {div.vehicleSpecs}
              </div>
              <div className="division-lead-line">
                <Users size={14} />
                <span>Division Lead: <strong>{div.captain}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionDivider label="ACHIEVEMENTS & PROTOTYPES" />

      {/* Achievements & Current Projects */}
      <section className="page-width sae-two-col-showcase">
        <div className="showcase-col">
          <div className="col-header">
            <Award size={20} className="col-icon" />
            <h3>National Trophies & Honors</h3>
          </div>
          <ul className="sae-trophies-list">
            {achievements.map((ach, idx) => (
              <li key={idx} className="trophy-item">
                <Sparkles size={16} />
                <span>{ach}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="showcase-col">
          <div className="col-header">
            <Wrench size={20} className="col-icon" />
            <h3>Under Active Development</h3>
          </div>
          <div className="sae-projects-list">
            {projects.map((proj, idx) => (
              <div key={idx} className="sae-project-box">
                <div className="sae-proj-head">
                  <h4>{proj.title}</h4>
                  <span className="sae-status-pill">{proj.status}</span>
                </div>
                <p>{proj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Executive Committee */}
      <section className="page-width sae-team-section">
        <div className="section-intro">
          <h2>Collegiate Club Office Bearers</h2>
          <p>Student leaders and faculty advisors steering our design, dynamic validation, and sponsorship operations.</p>
        </div>

        <div className="sae-members-grid">
          {members.map((m, idx) => (
            <div key={idx} className="sae-member-card">
              <div className="member-avatar-circle">
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="member-info">
                <h4>{m.name}</h4>
                <p className="member-role">{m.role}</p>
                <span className="member-batch">{m.batch}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activities & Bootcamps Strip */}
      <section className="page-width sae-activities-section">
        <div className="activities-card">
          <h3>Annual Hands-on Bootcamps</h3>
          <div className="activities-chips-cloud">
            {activities.map((act, idx) => (
              <div key={idx} className="act-chip">
                <CheckCircle size={15} />
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
