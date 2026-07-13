const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  // Dashboard
  getStats: () => request('/dashboard/stats'),
  getRecentAttendance: () => request('/dashboard/recent'),

  // Classes
  getClasses: () => request('/classes'),
  getClass: (id) => request(`/classes/${id}`),
  createClass: (data) => request('/classes', { method: 'POST', body: JSON.stringify(data) }),
  updateClass: (id, data) => request(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClass: (id) => request(`/classes/${id}`, { method: 'DELETE' }),

  // Students
  getStudents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/students${query ? `?${query}` : ''}`);
  },
  getStudent: (id) => request(`/students/${id}`),
  createStudent: (data) => request('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/attendance${query ? `?${query}` : ''}`);
  },
  getClassAttendance: (classId, date) => request(`/attendance/class/${classId}/date/${date}`),
  saveBulkAttendance: (data) => request('/attendance/bulk', { method: 'POST', body: JSON.stringify(data) }),
  getStudentReport: (studentId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/attendance/report/${studentId}${query ? `?${query}` : ''}`);
  },
};
