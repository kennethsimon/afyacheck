"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AlertCircle, Eye, EyeOff, HeartPulse, Loader2, Moon, ShieldCheck, Sun } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Loginscreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        username: username.trim(),
        password,
        redirect: false,
      });

      if (res?.ok) {
        toast.success("Signed in to AfyaCheck");
        router.push("/overview");
        router.refresh();
      } else {
        setError("Invalid username or password, or your account is inactive.");
      }
    } catch {
      setError("Unable to complete sign in. Verify network connectivity and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: Sign-in form */}
      <div className="flex flex-col justify-between bg-background px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-foreground">
                AfyaCheck
              </div>
              <div className="text-[11px] text-muted-foreground">
                Clinical Operations Platform
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 text-muted-foreground"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>

        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Sign in to your workspace
            </h1>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Access health projects, field camps, patient registers, clinical
              screening records, and analytics.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-medium">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your staff username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="h-9 bg-card text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-9 bg-card pr-9 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-9 w-full text-xs font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-center text-[11px] text-muted-foreground">
            Need credentials or a password reset? Contact your health program
            administrator.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>AfyaCheck Health Platform</span>
          <span>Role-based clinical access</span>
        </div>
      </div>

      {/* Right: Restrained clinical overview panel */}
      <div className="hidden flex-col justify-between border-l border-border bg-card p-12 lg:flex">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <ShieldCheck className="h-4 w-4" />
          <span>Protected Health Operations Environment</span>
        </div>

        <div className="max-w-md space-y-6">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight text-foreground">
            Structured field health operations, from registration to clinical
            outcomes.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Built for medical teams managing multi-camp outreach programs,
            standardized clinical screenings, wellness assessments, and custom
            data collection workflows.
          </p>

          <div className="grid gap-3 pt-2">
            {[
              {
                title: "Camp-scoped data safety",
                desc: "Active project and camp context stays visible across registration and screening workflows.",
              },
              {
                title: "Structured clinical entry",
                desc: "Validated vitals, TB, HIV, cancer, specialty, and radiology records with draft-to-final review.",
              },
              {
                title: "Full-dataset reporting",
                desc: "Server-aggregated demographics, clinical indicators, and de-identified executive exports.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-border bg-background/70 px-4 py-3"
              >
                <div className="text-xs font-semibold text-foreground">
                  {item.title}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground">
          Authorized clinical and program personnel only. Activity is scoped to
          assigned roles and camps.
        </div>
      </div>
    </div>
  );
}
