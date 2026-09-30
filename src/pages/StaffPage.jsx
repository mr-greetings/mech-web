import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  BookOpen,
  Award,
  Layers,
  ArrowUpRight,
  X,
  Sparkles,
  Search,
} from 'lucide-react';
import { api } from '../services/api';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';

export const StaffPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const data = await api.getStaff();
        setStaffList(data || []);
      } catch (err) {
        console.error('Failed to fetch staff:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const filteredStaff = staffList.filter((m) => {
    return (
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="interior-page-container">
      <BlueprintGrid />

      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="DEPARTMENT FACULTY & RESEARCH CORPS" code="ME-FAC-04" variant="amber" />
          <h1 className="page-title">Faculty Directory</h1>
          <p className="page-subtitle">
            Distinguished academicians, doctoral supervisors, and industry researchers mentoring the next generation of mechanical innovators.
          </p>
        </div>

        <div className="search-field-wrap" style={{ maxWidth: '360px', marginTop: '16px' }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search faculty name, specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Staff Grid */}
      <section className="page-width staff-grid-section">
        {loading ? (
          <div className="feed-loading-state">
            <div className="spinner" />
            <p>Loading faculty profiles...</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="empty-state-box">
            <p>No faculty members match your search.</p>
          </div>
        ) : (
          <div className="faculty-cards-grid">
            {filteredStaff.map((staff) => (
              <article key={staff.id} className="faculty-card-modern">
                <div className="faculty-photo-wrap">
                  <img
                    src={staff.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'}
                    alt={staff.name}
                    loading="lazy"
                  />
                  <div className="faculty-badge-frame">
                    <span>{staff.experience || 'Faculty'}</span>
                  </div>
                </div>

                <div className="faculty-card-body">
                  <span className="faculty-dept-sub">MECH // FACULTY</span>
                  <h3 className="faculty-name">{staff.name}</h3>
                  <div className="faculty-role">{staff.designation}</div>
                  <div className="faculty-qual">{staff.qualification}</div>

                  <div className="faculty-spec-line">
                    <strong>Specialization:</strong> {staff.specialization}
                  </div>

                  {staff.areasOfInterest && staff.areasOfInterest.length > 0 && (
                    <div className="faculty-interests-tags">
                      {staff.areasOfInterest.map((area, idx) => (
                        <span key={idx} className="interest-tag">
                          {area}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="faculty-contact-row">
                    {staff.email && (
                      <a href={`mailto:${staff.email}`} className="btn-icon-link" title={staff.email}>
                        <Mail size={15} />
                      </a>
                    )}
                    {staff.phone && (
                      <a href={`tel:${staff.phone}`} className="btn-icon-link" title={staff.phone}>
                        <Phone size={15} />
                      </a>
                    )}
                    <button
                      className="btn-faculty-detail"
                      onClick={() => onNavigate(`staff-profile-${staff.id}`)}
                    >
                      <span>View Public Portfolio</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Staff Bio & Publications Modal */}
      {selectedStaff && (
        <div className="modal-backdrop" onClick={() => setSelectedStaff(null)}>
          <div className="modal-window staff-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedStaff(null)}>
              <X size={20} />
            </button>

            <div className="staff-modal-header">
              <img
                src={selectedStaff.profileImage}
                alt={selectedStaff.name}
                className="staff-modal-avatar"
              />
              <div>
                <h2>{selectedStaff.name}</h2>
                <div className="designation-text">{selectedStaff.designation}</div>
                <div className="qual-text">{selectedStaff.qualification}</div>
                <div className="exp-text">Experience: {selectedStaff.experience}</div>
              </div>
            </div>

            <div className="staff-modal-body">
              <div className="bio-section">
                <h4>About & Academic Profile</h4>
                <p>{selectedStaff.about}</p>
              </div>

              {selectedStaff.publications && (
                <div className="publications-section">
                  <h4>Research Publications & Patents</h4>
                  <p>{selectedStaff.publications}</p>
                </div>
              )}

              {selectedStaff.areasOfInterest && selectedStaff.areasOfInterest.length > 0 && (
                <div className="interest-section">
                  <h4>Areas of Research Interest</h4>
                  <div className="interests-list">
                    {selectedStaff.areasOfInterest.map((item, idx) => (
                      <span key={idx} className="interest-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="contact-section">
                <h4>Department Contact</h4>
                <p>Email: <a href={`mailto:${selectedStaff.email}`}>{selectedStaff.email}</a></p>
                <p>Office Phone: {selectedStaff.phone}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
