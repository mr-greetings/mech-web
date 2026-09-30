import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  Building,
  Search,
  Award,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';
import { LinkedInIcon } from '../components/SocialIcons';

export const AlumniPage = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        const data = await api.getAlumni();
        setAlumniList(data || []);
      } catch (err) {
        console.error('Failed to load alumni:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  const years = useMemo(() => {
    const set = new Set();
    alumniList.forEach((a) => {
      if (a.graduationYear) set.add(a.graduationYear);
    });
    return ['ALL', ...Array.from(set).sort().reverse()];
  }, [alumniList]);

  const filteredAlumni = useMemo(() => {
    return alumniList.filter((item) => {
      const matchesYear =
        selectedYear === 'ALL' || item.graduationYear === selectedYear;

      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.designation.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesYear && matchesSearch;
    });
  }, [alumniList, selectedYear, searchQuery]);

  return (
    <div className="interior-page-container">
      <BlueprintGrid />

      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="DISTINGUISHED GRADUATES NETWORK" code="ME-ALM-08" variant="blue" />
          <h1 className="page-title">Alumni Network</h1>
          <p className="page-subtitle">
            CIET Mechanical Engineering graduates contributing to global engineering excellence across aerospace, automotive, energy, and robotics corporations.
          </p>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="events-controls-section page-width">
        <div className="controls-row">
          <div className="status-toggle-group">
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginRight: '6px', alignSelf: 'center' }}>Graduation Year:</span>
            {years.map((y) => (
              <button
                key={y}
                className={`status-tab-btn ${selectedYear === y ? 'active' : ''}`}
                onClick={() => setSelectedYear(y)}
              >
                {y === 'ALL' ? 'All Batches' : y}
              </button>
            ))}
          </div>

          <div className="search-field-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search alumni by name, company, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Alumni Cards Grid */}
      <section className="page-width alumni-grid-section">
        {loading ? (
          <div className="feed-loading-state">
            <div className="spinner" />
            <p>Loading alumni records...</p>
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="empty-state-box">
            <GraduationCap size={36} />
            <p>No alumni found matching your criteria.</p>
          </div>
        ) : (
          <div className="alumni-cards-grid">
            {filteredAlumni.map((alum) => (
              <article key={alum.id} className="alumni-card-modern">
                <div className="alumni-header-row">
                  <img
                    src={alum.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'}
                    alt={alum.name}
                    className="alumni-avatar-img"
                    loading="lazy"
                  />
                  <div className="alumni-meta-block">
                    <span className="alumni-grad-badge">
                      <GraduationCap size={13} />
                      <span>Class of {alum.graduationYear}</span>
                    </span>
                    <h3 className="alumni-name">{alum.name}</h3>
                  </div>
                </div>

                <div className="alumni-body-row">
                  <div className="alumni-company-line">
                    <Building size={15} />
                    <span><strong>{alum.company}</strong></span>
                  </div>
                  <div className="alumni-designation-line">{alum.designation}</div>

                  {alum.achievement && (
                    <div className="alumni-achievement-quote">
                      <Sparkles size={14} className="sparkle-icon" />
                      <p>"{alum.achievement}"</p>
                    </div>
                  )}
                </div>

                {alum.linkedin && (
                  <div className="alumni-footer-row">
                    <a
                      href={alum.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      <LinkedInIcon size={14} />
                      <span>Connect on LinkedIn</span>
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
