// app/sign-in/page.tsx (updated)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Store tokens
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);

        // Redirect based on role
        const role = data.data.user.role;
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else if (role === "doctor") {
          router.push("/doctor/dashboard");
        } else {
          router.push("/user/dashboard"); // Default user dashboard
        }
      } else {
        Swal.fire("Error", data.message || "Login failed", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT IMAGE */}
      <div className="hidden md:flex relative">
        <img
          src="/hospital.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-blue-900/70"></div>

        <div className="relative z-10 text-white p-12 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">AI Doctor</h1>
          <p className="text-lg opacity-90">
            Smart hospital & patient care management
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex items-center justify-center bg-gray-100">
        <div className="auth-card p-8 w-[380px]">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
            Sign In
          </h2>

          <form onSubmit={handleLogin}>
            <input
              className="input auth-input mb-3"
              placeholder="Email or Mobile"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <input
              className="input auth-input mb-4"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex justify-between text-sm text-blue-600 mb-4">
              <a href="#">Forgot Password?</a>
              <a href="#" className="font-semibold">Sign Up</a>
            </div>

            <button type="submit" className="auth-btn-primary">Login</button>
          </form>

          <div className="text-center text-gray-400 my-3">OR</div>

          <button className="auth-btn-outline">Login with OTP</button>
        </div>
      </div>
    </div>
  );
}