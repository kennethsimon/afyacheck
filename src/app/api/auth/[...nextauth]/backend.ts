import axios, { AxiosInstance } from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "./options";

// Set config defaults when creating the instance
const backend = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
});

backend.defaults.headers.common["Content-Type"] = "application/json";
backend.defaults.headers.common["Accept"] = "application/json";

// Add request interceptor to include JWT token from NextAuth session (server-side)
backend.interceptors.request.use(
  async (config) => {
    try {
      const session: any = await getServerSession(authOptions);
      if (session?.user?.token) {
        config.headers.Authorization = `Bearer ${session.user.token}`;
      }
    } catch (error) {
      console.error('Error getting server session for API request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
backend.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default backend;
