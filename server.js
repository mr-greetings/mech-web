import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { AsyncLocalStorage } from 'async_hooks';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 4000);
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;
const frontendOrigins = new Set(
  (process.env.FRONTEND_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean)
);
const requestContext = new AsyncLocalStorage();
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV !== 'production') {
  const localSecretPath = path.join(__dirname, '.dev-jwt-secret');
  try {
    JWT_SECRET = fs.readFileSync(localSecretPath, 'utf8').trim();
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    JWT_SECRET = randomBytes(48).toString('hex');
    try {
      fs.writeFileSync(localSecretPath, JWT_SECRET, { flag: 'wx', mode: 0o600 });
    } catch (writeError) {
      if (writeError.code !== 'EEXIST') throw writeError;
      JWT_SECRET = fs.readFileSync(localSecretPath, 'utf8').trim();
    }
    console.warn('Generated a local development JWT secret in .dev-jwt-secret. Set JWT_SECRET explicitly for production.');
  }
}
const missingServerEnvironment = [
  ['JWT_SECRET', JWT_SECRET],
].filter(([, value]) => !value?.trim()).map(([name]) => name);

if (supabaseUrl && !supabaseServiceKey) {
  console.warn('[server] Supabase URL is configured without a service role key; local JSON persistence will remain active for this process.');
}

if (!supabaseUrl && supabaseServiceKey) {
  console.warn('[server] Supabase service role key is configured without a URL; local JSON persistence will remain active for this process.');
}
const dbDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const dbPath = path.join(dbDir, 'db.json');
const curriculumPath = path.join(dbDir, 'r2023-curriculum.json');

