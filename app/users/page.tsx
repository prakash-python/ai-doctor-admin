"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "USER",
  });

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditId(null);
    setFormData({ email: "", password: "", role: "USER" });
    setShowModal(true);
  };

  const openEdit = (u: any) => {
    setEditId(u.id);
    setFormData({ email: u.email, password: "", role: u.role });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/users/${editId}` : "/api/users";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      Swal.fire("Success", editId ? "User Updated" : "User Created", "success");
      setShowModal(false);
      fetchUsers();
    } else Swal.fire("Error", "Operation failed", "error");
  };

  const deleteUser = async (id: string) => {
    const c = await Swal.fire({
      title: "Delete user?",
      text: "This cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });
    if (!c.isConfirmed) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    Swal.fire("Deleted", "User removed", "success");
    fetchUsers();
  };

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage all system users and their roles</p>
        </div>
        <button onClick={openCreate}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2">
          + Create New User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-8 py-5">Email</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5">Created</th>
                  <th className="px-8 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-8 py-6">{u.email}</td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-4 py-2 rounded-full text-xs font-bold ${
                        u.role === "ADMIN" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-8 py-6">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-6 flex gap-3">
                      <button onClick={()=>openEdit(u)} className="bg-yellow-400 px-3 py-1 rounded text-white">Edit</button>
                      <button onClick={()=>deleteUser(u.id)} className="bg-red-500 px-3 py-1 rounded text-white">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
  {showModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-md">

      <div className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-fade-in">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {editId ? "Edit User" : "Create New User"}
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            required
          />

          <input
            type="password"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Password"
            required={!editId}
          />

          <select
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition"
            >
              Save
            </button>
          </div>

        </form>
      </div>
    </div>
  )}


    </div>
  );
}
