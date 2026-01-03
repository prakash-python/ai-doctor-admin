"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [identifierError, setIdentifierError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidMobile = (value: string) => /^\d{10}$/.test(value.trim());
  const isValidEmail = (value: string) => emailRegex.test(value.trim());

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (/^\d*$/.test(value)) value = value.replace(/\D/g, "").slice(0, 10);
    setIdentifier(value);
    validateIdentifier(value);
  };

  const validateIdentifier = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return setIdentifierError("");
    if (isValidEmail(trimmed) || isValidMobile(trimmed)) return setIdentifierError("");
    setIdentifierError(/^\d+$/.test(trimmed)
      ? `Mobile must be exactly 10 digits (${trimmed.length}/10)`
      : "Enter valid email or mobile");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || identifierError || !password) {
      Swal.fire("Error", "Enter valid login details", "error");
      return;
    }

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
      callbackUrl: "/dashboard-router"
    });

    if (result?.error) {
      Swal.fire("Error", "Invalid credentials. Please try again.", "error");
    } else if (result?.ok) {
      window.location.href = "/dashboard-router";
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* Left side - Solid background with centered image and text below */}
      <div className="hidden md:flex flex-col items-center justify-center bg-blue-900 px-8">
        
        {/* The original image, centered, with max constraints to keep it nice-sized */}
        <img 
          src="/hospital.jpg"  
          alt="Doctor with stethoscope" 
          className="max-w-full max-h-96 object-contain mb-12 drop-shadow-2xl"
        />

        {/* Text below the image */}
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">AI Doctor</h1>
          <p className="text-xl opacity-90">Smart hospital & patient care management</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex items-center justify-center bg-gray-100 px-4 py-8">
        <div className="p-8 w-full max-w-[380px] bg-white rounded-2xl shadow-lg">

          <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-4">

            <input
              type="text"
              placeholder="Email or Mobile"
              value={identifier}
              onChange={handleIdentifierChange}
              className={`w-full px-4 py-3 border rounded-lg ${identifierError ? "border-red-500" : "border-gray-300"}`}
            />

            {identifierError && <p className="text-sm text-red-600">{identifierError}</p>}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-between text-sm text-blue-600">
              <a href="/forgot-password" className="hover:underline">Forgot Password?</a>
              <a href="/sign-up" className="font-semibold hover:underline">Sign Up</a>
            </div>

            <button type="submit"
              disabled={!identifier || !password || !!identifierError}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              Login
            </button>
          </form>

          <div className="text-center text-gray-400 my-4">OR</div>

          <button className="w-full py-3 border rounded-lg hover:bg-gray-50">
            Login with OTP
          </button>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard-router" })}
            className="w-full py-3 mt-3 flex items-center justify-center gap-3 border rounded-lg hover:bg-gray-50"
          >
            <img src="/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

        </div>
      </div>
    </div>
  );
}