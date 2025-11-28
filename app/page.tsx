"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/app"); // redirect on success
    } else {
      const data = await res.json();
      setError(data.message || "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white dark:bg-zinc-900 p-8 shadow-md flex flex-col gap-5"
      >
        <h1 className="text-2xl font-semibold text-center text-black dark:text-white">
          Login
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <input
          type="text"
          placeholder="Username"
          className="rounded-md border border-zinc-300 dark:border-zinc-700 p-3 bg-transparent outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="rounded-md border border-zinc-300 dark:border-zinc-700 p-3 bg-transparent outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="rounded-md bg-black text-white dark:bg-white dark:text-black py-3 font-medium hover:opacity-90 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
