"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = password.length >= 8 && password === confirm;

  const savePassword = async () => {
    if (!isValid) {
      Swal.fire("Error", "Password must be 8+ chars and match", "error");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      setLoading(false);
      Swal.fire("Error", "Failed to set password", "error");
      return;
    }

    // 🔥 Force JWT refresh
    await signIn("credentials", {
      redirect: false,
      identifier: (await res.json()).email,
      password,
    });

    setLoading(false);
    window.location.href = "/dashboard-router";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Create Your Password
        </h1>

        <div className="space-y-4">
          {/* Password */}
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="New Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            disabled={!isValid || loading}
            onClick={savePassword}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
            }`}
          >
            {loading ? "Saving..." : "Save Password"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          You must set a password to continue using your account.
        </p>
      </div>
    </div>
  );
}
