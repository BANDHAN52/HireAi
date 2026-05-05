// src/utils/api.js
// Axios instance — সব API call এখান থেকে হবে
// Base URL, token auto-attach, error handling এখানে

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",          // vite proxy /api → http://localhost:5000/api
  timeout: 15000,           // 15 seconds timeout
  headers: { "Content-Type": "application/json" },
});

// ── Request Interceptor ──
// প্রতিটা request পাঠানোর আগে JWT token attach করো
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hireai_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──
// 401 আসলে (token expire) logout করো
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hireai_token");
      localStorage.removeItem("hireai_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
