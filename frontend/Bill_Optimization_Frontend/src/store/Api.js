import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

// ✅ Routes that need multipart/form-data (file uploads)
const formDataURL = [
  '/bills/upload-scan',
];

// ✅ Attach token + content-type to every request
api.interceptors.request.use((req) => {
  let token = null;

  try {
    const stored = sessionStorage.getItem('energy_token');
    const parsed = stored ? JSON.parse(stored) : null;
    token = parsed?.token || null;
  } catch (error) {
    token = null;
  }

  // ✅ multipart for file uploads, JSON for everything else
  if (formDataURL.some(url => req.url.startsWith(url))) {
    req.headers['Content-Type'] = 'multipart/form-data';
  } else {
    req.headers['Content-Type'] = 'application/json';
  }

  // ✅ attach Bearer token if logged in
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
}, (error) => Promise.reject(error));

// ✅ Handle responses + auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('energy_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;