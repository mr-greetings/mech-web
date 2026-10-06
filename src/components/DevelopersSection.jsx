import React, { useState } from 'react';
import { Sparkles, Code2, Users } from 'lucide-react';
import './DevelopersSection.css';

/**
 * DevelopersSection Component
 * Showcases the student engineering team behind the CIET Department platform.
 * Adheres strictly to the requested modern design with purple/pink gradients,
 * glassmorphism, responsive cards, and clean typography.
 */
export const DevelopersSection = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="devs-section page-width" id="developers" aria-labelledby="devs-main-title">
      <div className="devs-ambient-glow" aria-hidden="true" />

      {/* SECTION 1: HEADER */}
      <header className="devs-header">
        <div className="devs-badge-hub">
          <Sparkles size={13} className="devs-badge-icon" aria-hidden="true" />
          <span>INNOVATION HUB</span>
        </div>

        <h2 id="devs-main-title" className="devs-main-title">
          MEET THE <span className="devs-gradient-text">DEVELOPERS</span>
        </h2>

        <p className="devs-subtitle">
          The visionary student team behind the digital architecture of our platform.
        </p>
      </header>

      {/* TWO-COLUMN RESPONSIVE SHOWCASE */}
      <div className="devs-grid">
        {/* SECTION 2: DEVELOPER/TEAM IMAGE CARD */}
        <div className="devs-image-card">
          <div className="devs-img-wrapper">
            {!imageError ? (
              <img
                src="/images/developers.jpg"
                alt="CIET Information Technology Department Student Developers Team - IT Batch '27"
                className="devs-image"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="devs-img-placeholder">
                <Users size={48} className="devs-img-placeholder-icon" />
                <span className="devs-img-placeholder-title">Student Developer Team</span>
                <span className="devs-img-placeholder-hint">Place team photo at public/images/developers.jpg</span>
              </div>
            )}
            <div className="devs-img-gradient-shade" aria-hidden="true" />
          </div>

          {/* Top-Right Badge: ● IT BATCH '27 */}
          <div className="devs-image-badge" aria-label="IT Batch 2028">
            <span className="devs-pulse-dot" aria-hidden="true" />
            <span>IT BATCH '28</span>
          </div>

          {/* Dark Glassmorphism Overlay at Bottom of Image */}
          <div className="devs-image-overlay">
            <span className="devs-overlay-kicker">CREATIVE MINDS</span>
            <h4 className="devs-overlay-title">DEPT. OF INFORMATION TECHNOLOGY</h4>
          </div>
        </div>

        {/* SECTION 3 & 4: INFORMATION COLUMN */}
        <div className="devs-content-column">
          {/* SECTION 3: WHO WE ARE */}
          <div className="devs-who-badge">
            <span aria-hidden="true">✦</span>
            <span>WHO WE ARE</span>
          </div>

          <h3 className="devs-who-heading">
            Engineered by <span className="devs-purple-underline">IT Students</span>
          </h3>

          <p className="devs-paragraph">
            We are a passionate team of student developers from the Department of Information Technology at Coimbatore Institute of Engineering and Technology.
          </p>

          <p className="devs-paragraph">
            Driven by innovation and a shared enthusiasm for building modern digital experiences, this entire platform was architected, designed, and developed from the ground up by our department's students.
          </p>

          {/* SECTION 4: MODERN INFORMATION CARD */}
          <div className="devs-purpose-card">
            <div className="devs-purpose-icon-box" aria-hidden="true">
              <Code2 size={24} strokeWidth={2.2} />
            </div>
            <div className="devs-purpose-body">
              <h4 className="devs-purpose-title">Built with Purpose</h4>
              <p className="devs-purpose-desc">
                From intuitive UI/UX design to robust backend architecture, this platform stands as a testament to the practical skills and technological excellence cultivated within the IT department.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DevelopersSection;
