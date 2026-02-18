/**
 * Axios instance configured for the Naskaus API
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - could trigger logout here
      console.warn('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

export default api;
