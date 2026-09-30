import React from 'react';
import { Cog, Crosshair, Compass, Cpu, Layers } from 'lucide-react';

export const BlueprintGrid = () => (
  <div className="blueprint-overlay" aria-hidden="true">
    <div className="grid-lines" />
    <div className="cad-corner top-left">+ 0.00, 0.00</div>
    <div className="cad-corner top-right">CIET // MECH-SYSTEMS</div>
    <div className="cad-corner bottom-left">COORDINATE: 11.0168° N, 76.9558° E</div>
    <div className="cad-corner bottom-right">SCALE: 1:1 · METRIC ISO</div>
  </div>
);

export const GearAccent = ({ size = 28, className = '' }) => (
  <div className={`gear-spinner ${className}`} aria-hidden="true">
    <Cog size={size} strokeWidth={1.5} />
  </div>
);

export const TechBadge = ({ label, code = 'ME-SYS', variant = 'blue' }) => (
  <span className={`tech-badge badge-${variant}`}>
    <span className="badge-code">{code}</span>
    <span className="badge-dot" />
    <span className="badge-label">{label}</span>
  </span>
);

export const SectionDivider = ({ label = 'SYSTEM MODULE' }) => (
  <div className="section-tech-divider page-width" aria-hidden="true">
    <div className="divider-line" />
    <div className="divider-node">
      <Crosshair size={13} />
      <span>{label}</span>
    </div>
    <div className="divider-line" />
  </div>
);
