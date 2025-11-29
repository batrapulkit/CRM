// client/src/api/client.jsx
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized – clearing token");
      localStorage.removeItem('auth_token');

      // Only redirect if not already on login page to prevent loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Entity helpers for common CRUD operations
api.entities = {
  Lead: {
    list: (sort, limit) => api.get(`/leads${limit ? `?limit=${limit}` : ''}`).then(res => res.data.leads || []),
    create: (data) => api.post('/leads', data).then(res => res.data.lead),
    update: (id, data) => api.patch(`/leads/${id}`, data).then(res => res.data.lead),
    delete: (id) => api.delete(`/leads/${id}`),
  },
  Client: {
    list: (sort, limit) => api.get(`/clients${limit ? `?limit=${limit}` : ''}`).then(res => res.data.clients || []),
    create: (data) => api.post('/clients', data).then(res => res.data.client),
    update: (id, data) => api.patch(`/clients/${id}`, data).then(res => res.data.client),
    delete: (id) => api.delete(`/clients/${id}`),
  },
  Itinerary: {
    list: (sort, limit) => api.get(`/itineraries${limit ? `?limit=${limit}` : ''}`).then(res => res.data.itineraries || []),
    create: (data) => api.post('/itineraries', data).then(res => res.data.itinerary),
    update: (id, data) => api.patch(`/itineraries/${id}`, data).then(res => res.data.itinerary),
    delete: (id) => api.delete(`/itineraries/${id}`),
  },
  Supplier: {
    list: (sort, limit) => api.get(`/suppliers${limit ? `?limit=${limit}` : ''}${sort ? `&sort=${sort}` : ''}`).then(res => res.data.suppliers || []),
    create: (data) => api.post('/suppliers', data).then(res => res.data.supplier),
    update: (id, data) => api.patch(`/suppliers/${id}`, data).then(res => res.data.supplier),
    delete: (id) => api.delete(`/suppliers/${id}`),
  },
};

export default api;
