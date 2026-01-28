import axios from "axios";
import { getSession } from "next-auth/react";

// Set config defaults when creating the instance
const projectApi = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_API
});

projectApi.defaults.headers.common['Content-Type'] = 'application/json';
projectApi.defaults.headers.common['Accept'] = 'application/json';
projectApi.defaults.headers.common['Cache-Control'] = 'no-cache';
projectApi.defaults.headers.common['Pragma'] = 'no-cache';
projectApi.defaults.headers.common['Expires'] = '0';

// Add request interceptor to include JWT token from NextAuth session
projectApi.interceptors.request.use(
  async (config) => {
    try {
      const session: any = await getSession();
      if (session?.user?.token) {
        config.headers.Authorization = `Bearer ${session.user.token}`;
      }
    } catch (error) {
      console.error('Error getting session for API request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
projectApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could redirect to login here
      console.error('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default projectApi;