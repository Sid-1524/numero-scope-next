'use client'

import React, { useState } from "react";
import { Lock, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        window.location.href = "/app"; 
      } else {
        const data = await res.json();
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Unable to connect right now. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f6f2] px-4 py-10 font-sans text-[#202c29] selection:bg-[#dce9df] selection:text-[#203a31]">
      <section className="w-full max-w-md rounded-3xl border border-[#e2e7df] bg-white p-7 shadow-[0_24px_80px_rgba(32,44,41,0.10)] sm:p-10" aria-labelledby="login-heading">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f3ed] text-[#426c58]">
              <Lock size={21} />
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#52715f]">NumeroScope</p>
            <h1 id="login-heading" className="text-2xl font-semibold tracking-tight text-[#25352e]">Sign in</h1>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#527c65] focus:ring-2 focus:ring-[#527c65]/20"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-[#527c65] focus:ring-2 focus:ring-[#527c65]/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#315d4c] px-5 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-[#274c3d] active:bg-[#203f33] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign in
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}