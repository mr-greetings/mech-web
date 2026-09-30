import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Mail,
  Share2,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { BlueprintGrid, TechBadge } from '../components/MechanicalDecor';
import { useToast } from '../components/Toast';

export const StaffPublicProfile = ({ staffId, onBack }) => {
  const { addToast } = useToast();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await api.getStaffById(staffId);
        if (active) setStaff(profile);
      } catch (error) {
        console.error('Failed to load staff portfolio:', error);
        if (active) setStaff(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (staffId) loadProfile();
    return () => { active = false; };
  }, [staffId]);

  const shareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast('Public portfolio link copied.', 'success');
    } catch {
      addToast(`Share this portfolio: ${window.location.href}`, 'info');
    }
  };

  if (loading) {
    return (
      <div className="interior-page-container">
        <BlueprintGrid />
        <div className="feed-loading-state" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
          <p>Loading faculty portfolio...</p>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="interior-page-container">
        <BlueprintGrid />
        <div className="page-width empty-state-box staff-portfolio-empty">
          <h2>Faculty profile not found</h2>
          <p>This public portfolio may have moved or is no longer available.</p>
          <button className="btn btn-primary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Return to Faculty Directory</span>
          </button>
        </div>
      </div>
    );
  }

  const researchAreas = Array.isArray(staff.areasOfInterest) ? staff.areasOfInterest : [];

  return (
    <div className="staff-portfolio-page interior-page-container">
      <BlueprintGrid />

      <div className="page-width profile-top-bar">
        <button className="back-link-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Faculty Directory</span>
        </button>
        <button className="btn btn-outline btn-sm" onClick={shareProfile}>
          <Share2 size={14} />
          <span>Share Portfolio</span>
        </button>
      </div>

      <section className="page-width staff-portfolio-hero">
        <div className="staff-portfolio-photo">
          <img
            src={staff.profileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=85'}
            alt={staff.name}
          />
          <span>CIET / MECH</span>
        </div>
        <div className="staff-portfolio-intro">
          <TechBadge label="FACULTY PUBLIC PORTFOLIO" code="ME-FAC" variant="amber" />
          <h1>{staff.name}</h1>
          <p className="staff-portfolio-role">{staff.designation}</p>
          <p className="staff-portfolio-qualification">{staff.qualification}</p>
          <p className="staff-portfolio-about">{staff.about || 'Faculty profile and academic information.'}</p>
          <div className="staff-portfolio-actions">
            {staff.email && (
              <a className="btn btn-primary btn-sm" href={`mailto:${staff.email}`}>
                <Mail size={14} />
                <span>Contact faculty</span>
              </a>
            )}
            {staff.phone && <a className="btn btn-outline btn-sm" href={`tel:${staff.phone}`}>{staff.phone}</a>}
          </div>
        </div>
      </section>

      <section className="page-width staff-portfolio-facts">
        <article className="staff-portfolio-fact">
          <BriefcaseBusiness size={18} />
          <span>Experience</span>
          <strong>{staff.experience || 'Faculty'}</strong>
        </article>
        <article className="staff-portfolio-fact">
          <BookOpen size={18} />
          <span>Specialization</span>
          <strong>{staff.specialization || 'Mechanical Engineering'}</strong>
        </article>
        <article className="staff-portfolio-fact">
          <Sparkles size={18} />
          <span>Research & Publications</span>
          <strong>{staff.publications || 'Academic research and student mentorship'}</strong>
        </article>
      </section>

      <section className="page-width staff-portfolio-research">
        <div>
          <p className="header-kicker">01 / RESEARCH PROFILE</p>
          <h2>Areas of interest</h2>
        </div>
        {researchAreas.length ? (
          <div className="staff-portfolio-tags">
            {researchAreas.map((area) => <span key={area}>{area}</span>)}
          </div>
        ) : (
          <p className="staff-portfolio-muted">Research interests will be added to this profile.</p>
        )}
      </section>

      <section className="page-width staff-portfolio-footer">
        <span>MECHANICAL ENGINEERING / CIET COIMBATORE</span>
        <button className="text-link-btn" onClick={onBack}>Explore faculty <ArrowUpRight size={15} /></button>
      </section>
    </div>
  );
};