if (!isVercel) {
  fs.mkdirSync(dbDir, { recursive: true });
  fs.mkdirSync(uploadsDir, { recursive: true });

  const sampleBrochurePath = path.join(uploadsDir, 'sample-brochure.pdf');
  if (!fs.existsSync(sampleBrochurePath)) {
    fs.writeFileSync(sampleBrochurePath, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF');
  }
}

const buildInitialDatabase = () => {
  const adminHash = bcrypt.hashSync('Admin@123', 10);
  const staffHash = bcrypt.hashSync('Staff@123', 10);
  const studentHash = bcrypt.hashSync('Student@123', 10);

  return {
    users: [
      {
        id: 'user-admin-1',
        name: 'Admin Desk',
        email: 'admin@ciet.ac.in',
        passwordHash: adminHash,
        role: 'admin',
        phone: '+91 94430 12345',
        department: 'Mechanical Engineering',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-staff-1',
        name: 'Dr. R. Karthikeyan',
        email: 'hod.mech@ciet.ac.in',
        passwordHash: staffHash,
        role: 'staff',
        staffId: 'staff-1',
        phone: '+91 99940 88123',
        department: 'Mechanical Engineering',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-staff-2',
        name: 'Dr. A. Sangeetha',
        email: 'sangeetha.mech@ciet.ac.in',
        passwordHash: staffHash,
        role: 'staff',
        staffId: 'staff-2',
        phone: '+91 94422 13311',
        department: 'Mechanical Engineering',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-student-1',
        name: 'Arjun Prakash',
        email: 'arjun@ciet.ac.in',
        passwordHash: studentHash,
        role: 'student',
        studentId: 'student-1',
        registerNumber: '23ME014',
        phone: '+91 89456 71201',
        department: 'Mechanical Engineering',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-student-2',
        name: 'Nivedha S.',
        email: 'nivedha@ciet.ac.in',
        passwordHash: studentHash,
        role: 'student',
        studentId: 'student-2',
        registerNumber: '24ME031',
        phone: '+91 81234 56789',
        department: 'Mechanical Engineering',
        createdAt: new Date().toISOString(),
      },
    ],
    batches: [
      { id: '2023-2027', label: '2023 — 2027', academicYear: '2023-2027', active: true, description: 'Final Year Batch' },
      { id: '2024-2028', label: '2024 — 2028', academicYear: '2024-2028', active: true, description: 'Third Year Batch' },
      { id: '2025-2029', label: '2025 — 2029', academicYear: '2025-2029', active: true, description: 'Second Year Batch' },
      { id: '2026-2030', label: '2026 — 2030', academicYear: '2026-2030', active: true, description: 'First Year Batch' },
    ],
    staff: [
      {
        id: 'staff-1',
        userId: 'user-staff-1',
        name: 'Dr. R. Karthikeyan',
        designation: 'Professor & Head of Department',
        qualification: 'B.E., M.E., Ph.D. (Mechanical Engineering)',
        specialization: 'Thermal Systems, Sustainable Energy & IC Engines',
        experience: '18 Years of Academic & Research Experience',
        email: 'hod.mech@ciet.ac.in',
        phone: '+91 99940 88123',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        about: 'Dr. Karthikeyan has spearheaded national research grants in biofuels and solar thermal storage. He oversees the curriculum design, research labs, and academic accreditation for CIET Mechanical Engineering.',
        publications: '24 Scopus Indexed Papers, 2 Australian Patents, 1 Text Book on Applied Thermodynamics',
        areasOfInterest: ['Renewable Energy', 'Thermal Storage', 'Computational Heat Transfer', 'Combustion Modeling'],
      },
      {
        id: 'staff-2',
        userId: 'user-staff-2',
        name: 'Dr. A. Sangeetha',
        designation: 'Associate Professor',
        qualification: 'M.E., Ph.D. (Computer Aided Design & Manufacturing)',
        specialization: 'Additive Manufacturing & Topology Optimization',
        experience: '12 Years of Academic Experience',
        email: 'sangeetha.mech@ciet.ac.in',
        phone: '+91 94422 13311',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        about: 'Leads the Advanced CAD/CAM Studio and directs student teams in industrial design competitions including SAE BAJA and SUPRA.',
        publications: '14 Indexed Journal Articles, 3 Design Patents in Rapid Prototyping Fixtures',
        areasOfInterest: ['3D Printing / Additive Manufacturing', 'Finite Element Analysis', 'Lightweight Composites', 'Robotic Automation'],
      },
      {
        id: 'staff-3',
        userId: '',
        name: 'Prof. V. Pradeep Kumar',
        designation: 'Assistant Professor & SAE Faculty Advisor',
        qualification: 'M.E. (Automobile & Manufacturing Engineering)',
        specialization: 'Vehicle Dynamics & Powertrain Systems',
        experience: '8 Years of Industry & Academic Experience',
        email: 'pradeep.mech@ciet.ac.in',
        phone: '+91 98421 77654',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        about: 'Faculty advisor to CIET SAE Collegiate Club. Mentors collegiate design teams in electric powertrain conversions, telemetry sensors, and chassis rigidity testing.',
        publications: '8 Research Papers in Automotive Systems, Co-investigator for Electric Mobility Grant',
        areasOfInterest: ['Electric Vehicles', 'Chassis Kinematics', 'Braking Dynamics', 'CAD Simulation'],
      },
      {
        id: 'staff-4',
        userId: '',
        name: 'Dr. M. Soundararajan',
        designation: 'Associate Professor',
        qualification: 'M.Tech, Ph.D. (Mechatronics & Automation)',
        specialization: 'Industrial Mechatronics, Sensors & PLC Automation',
        experience: '14 Years in Robotics & Precision Systems',
        email: 'soundar.mech@ciet.ac.in',
        phone: '+91 94865 33221',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        about: 'Coordinates the Mechatronics and Robotics incubation cell, training students on industrial arms, microcontrollers, and Industry 4.0 IoT instrumentation.',
        publications: '16 International Journal Articles, 2 Books on Industrial Mechatronics',
        areasOfInterest: ['PLC Programming', 'Robot Vision', 'Hydraulics & Pneumatics', 'Condition Monitoring'],
      },
    ],
    students: [
      {
        id: 'student-1',
        userId: 'user-student-1',
        name: 'Arjun Prakash',
        registerNumber: '23ME014',
        batch: '2023 — 2027',
        academicYear: '2023-2027',
        section: 'A',
        yearOfStudy: 'IV Year',
        email: 'arjun@ciet.ac.in',
        phone: '+91 89456 71201',
        profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
        skills: ['SolidWorks CSWP', 'Robotics & ROS', 'CNC Machining', 'Topology Optimization', 'ANSYS Mechanical', 'Python for CAD'],
        about: 'Passionate mechanical engineer specializing in autonomous robotic kinematics and lightweight structural frames. SAE BAJA vehicle chassis lead.',
        projects: [
          {
            id: 'proj-1',
            title: 'All-Terrain Vehicle Spaceframe Chassis',
            description: 'Designed and FEA-validated a lightweight tubular 4130 chromoly spaceframe chassis adhering to SAE BAJA regulations with a 35% torsional stiffness improvement.',
            techStack: 'SolidWorks, ANSYS FEA, TIG Welding, Tube Notching',
            github: 'https://github.com/ciet-mech',
            liveDemo: '',
            image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'proj-2',
            title: 'Autonomous Mobile Inspection Robot (AMIR)',
            description: 'Constructed a tracked robotic platform utilizing OpenCV computer vision to detect surface cracks in high-pressure oil pipelines.',
            techStack: 'Raspberry Pi, ROS2, Python, SolidWorks, 3D Printing',
            github: 'https://github.com/ciet-mech',
            liveDemo: '',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
          },
        ],
        achievements: [
          '1st Prize — National Level CAD Modeling Sprint (NIT Trichy, 2025)',
          'Captain — CIET BAJA Racing Team 2026',
          'Academic Merit Award in Mechanics of Solids (2024)',
        ],
        certificates: [
          {
            id: 'cert-1',
            title: 'Certified SolidWorks Professional (CSWP)',
            issuingOrganization: 'Dassault Systèmes',
            date: '2025-04-12',
            description: 'Advanced part modeling, multi-body configurations, and mechanical assembly evaluation.',
            fileUrl: '/uploads/sample-brochure.pdf',
          },
          {
            id: 'cert-2',
            title: 'ANSYS Mechanical APDL Simulation Certified',
            issuingOrganization: 'ANSYS Inc.',
            date: '2025-08-20',
            description: 'Static structural, modal, and non-linear contact analysis.',
            fileUrl: '/uploads/sample-brochure.pdf',
          },
        ],
        eventsParticipated: [
          'Mechathon 2026 — Team Lead (Smart Mobility Prototype)',
          'SAE BAJA India 2025 (Pithampur Virtual & Dynamic Rounds)',
          'International Conference on Advanced Materials & Manufacturing (ICAMM)',
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/arjun-prakash-mech',
          github: 'https://github.com/arjun-prakash',
          instagram: 'https://instagram.com/arjun_prakash',
        },
      },
      {
        id: 'student-2',
        userId: 'user-student-2',
        name: 'Nivedha S.',
        registerNumber: '24ME031',
        batch: '2024 — 2028',
        academicYear: '2024-2028',
        section: 'B',
        yearOfStudy: 'III Year',
        email: 'nivedha@ciet.ac.in',
        phone: '+91 81234 56789',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        skills: ['ANSYS Fluent (CFD)', 'Thermal System Design', 'MATLAB & Simulink', 'CATIA V5', 'Aerodynamics', 'Heat Exchangers'],
        about: 'Focused on computational fluid dynamics, thermal dissipation for electric vehicle battery packs, and renewable energy aerodynamics.',
        projects: [
          {
            id: 'proj-3',
            title: 'Phase Change Material (PCM) Cooling for EV Battery Packs',
            description: 'Conducted CFD simulations and built a physical test rig combining paraffin wax PCM with microchannel heat sinks to maintain battery cells under 38°C.',
            techStack: 'ANSYS Fluent, SolidWorks, K-Type Thermocouples, MATLAB',
            github: 'https://github.com/ciet-mech',
            liveDemo: '',
            image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=800&q=80',
          },
        ],
        achievements: [
          'Best Technical Paper Award at National Thermal Symposium 2025',
          'Treasurer — CIET SAE Collegiate Club (2025–2026)',
        ],
        certificates: [
          {
            id: 'cert-3',
            title: 'CFD Essentials & Aerodynamic Analysis',
            issuingOrganization: 'NPTEL / IIT Madras',
            date: '2025-06-15',
            description: 'Navier-Stokes discretization, turbulence modeling (k-epsilon and SST k-omega).',
            fileUrl: '/uploads/sample-brochure.pdf',
          },
        ],
        eventsParticipated: [
          'Thermal Engineering Expo 2026 — Presenter',
          'Lucas-TVS Industrial Study Tour',
          'SAE Aero Design Challenge 2025',
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=800&q=80',
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/nivedha-mech',
          github: 'https://github.com/nivedha-s',
          instagram: 'https://instagram.com/nivedha_s',
        },
      },
      {
        id: 'student-3',
        userId: '',
        name: 'Mohamed Rafi',
        registerNumber: '25ME008',
        batch: '2025 — 2029',
        academicYear: '2025-2029',
        section: 'A',
        yearOfStudy: 'II Year',
        email: 'mohamed.rafi@ciet.ac.in',
        phone: '+91 97891 22334',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        skills: ['Autodesk Fusion 360', '3D Printing & Slicing', 'GD&T', 'Metrology', 'Python', 'Arduino'],
        about: 'Hands-on fabricator fascinated by additive manufacturing, rapid prototyping, and precision machining tooling.',
        projects: [
          {
            id: 'proj-4',
            title: 'Modular 3-Axis CNC Laser Engraver',
            description: 'Engineered an open-source portable CNC laser engraver using 2020 aluminum extrusions and NEMA 17 stepper motors for student lab prototyping.',
            techStack: 'Fusion 360, GRBL, Laser Diode, 3D Printed Parts',
            github: 'https://github.com/ciet-mech',
            liveDemo: '',
            image: 'https://images.unsplash.com/photo-1581092919535-7146ff1a5908?auto=format&fit=crop&w=800&q=80',
          },
        ],
        achievements: [
          '2nd Place — CIET Makers Fair 2025',
          'Certified Fusion 360 Associate',
        ],
        certificates: [
          {
            id: 'cert-4',
            title: 'Autodesk Certified Associate in CAD for Mechanical Design',
            issuingOrganization: 'Autodesk',
            date: '2025-11-10',
            description: 'Parametric modeling, joints, simulations, and drawing documentation.',
            fileUrl: '/uploads/sample-brochure.pdf',
          },
        ],
        eventsParticipated: [
          'Additive Manufacturing Hands-on Bootcamp 2025',
          'SAE E-Kart Design Workshop',
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1581092919535-7146ff1a5908?auto=format&fit=crop&w=800&q=80',
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/mohamed-rafi',
          github: 'https://github.com/mohamed-rafi',
          instagram: '',
        },
      },
      {
        id: 'student-4',
        userId: '',
        name: 'Dharshini K.',
        registerNumber: '24ME019',
        batch: '2024 — 2028',
        academicYear: '2024-2028',
        section: 'B',
        yearOfStudy: 'III Year',
        email: 'dharshini@ciet.ac.in',
        phone: '+91 94451 99887',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        skills: ['Electric Powertrain', 'Battery Management Systems (BMS)', 'Simulink', 'SolidWorks', 'MATLAB', 'IoT Sensors'],
        about: 'Dedicated to clean mobility solutions, electric drivetrain sizing, and regenerative braking control algorithms.',
        projects: [
          {
            id: 'proj-5',
            title: 'Electric Go-Kart Regenerative Braking System',
            description: 'Designed an energy recovery system integrated with BLDC hub motors and ultra-capacitors, recapturing up to 18% braking kinetic energy.',
            techStack: 'MATLAB Simulink, SolidWorks, BLDC Motor Controller',
            github: 'https://github.com/ciet-mech',
            liveDemo: '',
            image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
          },
        ],
        achievements: [
          'Winner — National Green Mobility Challenge 2025',
          'Head of Powertrain — CIET E-Baja Team',
        ],
        certificates: [
          {
            id: 'cert-5',
            title: 'Electric Vehicle Architecture & Powertrain Design',
            issuingOrganization: 'SAE International',
            date: '2025-07-22',
            description: 'Inverter modulation, thermal battery safety, motor torque curves.',
            fileUrl: '/uploads/sample-brochure.pdf',
          },
        ],
        eventsParticipated: [
          'Formula Bharat 2025 Electrical Safety Scrutineering',
          'Smart Mobility Hackathon',
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        ],
        socialLinks: {
          linkedin: 'https://linkedin.com/in/dharshini-k-mech',
          github: 'https://github.com/dharshini-k',
          instagram: 'https://instagram.com/dharshini_mech',
        },
      },
    ],
    events: [
      {
        id: 'event-1',
        title: 'MECHATHON ’26: Autonomous & Sustainable Mobility Hackathon',
        description: 'A flagship 36-hour physical hackathon bringing together collegiate engineers, designers, and innovators to solve critical challenges in electric mobility, battery thermal management, and precision industrial automation. Mentored by leading engineers from automotive Tier-1 companies.',
        date: '2026-10-18',
        time: '08:30 AM – Next Day 06:00 PM',
        venue: 'Advanced CAD & Mechatronics Lab, CIET Campus, Coimbatore',
        category: 'Hackathon / Innovation',
        organizers: 'Department of Mechanical Engineering in Association with SAE Collegiate Club',
        registrationLink: 'https://ciet.ac.in/events/mechathon26',
        poster: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85',
        brochure: '/uploads/sample-brochure.pdf',
        status: 'upcoming',
        createdBy: 'staff-1',
        images: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85',
        ],
      },
      {
        id: 'event-2',
        title: 'Industrial Automation & Robot Kinematics Workshop',
        description: 'A 2-day hands-on intensive workshop covering industrial robot arm programming, trajectory planning, pneumatic pick-and-place end-effectors, and PLC integration.',
        date: '2026-10-02',
        time: '09:30 AM – 04:30 PM',
        venue: 'Robotics & Automation Center, Mechanical Block, CIET',
        category: 'Workshops',
        organizers: 'Mechatronics Research Cell, CIET',
        registrationLink: 'https://ciet.ac.in/events/robotics-workshop',
        poster: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85',
        brochure: '/uploads/sample-brochure.pdf',
        status: 'upcoming',
        createdBy: 'staff-2',
        images: [
          'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=85',
        ],
      },
      {
        id: 'event-3',
        title: 'Industrial Plant Study Tour: Lucas-TVS & Roots Industries',
        description: 'Comprehensive industrial exposure for III & IV Year Mechanical students to study high-volume automated manufacturing lines, cold forging, die casting, and lean assembly lines.',
        date: '2026-09-06',
        time: '08:00 AM – 05:30 PM',
        venue: 'Lucas-TVS & Roots Industries, Coimbatore Cluster',
        category: 'Industrial Visits',
        organizers: 'Industry-Institute Partnership Cell (IIPC)',
        registrationLink: '',
        poster: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=85',
        brochure: '/uploads/sample-brochure.pdf',
        status: 'completed',
        createdBy: 'staff-1',
        images: [
          'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=85',
          'https://images.unsplash.com/photo-1581092919535-7146ff1a5908?auto=format&fit=crop&w=1200&q=85',
        ],
      },
      {
        id: 'event-4',
        title: 'CFD in Aerospace & Automotive Design Masterclass',
        description: 'Distinguished lecture and simulation masterclass featuring Dr. K. Ramanathan from National Aerospace Laboratories on aerodynamic drag reduction.',
        date: '2026-08-14',
        time: '10:00 AM – 01:00 PM',
        venue: 'Mechanical Seminar Hall, CIET',
        category: 'Seminars',
        organizers: 'CIET Mechanical Association',
        registrationLink: '',
        poster: 'https://images.unsplash.com/photo-1517976487502-5f65342a76f0?auto=format&fit=crop&w=1200&q=85',
        brochure: '/uploads/sample-brochure.pdf',
        status: 'completed',
        createdBy: 'staff-2',
        images: [
          'https://images.unsplash.com/photo-1517976487502-5f65342a76f0?auto=format&fit=crop&w=1200&q=85',
        ],
      },
    ],
    announcements: [
      {
        id: 'announcement-1',
        title: 'SAE Collegiate Club 2026–27 Annual Team Recruitment',
        description: 'Applications are officially open for dynamic students across all batches for Design, Dynamics, Braking, Powertrain, and Sponsorship divisions for SAE BAJA and SUPRA competitions.',
        date: '2026-09-20',
        department: 'SAE Collegiate Club',
        uploadedBy: 'Prof. V. Pradeep Kumar (Faculty Advisor)',
        image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=85',
        type: 'ANNOUNCEMENT',
      },
      {
        id: 'announcement-2',
        title: 'Siemens Center of Excellence Lab Training Schedule',
        description: 'Registration for Semester V and VII students for the Certified CNC Tooling and NX CAM hands-on laboratory batch starting next Monday.',
        date: '2026-09-15',
        department: 'Department of Mechanical Engineering',
        uploadedBy: 'Dr. R. Karthikeyan (HOD)',
        image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=85',
        type: 'ANNOUNCEMENT',
      },
      {
        id: 'announcement-3',
        title: 'CIET Students Win 1st Prize at National CAD Olympiad',
        description: 'Hearty congratulations to Arjun Prakash (IV Year) and team for securing the top honor among 85 participating engineering colleges across India.',
        date: '2026-09-10',
        department: 'Student Achievements',
        uploadedBy: 'Staff Desk',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85',
        type: 'ANNOUNCEMENT',
      },
    ],
    brochures: [
      {
        id: 'brochure-1',
        title: 'MECHATHON ’26 Official Rules & Problem Statements',
        description: 'Complete guidelines, eligibility criteria, judging rubrics, prize pool details, and hardware tool access rules for the 36-hour hackathon.',
        date: '2026-09-18',
        uploadedBy: 'Dr. R. Karthikeyan (HOD)',
        thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        downloadLink: '/uploads/sample-brochure.pdf',
      },
      {
        id: 'brochure-2',
        title: 'Hands-on Electric Mobility & Battery Engineering Workshop',
        description: 'Two-week intensive summer workshop syllabus covering lithium battery pack design, cell balancing BMS, and dynamometer motor characterization.',
        date: '2026-09-12',
        uploadedBy: 'Dr. A. Sangeetha',
        thumbnail: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        downloadLink: '/uploads/sample-brochure.pdf',
      },
      {
        id: 'brochure-3',
        title: 'Department of Mechanical Engineering Annual Information Bulletin',
        description: 'Comprehensive department profile, faculty credentials, laboratory infrastructure, patent portfolio, and placement track record.',
        date: '2026-08-01',
        uploadedBy: 'Department Administration',
        thumbnail: 'https://images.unsplash.com/photo-1581092919535-7146ff1a5908?auto=format&fit=crop&w=800&q=80',
        downloadLink: '/uploads/sample-brochure.pdf',
      },
    ],
    gallery: [
      {
        id: 'gallery-1',
        title: 'Precision 5-Axis CNC Milling Center in Action',
        category: 'Workshops',
        image: 'https://images.unsplash.com/photo-1581092919535-7146ff1a5908?auto=format&fit=crop&w=900&q=85',
        caption: 'Students executing high-precision aerospace impeller milling.',
      },
      {
        id: 'gallery-2',
        title: 'Advanced CAD & Virtual Simulation Studio',
        category: 'Events',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=85',
        caption: 'High-performance workstation lab running ANSYS & SolidWorks simulations.',
      },
      {
        id: 'gallery-3',
        title: 'CIET SAE BAJA Chassis Fabrication & Rigidity Test',
        category: 'SAE Club',
        image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=900&q=85',
        caption: 'Collegiate racing team verifying spaceframe torsional weld integrity.',
      },
      {
        id: 'gallery-4',
        title: 'Engine Testing & Dynamometer Emission Cell',
        category: 'Student Activities',
        image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=900&q=85',
        caption: 'Evaluating alternative biofuel blends in computerized multi-cylinder test bench.',
      },
      {
        id: 'gallery-5',
        title: 'Industrial Study Delegations at Foundry & Forging Facility',
        category: 'Industrial Visits',
        image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=900&q=85',
        caption: 'Third-year students observing modern casting molten metal pouring operations.',
      },
      {
        id: 'gallery-6',
        title: 'National Robotics Competition Arena Finals',
        category: 'Competitions',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=85',
        caption: 'CIET autonomous vehicle prototype performing path navigation.',
      },
      {
        id: 'gallery-7',
        title: 'Faculty Research Presentation at International Symposium',
        category: 'Faculty Activities',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=900&q=85',
        caption: 'Dr. R. Karthikeyan delivering keynote address on phase change heat sinks.',
      },
      {
        id: 'gallery-8',
        title: 'Additive Manufacturing & Rapid Prototyping Showcase',
        category: 'Seminars',
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85',
        caption: 'Display of carbon-reinforced composite parts printed by students teams.',
      },
    ],
    certificates: [
      {
        id: 'certificate-1',
        title: 'SolidWorks Certified Professional (CSWP)',
        issuingOrganization: 'Dassault Systèmes',
        date: '2025-04-12',
        description: 'Industry-standard accreditation in advanced mechanical modeling, complex lofting, and assembly validation.',
        studentId: 'student-1',
        studentName: 'Arjun Prakash',
        category: 'Students',
        fileUrl: '/uploads/sample-brochure.pdf',
      },
      {
        id: 'certificate-2',
        title: 'National Level CAD Design Marathon — First Prize',
        issuingOrganization: 'National Institute of Technology, Trichy',
        date: '2025-03-24',
        description: 'Honored with 1st Prize in 12-hour high precision component design challenge.',
        studentId: 'student-1',
        studentName: 'Arjun Prakash',
        category: 'Competitions',
        fileUrl: '/uploads/sample-brochure.pdf',
      },
      {
        id: 'certificate-3',
        title: 'ANSYS Fluent Advanced CFD Certification',
        issuingOrganization: 'ANSYS Inc. / NPTEL',
        date: '2025-06-15',
        description: 'Comprehensive accreditation in multiphase flow and conjugate heat transfer.',
        studentId: 'student-2',
        studentName: 'Nivedha S.',
        category: 'Students',
        fileUrl: '/uploads/sample-brochure.pdf',
      },
      {
        id: 'certificate-4',
        title: 'Certified Production & Quality Engineer',
        issuingOrganization: 'TÜV SÜD South Asia',
        date: '2024-11-05',
        description: 'Quality management systems, Six Sigma green belt certification, and CMM measurement.',
        studentId: 'student-1',
        studentName: 'Arjun Prakash',
        category: 'Workshops',
        fileUrl: '/uploads/sample-brochure.pdf',
      },
    ],
    alumni: [
      {
        id: 'alumni-1',
        name: 'S. Nandhakumar',
        graduationYear: '2019',
        company: 'Tata Motors',
        designation: 'Senior Vehicle Dynamics Engineer',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        achievement: 'Led the multi-link suspension kinematics tuning for Tata Harrier & Safari EV models.',
        linkedin: 'https://www.linkedin.com',
      },
      {
        id: 'alumni-2',
        name: 'Priyanka Sundar',
        graduationYear: '2021',
        company: 'Tesla Motors',
        designation: 'Thermal Systems Design Engineer',
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        achievement: 'Developed liquid-glycol cooling manifolds for next-generation 4680 battery modules.',
        linkedin: 'https://www.linkedin.com',
      },
      {
        id: 'alumni-3',
        name: 'K. Vigneshwaran',
        graduationYear: '2018',
        company: 'ISRO (Indian Space Research Organisation)',
        designation: 'Scientist / Engineer ‘SC’',
        profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        achievement: 'Contributed to cryogenic stage propellant feed valves and structural verification testing.',
        linkedin: 'https://www.linkedin.com',
      },
      {
        id: 'alumni-4',
        name: 'M. Hariharan',
        graduationYear: '2022',
        company: 'L&T Heavy Engineering',
        designation: 'Assistant Manager — Precision Tooling',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        achievement: 'Streamlined nuclear reactor vessel component precision manufacturing cycles by 22%.',
        linkedin: 'https://www.linkedin.com',
      },
    ],
    saeClub: {
      title: 'CIET SAE Collegiate Club (Society of Automotive Engineers)',
      motto: 'Design. Build. Race. Inspire.',
      about: 'The CIET SAE Collegiate Club is a premier student-run engineering collective that translates classroom theory into championship-grade race vehicles, electric mobility prototypes, and unmanned aerial crafts. With dedicated fabrication studios, machine tools, and dynamic testing tracks, our teams represent CIET in prestigious international competitions.',
      divisions: [
        {
          name: 'BAJA SAE Racing',
          description: 'Custom all-terrain vehicle design with rugged 4130 tubular spaceframe, CVT gearbox, and double-wishbone suspension.',
          captain: 'Arjun Prakash (IV Year)',
          vehicleSpecs: 'Briggs & Stratton 10HP, Dual-Circuit Disc Brakes, 300mm Ground Clearance',
        },
        {
          name: 'CIET SUPRA Formula Student',
          description: 'High-downforce open-wheel formula race car engineered for autocross acceleration, skidpad stability, and endurance.',
          captain: 'Siddharth M. (IV Year)',
          vehicleSpecs: 'Carbon Composite Aero Wings, Custom Uprights, Telemetry CAN Bus',
        },
        {
          name: 'E-Kart Racing Division',
          description: 'Pure-electric high-efficiency racing kart featuring lithium iron phosphate battery packs and custom BMS thermal isolation.',
          captain: 'Dharshini K. (III Year)',
          vehicleSpecs: '48V 10kW BLDC Motor, Custom Regenerative Braking Unit',
        },
        {
          name: 'Aero Design Collegiate Wing',
          description: 'Fixed-wing autonomous aircraft designed for maximum payload fraction, carbon fiber spars, and autonomous waypoint telemetry.',
          captain: 'Kishore Kumar (III Year)',
          vehicleSpecs: '2.4m Wingspan, High Lift Clark-Y Airfoil, Pixhawk Autopilot',
        },
      ],
      activities: [
        'Annual vehicle fabrication and teardown bootcamps',
        'National participation in BAJA SAE India & Formula Bharat',
        'Advanced CAD & CFD simulation workshops for vehicle dynamics',
        'Industry expert mentorship sessions from automotive R&D leaders',
        'EV powertrain design & telemetry instrumentation workshops',
      ],
      events: [
        'Formula Prototype Design Challenge 2026',
        'Electric Vehicle Powertrain Optimization Sprint',
        'CIET Autocross Student Invitational',
        'Hands-on Suspension Geometry Tuning Clinic',
      ],
      members: [
        { name: 'Arjun Prakash', role: 'Club President & BAJA Captain', batch: '2023 — 2027' },
        { name: 'Nivedha S.', role: 'Treasurer & Aerodynamics Lead', batch: '2024 — 2028' },
        { name: 'Dharshini K.', role: 'Head of Powertrain & E-Kart Lead', batch: '2024 — 2028' },
        { name: 'Mohamed Rafi', role: 'Head of Fabrication & Machining', batch: '2025 — 2029' },
        { name: 'Prof. V. Pradeep Kumar', role: 'Faculty Advisor', batch: 'Faculty' },
      ],
      achievements: [
        'Overall 3rd in Acceleration & Skidpad at BAJA SAE India (Virtuals)',
        'Best Ergonomics & Driver Comfort Award — All-India E-Karting Challenge 2025',
        'State Champions — Formula Student Virtual Design Review 2024',
      ],
      projects: [
        {
          title: 'Gen-4 EV BAJA All-Terrain Vehicle',
          status: 'Under Active Fabrication',
          desc: '15kW water-cooled PMSM motor coupled with customized planetary reduction gearset.',
        },
        {
          title: 'Active Rear Aerodynamic Drag Reduction System (DRS)',
          status: 'Wind Tunnel Testing Complete',
          desc: 'Servo-actuated dual-element carbon wing achieving 40% drag reduction on straights.',
        },
      ],
      gallery: [
        'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=85',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85',
      ],
      announcements: [
        'Team selection trials for BAJA 2027 kick off this Saturday at the Workshop Arena.',
        'Technical workshop on CAN Bus Telemetry and Data Acquisition announced for Oct 5.',
      ],
    },
    departmentInfo: {
      collegeName: 'Coimbatore Institute of Engineering and Technology (CIET)',
      departmentName: 'Department of Mechanical Engineering',
      location: 'Narasipuram Post, Thondamuthur (via), Coimbatore - 641 109, Tamil Nadu, India',
      googleMapsUrl: 'https://maps.google.com/?q=CIET+College+Coimbatore+Tamil+Nadu',
      contactEmail: 'mech@ciet.ac.in',
      contactPhone: '+91 422 2970701 / 702',
      instagramUrl: 'https://instagram.com/ciet_mech_official',
      linkedinUrl: 'https://linkedin.com/school/ciet-coimbatore',
      youtubeUrl: 'https://youtube.com/@ciet_coimbatore',
      establishedYear: '2001',
      vision: 'To emerge as a renowned center of excellence in Mechanical Engineering education and research, fostering ethically committed, technically proficient, and innovative engineering leaders capable of advancing sustainable global technologies and serving industrial society.',
      mission: [
        'Deliver rigorous, industry-aligned foundational and applied mechanical engineering curricula supported by modern experimental and computational infrastructure.',
        'Foster an active ecosystem of multidisciplinary research, innovation, and entrepreneurship in green energy, automation, and advanced materials.',
        'Strengthen sustainable partnerships with manufacturing and automotive industries to provide experiential learning, internships, and technology transfer.',
        'Inculcate lifelong learning values, leadership attributes, environmental responsibility, and professional ethics among engineering graduates.',
      ],
      curriculum: [
        { semester: 'Semester I', courses: ['Matrices & Calculus', 'Engineering Physics', 'Engineering Chemistry', 'Engineering Graphics & CAD Basics', 'Basic Electrical & Electronics'] },
        { semester: 'Semester II', courses: ['Differential Equations & Complex Analysis', 'Material Science & Metallurgy', 'Engineering Mechanics', 'Manufacturing Processes — I', 'Python Programming for Engineers'] },
        { semester: 'Semester III', courses: ['Transforms & Partial Differential Equations', 'Engineering Thermodynamics', 'Fluid Mechanics and Machinery', 'Manufacturing Technology — II', 'Kinematics of Machinery'] },
        { semester: 'Semester IV', courses: ['Statistics & Numerical Methods', 'Thermal Engineering', 'Strength of Materials', 'Dynamics of Machinery', 'Metrology & Quality Assurance'] },
        { semester: 'Semester V', courses: ['Design of Machine Elements', 'Heat and Mass Transfer', 'Finite Element Analysis', 'Applied Hydraulics & Pneumatics', 'Professional Elective — I'] },
        { semester: 'Semester VI', courses: ['Design of Transmission Systems', 'Computer Aided Design & Manufacturing (CAD/CAM)', 'Automobile Engineering', 'Professional Elective — II', 'Open Elective — I'] },
        { semester: 'Semester VII', courses: ['Mechatronics & Robotics', 'Power Plant Engineering', 'Renewable Energy Technologies', 'Professional Elective — III', 'Professional Elective — IV'] },
        { semester: 'Semester VIII', courses: ['Industrial Management & Entrepreneurship', 'Project Work Phase — II / Capstone Industrial Prototype'] },
      ],
      syllabus: [
        {
          id: 'syl-1',
          title: 'Engineering Thermodynamics',
          regulation: 'R2021',
          academicYear: '2024-2025',
          semester: 'Semester III',
          subject: 'ME3301',
          credits: 4,
          pdfUrl: '/uploads/sample-brochure.pdf',
          description: 'Zeroth, First & Second Laws of Thermodynamics, Entropy, Pure Substances, Gas Power Cycles, and Vapor Power Cycles.',
        },
        {
          id: 'syl-2',
          title: 'Fluid Mechanics & Machinery',
          regulation: 'R2021',
          academicYear: '2024-2025',
          semester: 'Semester III',
          subject: 'ME3302',
          credits: 4,
          pdfUrl: '/uploads/sample-brochure.pdf',
          description: 'Fluid statics, Bernoulli equation, Boundary layer theory, Flow through pipes, Turbines, and Centrifugal pumps.',
        },
        {
          id: 'syl-3',
          title: 'Design of Machine Elements',
          regulation: 'R2021',
          academicYear: '2024-2025',
          semester: 'Semester V',
          subject: 'ME3501',
          credits: 4,
          pdfUrl: '/uploads/sample-brochure.pdf',
          description: 'Steady and variable stresses, Shafts, Couplings, Fasteners, Welded joints, Springs, and Rolling contact bearings.',
        },
        {
          id: 'syl-4',
          title: 'Electric & Hybrid Vehicle Engineering',
          regulation: 'R2024',
          academicYear: '2025-2026',
          semester: 'Semester VI',
          subject: 'ME3612',
          credits: 3,
          pdfUrl: '/uploads/sample-brochure.pdf',
          description: 'EV architectures, traction motors, lithium battery pack thermal sizing, inverter topology, and regenerative braking.',
        },
        {
          id: 'syl-5',
          title: 'Additive Manufacturing & Rapid Prototyping',
          regulation: 'R2024',
          academicYear: '2025-2026',
          semester: 'Semester VII',
          subject: 'ME3715',
          credits: 3,
          pdfUrl: '/uploads/sample-brochure.pdf',
          description: 'SLA, SLS, FDM, metal DMLS, slicing algorithms, topology optimization, and post-processing quality control.',
        },
      ],
      regulations: [
        {
          id: 'reg-1',
          title: 'Academic Regulation R2021 (Autonomous Curriculum & Syllabi)',
          regulation: 'R2021',
          academicYear: '2021–2025',
          effectiveDate: 'August 2021',
          downloadLink: '/uploads/sample-brochure.pdf',
          summary: 'Complete academic guidelines, grading system, CBCS rules, honors/minor degree qualifications, and evaluation standards.',
        },
        {
          id: 'reg-2',
          title: 'Academic Regulation R2024 (Industry 4.0 & NEP Aligned Curriculum)',
          regulation: 'R2024',
          academicYear: '2024–2028',
          effectiveDate: 'August 2024',
          downloadLink: '/uploads/sample-brochure.pdf',
          summary: 'Revised curriculum incorporating AI in manufacturing, green mobility tracks, and mandatory semester-long industrial internships.',
        },
      ],
    },
  };
};

