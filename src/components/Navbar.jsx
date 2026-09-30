import React, { useState } from 'react';
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Wrench,
  Sparkles,
  BookOpen,
  Calendar,
  Users,
  Image,
  Award,
  FileText,
  Compass,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeSection, onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated, logout, isAdmin, isStaff, isStudent } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleNav = (section) => {
    onNavigate(section);
    setMobileMenuOpen(false);
    setAcademicsOpen(false);
    setProfileDropdownOpen(false);
  };

  const getDashboardTarget = () => {
    if (isAdmin) return 'admin-dashboard';
    if (isStaff) return 'staff-dashboard';
    if (isStudent) return 'student-dashboard';
    return 'home';
  };

  const academicItems = [
    { label: 'Vision & Mission', id: 'vision-mission' },
    { label: 'Curriculum', id: 'curriculum' },
    { label: 'Syllabus', id: 'syllabus' },
    { label: 'Regulation 2023', id: 'regulation' },
  ];

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand / Logo with dedicated Placeholder */}
        <div className="header-brand">
          <button
            className="brand-button"
            onClick={() => handleNav('home')}
            aria-label="CIET Mechanical Engineering Department Home"
          >
            <div className="brand-logo-frame" title="CIET Mechanical Engineering Department Logo Placeholder">
              <img
                src="/src/assets/ciet-mech-logo.svg"
                alt="CIET Mechanical Engineering Department Logo"
                className="brand-logo-img"
              />
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <button
            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
          >
            Home / Feed
          </button>

          <button
            className={`nav-link ${activeSection === 'events' ? 'active' : ''}`}
            onClick={() => handleNav('events')}
          >
            Events
          </button>

          {/* Academics Dropdown */}
          <div
            className="nav-dropdown-wrapper"
            onMouseEnter={() => setAcademicsOpen(true)}
            onMouseLeave={() => setAcademicsOpen(false)}
          >
            <button
              className={`nav-link dropdown-trigger ${
                ['curriculum', 'syllabus', 'regulation', 'vision-mission', 'academics'].includes(activeSection)
                  ? 'active'
                  : ''
              }`}
              onClick={() => handleNav('academics')}
              aria-haspopup="true"
              aria-expanded={academicsOpen}
            >
              <span>Academics</span>
              <ChevronDown size={14} className={academicsOpen ? 'rotate-180' : ''} />
            </button>
            {academicsOpen && (
              <div className="nav-dropdown-menu">
                {academicItems.map((item) => (
                  <button
                    key={item.id}
                    className="dropdown-item"
                    onClick={() => handleNav(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={`nav-link ${activeSection === 'staff' ? 'active' : ''}`}
            onClick={() => handleNav('staff')}
          >
            Staff
          </button>

          <button
            className={`nav-link ${activeSection === 'students' ? 'active' : ''}`}
            onClick={() => handleNav('students')}
          >
            Students
          </button>

          <button
            className={`nav-link ${activeSection === 'sae' ? 'active' : ''}`}
            onClick={() => handleNav('sae')}
          >
            <span className="sae-nav-badge">SAE</span>
            <span>Club</span>
          </button>

          <button
            className={`nav-link ${activeSection === 'gallery' ? 'active' : ''}`}
            onClick={() => handleNav('gallery')}
          >
            Gallery
          </button>

          <button
            className={`nav-link ${activeSection === 'certificates' ? 'active' : ''}`}
            onClick={() => handleNav('certificates')}
          >
            Certificates
          </button>

          <button
            className={`nav-link ${activeSection === 'brochures' ? 'active' : ''}`}
            onClick={() => handleNav('brochures')}
          >
            Brochures
          </button>

          <button
            className={`nav-link ${activeSection === 'alumni' ? 'active' : ''}`}
            onClick={() => handleNav('alumni')}
          >
            Alumni
          </button>
        </nav>

        {/* Right Header Controls (Auth / Dashboards) */}
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="auth-profile-menu">
              <button
                className="dashboard-quick-btn"
                onClick={() => handleNav(getDashboardTarget())}
                title="Go to role dashboard"
              >
                <LayoutDashboard size={15} />
                <span className="role-capsule">{user.role}</span>
              </button>

              <div className="profile-btn-wrap">
                <button
                  className="user-avatar-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-label="User account menu"
                >
                  <span className="avatar-initials">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {profileDropdownOpen && (
                  <div className="user-profile-dropdown">
                    <div className="dropdown-user-info">
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                      <div className="dropdown-role-tag">
                        {user.role.toUpperCase()} {user.registerNumber ? `· ${user.registerNumber}` : ''}
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <button
                      className="profile-dropdown-link"
                      onClick={() => handleNav(getDashboardTarget())}
                    >
                      <LayoutDashboard size={15} />
                      <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard</span>
                    </button>

                    {isStudent && user.registerNumber && (
                      <button
                        className="profile-dropdown-link"
                        onClick={() => handleNav(`student-profile-${user.registerNumber}`)}
                      >
                        <User size={15} />
                        <span>My Public Portfolio</span>
                      </button>
                    )}

                    <div className="dropdown-divider" />

                    <button
                      className="profile-dropdown-link logout-link"
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        handleNav('home');
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button className="signin-btn" onClick={onOpenAuth}>
              <User size={15} />
              <span>Portal Login</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-title">CIET MECH PORTAL</div>
              <button
                className="drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-links">
              <button
                className={`drawer-link ${activeSection === 'home' ? 'active' : ''}`}
                onClick={() => handleNav('home')}
              >
                Home / Feed
              </button>
              <button
                className={`drawer-link ${activeSection === 'events' ? 'active' : ''}`}
                onClick={() => handleNav('events')}
              >
                Events & Symposia
              </button>
              <button
                className={`drawer-link ${activeSection === 'curriculum' ? 'active' : ''}`}
                onClick={() => handleNav('curriculum')}
              >
                Curriculum
              </button>
              <button
                className={`drawer-link ${activeSection === 'vision-mission' ? 'active' : ''}`}
                onClick={() => handleNav('vision-mission')}
              >
                Vision & Mission
              </button>
              <button
                className={`drawer-link ${activeSection === 'syllabus' ? 'active' : ''}`}
                onClick={() => handleNav('syllabus')}
              >
                Syllabus
              </button>
              <button
                className={`drawer-link ${activeSection === 'regulation' ? 'active' : ''}`}
                onClick={() => handleNav('regulation')}
              >
                Regulations
              </button>
              <button
                className={`drawer-link ${activeSection === 'staff' ? 'active' : ''}`}
                onClick={() => handleNav('staff')}
              >
                Staff Directory
              </button>
              <button
                className={`drawer-link ${activeSection === 'students' ? 'active' : ''}`}
                onClick={() => handleNav('students')}
              >
                Students (Batch Wise)
              </button>
              <button
                className={`drawer-link ${activeSection === 'sae' ? 'active' : ''}`}
                onClick={() => handleNav('sae')}
              >
                SAE Collegiate Club
              </button>
              <button
                className={`drawer-link ${activeSection === 'gallery' ? 'active' : ''}`}
                onClick={() => handleNav('gallery')}
              >
                Department Gallery
              </button>
              <button
                className={`drawer-link ${activeSection === 'certificates' ? 'active' : ''}`}
                onClick={() => handleNav('certificates')}
              >
                Certificates
              </button>
              <button
                className={`drawer-link ${activeSection === 'brochures' ? 'active' : ''}`}
                onClick={() => handleNav('brochures')}
              >
                Brochures
              </button>
              <button
                className={`drawer-link ${activeSection === 'alumni' ? 'active' : ''}`}
                onClick={() => handleNav('alumni')}
              >
                Alumni Network
              </button>
            </div>

            <div className="drawer-footer">
              {isAuthenticated ? (
                <div className="drawer-auth-box">
                  <div className="drawer-user-meta">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <button
                    className="drawer-action-btn primary"
                    onClick={() => handleNav(getDashboardTarget())}
                  >
                    Go to {user.role.toUpperCase()} Dashboard
                  </button>
                  <button
                    className="drawer-action-btn secondary"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      handleNav('home');
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  className="drawer-action-btn primary"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                >
                  Sign In to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
