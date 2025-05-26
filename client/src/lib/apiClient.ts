// lib/apiClient.ts
import axios, { AxiosError, AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 403) {
      // Handle forbidden access
      window.location.href = "/auth/login?error=forbidden";
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle HTTP errors
      return Promise.reject(error);
    } else if (error.request) {
      // Handle network errors
      return Promise.reject(
        new Error("Network error. Please check your connection.")
      );
    } else {
      // Handle other errors
      return Promise.reject(error);
    }
  }
);

export default apiClient;
