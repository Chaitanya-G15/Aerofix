"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login - in a real app, this would check Supabase Auth
    if (email && password) {
      router.push("/devices");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-600/10 blur-[120px]"></div>

      <div className="relative w-full max-w-md px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              AeroFix AI
            </h1>
            <p className="mt-2 text-sm text-zinc-400">Technician Portal v2.0</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Email Address
              </label>
              <input
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                placeholder="tech@aerofix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Password
              </label>
              <input
                type="password"
                required
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-zinc-500">
              Forgot your credentials? Contact your regional manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