const removeSeedRecords = (data, seedData) => {
  Object.keys(data).forEach((key) => {
    const value = data[key];
    const seedValue = seedData[key];

    if (Array.isArray(value) && Array.isArray(seedValue)) {
      data[key] = value.filter((record) => {
        if (key === 'users' && record.role === 'admin') return true;
        return !seedValue.some((seedRecord) => {
          if (record && seedRecord && typeof record === 'object' && typeof seedRecord === 'object') {
            if (record.id && seedRecord.id) return record.id === seedRecord.id;
            return JSON.stringify(record) === JSON.stringify(seedRecord);
          }
          return record === seedRecord;
        });
      });
      return;
    }

    if (value && seedValue && typeof value === 'object' && typeof seedValue === 'object') {
      removeSeedRecords(value, seedValue);
    }
  });

  const seededStudentIds = new Set((seedData.students || []).map((student) => student.id));
  data.resumes = (data.resumes || []).filter((resume) => !seededStudentIds.has(resume.studentId));
  return data;
};

const ensureSeedData = () => {
  const seed = buildInitialDatabase();
  removeSeedRecords(seed, seed);
  if (!fs.existsSync(dbPath)) {
    seed.resumes = seed.resumes || [];
    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2));
    return seed;
  }

  try {
    const existing = removeSeedRecords(JSON.parse(fs.readFileSync(dbPath, 'utf8')), buildInitialDatabase());
    if (existing && existing.users && existing.batches && existing.events && existing.saeClub?.divisions) {
      existing.resumes = existing.resumes || [];
      if (existing !== seed) {
        fs.writeFileSync(dbPath, JSON.stringify(existing, null, 2));
      }
      return existing;
    }
  } catch (e) {
    console.warn('Re-seeding database due to missing schema fields.');
  }

  fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2));
  return seed;
};

