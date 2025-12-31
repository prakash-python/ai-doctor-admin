// app/admin/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Users, UserCheck, Calendar } from "lucide-react";

type CurrentUser = {
  id: string;
  email: string | null;
  mobile: string;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  createdAt: string;
};

type Stats = {
  totalUsers: number;
  totalRoles: number;
  totalPatients: number; // placeholder - you can fetch later
};

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  console.log("Current User:", currentUser);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRoles: 0,
    totalPatients: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch current logged-in user (you'll need an auth context or API later)
  // For now, we'll mock it or fetch from a protected endpoint
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me"); // You'll create this endpoint later
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error("Failed to fetch current user");
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/roles"),
      ]);

      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      setStats({
        totalUsers: usersData.total || 0,
        totalRoles: rolesData.total || 0,
        totalPatients: 0, // Replace with actual patients count when ready
      });
    } catch (err) {
      console.error("Failed to fetch stats");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {currentUser?.email || currentUser?.mobile || "Admin"}!
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Here's what's happening in your system today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {loading ? "-" : stats.totalUsers}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Roles */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Roles</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {loading ? "-" : stats.totalRoles}
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Active Admins / Placeholder */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Your Role</p>
              <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">
                {currentUser?.role.name || "Loading..."}
              </p>
              {currentUser?.role.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {currentUser.role.description}
                </p>
              )}
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity or Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <Link
              href="/admin/users"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition"
            >
              <Users className="w-6 h-6 text-blue-600" />
              <span className="font-medium">Manage Users</span>
            </Link>
            <Link
              href="/admin/roles"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition"
            >
              <Shield className="w-6 h-6 text-purple-600" />
              <span className="font-medium">Manage Roles</span>
            </Link>
            <Link
              href="/admin/patients"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition"
            >
              <Calendar className="w-6 h-6 text-green-600" />
              <span className="font-medium">View Patients</span>
            </Link>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium text-gray-900">
                {currentUser?.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Mobile</p>
              <p className="font-medium text-gray-900">{currentUser?.mobile || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500">Member Since</p>
              <p className="font-medium text-gray-900">
                {currentUser
                  ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}