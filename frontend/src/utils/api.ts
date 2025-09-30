import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Courses API
export const coursesAPI = {
  getCourses: (params?: any) => api.get('/courses', { params }),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  createCourse: (courseData: any) => api.post('/courses', courseData),
  updateCourse: (id: string, courseData: any) =>
    api.put(`/courses/${id}`, courseData),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
  enrollInCourse: (id: string) => api.put(`/courses/${id}/enroll`),
  dropCourse: (id: string) => api.put(`/courses/${id}/drop`),
};

// Schedules API
export const schedulesAPI = {
  getSchedules: () => api.get('/schedules'),
  getSchedule: (id: string) => api.get(`/schedules/${id}`),
  createSchedule: (scheduleData: any) => api.post('/schedules', scheduleData),
  updateSchedule: (id: string, scheduleData: any) =>
    api.put(`/schedules/${id}`, scheduleData),
  deleteSchedule: (id: string) => api.delete(`/schedules/${id}`),
};

// Users API
export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, userData: any) =>
    api.put(`/users/${id}`, userData),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Faculty API
export const facultyAPI = {
  getLectureSlots: () => api.get('/faculty/lecture-slots'),
  createLectureSlot: (slotData: any) => api.post('/faculty/lecture-slots', slotData),
  updateLectureSlot: (id: string, slotData: any) => api.put(`/faculty/lecture-slots/${id}`, slotData),
  deleteLectureSlot: (id: string) => api.delete(`/faculty/lecture-slots/${id}`),
};

// Lecture Slots API
export const lectureSlotsAPI = {
  getLectureSlots: (params?: any) => api.get('/lecture-slots', { params }),
  getLectureSlot: (id: string) => api.get(`/lecture-slots/${id}`),
};

// Enrollments API
export const enrollmentsAPI = {
  enrollInSlot: (slotId: string) => api.post(`/enrollments/${slotId}`),
  dropFromSlot: (slotId: string) => api.delete(`/enrollments/${slotId}`),
  getMyTimetable: (params?: any) => api.get('/enrollments/me', { params }),
  getAllEnrollments: (params?: any) => api.get('/enrollments', { params }),
  forceCancel: (id: string, data: any) => api.put(`/enrollments/${id}/cancel`, data),
};

export default api;