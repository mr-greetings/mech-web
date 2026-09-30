const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export const getStoredToken = () => localStorage.getItem('ciet_mech_token');
export const setStoredToken = (token) => localStorage.getItem('ciet_mech_token') !== token && localStorage.setItem('ciet_mech_token', token);
export const removeStoredToken = () => localStorage.removeItem('ciet_mech_token');

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Allow custom options (like FormData where Content-Type shouldn't be forced)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Unable to reach the API server. Check that it is running and that VITE_API_BASE_URL is configured for this deployment.');
  }

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const isCloudNotFound = typeof data === 'string' && /^\s*cloud not found\.?\s*$/i.test(data);
    const errorMsg = data?.message || (
      isCloudNotFound
        ? 'The configured host could not find the API. Set VITE_API_BASE_URL to the deployed Express API URL, including /api, and verify that the API is running.'
        : typeof data === 'string' && !/<\s*html[\s>]/i.test(data)
        ? data
        : res.status === 404
          ? 'API endpoint not found. Check VITE_API_BASE_URL and confirm it includes /api.'
          : `Request failed with status ${res.status}`
    );
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  // --- Auth ---
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  forgotPassword: (email) => request('/auth/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email, password) => request('/auth/reset', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // --- Dynamic Feed ---
  getFeed: () => request('/feed'),

  // --- Batches ---
  getBatches: () => request('/batches'),
  createBatch: (batch) => request('/batches', { method: 'POST', body: JSON.stringify(batch) }),
  updateBatch: (id, batch) => request(`/batches/${id}`, { method: 'PUT', body: JSON.stringify(batch) }),
  deleteBatch: (id) => request(`/batches/${id}`, { method: 'DELETE' }),

  // --- Students ---
  getStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/students${query ? `?${query}` : ''}`);
  },
  getStudentByReg: (regNo) => request(`/students/reg/${encodeURIComponent(regNo)}`),
  getStudentById: (id) => request(`/students/${id}`),
  getStudentProfile: () => request('/student/profile'),
  getStudentPortfolio: () => request('/student/portfolio'),
  getStudentResumes: () => request('/student/resumes'),
  getStudentResumeById: (id) => request(`/student/resumes/${id}`),
  createStudentResume: (resume) => request('/student/resumes', { method: 'POST', body: JSON.stringify(resume) }),
  updateStudentResume: (id, resume) => request(`/student/resumes/${id}`, { method: 'PUT', body: JSON.stringify(resume) }),
  deleteStudentResume: (id) => request(`/student/resumes/${id}`, { method: 'DELETE' }),
  generateResumePdf: (id) => request(`/student/resumes/${id}/generate-pdf`, { method: 'POST' }),
  createStudent: (student) => request('/students', { method: 'POST', body: JSON.stringify(student) }),
  updateStudent: (id, student) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(student) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),

  // --- Staff ---
  getStaff: () => request('/staff'),
  getStaffById: (id) => request(`/staff/${id}`),
  createStaff: (member) => request('/staff', { method: 'POST', body: JSON.stringify(member) }),
  updateStaff: (id, member) => request(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(member) }),
  deleteStaff: (id) => request(`/staff/${id}`, { method: 'DELETE' }),

  // --- Events ---
  getEvents: () => request('/events'),
  getEventById: (id) => request(`/events/${id}`),
  createEvent: (event) => request('/events', { method: 'POST', body: JSON.stringify(event) }),
  updateEvent: (id, event) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(event) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  // --- Announcements ---
  getAnnouncements: () => request('/announcements'),
  createAnnouncement: (announcement) => request('/announcements', { method: 'POST', body: JSON.stringify(announcement) }),
  deleteAnnouncement: (id) => request(`/announcements/${id}`, { method: 'DELETE' }),

  // --- Brochures ---
  getBrochures: () => request('/brochures'),
  createBrochure: (brochure) => request('/brochures', { method: 'POST', body: JSON.stringify(brochure) }),
  deleteBrochure: (id) => request(`/brochures/${id}`, { method: 'DELETE' }),

  // --- Gallery ---
  getGallery: () => request('/gallery'),
  createGalleryItem: (item) => request('/gallery', { method: 'POST', body: JSON.stringify(item) }),
  deleteGalleryItem: (id) => request(`/gallery/${id}`, { method: 'DELETE' }),

  // --- Certificates ---
  getCertificates: () => request('/certificates'),
  createCertificate: (cert) => request('/certificates', { method: 'POST', body: JSON.stringify(cert) }),
  deleteCertificate: (id) => request(`/certificates/${id}`, { method: 'DELETE' }),

  // --- Alumni ---
  getAlumni: () => request('/alumni'),
  createAlumni: (alumni) => request('/alumni', { method: 'POST', body: JSON.stringify(alumni) }),
  deleteAlumni: (id) => request(`/alumni/${id}`, { method: 'DELETE' }),

  // --- SAE Club ---
  getSaeInfo: () => request('/sae'),
  updateSaeInfo: (data) => request('/sae', { method: 'PUT', body: JSON.stringify(data) }),

  // --- Department Info & Academics ---
  getCurriculum: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/curriculum${query ? `?${query}` : ''}`);
  },
  getCurriculumCourse: (courseCode) => request(`/curriculum/course/${encodeURIComponent(courseCode)}`),
  getAdminCurriculum: () => request('/admin/curriculum'),
  createCurriculumCourse: (course) => request('/admin/curriculum/courses', { method: 'POST', body: JSON.stringify(course) }),
  updateCurriculumCourse: (courseCode, updates) => request(`/admin/curriculum/courses/${encodeURIComponent(courseCode)}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteCurriculumCourse: (courseCode) => request(`/admin/curriculum/courses/${encodeURIComponent(courseCode)}`, { method: 'DELETE' }),
  replaceCurriculumPdf: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/admin/curriculum/pdf', { method: 'POST', body: formData });
  },
  getDepartmentInfo: () => request('/department'),
  updateDepartmentInfo: (data) => request('/department', { method: 'PUT', body: JSON.stringify(data) }),

  // --- Universal File Upload ---
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/upload', { method: 'POST', body: formData });
  },
};
