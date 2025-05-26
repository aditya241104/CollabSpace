// src/services/authService.js
import axios from 'axios';

axios.defaults.withCredentials = true; // send cookies with requests

const API_URL = 'http://localhost:3000/api/auth/';

export const login = async (email, password) => {
  const response = await axios.post(API_URL + 'login', { userEmail: email, userPassword: password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token); // Only store the token
  }
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await axios.post(API_URL + 'register', {
    userName: name,
    userEmail: email,
    userPassword: password,
  });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token); // Only store the token
  }
  return response.data;
};

export const logout = async () => {
  await axios.post(API_URL + 'logout');
  localStorage.removeItem('token');
};

export const refreshAccessToken = async () => {
  try {
    const response = await axios.post(API_URL + 'refresh-token');
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    }
  } catch (error) {
    localStorage.removeItem('token');
    throw error;
  }
};
