"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Eye, Search } from "lucide-react";
import Link from "next/link";

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

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/patients");
      const data = await res.json();
      if (data.status === "success") setPatients(data.data || []);
    } catch {
      Swal.fire("Error", "Failed to fetch patients", "error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, []);

  const filtered = patients.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.user.mobile.includes(term) ||
      (p.user.email && p.user.email.toLowerCase().includes(term)) ||
      (p.name && p.name.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-3xl mx-auto">
          Registered patient profiles in your hospital system.
        </p>
      </div>

      {/* Search */}
      <div className="flex justify-between items-center">
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            placeholder="Search by name, email, mobile"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                <th className="px-6 py-4 text-xs uppercase">S.No</th>
                <th className="px-6 py-4 text-xs uppercase">Name</th>
                <th className="px-6 py-4 text-xs uppercase">Email</th>
                <th className="px-6 py-4 text-xs uppercase">Mobile</th>
                <th className="px-6 py-4 text-xs uppercase">Age / Gender</th>
                <th className="px-6 py-4 text-xs uppercase">Blood Group</th>
                <th className="px-6 py-4 text-xs uppercase">Joined</th>
                <th className="px-6 py-4 text-center text-xs uppercase">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12">No patients found</td></tr>
              ) : paginated.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{(currentPage-1)*itemsPerPage + i + 1}</td>
                  <td className="px-6 py-4 font-medium">{p.name || "-"}</td>
                  <td className="px-6 py-4">{p.user.email || "-"}</td>
                  <td className="px-6 py-4">{p.user.mobile}</td>
                  <td className="px-6 py-4">{p.age || "-"} / {p.gender || "-"}</td>
                  <td className="px-6 py-4">{p.bloodGroup || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(p.user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href={`/admin/patients/${p.id}`}
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
              Showing {(currentPage-1)*itemsPerPage+1} to {Math.min(currentPage*itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1,p-1))}>Prev</button>
              {Array.from({length: totalPages},(_,i)=>i+1).map(p => (
                <button key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-full ${p===currentPage?"bg-blue-600 text-white":"hover:bg-gray-100"}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
