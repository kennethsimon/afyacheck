"use client";

import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AlertCircle, Eye, EyeOff, Loader2, Moon, Sun } from "lucide-react";
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
      setError(
        "Unable to complete sign in. Verify network connectivity and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full overflow-x-hidden bg-white dark:bg-background lg:grid-cols-[46%_54%]">
      {/* Left Panel: Minimal, focused sign-in form */}
      <div className="flex min-h-screen min-w-0 flex-col justify-between bg-white px-5 py-7 dark:bg-background sm:px-10 lg:px-14 xl:px-16">
        {/* Top bar: Official AfyaCheck Logo + Theme Toggle */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-lg dark:bg-white/95 dark:px-2.5 dark:py-1">
              <Image
                src="/logo.png"
                alt="AfyaCheck"
                width={136}
                height={40}
                priority
                className="h-8 w-auto object-contain mix-blend-multiply dark:mix-blend-normal"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle color theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </header>

        {/* Centered Auth Form Container (380-420px) */}
        <main className="mx-auto my-auto w-full max-w-[400px] py-10">
          {/* Compact mobile brand visual strip (< lg only) */}
          <div className="mb-7 rounded-xl border border-[#106D75]/15 bg-[#EFF6F7] px-4 py-3 dark:border-primary/20 dark:bg-[#0D272B] lg:hidden">
            <p className="text-[11px] font-medium tracking-wide text-[#106D75] dark:text-[#7CC4B8]">
              Healthcare, thoughtfully connected.
            </p>
            <p className="mt-0.5 text-sm font-semibold tracking-tight text-[#101828] dark:text-foreground">
              Better health. Better connected.
            </p>
          </div>

          <div className="space-y-2">
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sign in to access your healthcare workspace.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-6 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-xs leading-relaxed text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-xs font-medium text-foreground"
              >
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="h-11 rounded-lg border-input bg-card px-3.5 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-medium text-foreground"
              >
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
                  className="h-11 rounded-lg border-input bg-card px-3.5 pr-11 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-primary/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="h-11 w-full rounded-lg bg-[#106D75] text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#084C53] focus-visible:ring-2 focus-visible:ring-[#106D75]/40 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-7 text-center text-xs leading-relaxed text-muted-foreground">
            Need help accessing your account? Contact your administrator.
          </p>
        </main>

        {/* Restrained Footer */}
        <footer className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>AfyaCheck Healthcare Platform</span>
          <span>&copy; {new Date().getFullYear()} AfyaCheck</span>
        </footer>
      </div>

      {/* Right Panel: Branded Editorial Illustration & Concise Messaging */}
      <aside
        aria-label="AfyaCheck platform overview"
        className="relative hidden overflow-hidden border-l border-border/70 bg-[#EFF6F7] dark:bg-[#0B2226] lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-12 lg:py-12 xl:px-16"
      >
        {/* Subtle radial ambient glow & refined geometric ring */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 38%, rgba(16, 109, 117, 0.08) 0%, rgba(16, 109, 117, 0) 64%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#106D75]/10 dark:border-[#7CC4B8]/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -left-24 h-96 w-96 rounded-full border border-[#106D75]/10 dark:border-[#7CC4B8]/10"
        />

        <div className="relative z-10 flex w-full max-w-[600px] flex-col items-center text-center">
          {/* Dominant Custom Healthcare Illustration */}
          <div className="w-full max-w-[540px] overflow-hidden rounded-2xl dark:border dark:border-white/10 dark:bg-[#EFF6F7] dark:p-2 dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <Image
              src="/illustrations/afyacheck-signin-hero.jpg"
              alt="Diverse healthcare professionals coordinating community health programs and digital insights together"
              width={1408}
              height={1056}
              priority
              sizes="(min-width: 1280px) 540px, (min-width: 1024px) 46vw, 0px"
              className="h-auto w-full rounded-xl object-contain mix-blend-multiply dark:mix-blend-normal"
            />
          </div>

          {/* Concise Editorial Brand Messaging */}
          <div className="mt-7 max-w-[540px] space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#106D75] dark:text-[#7CC4B8]">
              Healthcare, thoughtfully connected.
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-[#101828] dark:text-white xl:text-[31px] xl:leading-[1.18]">
              Better health. Better connected.
            </h2>
            <p className="mx-auto max-w-[480px] text-[15px] leading-relaxed text-[#475467] dark:text-[#B8D2D4]">
              Empowering healthcare teams to manage programs, coordinate
              community outreach, deliver wellness services, and turn health
              data into meaningful insights.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
