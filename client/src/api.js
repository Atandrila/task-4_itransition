import axios from "axios";

export const api = axios.create({
  baseURL: "https://task-4itransition-production.up.railway.app/api",
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && error.response?.data?.redirectTo) {
      window.location.href = error.response.data.redirectTo;
    }

    return Promise.reject(error);
  }
);