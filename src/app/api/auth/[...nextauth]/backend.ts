import axios from "axios";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "./options";

// Set config defaults when creating the instance
const backend = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
});

const token = async (): Promise<string | null> => {
  const session: any = await getServerSession(authOptions);

  if (session) return session?.user?.token;

  return null;
};

// backend.defaults.headers.common['Authorization'] = `Bearer ${() => token()}`;
backend.defaults.headers.common["Content-Type"] = "application/json";
backend.defaults.headers.common["Accept"] = "application/json";

export default backend;
