import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Search,
  Download,
  ExternalLink,
  Calendar,
  CheckCircle,
  Building,
  User,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';

export const CertificatesPage = ({ onNavigate }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await api.getCertificates();
      setCertificates(data || []);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const categories = ['ALL', 'Students', 'Competitions', 'Workshops', 'Department'];

  const filteredCerts = useMemo(() => {
    return certificates.filter((cert) => {
      const matchesCat =
        categoryFilter === 'ALL' ||
        (cert.category && cert.category.toLowerCase() === categoryFilter.toLowerCase());

      const matchesSearch =
        !searchQuery ||
        cert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.issuingOrganization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.studentName?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [certificates, categoryFilter, searchQuery]);

  return (
    <div className="interior-page-container">
      <BlueprintGrid />

      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="VERIFIED CREDENTIAL ARCHIVE" code="ME-CRT-06" variant="purple" />
          <h1 className="page-title">Certificates & Accreditations</h1>
          <p className="page-subtitle">
            A showcase of professional certifications, Dassault Systèmes / ANSYS tool accreditations, symposium awards, and skill completions achieved by students and staff.
          </p>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="events-controls-section page-width">
        <div className="controls-row">
          <div className="status-toggle-group">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`status-tab-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-field-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search certification, student name, issuing body..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Certificates Cards Grid */}
      <section className="page-width certificates-grid-section">
        {loading ? (
          <div className="feed-loading-state">
            <div className="spinner" />
            <p>Loading credentials database...</p>
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="empty-state-box">
            <Award size={36} />
            <p>No certificates found matching your criteria.</p>
          </div>
        ) : (
          <div className="certificates-cards-grid">
            {filteredCerts.map((cert) => (
              <article key={cert.id} className="certificate-card-modern">
                <div className="cert-card-header">
                  <div className="cert-icon-frame">
                    <Award size={24} />
                  </div>
                  <span className="cert-category-badge">{cert.category || 'Certification'}</span>
                </div>

                <div className="cert-card-body">
                  <span className="cert-date-text">
                    <Calendar size={13} />
                    <span>{cert.date}</span>
                  </span>

                  <h3 className="cert-card-title">{cert.title}</h3>

                  <div className="cert-issuer-line">
                    <Building size={14} />
                    <span>Issued by: <strong>{cert.issuingOrganization}</strong></span>
                  </div>

                  {cert.studentName && (
                    <div className="cert-recipient-line">
                      <User size={14} />
                      <span>Recipient: <strong>{cert.studentName}</strong></span>
                    </div>
                  )}

                  <p className="cert-desc-snip">{cert.description}</p>
                </div>

                <div className="cert-card-footer">
                  <div className="cert-verified-pill">
                    <ShieldCheck size={14} />
                    <span>Verified Credential</span>
                  </div>

                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <Download size={13} />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
