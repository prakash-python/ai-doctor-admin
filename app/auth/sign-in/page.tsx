export default function SignInPage() {
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

          <input className="input auth-input mb-3" placeholder="Email or Mobile" />
          <input className="input auth-input mb-4" type="password" placeholder="Password" />

          <div className="flex justify-between text-sm text-blue-600 mb-4">
            <a href="#">Forgot Password?</a>
            <a href="#" className="font-semibold">Sign Up</a>
          </div>

          <button className="auth-btn-primary">Login</button>

          <div className="text-center text-gray-400 my-3">OR</div>

          <button className="auth-btn-outline">Login with OTP</button>
        </div>
      </div>
    </div>
  );
}
