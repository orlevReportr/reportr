import axios from "axios";

const axiosRequest = axios.create({
  baseURL: import.meta.env.VITE_BACKEND, // use process.env for compatibility with Jest
  headers: {
    "Content-Type": "application/json",
  },
});

axiosRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosRequest;
