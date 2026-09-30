import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { InstagramIcon, LinkedInIcon, YouTubeIcon } from './SocialIcons';
import { api } from '../services/api';

export const Footer = ({ onNavigate }) => {
  const [deptInfo, setDeptInfo] = useState({
    collegeName: 'Coimbatore Institute of Engineering and Technology (CIET)',
    departmentName: 'Department of Mechanical Engineering',
    location: 'Narasipuram Post, Thondamuthur (via), Coimbatore - 641 109, Tamil Nadu, India',
    googleMapsUrl: 'https://maps.google.com/?q=CIET+College+Coimbatore+Tamil+Nadu',
    contactEmail: 'mech@ciet.ac.in',
    contactPhone: '+91 422 2970701 / 702',
    instagramUrl: 'https://instagram.com/ciet_mech_official',
    linkedinUrl: 'https://linkedin.com/school/ciet-coimbatore',
    youtubeUrl: 'https://youtube.com/@ciet_coimbatore',
  });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await api.getDepartmentInfo();
        if (data && data.collegeName) {
          setDeptInfo((prev) => ({ ...prev, ...data }));
        }
      } catch (e) {
        // Fallback to default state
      }
    };
    fetchInfo();
  }, []);

  return (
    <footer className="site-footer">
      <div className="page-width footer-grid">
        {/* Department Info & Logo Placeholder */}
        <div className="footer-col brand-col">
          <div className="footer-logo-wrap" title="CIET Mechanical Engineering Department Logo Placeholder">
            <img
              src="/src/assets/ciet-mech-logo.svg"
              alt="CIET Mechanical Engineering Logo"
              className="footer-logo-img"
            />
          </div>
          <p className="footer-tagline">
            Excellence in Mechanical Engineering Education, Automotive Innovation & Applied Research.
          </p>
          <div className="accreditation-pill">
            <ShieldCheck size={14} />
            <span>Autonomous Institution · Approved by AICTE · Affiliated to Anna University</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Department Hub</h4>
          <ul className="footer-nav">
            <li><button onClick={() => onNavigate('home')}>Department Feed</button></li>
            <li><button onClick={() => onNavigate('events')}>Symposium & Events</button></li>
            <li><button onClick={() => onNavigate('students')}>Students by Batch</button></li>
            <li><button onClick={() => onNavigate('staff')}>Faculty Directory</button></li>
            <li><button onClick={() => onNavigate('sae')}>SAE Collegiate Club</button></li>
            <li><button onClick={() => onNavigate('gallery')}>Department Gallery</button></li>
          </ul>
        </div>

        {/* Academics & Resources */}
        <div className="footer-col">
          <h4 className="footer-heading">Academics</h4>
          <ul className="footer-nav">
            <li><button onClick={() => onNavigate('vision-mission')}>Vision & Mission</button></li>
            <li><button onClick={() => onNavigate('curriculum')}>Curriculum Framework</button></li>
            <li><button onClick={() => onNavigate('syllabus')}>Syllabi Downloads</button></li>
            <li><button onClick={() => onNavigate('regulation')}>Academic Regulations</button></li>
            <li><button onClick={() => onNavigate('brochures')}>Event Brochures</button></li>
            <li><button onClick={() => onNavigate('certificates')}>Certifications</button></li>
            <li><button onClick={() => onNavigate('alumni')}>Alumni Network</button></li>
          </ul>
        </div>

        {/* Location & Contact Information */}
        <div className="footer-col contact-col">
          <h4 className="footer-heading">Coimbatore Campus</h4>
          <div className="footer-contact-item">
            <MapPin size={16} className="contact-icon" />
            <div>
              <p className="contact-text">{deptInfo.location}</p>
              <a
                href={deptInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="maps-link"
              >
                <span>View on Google Maps</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          <div className="footer-contact-item">
            <Mail size={16} className="contact-icon" />
            <a href={`mailto:${deptInfo.contactEmail}`} className="contact-link">
              {deptInfo.contactEmail}
            </a>
          </div>

          <div className="footer-contact-item">
            <Phone size={16} className="contact-icon" />
            <span className="contact-text">{deptInfo.contactPhone}</span>
          </div>

          {/* Social Links including Configurable Instagram */}
          <div className="footer-social-row">
            <a
              href={deptInfo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn instagram"
              title="Official Department Instagram"
            >
              <InstagramIcon size={17} />
            </a>
            <a
              href={deptInfo.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn linkedin"
              title="LinkedIn Page"
            >
              <LinkedInIcon size={17} />
            </a>
            <a
              href={deptInfo.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn youtube"
              title="YouTube Channel"
            >
              <YouTubeIcon size={17} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom page-width">
        <div className="footer-copy">
          © {new Date().getFullYear()} Department of Mechanical Engineering, CIET Coimbatore. All rights reserved.
        </div>
        <div className="footer-sub-links">
          <button onClick={() => onNavigate('academics')}>Academics</button>
          <span>·</span>
          <button onClick={() => onNavigate('events')}>Events</button>
          <span>·</span>
          <button onClick={() => onNavigate('sae')}>SAE India</button>
        </div>
      </div>
    </footer>
  );
};
