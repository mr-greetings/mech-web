import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpRight,
  ChevronRight,
  Calendar,
  Download,
  Filter,
  Search,
  Sparkles,
  ExternalLink,
  Flame,
  Clock,
  Layers,
  Award,
  Compass,
  FileText,
  GraduationCap,
  User,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { BlueprintGrid, TechBadge, SectionDivider } from '../components/MechanicalDecor';

export const HomePage = ({ onNavigate, onSelectEvent }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await api.getFeed();
      setFeedItems(data || []);
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const filteredFeed = useMemo(() => {
    return feedItems.filter((item) => {
      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'EVENTS' && item.type === 'EVENT') ||
        (activeFilter === 'ANNOUNCEMENTS' && item.type === 'ANNOUNCEMENT') ||
        (activeFilter === 'BROCHURES' && item.type === 'BROCHURE') ||
        (activeFilter === 'ACHIEVEMENTS' && item.type === 'ACHIEVEMENT') ||
        (activeFilter === 'ACADEMICS' && item.type === 'CURRICULUM');

      const matchesSearch =
        !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.uploadedBy?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [feedItems, activeFilter, searchQuery]);

  return (
    <div className="home-page-container">
      <BlueprintGrid />

      {/* Hero Section */}
      <section className="hero-section page-width">
        <div className="hero-content">
          <div className="hero-kicker">
            <TechBadge label="DEPARTMENT PORTAL · COIMBATORE" code="MECH // 2026" variant="blue" />
            <span className="live-pulse-badge">
              <span className="live-dot" /> LIVE STREAM
            </span>
          </div>

          <h1 className="hero-main-title">
            PRECISION <span className="title-highlight">DESIGN</span>.<br />
            AUTONOMOUS <span className="title-accent">MOMENTUM</span>.
          </h1>

          <p className="hero-lead">
            Welcome to the digital portal of the <strong>Department of Mechanical Engineering, CIET Coimbatore</strong>.
            A modern collective turning advanced CAD, thermodynamics, additive manufacturing, and collegiate motorsport into working reality.
          </p>

          <div className="hero-cta-group">
            <button className="btn btn-primary" onClick={() => onNavigate('events')}>
              <span>Explore Symposia & Events</span>
              <ArrowUpRight size={17} />
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('sae')}>
              <span>SAE Collegiate Racing</span>
              <ChevronRight size={17} />
            </button>
            <button className="btn btn-outline" onClick={() => onNavigate('students')}>
              <span>Student Portfolios</span>
            </button>
          </div>
        </div>

        {/* Hero Visual Mechanical Cad Display */}
        <div className="hero-cad-visual">
          <div className="cad-chassis-frame">
            <div className="rotating-cam-gear gear-large" />
            <div className="rotating-cam-gear gear-small" />
            <div className="cad-coordinates-box">
              <div className="cad-spec-line">LAT: 11.0168° N · LON: 76.9558° E</div>
              <div className="cad-spec-line">CAD MODEL: CIET-MECH-SP26</div>
              <div className="cad-spec-line">STATUS: FULL PRODUCTION</div>
            </div>
            <div className="blueprint-stamp">
              <svg className="stamp-art" viewBox="0 0 160 160" role="img" aria-label="CIET Mechanical Engineering, Coimbatore, established 2001">
                <defs>
                  <path id="stamp-top-curve" d="M 25 80 A 55 55 0 0 1 135 80" />
                  <path id="stamp-bottom-curve" d="M 135 80 A 55 55 0 0 1 25 80" />
                </defs>
                <g className="stamp-orbit">
                  <circle className="stamp-ring-outer" cx="80" cy="80" r="75" />
                  <circle className="stamp-ring-inner" cx="80" cy="80" r="57" />
                  <text className="stamp-curved-text stamp-top-text">
                    <textPath href="#stamp-top-curve" startOffset="50%" textAnchor="middle">CIET • MECHANICAL ENGINEERING</textPath>
                  </text>
                  <text className="stamp-curved-text stamp-bottom-text">
                    <textPath href="#stamp-bottom-curve" startOffset="50%" textAnchor="middle">COIMBATORE • EST. 2001</textPath>
                  </text>
                  <text className="stamp-star" x="20" y="84" textAnchor="middle">✳</text>
                  <text className="stamp-star" x="140" y="84" textAnchor="middle">✳</text>
                </g>
                <text className="stamp-year" x="80" y="87" textAnchor="middle">2001</text>
                <text className="stamp-center-caption" x="80" y="101" textAnchor="middle">MECHANICAL</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Bar / Key Statistics */}
      <section className="signal-bar page-width">
        <div className="signal-col">
          <span className="signal-label">ACADEMIC BATCHES</span>
          <strong className="signal-val">4 Batches</strong>
          <span className="signal-sub">2023–27 · 2024–28 · 2025–29 · 2026–30</span>
        </div>
        <div className="signal-col">
          <span className="signal-label">RESEARCH & CAD LABS</span>
          <strong className="signal-val">8 Centers</strong>
          <span className="signal-sub">Siemens CoE, Robotics, Thermal, Mechatronics</span>
        </div>
        <div className="signal-col">
          <span className="signal-label">COLLEGIATE RACING</span>
          <strong className="signal-val">SAE Club</strong>
          <span className="signal-sub">BAJA, SUPRA, E-Kart, Aero Design Wings</span>
        </div>
        <div className="signal-col">
          <span className="signal-label">LIVE FEED NOTICES</span>
          <strong className="signal-val">{feedItems.length} Records</strong>
          <span className="signal-sub">Updated dynamically by Faculty & Staff</span>
        </div>
      </section>

      <SectionDivider label="DEPARTMENT BROADCAST STREAM" />

      {/* DYNAMIC FEED SECTION */}
      <section className="feed-hub-section page-width">
        <div className="feed-header-bar">
          <div>
            <span className="section-eyebrow">01 // OFFICIAL FEED</span>
            <h2 className="feed-section-heading">Department Feed & Announcements</h2>
            <p className="feed-section-desc">
              All events, workshop brochures, achievements, and notifications published by staff automatically sync here in real time.
            </p>
          </div>

          <div className="feed-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search announcements, events, brochures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Feed Category Tabs */}
        <div className="feed-filter-tabs">
          {[
            { id: 'ALL', label: 'All Feed' },
            { id: 'EVENTS', label: 'Events & Workshops' },
            { id: 'ANNOUNCEMENTS', label: 'Announcements' },
            { id: 'BROCHURES', label: 'Brochures' },
            { id: 'ACHIEVEMENTS', label: 'Student Achievements' },
            { id: 'ACADEMICS', label: 'Curriculum & Syllabus' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`filter-tab-btn ${activeFilter === tab.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed Cards Grid */}
        {loading ? (
          <div className="feed-loading-state">
            <div className="spinner" />
            <p>Streaming department activity from server...</p>
          </div>
        ) : filteredFeed.length === 0 ? (
          <div className="empty-feed-card">
            <Layers size={36} />
            <h3>No entries found</h3>
            <p>No activity matches the selected filter or search query.</p>
          </div>
        ) : (
          <div className="feed-cards-grid">
            {filteredFeed.map((item) => (
              <article key={item.id} className={`feed-item-card accent-${item.accent || 'blue'}`}>
                {/* Poster / Thumbnail Wrap */}
                <div className={`feed-card-image-wrap ${item.type === 'CURRICULUM' ? 'curriculum-feed-visual' : ''}`}>
                  {item.type === 'CURRICULUM' ? <GraduationCap size={46} /> : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="feed-card-img"
                      loading="lazy"
                    />
                  )}
                  <div className="feed-type-pill">{item.type}</div>
                  {item.tag && <div className="feed-status-pill">{item.tag}</div>}
                </div>

                {/* Card Body */}
                <div className="feed-card-content">
                  <div className="feed-meta-row">
                    <span className="feed-date">
                      <Clock size={13} />
                      <span>{item.date}</span>
                    </span>
                    <span className="feed-dept-tag">
                      {item.department || 'Mechanical'}
                    </span>
                  </div>

                  <h3 className="feed-card-title">{item.title}</h3>

                  <p className="feed-card-desc">{item.description}</p>

                  <div className="feed-uploader-meta">
                    <User size={13} />
                    <span>Published by: <strong>{item.uploadedBy || 'Staff Desk'}</strong></span>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="feed-actions-row">
                    {item.type === 'CURRICULUM' ? (
                      <>
                        <button className="btn-card-action primary" onClick={() => onNavigate('curriculum')}><span>View Curriculum</span><ArrowUpRight size={14} /></button>
                        <button className="btn-card-action secondary" onClick={() => onNavigate('syllabus')}><span>View Syllabus</span><ArrowUpRight size={14} /></button>
                        <a href="/uploads/R2023-MECH-CURRICULUM-AND-SYLLABUS.pdf" download className="btn-card-action secondary"><Download size={14} /><span>Official PDF</span></a>
                      </>
                    ) : item.type === 'EVENT' ? (
                      <button
                        className="btn-card-action primary"
                        onClick={() => onSelectEvent(item)}
                      >
                        <span>View Details</span>
                        <ArrowUpRight size={14} />
                      </button>
                    ) : item.type === 'ACHIEVEMENT' && item.studentRegNo ? (
                      <button
                        className="btn-card-action primary"
                        onClick={() => onNavigate(`student-profile-${item.studentRegNo}`)}
                      >
                        <span>View Portfolio</span>
                        <ArrowUpRight size={14} />
                      </button>
                    ) : (
                      <button
                        className="btn-card-action primary"
                        onClick={() => onSelectEvent(item)}
                      >
                        <span>Read Notice</span>
                        <ArrowUpRight size={14} />
                      </button>
                    )}

                    {item.brochure && (
                      <a
                        href={item.brochure}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-card-action secondary"
                      >
                        <Download size={14} />
                        <span>Brochure</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Department Spotlight Band */}
      <section className="spotlight-band page-width">
        <div className="spotlight-card">
          <div className="spotlight-content">
            <span className="spotlight-tag">SAE COLLEGIATE RACING</span>
            <h2>Driven by High Octane & Electric Torque</h2>
            <p>
              Our student teams design and manufacture competitive all-terrain vehicles (BAJA), open-wheel formula cars (SUPRA), and autonomous aeromodels from scratch in our campus workshop.
            </p>
            <div className="spotlight-buttons">
              <button className="btn btn-primary" onClick={() => onNavigate('sae')}>
                <span>Enter SAE Club Portal</span>
                <ArrowUpRight size={16} />
              </button>
              <button className="btn btn-outline" onClick={() => onNavigate('gallery')}>
                <span>View Workshop Gallery</span>
              </button>
            </div>
          </div>
          <div className="spotlight-media">
            <img
              src="https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=85"
              alt="SAE Collegiate Racing Team at CIET"
              className="spotlight-img"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
