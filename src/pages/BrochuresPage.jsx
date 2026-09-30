import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Calendar,
  User,
  Search,
  Upload,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';

export const BrochuresPage = ({ onNavigate }) => {
  const { isStaff, isAdmin } = useAuth();
  const [brochures, setBrochures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBrochures = async () => {
    try {
      setLoading(true);
      const data = await api.getBrochures();
      setBrochures(data || []);
    } catch (err) {
      console.error('Failed to load brochures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrochures();
  }, []);

  const filteredBrochures = brochures.filter((b) => {
    return (
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="interior-page-container">
      <BlueprintGrid />

      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="DEPARTMENT RESOURCE REPOSITORY" code="ME-BRO-07" variant="green" />
          <h1 className="page-title">Event Brochures & Handbooks</h1>
          <p className="page-subtitle">
            Download official brochures, workshop guidelines, symposium flyers, and academic information bulletins issued by the department.
          </p>
        </div>

        {(isStaff || isAdmin) && (
          <div className="staff-action-shortcut">
            <button
              className="btn btn-primary"
              onClick={() => onNavigate(isStaff ? 'staff-dashboard' : 'admin-dashboard')}
            >
              <Upload size={16} />
              <span>Upload Brochure (Dashboard)</span>
            </button>
          </div>
        )}
      </section>

      {/* Search Bar */}
      <section className="events-controls-section page-width">
        <div className="search-field-wrap" style={{ maxWidth: '420px' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search brochures by title, topic, or uploader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Brochure Cards Grid */}
      <section className="page-width brochures-grid-section">
        {loading ? (
          <div className="feed-loading-state">
            <div className="spinner" />
            <p>Loading department brochures...</p>
          </div>
        ) : filteredBrochures.length === 0 ? (
          <div className="empty-state-box">
            <FileText size={36} />
            <p>No brochures match your query.</p>
          </div>
        ) : (
          <div className="brochures-cards-grid">
            {filteredBrochures.map((brochure) => (
              <article key={brochure.id} className="brochure-card-modern">
                <div className="brochure-thumb-wrap">
                  <img
                    src={brochure.thumbnail || 'https://images.unsplash.com/photo-1581092919535-7146ff1a5908?auto=format&fit=crop&w=800&q=80'}
                    alt={brochure.title}
                    loading="lazy"
                  />
                  <div className="brochure-pdf-tag">
                    <FileText size={13} />
                    <span>PDF DOCUMENT</span>
                  </div>
                </div>

                <div className="brochure-card-body">
                  <div className="brochure-meta-line">
                    <span className="brochure-date">
                      <Calendar size={13} />
                      <span>{brochure.date}</span>
                    </span>
                  </div>

                  <h3 className="brochure-title">{brochure.title}</h3>
                  <p className="brochure-desc">{brochure.description}</p>

                  <div className="brochure-uploader-line">
                    <User size={13} />
                    <span>Uploaded by: <strong>{brochure.uploadedBy || 'Department Desk'}</strong></span>
                  </div>

                  <div className="brochure-actions-row">
                    <a
                      href={brochure.downloadLink || '/uploads/sample-brochure.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      <ExternalLink size={14} />
                      <span>View in Browser</span>
                    </a>

                    <a
                      href={brochure.downloadLink || '/uploads/sample-brochure.pdf'}
                      download
                      className="btn btn-primary btn-sm"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
