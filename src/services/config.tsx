import axios from "axios";

// Set config defaults when creating the instance
const projectApi = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_API
});

// projectApi.defaults.headers.common['Authorization'] = `Bearer ${process$
projectApi.defaults.headers.common['Content-Type'] = 'application/json';
projectApi.defaults.headers.common['Accept'] = 'application/json';
projectApi.defaults.headers.common['Cache-Control'] = 'no-cache';
projectApi.defaults.headers.common['Pragma'] = 'no-cache';
projectApi.defaults.headers.common['Expires'] = '0';

export default projectApi;