"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function AdvisorConsultations() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [open, setOpen] = useState(false);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [form, setForm] = useState({
    consultationAt: "",
    notes: "",
    status: "booked"
  });

  const router = useRouter();

  /* Load consultations */
  const fetchItems = async () => {
    const res = await fetch("/api/health_advisor/consultations");
    if (res.status === 401) return router.replace("/sign-in");
    const data = await res.json();
    if (data.status === "success") setItems(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter((c) => {
    const t = search.toLowerCase();
    return (
      c.patient?.name?.toLowerCase().includes(t) ||
      c.patient?.user?.email?.toLowerCase().includes(t) ||
      c.patient?.user?.mobile?.includes(t)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const openCreate = (patientId: string) => {
    setActivePatientId(patientId);
    setForm({ consultationAt: "", notes: "", status: "booked" });
    setOpen(true);
  };

  const createConsultation = async () => {
    if (!activePatientId || !form.consultationAt || !form.notes)
      return Swal.fire("All fields required", "", "warning");

    const res = await fetch("/api/health_advisor/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: activePatientId,
        ...form
      })
    });

    if (res.ok) {
      Swal.fire("Created", "Consultation booked", "success");
      setOpen(false);
      fetchItems();
    } else Swal.fire("Failed", "", "error");
  };

  return (
    <div className="space-y-8">

      <div className="text-center">
        <h1 className="text-3xl font-bold">Consultations</h1>
        <p className="text-sm text-gray-600 mt-2">Your booked consultations</p>
      </div>

      <div className="flex justify-end">
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            placeholder="Search patient..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs uppercase text-gray-500">#</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500">Patient</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500">Mobile</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500">When</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500">Status</th>
              <th className="px-6 py-4 text-xs uppercase text-gray-500 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center">Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center">No consultations</td></tr>
            ) : paginated.map((c,i)=>(
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{(page-1)*itemsPerPage+i+1}</td>
                <td className="px-6 py-4 font-medium">{c.patient?.name || "-"}</td>
                <td className="px-6 py-4">{c.patient?.user?.mobile}</td>
                <td className="px-6 py-4">{new Date(c.consultationAt).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    c.status === "completed" ? "bg-green-500" :
                    c.status === "cancelled" ? "bg-red-500" : "bg-blue-500"
                  }`}>
                    {c.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={()=>openCreate(c.patientId)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
                    <Plus className="w-4 h-4"/> Create
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages>1 && (
          <div className="flex justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-600">
              Showing {(page-1)*itemsPerPage+1} to {Math.min(page*itemsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
              {Array.from({length: totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)}
                  className={`w-8 h-8 rounded-full ${p===page?"bg-blue-600 text-white":"hover:bg-gray-100"}`}>
                  {p}
                </button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Create Consultation</h2>

            <input type="datetime-local" className="w-full p-3 border rounded-lg"
              value={form.consultationAt}
              onChange={e=>setForm({...form,consultationAt:e.target.value})}/>

            <textarea className="w-full p-3 border rounded-lg"
              placeholder="Notes"
              value={form.notes}
              onChange={e=>setForm({...form,notes:e.target.value})}/>

            <select className="w-full p-3 border rounded-lg"
              value={form.status}
              onChange={e=>setForm({...form,status:e.target.value})}>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={()=>setOpen(false)} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
              <button onClick={createConsultation} className="px-5 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
