"use client";

import { useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

type Staff = {
  id: string;
  name?: string;
  specialization: string;
  qualification: string;
  experience: number;
  available: boolean;
  user: {
    email: string | null;
    mobile: string;
    createdAt: string;
  };
};

export default function AdminStaffPage() {
  const [tab, setTab] = useState<"doctors" | "advisors">("doctors");
  const [doctors, setDoctors] = useState<Staff[]>([]);
  const [advisors, setAdvisors] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, a] = await Promise.all([
        fetch("/api/admin/doctors").then(r => r.json()),
        fetch("/api/admin/health-advisors").then(r => r.json())
      ]);
      if (d.status === "success") setDoctors(d.data || []);
      if (a.status === "success") setAdvisors(a.data || []);
    } catch {
      Swal.fire("Error", "Failed to load staff", "error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const list = tab === "doctors" ? doctors : advisors;

  const filtered = list.filter(s => {
    const t = search.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(t)) ||
      (s.user.email && s.user.email.toLowerCase().includes(t)) ||
      s.user.mobile.includes(t)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
        <p className="text-sm text-gray-600 mt-2">
          Doctors and Health Advisors working in your hospital
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3">
          {["doctors", "advisors"].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t as any); setPage(1); }}
              className={`px-5 py-2 rounded-lg font-medium ${tab === t ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              {t === "doctors" ? "Doctors" : "Health Advisors"}
            </button>
          ))}
        </div>

        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            placeholder="Search by name, email, mobile"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase">S.No</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase">Name</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase">Specialization</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase">Qualification</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase">Experience</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-4 text-center text-xs text-gray-500 uppercase">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">

              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center">No staff found</td></tr>
              ) : paginated.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{(page-1)*itemsPerPage + i + 1}</td>
                  <td className="px-6 py-4 font-medium">{s.name || "-"}</td>
                  <td className="px-6 py-4">{s.specialization}</td>
                  <td className="px-6 py-4">{s.qualification}</td>
                  <td className="px-6 py-4">{s.experience} yrs</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${s.available ? "bg-green-500" : "bg-red-500"}`}>
                      {s.available ? "AVAILABLE" : "UNAVAILABLE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(s.user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href={`/admin/staff/${tab}/${s.id}`}
                      className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                      <Eye className="w-5 h-5"/>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {(page-1)*itemsPerPage+1} to {Math.min(page*itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))}>Prev</button>
              {Array.from({length: totalPages},(_,i)=>i+1).map(p => (
                <button key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-full ${p===page?"bg-blue-600 text-white":"hover:bg-gray-100"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