// Initialize DB
let db = supabase || isVercel ? null : ensureSeedData();

const getDb = () => {
  const context = requestContext.getStore();
  if (context) return context.payload.database;
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (err) {
    return db;
  }
};

const saveDb = (data) => {
  const context = requestContext.getStore();
  if (context) {
    context.payload.database = data;
    context.dirty = true;
    return;
  }
  db = data;
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const releaseCloudLock = async (token) => {
  if (!supabase || !token) return;
  const { error } = await supabase.rpc('release_portal_state_lock', { p_token: token });
  if (error) throw error;
};

const acquireCloudLock = async (token) => {
  const deadline = Date.now() + 7000;
  while (Date.now() < deadline) {
    const { data, error } = await supabase.rpc('acquire_portal_state_lock', { p_token: token });
    if (error) throw error;
    if (data === true) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
};

const cloudStateMiddleware = async (req, res, next) => {
  if (!supabase || !req.path.startsWith('/api/') || req.path === '/api/health') return next();

  const lockToken = randomBytes(16).toString('hex');
  const locked = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  try {
    if (locked && !(await acquireCloudLock(lockToken))) {
      return res.status(503).json({ message: 'The portal is busy saving changes. Please retry shortly.' });
    }

    const { data: stateRow, error } = await supabase
      .from('portal_state')
      .select('payload')
      .eq('id', 1)
      .maybeSingle();
    if (error) throw error;
    if (!stateRow?.payload?.database || !stateRow?.payload?.curriculum) {
      if (locked) await releaseCloudLock(lockToken);
      return res.status(503).json({ message: 'Supabase is connected, but portal data has not been imported yet. Follow the Supabase setup steps in README.md.' });
    }

    const context = {
      payload: stateRow.payload,
      dirty: false,
      lockToken: locked ? lockToken : null,
      locked,
    };
    const sendJson = res.json.bind(res);
    let responseStarted = false;
    res.json = (body) => {
      if (responseStarted) return res;
      responseStarted = true;
      const commitAndSend = async () => {
        if (context.locked) {
          if (context.dirty) {
            const { data, error: saveError } = await supabase
              .from('portal_state')
              .update({ payload: context.payload, updated_at: new Date().toISOString() })
              .eq('id', 1)
              .eq('lock_token', context.lockToken)
              .select('id')
              .maybeSingle();
            if (saveError) throw saveError;
            if (!data) throw new Error('Portal state lock expired before changes were saved.');
          }
          await releaseCloudLock(context.lockToken);
          context.locked = false;
        }
        sendJson(body);
      };

      commitAndSend().catch(async (saveError) => {
        console.error('[api/state] Could not persist portal state:', saveError.message);
        try {
          await releaseCloudLock(context.lockToken);
        } catch (releaseError) {
          console.error('[api/state] Could not release portal state lock:', releaseError.message);
        }
        if (!res.headersSent) {
          res.status(503);
          sendJson({ message: 'The portal could not save this change. Please retry.' });
        }
      });
      return res;
    };

    requestContext.run(context, next);
  } catch (error) {
    if (locked) {
      try {
        await releaseCloudLock(lockToken);
      } catch (releaseError) {
        console.error('[api/state] Could not release portal state lock:', releaseError.message);
      }
    }
    console.error('[api/state] Could not load portal state:', error.message);
    return res.status(503).json({ message: 'The portal database is unavailable. Check the Supabase configuration and setup.' });
  }
};

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      studentId: user.studentId || '',
      staffId: user.staffId || '',
      registerNumber: user.registerNumber || '',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  department: user.department || 'Mechanical Engineering',
  studentId: user.studentId || '',
  staffId: user.staffId || '',
  registerNumber: user.registerNumber || '',
  createdAt: user.createdAt,
});

const getCurrentStudentFromUser = (data, user) => {
  if (!user || user.role !== 'student') {
    return null;
  }

  return (data.students || []).find(
    (student) =>
      student.userId === user.id ||
      student.id === user.studentId ||
      student.registerNumber === user.registerNumber
  ) || null;
};

const getStudentPortfolioSnapshot = (student = {}) => ({
  id: student.id || '',
  userId: student.userId || '',
  name: student.name || '',
  registerNumber: student.registerNumber || '',
  email: student.email || '',
  phone: student.phone || '',
  profilePhoto: student.profilePhoto || '',
  batch: student.batch || '',
  academicYear: student.academicYear || '',
  yearOfStudy: student.yearOfStudy || '',
  section: student.section || '',
  department: 'Mechanical Engineering',
  college: 'CIET College, Coimbatore',
  location: 'Coimbatore, Tamil Nadu, India',
  degree: 'Bachelor of Engineering (B.E.)',
  about: student.about || '',
  skills: Array.isArray(student.skills) ? student.skills : [],
  projects: Array.isArray(student.projects) ? student.projects : [],
  achievements: Array.isArray(student.achievements) ? student.achievements : [],
  certificates: Array.isArray(student.certificates) ? student.certificates : [],
  eventsParticipated: Array.isArray(student.eventsParticipated) ? student.eventsParticipated : [],
  socialLinks: student.socialLinks || { linkedin: '', github: '', instagram: '' },
  galleryImages: Array.isArray(student.galleryImages) ? student.galleryImages : [],
  internships: Array.isArray(student.internships) ? student.internships : [],
  clubs: Array.isArray(student.clubs) ? student.clubs : [],
});

