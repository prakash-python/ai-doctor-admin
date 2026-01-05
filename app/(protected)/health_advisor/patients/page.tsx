"use client";

import { useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

type Patient = {
  id: string;
  name?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  user: {
    email: string | null;
    mobile: string;
    createdAt: string;
  };
};

export default function HealthAdvisorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health_advisor/patients");
      const data = await res.json();
      if (data.status === "success") setPatients(data.data || []);
    } catch {
      Swal.fire("Error", "Failed to fetch patients", "error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = patients.filter(p => {
    const t = search.toLowerCase();
    return (
      p.user.mobile.includes(t) ||
      (p.user.email && p.user.email.toLowerCase().includes(t)) ||
      (p.name && p.name.toLowerCase().includes(t))
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
          Patients assigned for consultation.
        </p>
      </div>

      {/* Search */}
      <div className="flex justify-end">
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
                <th className="px-6 py-4 text-xs uppercase text-gray-500">S.No</th>
                <th className="px-6 py-4 text-xs uppercase text-gray-500">Name</th>
                <th className="px-6 py-4 text-xs uppercase text-gray-500">Email</th>
                <th className="px-6 py-4 text-xs uppercase text-gray-500">Mobile</th>
                <th className="px-6 py-4 text-xs uppercase text-gray-500">Age / Gender</th>
                <th className="px-6 py-4 text-xs uppercase text-gray-500">Joined</th>
                <th className="px-6 py-4 text-center text-xs uppercase text-gray-500">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center">No patients found</td></tr>
              ) : paginated.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{(page-1)*itemsPerPage + i + 1}</td>
                  <td className="px-6 py-4 font-medium">{p.name || "-"}</td>
                  <td className="px-6 py-4">{p.user.email || "-"}</td>
                  <td className="px-6 py-4">{p.user.mobile}</td>
                  <td className="px-6 py-4">{p.age || "-"} / {p.gender || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(p.user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href={`/health_advisor/patients/${p.id}`}
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
          <div className="flex justify-between px-6 py-4 border-t border-gray-200">
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
