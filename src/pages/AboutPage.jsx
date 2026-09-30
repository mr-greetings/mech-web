import React from 'react';
import {
  Wrench,
  Compass,
  Cpu,
  Flame,
  Award,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Users,
} from 'lucide-react';
import { BlueprintGrid, TechBadge, SectionDivider } from '../components/MechanicalDecor';

export const AboutPage = ({ onNavigate }) => {
  const labs = [
    {
      title: 'Siemens Center of Excellence & CAD Studio',
      specs: '60 High-Performance Workstations · NX CAD · SolidWorks · ANSYS Workbench',
      desc: 'Advanced computer-aided modeling, finite element stress simulation, and computational fluid dynamics lab.',
    },
    {
      title: 'Robotics, Mechatronics & Automation Cell',
      specs: '6-Axis Industrial Robotic Arm · PLC Testbeds · Electro-Pneumatic Trainers',
      desc: 'Hands-on programming for automated factory assembly lines, sensor calibration, and machine vision.',
    },
    {
      title: 'Thermal Engineering & IC Engines Research Lab',
      specs: 'Computerized Multi-Cylinder Petrol & Diesel Engine Dynamometer · Emission Gas Analyzers',
      desc: 'Combustion performance profiling, alternative biofuel characterization, and heat exchanger test rigs.',
    },
    {
      title: 'Precision Machine Shop & CNC Tooling Center',
      specs: 'CNC Turning Center · 5-Axis Milling Machine · Surface Grinders · EDM Spark Erosion',
      desc: 'High-tolerance parts machining for industrial aerospace components and collegiate racing prototypes.',
    },
    {
      title: 'Advanced Additive Manufacturing & Prototyping Studio',
      specs: 'Industrial SLA & FDM 3D Printers · Carbon Fiber Reinforced Composite Slicing',
      desc: 'Rapid physical realization of complex topological geometries and lightweight robotic end-effectors.',
    },
  ];

  return (
    <div className="interior-page-container about-department-page">
      <BlueprintGrid />

      <section className="page-header-band page-width">
        <div className="header-meta">
          <TechBadge label="DEPARTMENT OVERVIEW & HISTORY" code="ME-ABT-11" variant="blue" />
          <h1 className="page-title">About the Department</h1>
          <p className="page-subtitle">
            Established in 2001, the Department of Mechanical Engineering at CIET Coimbatore has cultivated engineering pioneers, innovators, and industry leaders for over two decades.
          </p>
        </div>
      </section>

      {/* Narrative & Philosophy Grid */}
      <section className="page-width about-narrative-section">
        <div className="narrative-main">
          <h2>Engineering the Foundations of Modern Industry</h2>
          <p>
            Mechanical Engineering represents the intersection of physics, materials science, computational design, and human curiosity. At CIET, we believe in hands-on immersion from the very first semester. Our students do not simply study thermodynamic cycles in textbooks—they instrument engine dynamometers, weld tubular spaceframes, tune suspension kinematics, and write simulation algorithms.
          </p>
          <p>
            Accredited by national bodies and affiliated with Anna University, our curriculum pairs foundational rigor with forward-looking tracks in Electric Vehicles, Industry 4.0 automation, and green energy systems.
          </p>

          <div className="about-metrics-row">
            <div className="metric-box">
              <strong>2001</strong>
              <span>Year Established</span>
            </div>
            <div className="metric-box">
              <strong>18+</strong>
              <span>Doctoral & M.E. Faculty</span>
            </div>
            <div className="metric-box">
              <strong>100%</strong>
              <span>Experiential Lab Access</span>
            </div>
            <div className="metric-box">
              <strong>25+</strong>
              <span>Industry MoU Partners</span>
            </div>
          </div>
        </div>

        {/* HOD Profile Callout */}
        <div className="hod-message-card">
          <div className="hod-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
              alt="Dr. R. Karthikeyan, HOD Mechanical"
            />
          </div>
          <div className="hod-copy">
            <span className="hod-title-tag">FROM THE HOD'S DESK</span>
            <h3>Dr. R. Karthikeyan</h3>
            <p className="hod-designation">Professor & Head of Department · Ph.D.</p>
            <blockquote className="hod-quote">
              "We foster an environment where bold ideas meet practical manufacturing discipline. Our students graduate not just with degrees, but with real machines they designed, tested, and validated."
            </blockquote>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigate('staff')}>
              <span>View Faculty Profiles</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </section>

      <SectionDivider label="DEPARTMENT INFRASTRUCTURE & LABORATORIES" />

      {/* Laboratories & Infrastructure */}
      <section className="page-width labs-showcase-section">
        <div className="section-intro">
          <h2>State-of-the-Art Research Centers & Tool Studios</h2>
          <p>Over 35,000 square feet of dedicated industrial testing bays, machine tooling facilities, and CAD workstation clusters.</p>
        </div>

        <div className="labs-grid">
          {labs.map((lab, idx) => (
            <div key={idx} className="lab-card-modern">
              <span className="lab-num">0{idx + 1}</span>
              <h3 className="lab-title">{lab.title}</h3>
              <div className="lab-specs-tag">{lab.specs}</div>
              <p className="lab-desc">{lab.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Action Navigation Strip */}
      <section className="page-width about-action-strip">
        <div className="action-strip-card">
          <div>
            <h3>Ready to explore departmental life?</h3>
            <p>Check out our live events calendar, browse student project records, or learn about academic regulations.</p>
          </div>
          <div className="action-strip-btns">
            <button className="btn btn-primary" onClick={() => onNavigate('events')}>
              <span>View Upcoming Events</span>
              <ArrowUpRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('curriculum')}>
              <span>View Curriculum</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