const buildProfessionalSummary = (student) => {
  const skills = Array.isArray(student.skills) ? student.skills.filter(Boolean).slice(0, 4) : [];
  const projectTitles = Array.isArray(student.projects) ? student.projects.map((project) => project.title).filter(Boolean).slice(0, 2) : [];

  const skillText = skills.length > 0 ? skills.join(', ') : 'design, analysis, and manufacturing';
  const projectText = projectTitles.length > 0 ? projectTitles.join(' and ') : 'industry-focused mechanical engineering projects';

  return `Mechanical Engineering student at CIET College, Coimbatore, with a focus on ${skillText}. Experienced in developing ${projectText} and actively strengthening technical and practical problem-solving skills in design, simulation, and manufacturing.`;
};

const getDefaultResumeFromStudent = (student = {}) => ({
  studentId: student.id || '',
  title: `${student.name ? student.name.split(' ')[0] : 'My'} Mechanical Resume`,
  template: 'ats',
  summary: student.about || buildProfessionalSummary(student),
  selectedSkills: Array.isArray(student.skills) ? student.skills.slice(0, 10) : [],
  selectedProjects: Array.isArray(student.projects) ? student.projects.slice(0, 3).map((project) => project.id || project.title) : [],
  selectedCertificates: Array.isArray(student.certificates) ? student.certificates.slice(0, 2).map((cert) => cert.id || cert.title) : [],
  selectedAchievements: Array.isArray(student.achievements) ? student.achievements.slice(0, 4) : [],
  selectedActivities: Array.isArray(student.eventsParticipated) ? student.eventsParticipated.slice(0, 4) : [],
  selectedExperience: [],
  sectionOrder: ['summary', 'education', 'skills', 'projects', 'experience', 'certifications', 'achievements', 'workshops', 'leadership', 'languages', 'interests'],
  visibleSections: ['summary', 'education', 'skills', 'projects', 'experience', 'certificates', 'achievements', 'workshops', 'leadership', 'languages', 'interests'],
  accentColor: '#2563eb',
  atsMode: false,
  fontSize: 11,
  profilePhotoVisible: true,
  pageMargins: 'normal',
  resumeType: 'student',
});

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session. Please sign in again.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. You do not have permission for this action.' });
  }
  next();
};

const upload = multer({
  storage: supabase
    ? multer.memoryStorage()
    : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const safe = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-');
        const unique = `${Date.now()}-${safe}`;
        cb(null, unique);
      },
    }),
  limits: { fileSize: supabase ? 4 * 1024 * 1024 : 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|webp|pdf|doc|docx)$/i;
    if (!allowed.test(file.originalname)) {
      return cb(new Error('Unsupported file format. Supported: JPG, JPEG, PNG, WEBP, PDF, DOC, DOCX.'));
    }
    cb(null, true);
  },
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || frontendOrigins.has(origin) || (!isProduction && frontendOrigins.size === 0)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/api', (req, res, next) => {
  if (!isProduction || missingServerEnvironment.length === 0 || req.path === '/health') {
    return next();
  }
  return res.status(503).json({
    message: 'The production API is missing required server environment variables.',
    missingEnvironmentVariables: missingServerEnvironment,
  });
});
if (!isVercel) app.use('/uploads', express.static(uploadsDir));
app.use(cloudStateMiddleware);

