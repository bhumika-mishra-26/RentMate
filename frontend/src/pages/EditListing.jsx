import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import listingService from "../services/listingService";
import { CreateListingForm } from "./OwnerDashboard";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await listingService.getListingById(id);
        if (res.success) setListing(res.data);
        else setError("Listing not found.");
      } catch {
        setError("Failed to load listing.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 gap-3">
        <FaSpinner className="animate-spin text-xl text-emerald-600" /> Loading listing...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-4">
        <p>{error}</p>
        <Link to="/owner/dashboard" className="text-emerald-600 underline text-sm font-bold">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <nav className="border-b border-slate-200 bg-white/70 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20">RM</div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RentMate</span>
        </div>
        <Link to="/owner/dashboard" className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-650 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold transition">
          <FaArrowLeft /> Back to Dashboard
        </Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-10 w-full flex-1">
        <CreateListingForm
          prefill={listing}
          isEdit={true}
          listingId={id}
          onSuccess={() => navigate("/owner/dashboard")}
        />
      </div>
    </div>
  );
}
