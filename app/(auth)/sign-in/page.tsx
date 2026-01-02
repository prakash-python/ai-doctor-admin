// app/sign-in/page.tsx (updated)

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { signIn } from "next-auth/react";


export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const res = await signIn("credentials", {
    redirect: false,
    identifier,
    password,
  });

  if (!res?.ok) {
    Swal.fire("Error", "Invalid credentials", "error");
    return;
  }

  // Wait for session to be ready
  const waitForSession = async () => {
    for (let i = 0; i < 10; i++) {
      const s = await fetch("/api/auth/session");
      const session = await s.json();
      if (session?.user?.role) return session;
      await new Promise(r => setTimeout(r, 200));
    }
    return null;
  };

  const session = await waitForSession();
  if (!session) {
    Swal.fire("Error", "Session not ready. Try again.", "error");
    return;
  }

  const role = session.user.role;

  if (role === "admin") router.replace("/admin/dashboard");
  else if (role === "doctor") router.replace("/doctor/dashboard");
  else if (role === "health_advisor") router.replace("/advisor/dashboard");
  else if (role === "patient") router.replace("/patient/dashboard");
  else router.replace("/user/dashboard");
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