// --- Health ---
app.get('/api/health', async (_req, res) => {
  if (missingServerEnvironment.length > 0) {
    return res.status(503).json({
      status: 'error',
      service: 'CIET Mechanical Engineering Department Portal API',
      version: '2.0.0',
      database: { status: 'unavailable' },
      missingEnvironmentVariables: missingServerEnvironment,
    });
  }

  if (supabase) {
    try {
      const { data: stateRow, error } = await supabase
        .from('portal_state')
        .select('payload')
        .eq('id', 1)
        .maybeSingle();
      if (error) throw error;
      if (!stateRow?.payload?.database || !stateRow?.payload?.curriculum) {
        return res.status(503).json({
          status: 'error',
          service: 'CIET Mechanical Engineering Department Portal API',
          version: '2.0.0',
          database: { status: 'connected', initialized: false },
          message: 'Supabase is reachable, but portal data has not been imported. Run npm run migrate:supabase.',
        });
      }
      return res.json({
        status: 'ok',
        service: 'CIET Mechanical Engineering Department Portal API',
        version: '2.0.0',
        database: { status: 'connected', collections: Object.keys(stateRow.payload.database).length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[api/health] Supabase portal_state check failed:', error.message);
      return res.status(503).json({
        status: 'error',
        service: 'CIET Mechanical Engineering Department Portal API',
        version: '2.0.0',
        database: { status: 'unavailable', errorCode: error.code || null },
        message: 'Supabase portal_state is unavailable. Verify the SQL migration and server-side Supabase credentials.',
      });
    }
  }

  try {
    const database = getDb();
    const collections = Object.keys(database).length;

    res.json({
      status: 'ok',
      service: 'CIET Mechanical Engineering Department Portal API',
      version: '2.0.0',
      database: { status: supabase ? 'connected' : 'local', collections },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    res.status(503).json({
      status: 'error',
      service: 'CIET Mechanical Engineering Department Portal API',
      version: '2.0.0',
      database: { status: 'unavailable' },
      timestamp: new Date().toISOString(),
    });
  }
});

// --- Dynamic Feed ---
app.get('/api/feed', (_req, res) => {
  const data = getDb();
  const feed = [];

  // Events in feed
  (data.events || []).forEach((ev) => {
    feed.push({
      id: `feed-${ev.id}`,
      originalId: ev.id,
      type: 'EVENT',
      title: ev.title,
      description: ev.description,
      date: ev.date,
      time: ev.time,
      venue: ev.venue,
      department: 'Mechanical Engineering',
      uploadedBy: ev.organizers || 'Department Desk',
      image: ev.poster || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85',
      brochure: ev.brochure || '',
      registrationLink: ev.registrationLink || '',
      category: ev.category || 'Event',
      status: ev.status || 'upcoming',
      tag: ev.status === 'upcoming' ? 'Registration Open' : 'Completed Activity',
      accent: 'blue',
    });
  });

  // Announcements in feed
  (data.announcements || []).forEach((an) => {
    feed.push({
      id: `feed-${an.id}`,
      originalId: an.id,
      type: 'ANNOUNCEMENT',
      title: an.title,
      description: an.description,
      date: an.date,
      department: an.department || 'Mechanical Department',
      uploadedBy: an.uploadedBy || 'Faculty / Staff',
      image: an.image || 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=85',
      category: 'Department Notice',
      tag: 'Official Notice',
      accent: 'amber',
    });
  });

  // Brochures in feed
  (data.brochures || []).forEach((br) => {
    feed.push({
      id: `feed-${br.id}`,
      originalId: br.id,
      type: 'BROCHURE',
      title: br.title,
      description: br.description,
      date: br.date,
      department: 'Mechanical Engineering',
      uploadedBy: br.uploadedBy || 'Staff Desk',
      image: br.thumbnail || 'https://images.unsplash.com/photo-1581092919535-7146ff1a5908?auto=format&fit=crop&w=800&q=80',
      brochure: br.downloadLink || '',
      category: 'Brochures & Resources',
      tag: 'Downloadable PDF',
      accent: 'green',
    });
  });

  // Student achievements in feed
  (data.students || []).forEach((st) => {
    if (st.achievements && st.achievements.length > 0) {
      st.achievements.slice(0, 2).forEach((ach, idx) => {
        feed.push({
          id: `feed-ach-${st.id}-${idx}`,
          originalId: st.id,
          type: 'ACHIEVEMENT',
          title: `${st.name} (${st.batch}): ${ach}`,
          description: `Student achievement in Department of Mechanical Engineering. Registered: ${st.registerNumber}, ${st.yearOfStudy}.`,
          date: '2026-09-15',
          department: `Batch ${st.batch}`,
          uploadedBy: 'Student Portfolio Record',
          image: st.profilePhoto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
          category: 'Student Accolades',
          tag: 'Honor Roll',
          accent: 'purple',
          studentRegNo: st.registerNumber,
        });
      });
    }
  });

  if (fs.existsSync(curriculumPath)) {
    feed.push({
      id: 'feed-r2023-mechanical-curriculum',
      type: 'CURRICULUM',
      title: 'Regulation 2023 – B.E. Mechanical Engineering Curriculum & Syllabus',
      description: 'Official curriculum and syllabus for students admitted from 2023–2024 onwards, published by CIET Mechanical Engineering.',
      department: 'Mechanical Engineering',
      uploadedBy: 'Official Regulation 2023 PDF',
      category: 'Curriculum & Syllabus',
      tag: 'OFFICIAL · R2023',
      accent: 'blue',
    });
  }

  feed.sort((a, b) => new Date(b.date || '2020-01-01') - new Date(a.date || '2020-01-01'));
  res.json(feed);
});

// --- Auth Routes ---
app.post('/api/auth/register', (req, res) => {
  const input = req.body || {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = typeof input.password === 'string' ? input.password : '';
  const role = input.role || 'student';
  const registerNumber = typeof input.registerNumber === 'string' ? input.registerNumber.trim().toUpperCase() : '';

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }
  if (!['student', 'staff'].includes(role)) {
    return res.status(400).json({ message: 'Role must be either student or staff.' });
  }
  if (role === 'student' && !registerNumber) {
    return res.status(400).json({ message: 'A student registration number is required.' });
  }

  try {
    const data = getDb();
    const existing = data.users.find((user) => user.email.toLowerCase() === email);
    if (existing) {
      return res.status(409).json({ message: 'An account with this email address already exists.' });
    }
    if (role === 'student' && data.students.some((student) => student.registerNumber?.toUpperCase() === registerNumber)) {
      return res.status(409).json({ message: 'A student with this registration number already exists.' });
    }

    const userId = `user-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    let studentId = '';
    let staffId = '';

    if (role === 'student') {
      studentId = `student-${Date.now()}`;
      data.students.push({
        id: studentId,
        userId,
        name,
        registerNumber,
        batch: input.batch || '2025 — 2029',
        academicYear: input.academicYear || '2025-2029',
        section: input.section || 'A',
        yearOfStudy: input.yearOfStudy || 'II Year',
        email,
        phone: typeof input.phone === 'string' ? input.phone.trim() : '',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        skills: ['CAD Design', 'Engineering Mechanics'],
        about: 'Mechanical engineering undergraduate student at CIET Coimbatore.',
        projects: [],
        achievements: [],
        certificates: [],
        eventsParticipated: [],
        galleryImages: [],
        socialLinks: { linkedin: '', github: '', instagram: '' },
      });
    } else {
      staffId = `staff-${Date.now()}`;
      data.staff.push({
        id: staffId,
        userId,
        name,
        designation: input.designation || 'Assistant Professor',
        qualification: input.qualification || 'M.E. (Mechanical Engineering)',
        specialization: input.specialization || 'Mechanical Engineering',
        experience: '3 Years',
        email,
        phone: typeof input.phone === 'string' ? input.phone.trim() : '',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        about: 'Faculty member in the Department of Mechanical Engineering, CIET.',
        publications: '',
        areasOfInterest: ['Manufacturing', 'Machine Design'],
      });
    }

    const newUser = {
      id: userId,
      name,
      email,
      passwordHash,
      role,
      phone: typeof input.phone === 'string' ? input.phone.trim() : '',
      department: 'Mechanical Engineering',
      studentId,
      staffId,
      registerNumber,
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    saveDb(data);

    const token = signToken(newUser);
    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error('[auth/register] Registration failed:', error.message);
    return res.status(500).json({ message: 'Registration could not be completed. Please try again later.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const data = getDb();

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = data.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user);
  res.json({
    message: 'Signed in successfully.',
    token,
    user: sanitizeUser(user),
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const data = getDb();
  const user = data.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  res.json({ user: sanitizeUser(user) });
});

app.get('/api/student/profile', authMiddleware, requireRole('student'), (req, res) => {
  const data = getDb();
  const student = getCurrentStudentFromUser(data, req.user);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }
  res.json({ student: getStudentPortfolioSnapshot(student) });
});

app.get('/api/student/portfolio', authMiddleware, requireRole('student'), (req, res) => {
  const data = getDb();
  const student = getCurrentStudentFromUser(data, req.user);
  if (!student) {
    return res.status(404).json({ message: 'Student portfolio not found.' });
  }
  res.json({ portfolio: getStudentPortfolioSnapshot(student) });
});

app.get('/api/student/resumes', authMiddleware, requireRole('student'), (req, res) => {
  const data = getDb();
  const student = getCurrentStudentFromUser(data, req.user);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  const resumes = (data.resumes || []).filter((item) => item.studentId === student.id);
  res.json({ resumes });
});

app.get('/api/student/resumes/:id', authMiddleware, requireRole('student'), (req, res) => {
  const data = getDb();
  const student = getCurrentStudentFromUser(data, req.user);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  const resume = (data.resumes || []).find((item) => item.id === req.params.id && item.studentId === student.id);
  if (!resume) {
    return res.status(404).json({ message: 'Resume not found.' });
  }

  res.json({ resume });
});

app.post('/api/student/resumes', authMiddleware, requireRole('student'), (req, res) => {
  const data = getDb();
  const student = getCurrentStudentFromUser(data, req.user);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  const payload = {
    ...getDefaultResumeFromStudent(student),
    ...req.body,
    id: req.body.id || `resume-${Date.now()}`,
    studentId: student.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.resumes = data.resumes || [];
  data.resumes.unshift(payload);
  saveDb(data);
  res.status(201).json({ message: 'Resume saved successfully.', resume: payload });
});

app.put('/api/student/resumes/:id', authMiddleware, requireRole('student'), (req, res) => {
  const data = getDb();
  const student = getCurrentStudentFromUser(data, req.user);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  const resumeIndex = (data.resumes || []).findIndex((item) => item.id === req.params.id && item.studentId === student.id);
  if (resumeIndex === -1) {
    return res.status(404).json({ message: 'Resume not found.' });
  }

  const updated = {
    ...(data.resumes[resumeIndex] || {}),
    ...req.body,
    id: req.params.id,
    studentId: student.id,
    updatedAt: new Date().toISOString(),
  };

  data.resumes[resumeIndex] = updated;
  saveDb(data);
  res.json({ message: 'Resume updated successfully.', resume: updated });
});

app.delete('/api/student/resumes/:id', authMiddleware, requireRole('student'), (req, res) => {
  const data = getDb();
  const student = getCurrentStudentFromUser(data, req.user);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  const before = (data.resumes || []).length;
  data.resumes = (data.resumes || []).filter((item) => !(item.id === req.params.id && item.studentId === student.id));

  if ((data.resumes || []).length === before) {
    return res.status(404).json({ message: 'Resume not found.' });
  }

  saveDb(data);
  res.json({ message: 'Resume deleted successfully.' });
});

app.post('/api/student/resumes/:id/generate-pdf', authMiddleware, requireRole('student'), (req, res) => {
  const data = getDb();
  const student = getCurrentStudentFromUser(data, req.user);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  const resume = (data.resumes || []).find((item) => item.id === req.params.id && item.studentId === student.id);
  if (!resume) {
    return res.status(404).json({ message: 'Resume not found.' });
  }

  const fileName = `${student.name || 'Student'}_Mechanical_Resume.pdf`;
  res.json({
    message: 'Resume is ready to be exported as a selectable-text PDF.',
    fileName,
    resume,
    pdfReady: true,
  });
});

app.post('/api/auth/forgot', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Please provide your registered email.' });
  }
  const data = getDb();
  const user = data.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ message: 'No registered user found with this email.' });
  }
  res.json({
    message: `Password reset instructions have been verified for ${email}. You may now set a new password.`,
    email,
  });
});

app.post('/api/auth/reset', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and new password are required.' });
  }
  const data = getDb();
  const user = data.users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  user.passwordHash = bcrypt.hashSync(password, 10);
  saveDb(data);
  res.json({ message: 'Password has been updated successfully. You can now sign in with your new password.' });
});

// --- Batches Management ---
app.get('/api/batches', (_req, res) => {
  const data = getDb();
  res.json(data.batches || []);
});

app.post('/api/batches', authMiddleware, requireRole('admin'), (req, res) => {
  const { id, label, academicYear, description = '', active = true } = req.body;
  const data = getDb();
  const batchId = id || academicYear || `batch-${Date.now()}`;

  if (data.batches.some((b) => b.id === batchId)) {
    return res.status(409).json({ message: 'A batch with this ID already exists.' });
  }

  const newBatch = {
    id: batchId,
    label: label || batchId,
    academicYear: academicYear || batchId,
    description,
    active,
  };
  data.batches.push(newBatch);
  saveDb(data);
  res.status(201).json({ message: 'New batch added successfully.', batch: newBatch });
});

app.put('/api/batches/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const data = getDb();
  const index = data.batches.findIndex((b) => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Batch not found.' });
  }
  data.batches[index] = { ...data.batches[index], ...req.body, id: req.params.id };
  saveDb(data);
  res.json({ message: 'Batch updated successfully.', batch: data.batches[index] });
});

app.delete('/api/batches/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const data = getDb();
  data.batches = data.batches.filter((b) => b.id !== req.params.id);
  saveDb(data);
  res.json({ message: 'Batch deleted successfully.' });
});

// --- Students Management ---
app.get('/api/students', (req, res) => {
  const data = getDb();
  const { batch, query, section, year } = req.query;
  let students = data.students || [];

  if (batch && batch !== 'All batches' && batch !== 'All') {
    students = students.filter(
      (s) =>
        s.batch === batch ||
        s.academicYear === batch ||
        (s.batch && s.batch.replace(/\s+/g, '') === batch.replace(/\s+/g, ''))
    );
  }

  if (section && section !== 'All') {
    students = students.filter((s) => s.section === section);
  }

  if (year && year !== 'All') {
    students = students.filter((s) => s.yearOfStudy === year);
  }

  if (query) {
    const q = query.toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.registerNumber.toLowerCase().includes(q) ||
        (s.skills && s.skills.some((sk) => sk.toLowerCase().includes(q)))
    );
  }

  res.json(students);
});

// Public shareable student profile lookup by registration number
app.get('/api/students/reg/:regNo', (req, res) => {
  const data = getDb();
  const student = (data.students || []).find(
    (s) => s.registerNumber.toLowerCase() === req.params.regNo.toLowerCase()
  );
  if (!student) {
    return res.status(404).json({ message: `No student profile found for registration number ${req.params.regNo}` });
  }
  res.json(student);
});

app.get('/api/students/:id', (req, res) => {
  const data = getDb();
  const student = (data.students || []).find((s) => s.id === req.params.id || s.registerNumber === req.params.id);
  if (!student) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }
  res.json(student);
});

app.post('/api/students', authMiddleware, requireRole('admin', 'staff'), (req, res) => {
  const data = getDb();
  const newStudent = {
    id: `student-${Date.now()}`,
    ...req.body,
    skills: Array.isArray(req.body.skills) ? req.body.skills : [],
    projects: Array.isArray(req.body.projects) ? req.body.projects : [],
    achievements: Array.isArray(req.body.achievements) ? req.body.achievements : [],
    certificates: Array.isArray(req.body.certificates) ? req.body.certificates : [],
    eventsParticipated: Array.isArray(req.body.eventsParticipated) ? req.body.eventsParticipated : [],
    galleryImages: Array.isArray(req.body.galleryImages) ? req.body.galleryImages : [],
  };
  data.students.push(newStudent);
  saveDb(data);
  res.status(201).json({ message: 'Student added successfully.', student: newStudent });
});

app.put('/api/students/:id', authMiddleware, (req, res) => {
  const data = getDb();
  const studentIndex = data.students.findIndex(
    (s) => s.id === req.params.id || s.userId === req.user.id || s.registerNumber === req.params.id
  );

  if (studentIndex === -1) {
    return res.status(404).json({ message: 'Student profile not found.' });
  }

  // Authorization: student can only edit own profile unless admin/staff
  const targetStudent = data.students[studentIndex];
  if (req.user.role === 'student' && targetStudent.userId && targetStudent.userId !== req.user.id && targetStudent.registerNumber !== req.user.registerNumber) {
    return res.status(403).json({ message: 'Unauthorized to modify this student profile.' });
  }

  data.students[studentIndex] = {
    ...targetStudent,
    ...req.body,
    id: targetStudent.id,
    registerNumber: targetStudent.registerNumber, // preserve reg no integrity
  };

  saveDb(data);
  res.json({ message: 'Profile updated successfully.', student: data.students[studentIndex] });
});

app.delete('/api/students/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const data = getDb();
  data.students = data.students.filter((s) => s.id !== req.params.id);
  saveDb(data);
  res.json({ message: 'Student removed successfully.' });
});

// --- Staff Management ---
app.get('/api/staff', (_req, res) => {
  const data = getDb();
  res.json(data.staff || []);
});

app.get('/api/staff/:id', (req, res) => {
  const data = getDb();
  const member = (data.staff || []).find((s) => s.id === req.params.id);
  if (!member) {
    return res.status(404).json({ message: 'Staff member not found.' });
  }
  res.json(member);
});

app.post('/api/staff', authMiddleware, requireRole('admin'), (req, res) => {
  const data = getDb();
  const newStaff = {
    id: `staff-${Date.now()}`,
    ...req.body,
    areasOfInterest: Array.isArray(req.body.areasOfInterest) ? req.body.areasOfInterest : [],
  };
  data.staff.push(newStaff);
  saveDb(data);
  res.status(201).json({ message: 'Staff member added successfully.', staff: newStaff });
});

app.put('/api/staff/:id', authMiddleware, (req, res) => {
  const data = getDb();
  const staffIndex = data.staff.findIndex(
    (s) => s.id === req.params.id || s.userId === req.user.id
  );

  if (staffIndex === -1) {
    return res.status(404).json({ message: 'Staff profile not found.' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Permission denied.' });
  }

  data.staff[staffIndex] = {
    ...data.staff[staffIndex],
    ...req.body,
    id: data.staff[staffIndex].id,
  };

  saveDb(data);
  res.json({ message: 'Staff profile updated successfully.', staff: data.staff[staffIndex] });
});

app.delete('/api/staff/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const data = getDb();
  data.staff = data.staff.filter((s) => s.id !== req.params.id);
  saveDb(data);
  res.json({ message: 'Staff record deleted successfully.' });
});

// --- Events Management ---
app.get('/api/events', (_req, res) => {
  const data = getDb();
  res.json(data.events || []);
});

app.get('/api/events/:id', (req, res) => {
  const data = getDb();
  const ev = (data.events || []).find((e) => e.id === req.params.id);
  if (!ev) {
    return res.status(404).json({ message: 'Event not found.' });
  }
  res.json(ev);
});

app.post('/api/events', authMiddleware, requireRole('admin', 'staff'), (req, res) => {
  const data = getDb();
  const newEvent = {
    id: `event-${Date.now()}`,
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    time: req.body.time || '09:30 AM',
    venue: req.body.venue || 'CIET Mechanical Department',
    category: req.body.category || 'General',
    organizers: req.body.organizers || 'Department of Mechanical Engineering',
    registrationLink: req.body.registrationLink || '',
    poster: req.body.poster || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85',
    brochure: req.body.brochure || '',
    status: req.body.status || 'upcoming',
    createdBy: req.user.id,
    images: Array.isArray(req.body.images) ? req.body.images : [],
    createdAt: new Date().toISOString(),
  };

  data.events.unshift(newEvent);

  // If a brochure was attached to the event, also list it in brochures collection
  if (req.body.brochure) {
    data.brochures.unshift({
      id: `brochure-${Date.now()}`,
      title: `${newEvent.title} — Official Brochure`,
      description: newEvent.description.slice(0, 140) + '...',
      date: newEvent.date,
      uploadedBy: req.user.name || 'Staff Desk',
      thumbnail: newEvent.poster,
      downloadLink: newEvent.brochure,
    });
  }

  saveDb(data);
  res.status(201).json({ message: 'Event published successfully and broadcasted to Feed.', event: newEvent });
});

app.put('/api/events/:id', authMiddleware, requireRole('admin', 'staff'), (req, res) => {
  const data = getDb();
  const idx = data.events.findIndex((e) => e.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Event not found.' });
  }
  data.events[idx] = { ...data.events[idx], ...req.body, id: req.params.id };
  saveDb(data);
  res.json({ message: 'Event updated successfully.', event: data.events[idx] });
});

app.delete('/api/events/:id', authMiddleware, requireRole('admin', 'staff'), (req, res) => {
  const data = getDb();
  data.events = data.events.filter((e) => e.id !== req.params.id);
  saveDb(data);
  res.json({ message: 'Event deleted successfully.' });
});

// --- Announcements ---
app.get('/api/announcements', (_req, res) => {
  const data = getDb();
  res.json(data.announcements || []);
});

app.post('/api/announcements', authMiddleware, requireRole('admin', 'staff'), (req, res) => {
  const data = getDb();
  const announcement = {
    id: `announcement-${Date.now()}`,
    title: req.body.title,
    description: req.body.description,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    department: req.body.department || 'Mechanical Engineering',
    uploadedBy: req.body.uploadedBy || req.user.name || 'Staff Desk',
    image: req.body.image || 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=85',
    type: 'ANNOUNCEMENT',
    createdAt: new Date().toISOString(),
  };
  data.announcements.unshift(announcement);
  saveDb(data);
  res.status(201).json({ message: 'Announcement broadcasted successfully to Feed.', announcement });
});

app.delete('/api/announcements/:id', authMiddleware, requireRole('admin', 'staff'), (req, res) => {
  const data = getDb();
  data.announcements = data.announcements.filter((a) => a.id !== req.params.id);
  saveDb(data);
  res.json({ message: 'Announcement deleted.' });
});

// --- Brochures ---
app.get('/api/brochures', (_req, res) => {
  const data = getDb();
  res.json(data.brochures || []);
});

app.post('/api/brochures', authMiddleware, requireRole('admin', 'staff'), (req, res) => {
  const data = getDb();
  const brochure = {
    id: `brochure-${Date.now()}`,
    title: req.body.title,
    description: req.body.description,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    uploadedBy: req.body.uploadedBy || req.user.name || 'Staff Desk',
    thumbnail: req.body.thumbnail || 'https://images.unsplash.com/photo-1581092919535-7146ff1a5908?auto=format&fit=crop&w=800&q=80',
    downloadLink: req.body.downloadLink || '/uploads/sample-brochure.pdf',
    createdAt: new Date().toISOString(),
  };
  data.brochures.unshift(brochure);
  saveDb(data);
  res.status(201).json({ message: 'Brochure uploaded successfully and posted to Feed.', brochure });
});

app.delete('/api/brochures/:id', authMiddleware, requireRole('admin', 'staff'), (req, res) => {
  const data = getDb();
  data.brochures = data.brochures.filter((b) => b.id !== req.params.id);
  saveDb(data);
  res.json({ message: 'Brochure removed.' });
});

// --- Gallery ---
app.get('/api/gallery', (_req, res) => {
  const data = getDb();
  res.json(data.gallery || []);
});

app.post('/api/gallery', authMiddleware, requireRole('admin', 'staff', 'student'), (req, res) => {
  const data = getDb();
  const item = {
    id: `gallery-${Date.now()}`,
    title: req.body.title,
    category: req.body.category || 'Events',
    image: req.body.image,
    caption: req.body.caption || '',
    uploadedBy: req.user.name,
    createdAt: new Date().toISOString(),
  };
  data.gallery.unshift(item);
  saveDb(data);
  res.status(201).json({ message: 'Gallery item added successfully.', item });
});

app.delete('/api/gallery/:id', authMiddleware, requireRole('admin', 'staff'), (req, res) => {
  const data = getDb();
  data.gallery = data.gallery.filter((g) => g.id !== req.params.id);
  saveDb(data);
  res.json({ message: 'Gallery item deleted.' });
});

// --- Certificates ---
app.get('/api/certificates', (_req, res) => {
  const data = getDb();
  res.json(data.certificates || []);
});

app.post('/api/certificates', authMiddleware, (req, res) => {
  const data = getDb();
  const cert = {
    id: `cert-${Date.now()}`,
    title: req.body.title,
    issuingOrganization: req.body.issuingOrganization,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    description: req.body.description || '',
    studentId: req.body.studentId || req.user.studentId || '',
    studentName: req.body.studentName || req.user.name || '',
    category: req.body.category || (req.user.role === 'student' ? 'Students' : 'Department'),
    fileUrl: req.body.fileUrl || '/uploads/sample-brochure.pdf',
    createdAt: new Date().toISOString(),
  };

  data.certificates.unshift(cert);

  // If uploaded by student, also update their student object
  if (cert.studentId) {
    const student = data.students.find((s) => s.id === cert.studentId || s.userId === req.user.id);
    if (student) {
      if (!Array.isArray(student.certificates)) student.certificates = [];
      student.certificates.push(cert);
    }
  }

  saveDb(data);
  res.status(201).json({ message: 'Certificate saved successfully.', certificate: cert });
});

app.delete('/api/certificates/:id', authMiddleware, (req, res) => {
  const data = getDb();
  data.certificates = data.certificates.filter((c) => c.id !== req.params.id);
  saveDb(data);
  res.json({ message: 'Certificate deleted.' });
});

// --- Alumni ---
app.get('/api/alumni', (_req, res) => {
  const data = getDb();
  res.json(data.alumni || []);
});

app.post('/api/alumni', authMiddleware, requireRole('admin'), (req, res) => {
  const data = getDb();
  const alumni = {
    id: `alumni-${Date.now()}`,
    name: req.body.name,
    graduationYear: req.body.graduationYear,
    company: req.body.company,
    designation: req.body.designation,
    profilePhoto: req.body.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    achievement: req.body.achievement || '',
    linkedin: req.body.linkedin || '',
  };
  data.alumni.unshift(alumni);
  saveDb(data);
  res.status(201).json({ message: 'Alumni profile added successfully.', alumni });
});

app.delete('/api/alumni/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const data = getDb();
  data.alumni = data.alumni.filter((a) => a.id !== req.params.id);
  saveDb(data);
  res.json({ message: 'Alumni record removed.' });
});

// --- SAE Club ---
app.get('/api/sae', (_req, res) => {
  const data = getDb();
  res.json(data.saeClub || {});
});

app.put('/api/sae', authMiddleware, requireRole('admin', 'staff'), (req, res) => {
  const data = getDb();
  data.saeClub = { ...data.saeClub, ...req.body };
  saveDb(data);
  res.json({ message: 'SAE Club portal content updated successfully.', saeClub: data.saeClub });
});

// --- Department Info & Academics (Vision, Mission, Curriculum, Syllabus, Regulations, Social Links) ---
let curriculumCache = null;
let curriculumCacheMtime = 0;
const readCurriculum = () => {
  const context = requestContext.getStore();
  if (context) return context.payload.curriculum;
  try {
    const { mtimeMs } = fs.statSync(curriculumPath);
    if (curriculumCache && curriculumCacheMtime === mtimeMs) return curriculumCache;
    curriculumCache = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
    curriculumCacheMtime = mtimeMs;
    return curriculumCache;
  } catch {
    return null;
  }
};

const getCourseSemester = (curriculum, courseCode) =>
  curriculum.semesters.find((semester) =>
    semester.courses.some((course) => course.courseCode === courseCode)
  )?.number || null;

const getCourseSummary = (course, semester) => {
  const { detailsText, ...summary } = course;
  return { ...summary, semester };
};

app.get('/api/curriculum', (req, res) => {
  const curriculum = readCurriculum();
  if (!curriculum) return res.status(503).json({ success: false, message: 'Official curriculum data is not available.' });

  const semesterNumber = Number(req.query.semester) || null;
  const category = String(req.query.category || '').trim().toUpperCase();
  const query = String(req.query.query || '').trim().toLowerCase();
  const courseDetailsByCode = new Map(curriculum.courses.map((course) => [course.courseCode, course]));
  const allSemesterCourses = curriculum.semesters.flatMap((semester) =>
    semester.courses
      .filter((course) => courseDetailsByCode.get(course.courseCode)?.published !== false)
      .map((course) => ({ ...course, semester: semester.number, semesterName: semester.name }))
  );
  const filtered = allSemesterCourses.filter((course) => {
    const detail = courseDetailsByCode.get(course.courseCode);
    const published = detail?.published !== false;
    const matchesSemester = !semesterNumber || course.semester === semesterNumber;
    const matchesCategory = !category || course.category === category;
    const searchable = `${course.courseCode} ${course.courseName} ${course.category} ${detail?.detailsText || ''}`.toLowerCase();
    return published && matchesSemester && matchesCategory && (!query || searchable.includes(query));
  });
  const categories = [...new Set([
    ...allSemesterCourses.map((course) => course.category),
    ...curriculum.electiveCatalog.filter((course) => courseDetailsByCode.get(course.courseCode)?.published !== false).map((course) => course.category),
  ].filter(Boolean))].sort();
  const toSummary = (course) => getCourseSummary(courseDetailsByCode.get(course.courseCode) || course, course.semester);
  const creditsBySemester = curriculum.semesters.map((semester) => ({
    semester: semester.number,
    name: semester.name,
    credits: semester.courses.reduce((total, course) => total + (Number(course.credits) || 0), 0),
  }));
  const allCourses = allSemesterCourses;
  const creditSummary = {
    total: allCourses.reduce((total, course) => total + (Number(course.credits) || 0), 0),
    bySemester: creditsBySemester,
    theory: allCourses.filter((course) => (Number(course.lectureHours) || 0) + (Number(course.tutorialHours) || 0) > 0 && !(Number(course.practicalHours) || 0)).reduce((total, course) => total + (Number(course.credits) || 0), 0),
    laboratory: allCourses.filter((course) => /laboratory|lab\b/i.test(course.courseName) && !/project/i.test(course.courseName)).reduce((total, course) => total + (Number(course.credits) || 0), 0),
    projects: allCourses.filter((course) => /project/i.test(course.courseName)).reduce((total, course) => total + (Number(course.credits) || 0), 0),
    internship: allCourses.filter((course) => /internship|in-plant/i.test(course.courseName)).reduce((total, course) => total + (Number(course.credits) || 0), 0),
    electives: allCourses.filter((course) => ['PE', 'OE'].includes(course.category)).reduce((total, course) => total + (Number(course.credits) || 0), 0),
  };

  res.json({
    ...Object.fromEntries(Object.entries(curriculum).filter(([key]) => !['courses', 'electiveCatalog', 'semesters', 'programmeInformationText', 'creditSummarySourceText'].includes(key))),
    programmeInformationText: curriculum.programmeInformationText,
    semesters: curriculum.semesters.map((semester) => ({
      ...semester,
      courses: semester.courses
        .filter((course) => courseDetailsByCode.get(course.courseCode)?.published !== false)
        .map((course) => getCourseSummary(courseDetailsByCode.get(course.courseCode) || course, semester.number)),
    })),
    courses: filtered.map(toSummary),
    electiveCatalog: curriculum.electiveCatalog
      .filter((course) => courseDetailsByCode.get(course.courseCode)?.published !== false)
      .filter((course) => !category || course.category === category)
      .filter((course) => !query || `${course.courseCode} ${course.courseName} ${course.category} ${course.offeringDepartment || ''} ${courseDetailsByCode.get(course.courseCode)?.detailsText || ''}`.toLowerCase().includes(query))
      .map((course) => {
        const detail = courseDetailsByCode.get(course.courseCode);
        const selected = detail && detail.courseName === course.courseName ? detail : course;
        return getCourseSummary(selected, getCourseSemester(curriculum, course.courseCode));
      }),
    categories,
    creditSummary,
    extractionNotes: curriculum.extractionNotes,
  });
});

app.get('/api/curriculum/course/:courseCode', (req, res) => {
  const curriculum = readCurriculum();
  const courseCode = String(req.params.courseCode || '').toUpperCase();
  const course = curriculum?.courses.find((item) => item.courseCode.toUpperCase() === courseCode);
  if (!course || course.published === false) return res.status(404).json({ success: false, message: 'Course not found in the published Regulation 2023 catalogue.' });
  res.json({ course: { ...course, semester: getCourseSemester(curriculum, course.courseCode) }, sourceDocument: curriculum.sourceDocument });
});

const saveCurriculum = (curriculum) => {
  const context = requestContext.getStore();
  if (context) {
    context.payload.curriculum = curriculum;
    context.dirty = true;
    return;
  }
  fs.writeFileSync(curriculumPath, JSON.stringify(curriculum, null, 2));
  curriculumCache = curriculum;
  curriculumCacheMtime = fs.statSync(curriculumPath).mtimeMs;
};

app.get('/api/admin/curriculum', authMiddleware, requireRole('admin'), (_req, res) => {
  const curriculum = readCurriculum();
  if (!curriculum) return res.status(503).json({ message: 'Official curriculum data is not available.' });
  res.json({ courses: curriculum.courses.map((course) => ({ ...course, semester: getCourseSemester(curriculum, course.courseCode) })), sourceDocument: curriculum.sourceDocument, pendingDocument: curriculum.pendingDocument || null });
});

app.post('/api/admin/curriculum/courses', authMiddleware, requireRole('admin'), (req, res) => {
  const curriculum = readCurriculum();
  if (!curriculum) return res.status(503).json({ message: 'Official curriculum data is not available.' });
  const courseCode = String(req.body.courseCode || '').trim().toUpperCase();
  const courseName = String(req.body.courseName || '').trim();
  const semesterNumber = Number(req.body.semester);
  if (!courseCode || !courseName || !Number.isInteger(semesterNumber) || semesterNumber < 1 || semesterNumber > 8) {
    return res.status(400).json({ message: 'Course code, course name, and semester 1–8 are required.' });
  }
  if (curriculum.courses.some((course) => course.courseCode === courseCode)) {
    return res.status(409).json({ message: 'A course with this code already exists.' });
  }
  const course = {
    courseCode,
    courseName,
    officialTitle: courseName,
    category: String(req.body.category || '').trim().toUpperCase(),
    lectureHours: Number(req.body.lectureHours) || 0,
    tutorialHours: Number(req.body.tutorialHours) || 0,
    practicalHours: Number(req.body.practicalHours) || 0,
    credits: Number(req.body.credits) || 0,
    regulation: '2023',
    programme: 'B.E. Mechanical Engineering',
    published: true,
    detailsAvailable: Boolean(req.body.detailsText),
    detailsText: String(req.body.detailsText || ''),
    verificationNote: 'Admin-created course record. Verify it against an approved official source before publication.',
  };
  curriculum.courses.push(course);
  const semester = curriculum.semesters.find((item) => item.number === semesterNumber);
  semester.courses.push({ ...course, detailsAvailable: false });
  saveCurriculum(curriculum);
  res.status(201).json({ course: { ...course, semester: semesterNumber } });
});

app.put('/api/admin/curriculum/courses/:courseCode', authMiddleware, requireRole('admin'), (req, res) => {
  const curriculum = readCurriculum();
  if (!curriculum) return res.status(503).json({ message: 'Official curriculum data is not available.' });
  const courseCode = String(req.params.courseCode || '').toUpperCase();
  const index = curriculum.courses.findIndex((course) => course.courseCode === courseCode);
  if (index < 0) return res.status(404).json({ message: 'Course not found.' });
  const allowedFields = ['courseName', 'category', 'lectureHours', 'tutorialHours', 'practicalHours', 'credits', 'published', 'detailsText', 'detailsAvailable', 'verificationNote'];
  const updates = Object.fromEntries(allowedFields.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
  if (req.body.detailsText !== undefined && req.body.detailsAvailable === undefined) updates.detailsAvailable = Boolean(req.body.detailsText);
  curriculum.courses[index] = { ...curriculum.courses[index], ...updates };
  const currentSemester = getCourseSemester(curriculum, courseCode);
  const nextSemester = req.body.semester === undefined ? currentSemester : (req.body.semester === null || req.body.semester === '' ? null : Number(req.body.semester));
  if (nextSemester !== null && (!Number.isInteger(nextSemester) || nextSemester < 1 || nextSemester > 8)) {
    return res.status(400).json({ message: 'Semester must be a number from 1 to 8.' });
  }
  let semesterRecord = null;
  curriculum.semesters.forEach((semester) => {
    const currentRecord = semester.courses.find((course) => course.courseCode === courseCode);
    if (currentRecord) semesterRecord = { ...currentRecord, ...updates };
    semester.courses = semester.courses.filter((course) => course.courseCode !== courseCode);
  });
  if (nextSemester !== null) {
    const destination = curriculum.semesters.find((semester) => semester.number === nextSemester);
    destination.courses.push({ ...(semesterRecord || curriculum.courses[index]), ...updates, ...curriculum.courses[index] });
  }
  saveCurriculum(curriculum);
  res.json({ course: { ...curriculum.courses[index], semester: getCourseSemester(curriculum, courseCode) } });
});

app.delete('/api/admin/curriculum/courses/:courseCode', authMiddleware, requireRole('admin'), (req, res) => {
  const curriculum = readCurriculum();
  if (!curriculum) return res.status(503).json({ message: 'Official curriculum data is not available.' });
  const courseCode = String(req.params.courseCode || '').toUpperCase();
  const countBefore = curriculum.courses.length;
  curriculum.courses = curriculum.courses.filter((course) => course.courseCode !== courseCode);
  curriculum.semesters.forEach((semester) => {
    semester.courses = semester.courses.filter((course) => course.courseCode !== courseCode);
  });
  curriculum.electiveCatalog = curriculum.electiveCatalog.filter((course) => course.courseCode !== courseCode);
  if (curriculum.courses.length === countBefore) return res.status(404).json({ message: 'Course not found.' });
  saveCurriculum(curriculum);
  res.json({ message: 'Course removed from the published curriculum.' });
});

const storeUploadedFile = async (file) => {
  if (!supabase) return `/uploads/${file.filename}`;

  const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-');
  const objectName = `${Date.now()}-${safeName}`;
  const { data, error } = await supabase.storage
    .from('portal-uploads')
    .upload(objectName, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) throw error;
  return supabase.storage.from('portal-uploads').getPublicUrl(data.path).data.publicUrl;
};

app.post('/api/admin/curriculum/pdf', authMiddleware, requireRole('admin'), upload.single('file'), async (req, res) => {
  if (!req.file || req.file.mimetype !== 'application/pdf') {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Upload a PDF file for the official curriculum.' });
  }
  const curriculum = readCurriculum();
  if (!curriculum) return res.status(503).json({ message: 'Official curriculum data is not available.' });
  const fileUrl = await storeUploadedFile(req.file);
  curriculum.pendingDocument = {
    fileName: req.file.originalname,
    fileUrl,
    uploadedAt: new Date().toISOString(),
    pageCount: curriculum.sourceDocument?.pageCount || null,
  };
  saveCurriculum(curriculum);
  res.status(201).json({ pendingDocument: curriculum.pendingDocument, message: 'PDF staged. Re-import and verify the structured curriculum before publishing this document.' });
});

app.get('/api/department', (_req, res) => {
  const data = getDb();
  res.json(data.departmentInfo || {});
});

app.put('/api/department', authMiddleware, requireRole('admin'), (req, res) => {
  const data = getDb();
  data.departmentInfo = { ...data.departmentInfo, ...req.body };
  saveDb(data);
  res.json({ message: 'Department information and academic settings saved.', departmentInfo: data.departmentInfo });
});

// --- Universal File Upload ---
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file received for upload.' });
  }

  const fileUrl = await storeUploadedFile(req.file);
  res.status(201).json({
    message: 'File uploaded successfully.',
    file: {
      name: req.file.originalname,
      url: fileUrl,
      type: req.file.mimetype,
      size: req.file.size,
    },
  });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found.' });
  }
  next();
});

if (fs.existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get(/^(?!\/api\/).*$/, (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Error handling for Multer and standard errors
app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${error.message}` });
  }
  if (error) {
    const status = Number(error.status || error.statusCode) || 500;
    if (status >= 500) {
      console.error('[api] Request failed:', error.message);
    }
    return res.status(status).json({
      message: status >= 500 ? 'Internal server error.' : error.message || 'Request could not be processed.',
    });
  }
  return res.status(500).json({ message: 'Internal server error.' });
});

if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`CIET Mechanical Engineering Department API running on port ${PORT}`);
  });
}

export default app;
