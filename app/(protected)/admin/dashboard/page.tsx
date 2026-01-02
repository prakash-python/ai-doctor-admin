"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Users, Calendar, Stethoscope, HeartHandshake } from "lucide-react";

type DashboardData = {
  user: {
    email: string | null;
    mobile: string;
    role: { name: string };
    createdAt: string;
  };
  stats: {
    totalUsers: number;
    totalRoles: number;
    totalDoctors: number;
    totalHealthAdvisors: number;
    totalPatients: number;
  };
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(res => res.json())
      .then(setData);
  }, []);

  const user = data?.user;
  const stats = data?.stats;

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {user?.email || user?.mobile || "Admin"}!
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Here's what's happening in your system today.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Stat title="Users" value={stats?.totalUsers} icon={<Users />} color="blue" />
        <Stat title="Doctors" value={stats?.totalDoctors} icon={<Stethoscope />} color="green" />
        <Stat title="Health Advisors" value={stats?.totalHealthAdvisors} icon={<HeartHandshake />} color="purple" />
        <Stat title="Patients" value={stats?.totalPatients} icon={<Calendar />} color="orange" />
        <Stat title="Roles" value={stats?.totalRoles} icon={<Shield />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <ActionLink href="/admin/users" icon={<Users className="text-blue-600" />} label="Manage Users" />
            <ActionLink href="/admin/roles" icon={<Shield className="text-purple-600" />} label="Manage Roles" />
            <ActionLink href="/admin/patients" icon={<Calendar className="text-green-600" />} label="View Patients" />
          </div>
        </div>

        {/* ACCOUNT INFO */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-semibold mb-6">Account Information</h3>
          <Info label="Email" value={user?.email} />
          <Info label="Mobile" value={user?.mobile} />
          <Info label="Role" value={user?.role.name} />
          <Info label="Member Since" value={user?.createdAt && new Date(user.createdAt).toLocaleDateString()} />
        </div>

      </div>
    </div>
  );
}

/* ---------- UI PARTS ---------- */

function Stat({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    indigo: "bg-indigo-100 text-indigo-600"
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">{title}</p>
          <p className="text-4xl font-bold mt-2">{value ?? "-"}</p>
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ActionLink({ href, icon, label }: any) {
  return (
    <Link href={href} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition">
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function Info({ label, value }: any) {
  return (
    <div className="mb-4">
      <p className="text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || "-"}</p>
    </div>
  );
}
