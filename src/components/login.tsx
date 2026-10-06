"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Moon, Menu, ShieldCheck } from "lucide-react";

function Loginscreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onFinish = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await signIn("credentials", {
        redirect: false,
        username: username,
        password: password,
        callbackUrl: "/project",
      });

      console.log(res);

      if (!res?.error) {
        toast("Login successfully.", {
          description: "",
        });
        router.push("/project");
      } else {
        console.log("error");
        setLoading(false);
        setError("invalid email or password");
        toast("Login error.", {
          description: "Wrong username or password",
        });
      }
    } catch (error: any) {
      setLoading(false);
      setError(error);
      toast("Login error.", {
        description: "Wrong username or password",
      });
    }
  };

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      {/* Left Panel - Login Form */}
      <div className="flex flex-col bg-white min-h-screen">
        {/* Top Left - Moon Icon */}
        <div className="p-6">
          <Moon className="w-5 h-5 text-gray-800" />
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[350px] space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Login</h1>
              <p className="text-gray-600 text-sm">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={(e) => onFinish(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">
                  Username or Email
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="m@example.com"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  type="password"
                  required
                  className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-md py-2.5 font-medium"
                disabled={loading}
              >
                {loading && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Login
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="#" className="font-medium text-gray-900 hover:underline">
                Contact Administrator
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Promotional Area */}
      <div className="hidden lg:flex flex-col min-h-screen relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://plus.unsplash.com/premium_photo-1673953510107-d5aee40d80a7?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Healthcare Background"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-teal-600/80"></div>
        </div>

        {/* Top Right - Menu Button */}
        <div className="absolute top-6 right-6 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="bg-blue-700 hover:bg-blue-800 text-white rounded-full w-10 h-10"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Secure Portal Badge */}
        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 text-teal-100">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm font-medium">SECURE PORTAL</span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-12 py-16 text-center relative z-10">
          {/* Heading */}
          <h2 className="text-3xl font-bold text-white mb-4">
            Empowering Healthcare Through Precision
          </h2>

          {/* Description */}
          <p className="text-white text-lg max-w-md leading-relaxed">
            Access patient records, analyze health data, and manage medical camps with our unified healthcare management platform.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Loginscreen;
