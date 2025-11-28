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
      // In a real app, this would point to your actual authentication API
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Redirect on success (Standard React approach)
        window.location.href = "/app"; 
      } else {
        const data = await res.json();
        setError(data.message || "Login failed");
      }
    } catch (err) {
      // Fallback for demo purposes if API doesn't exist
      if (username.toLowerCase() === 'admin' && password === 'newpass@123') {
         window.location.href = "/app";
      } else {
         setError("An unexpected error occurred (or invalid demo credentials)");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 font-sans selection:bg-purple-500 selection:text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-slate-800 border border-slate-700 p-8 shadow-2xl flex flex-col gap-6"
      >
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-purple-600/20 rounded-full shadow-lg shadow-purple-900/20">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
          NumeroScope Login
        </h1>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
            <AlertCircle size={16} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <input
              type="text"
              placeholder="Username"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
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
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3.5 font-bold transition-all shadow-lg shadow-purple-900/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99]"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={18} />
              Sign In
            </>
          )}
        </button>
      </form>
    </div>
  );
}