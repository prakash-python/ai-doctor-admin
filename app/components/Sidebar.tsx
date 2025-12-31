"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-72 bg-white shadow-lg flex flex-col h-full">
      {/* Logo / Title */}
      <div className="p-8 border-b border-gray-200">
        <h1 className="text-3xl font-extrabold text-blue-600">My AI Doctor</h1>
        <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Main
          </p>
          <div className="space-y-2">
            <Link
              href="/users"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive("/users")
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users Management
            </Link>

            <Link
              href="/patients"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive("/patients")
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Patients Management
            </Link>
          </div>
        </div>
      </nav>

      {/* Optional Footer */}
      <div className="p-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">© 2025 My AI Doctor</p>
      </div>
    </aside>
  );
}