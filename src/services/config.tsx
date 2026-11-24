import axios from "axios";

/**
 * Browser Axios instance routed through the same-origin `/api/backend` BFF proxy.
 * Raw backend JWTs remain inside the HttpOnly NextAuth cookie and are never read by client code.
 */
const projectApi = axios.create({
  baseURL: "/api/backend",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

export default projectApi;
