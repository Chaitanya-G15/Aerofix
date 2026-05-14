"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const linkClass =
  "text-sm font-medium text-zinc-400 transition hover:text-cyan-300";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") return null;

  const handleLogout = () => {
    document.cookie = "aerofix_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-white">
            AeroFix
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-widest text-zinc-500 sm:inline">
            HVAC ops
          </span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/" className={linkClass}>
            Dashboard
          </Link>
          <Link href="/devices" className={linkClass}>
            Devices
          </Link>
          <button 
            onClick={handleLogout}
            className="text-xs font-bold uppercase tracking-wider text-red-400/80 hover:text-red-400"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
