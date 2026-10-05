import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Hash,
  BookOpen,
  ArrowRight,
  Shield,
  Phone,
  Briefcase,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';

export const AuthModal = ({ onClose, onSuccessRedirect }) => {
  const { login, register } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [role, setRole] = useState('student'); // 'student' | 'staff'
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [batch] = useState('2024 — 2028');
  const [section, setSection] = useState('A');
  const [yearOfStudy, setYearOfStudy] = useState('III Year');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [qualification, setQualification] = useState('M.E.');
  const [specialization, setSpecialization] = useState('Thermal / CAD / Manufacturing');

  // Forgot password flow
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      addToast(`Welcome back, ${res.user.name}!`, 'success');
      onClose();
      if (onSuccessRedirect) {
        if (res.user.role === 'admin') onSuccessRedirect('admin-dashboard');
        else if (res.user.role === 'staff') onSuccessRedirect('staff-dashboard');
        else if (res.user.role === 'student') onSuccessRedirect('student-dashboard');
        else onSuccessRedirect('home');
      }
    } catch (err) {
      addToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
      };

      if (role === 'student') {
        payload.registerNumber = registerNumber;
        payload.batch = batch;
        payload.academicYear = batch.replace(/\s+/g, '');
        payload.section = section;
        payload.yearOfStudy = yearOfStudy;
      } else {
        payload.designation = designation;
        payload.qualification = qualification;
        payload.specialization = specialization;
      }

      const res = await register(payload);
      addToast(`Registration successful! Welcome to CIET Mech, ${res.user.name}`, 'success');
      onClose();
      if (onSuccessRedirect) {
        if (role === 'student') onSuccessRedirect('student-dashboard');
        else onSuccessRedirect('staff-dashboard');
      }
    } catch (err) {
      addToast(err.message || 'Registration failed. Email might already exist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(resetEmail);
      setResetSuccess(true);
      setMode('reset');
      addToast('Password reset link verified. Enter your new password below.', 'info');
    } catch (err) {
      addToast(err.message || 'Error checking email.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.resetPassword(resetEmail, newPassword);
      addToast('Password successfully reset! Please sign in with your new password.', 'success');
      setMode('login');
      setEmail(resetEmail);
      setPassword(newPassword);
    } catch (err) {
      addToast(err.message || 'Password reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Lock size={18} />
          </div>
          <h2 className="auth-title">
            {mode === 'login' && 'CIET MECH PORTAL ACCESS'}
            {mode === 'register' && 'CREATE DEPARTMENT ACCOUNT'}
            {mode === 'forgot' && 'ACCOUNT RECOVERY'}
            {mode === 'reset' && 'SET NEW PASSWORD'}
          </h2>
          <p className="auth-sub">
            {mode === 'login' && 'Sign in to access your role-based dashboard, portfolios, and events.'}
            {mode === 'register' && 'Register as a Mechanical Department Student or Faculty member.'}
            {mode === 'forgot' && 'Enter your institutional email to recover account credentials.'}
            {mode === 'reset' && 'Enter your new secure password.'}
          </p>
        </div>

        {/* Mode: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@ciet.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-link">
                <label>Password</label>
                <button
                  type="button"
                  className="link-text"
                  onClick={() => {
                    setResetEmail(email);
                    setMode('forgot');
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-switch">
              <span>Don't have an account yet?</span>
              <button type="button" onClick={() => setMode('register')}>
                Register here
              </button>
            </div>
          </form>
        )}

        {/* Mode: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            {/* Role Toggle */}
            <div className="role-selector-tab">
              <button
                type="button"
                className={`role-tab-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                Student Registration
              </button>
              <button
                type="button"
                className={`role-tab-btn ${role === 'staff' ? 'active' : ''}`}
                onClick={() => setRole('staff')}
              >
                Faculty / Staff
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={16} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arjun Prakash"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={16} />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Institutional Email</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    required
                    placeholder="student@ciet.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Create Password</label>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Student Specific Fields */}
            {role === 'student' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Register Number</label>
                    <div className="input-with-icon">
                      <Hash size={16} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 24ME042"
                        value={registerNumber}
                        onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Academic Batch</label>
                    <input type="text" value={batch} disabled readOnly />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Section</label>
                    <select value={section} onChange={(e) => setSection(e.target.value)}>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Year of Study</label>
                    <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)}>
                      <option value="I Year">I Year</option>
                      <option value="II Year">II Year</option>
                      <option value="III Year">III Year</option>
                      <option value="IV Year">IV Year</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Staff Specific Fields */}
            {role === 'staff' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Designation</label>
                  <select value={designation} onChange={(e) => setDesignation(e.target.value)}>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Lab Instructor">Lab Instructor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    placeholder="e.g. Thermal / CAD / Robotics"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-switch">
              <span>Already registered?</span>
              <button type="button" onClick={() => setMode('login')}>
                Sign in
              </button>
            </div>
          </form>
        )}

        {/* Mode: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="auth-form">
            <div className="form-group">
              <label>Registered Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@ciet.ac.in"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              <span>{loading ? 'Verifying...' : 'Request Password Reset'}</span>
              <ArrowRight size={16} />
            </button>

            <div className="auth-switch">
              <button type="button" onClick={() => setMode('login')}>
                Return to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Mode: RESET PASSWORD */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" disabled value={resetEmail} />
            </div>

            <div className="form-group">
              <label>Enter New Password</label>
              <div className="input-with-icon">
                <KeyRound size={16} />
                <input
                  type="password"
                  required
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
              <CheckCircle2 size={16} />
            </button>

            <div className="auth-switch">
              <button type="button" onClick={() => setMode('login')}>
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
