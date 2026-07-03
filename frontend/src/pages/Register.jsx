import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaHome, FaSearch, FaInfoCircle, FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TENANT"); // OWNER or TENANT
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Standard client side validation
    if (!name || !email || !phone || !password || !role) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const result = await register({
      name,
      email,
      phone,
      password,
      role,
    });

    if (result && result.success) {
      navigate("/");
    } else {
      setError(result?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-200/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-lg w-full z-10 flex flex-col items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-8 hover:opacity-95 transition">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">
            RM
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            RentMate
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full shadow-xl relative">
          <h2 className="text-3xl font-extrabold text-center mb-2 text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-sm text-center mb-8">
            Rent Smarter. Live Better.
          </p>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-xs flex items-center gap-3 mb-6">
              <FaInfoCircle className="text-sm shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5">
            {/* Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <FaUser />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white text-slate-800 rounded-xl py-3.5 pl-11 pr-4 outline-none transition text-sm font-medium"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white text-slate-800 rounded-xl py-3.5 pl-11 pr-4 outline-none transition text-sm font-medium"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <FaPhone />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white text-slate-800 rounded-xl py-3.5 pl-11 pr-4 outline-none transition text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                  <FaLock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white text-slate-800 rounded-xl py-3.5 pl-11 pr-11 outline-none transition text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Role Switcher Toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("TENANT")}
                  className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition font-semibold text-sm ${
                    role === "TENANT"
                      ? "bg-violet-50 border-violet-500 text-violet-600 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <FaSearch className="text-base" />
                  <span>Find a Room</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("OWNER")}
                  className={`py-4 rounded-xl border flex flex-col items-center gap-2 transition font-semibold text-sm ${
                    role === "OWNER"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <FaHome className="text-base" />
                  <span>Rent out a Room</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold tracking-wide transition shadow-lg shadow-indigo-600/10 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Bottom link */}
          <div className="text-center mt-6 text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-600 hover:text-violet-500 font-semibold underline transition">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;