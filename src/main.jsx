import React, { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';

// Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EventModal } from './components/EventModal';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { EventsPage } from './pages/EventsPage';
import { StaffPage } from './pages/StaffPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentPublicProfile } from './pages/StudentPublicProfile';
import { StaffPublicProfile } from './pages/StaffPublicProfile';
import { GalleryPage } from './pages/GalleryPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { BrochuresPage } from './pages/BrochuresPage';
import { AlumniPage } from './pages/AlumniPage';
import { SAEClubPage } from './pages/SAEClubPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { AuthModal } from './pages/AuthModal';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentResumeBuilder } from './pages/StudentResumeBuilder';
import { CurriculumPage, CourseSyllabusPage } from './pages/CurriculumPage';

function AppContent() {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync hash routing e.g. #/student/23ME014 or #events
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('student/resume')) {
        setActiveSection('student-resume');
        return;
      }
      if (hash.startsWith('syllabus/')) {
        setActiveSection(`syllabus-course-${decodeURIComponent(hash.slice('syllabus/'.length))}`);
        return;
      }
      if (hash === 'academics') {
        setActiveSection('curriculum');
        return;
      }
      if (hash === 'regulations') {
        setActiveSection('regulation');
        return;
      }
      if (hash.startsWith('student/')) {
        const regNo = hash.split('student/')[1];
        if (regNo && regNo !== 'resume') {
          setActiveSection(`student-profile-${regNo}`);
          return;
        }
      }
      if (hash.startsWith('staff/')) {
        const staffId = hash.split('staff/')[1];
        if (staffId) {
          setActiveSection(`staff-profile-${staffId}`);
          return;
        }
      }
      if (hash) {
        setActiveSection(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial check on load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (section) => {
    setActiveSection(section);
    if (section === 'student-resume') {
      window.location.hash = '/student/resume';
    } else if (section.startsWith('syllabus-course-')) {
      window.location.hash = `/syllabus/${encodeURIComponent(section.replace('syllabus-course-', ''))}`;
    } else if (section.startsWith('student-profile-')) {
      const reg = section.replace('student-profile-', '');
      window.location.hash = `/student/${reg}`;
    } else if (section.startsWith('staff-profile-')) {
      const staffId = section.replace('staff-profile-', '');
      window.location.hash = `/staff/${staffId}`;
    } else {
      window.location.hash = `/${section}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="site-shell">
      {/* Top Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={navigateTo}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Content Area */}
      <main className="site-main">
        {activeSection === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
          />
        )}

        {activeSection === 'events' && (
          <EventsPage
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            onNavigate={navigateTo}
          />
        )}

        {activeSection === 'about' && (
          <AboutPage onNavigate={navigateTo} />
        )}

        {activeSection === 'staff' && (
          <StaffPage onNavigate={navigateTo} />
        )}

        {activeSection === 'students' && (
          <StudentsPage onNavigate={navigateTo} />
        )}

        {activeSection.startsWith('student-profile-') && (
          <StudentPublicProfile
            registerNumber={activeSection.replace('student-profile-', '')}
            onBack={() => navigateTo('students')}
          />
        )}

        {activeSection.startsWith('staff-profile-') && (
          <StaffPublicProfile
            staffId={activeSection.replace('staff-profile-', '')}
            onBack={() => navigateTo('staff')}
          />
        )}

        {activeSection === 'gallery' && (
          <GalleryPage onNavigate={navigateTo} />
        )}

        {activeSection === 'certificates' && (
          <CertificatesPage onNavigate={navigateTo} />
        )}

        {activeSection === 'brochures' && (
          <BrochuresPage onNavigate={navigateTo} />
        )}

        {activeSection === 'alumni' && (
          <AlumniPage onNavigate={navigateTo} />
        )}

        {activeSection === 'sae' && (
          <SAEClubPage onNavigate={navigateTo} />
        )}

        {activeSection === 'curriculum' && <CurriculumPage mode="curriculum" onNavigate={navigateTo} />}

        {activeSection === 'syllabus' && <CurriculumPage mode="syllabus" onNavigate={navigateTo} />}

        {activeSection === 'regulation' && <CurriculumPage mode="regulation" onNavigate={navigateTo} />}

        {activeSection.startsWith('syllabus-course-') && (
          <CourseSyllabusPage
            courseCode={activeSection.replace('syllabus-course-', '')}
            onBack={() => navigateTo('syllabus')}
            onNavigate={navigateTo}
          />
        )}

        {activeSection === 'vision-mission' && (
          <AcademicsPage
            initialSection={activeSection}
            onNavigate={navigateTo}
          />
        )}

        {/* Dashboards */}
        {activeSection === 'admin-dashboard' && (
          <AdminDashboard onNavigate={navigateTo} />
        )}

        {activeSection === 'staff-dashboard' && (
          <StaffDashboard onNavigate={navigateTo} />
        )}

        {activeSection === 'student-dashboard' && (
          <StudentDashboard onNavigate={navigateTo} />
        )}

        {activeSection === 'student-resume' && (
          <StudentResumeBuilder onBack={() => navigateTo('student-dashboard')} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Global Event Details Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Global Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccessRedirect={(target) => navigateTo(target)}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
