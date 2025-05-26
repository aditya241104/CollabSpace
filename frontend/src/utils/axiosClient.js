import axios from 'axios';
import { refreshAccessToken } from '../services/authService';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,  // send cookies automatically
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        localStorage.setItem('token', newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


export default axiosClient;
