"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { roleMenus } from "@/app/lib/roleMenu";
import { LogOut } from "lucide-react";

export default function AppSidebar({ role }: { role: string }) {
  const path = usePathname();
  const router = useRouter();
  const menu = roleMenus[role as keyof typeof roleMenus] || [];

  const logout = async () => {
    await signOut({ redirect: false });
    router.replace("/sign-in");
  };

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-white shadow-xl flex flex-col">

      {/* TITLE */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold capitalize">{role} Panel</h2>
      </div>

      {/* MENU */}
      <div className="flex-1 p-6 overflow-y-auto">
        {menu.map(m => (
          <Link
            key={m.href}
            href={m.href}
            className={`block p-3 rounded-xl mb-2 transition ${
              path.startsWith(m.href)
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {m.label}
          </Link>
        ))}
      </div>

      {/* LOGOUT */}
      <div className="p-6 border-t">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
