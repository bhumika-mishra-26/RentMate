import { useState, useEffect } from "react";
import tenantService from "../services/tenantService";
import { FaMapMarkerAlt, FaRupeeSign, FaCalendarAlt, FaCheckCircle, FaSpinner, FaExclamationCircle } from "react-icons/fa";

export default function TenantProfile() {
  const [form, setForm] = useState({
    preferredLocation: "",
    minBudget: "",
    maxBudget: "",
    moveInDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await tenantService.getProfile();
        if (res.success && res.data) {
          setHasProfile(true);
          setForm({
            preferredLocation: res.data.preferredLocation,
            minBudget: res.data.minBudget,
            maxBudget: res.data.maxBudget,
            moveInDate: res.data.moveInDate?.slice(0, 10) || "",
          });
        }
      } catch {
        // No profile yet — that's fine
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.preferredLocation || !form.minBudget || !form.maxBudget || !form.moveInDate) {
      setError("All fields are required.");
      return;
    }
    if (parseInt(form.minBudget) > parseInt(form.maxBudget)) {
      setError("Minimum budget cannot exceed maximum budget.");
      return;
    }

    setSaving(true);
    try {
      const res = await tenantService.upsertProfile(form);
      if (res.success) {
        setSuccess("Profile saved successfully!");
        setHasProfile(true);
        setTimeout(() => setSuccess(""), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white text-slate-800 rounded-xl py-3 px-4 outline-none transition text-sm font-medium";
  const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-wider pl-1";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
        <FaSpinner className="animate-spin text-violet-600" /> Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-xl flex flex-col gap-5 bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Tenant Profile Preferences</h2>
        <p className="text-slate-500 text-sm mt-1">
          {hasProfile ? "Update your preferences to improve listing matches." : "Set up your preferences to start matching with rooms."}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-xs">
          <FaExclamationCircle className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-600 p-3 rounded-xl text-xs">
          <FaCheckCircle className="shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Location Preference */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Preferred Location</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FaMapMarkerAlt />
            </span>
            <input
              type="text"
              value={form.preferredLocation}
              onChange={set("preferredLocation")}
              placeholder="e.g. Koramangala, Bangalore"
              className={`${inputCls} pl-11`}
            />
          </div>
        </div>

        {/* Budget Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Min Budget (₹ / mo)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <FaRupeeSign />
              </span>
              <input
                type="number"
                value={form.minBudget}
                onChange={set("minBudget")}
                placeholder="5000"
                className={`${inputCls} pl-11`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Max Budget (₹ / mo)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <FaRupeeSign />
              </span>
              <input
                type="number"
                value={form.maxBudget}
                onChange={set("maxBudget")}
                placeholder="20000"
                className={`${inputCls} pl-11`}
              />
            </div>
          </div>
        </div>

        {/* Target Move-in Date */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Target Move-in Date</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FaCalendarAlt />
            </span>
            <input
              type="date"
              value={form.moveInDate}
              onChange={set("moveInDate")}
              className={`${inputCls} pl-11`}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/10"
        >
          {saving ? <FaSpinner className="animate-spin" /> : "Save Preferences"}
        </button>
      </form>
    </div>
  );
}
