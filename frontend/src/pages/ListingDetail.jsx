import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import listingService from "../services/listingService";
import interestService from "../services/interestService";
import compatibilityService from "../services/compatibilityService";
import { useAuth } from "../contexts/AuthContext";
import {
  FaArrowLeft, FaMapMarkerAlt, FaRupeeSign, FaBed, FaCouch,
  FaCalendarAlt, FaUser, FaPhone, FaSpinner, FaHeart, FaCheckCircle, FaBrain,
  FaHome,
} from "react-icons/fa";

// Fallback demo listings to resolve detail page offline
const DEMO_LISTINGS = [
  {
    id: "demo-listing-1",
    title: "Premium Cozy Studio Apartment",
    location: "Koramangala, Bangalore",
    rent: 14000,
    roomType: "Studio",
    furnishingStatus: "Fully Furnished",
    availableFrom: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Beautiful independent studio room with detached private kitchen, premium work-desk setup, and high-speed fiber internet. Located in a safe residential street close to popular cafes.",
    status: "AVAILABLE",
    photos: [{ id: "photo-1", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80" }],
    owner: { name: "Rajesh Kumar", email: "rajesh@demo.com", phone: "+91 98765 43210" }
  },
  {
    id: "demo-listing-2",
    title: "Spacious 1BHK Flat near Tech Park",
    location: "Marathahalli, Bangalore",
    rent: 18500,
    roomType: "1BHK",
    furnishingStatus: "Semi Furnished",
    availableFrom: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Large 1BHK apartment with modern modular wardrobes, geyser, kitchen chimney, and private balcony. Secure gated society with 24/7 security guard and power backup.",
    status: "AVAILABLE",
    photos: [{ id: "photo-2", imageUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80" }],
    owner: { name: "Anjali Sharma", email: "anjali@demo.com", phone: "+91 99887 76655" }
  },
  {
    id: "demo-listing-3",
    title: "Luxury Single Bed in Shared Room",
    location: "Indiranagar, Bangalore",
    rent: 8000,
    roomType: "Shared Room",
    furnishingStatus: "Fully Furnished",
    availableFrom: new Date().toISOString(),
    description: "Single occupancy bed in a spacious, airy double-sharing room. Fully equipped common area, washing machine, refrigerator, and smart TV. Rent includes cleaning and Wi-Fi services.",
    status: "AVAILABLE",
    photos: [{ id: "photo-3", imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=600&q=80" }],
    owner: { name: "Vikram Malhotra", email: "vikram@demo.com", phone: "+91 91223 34455" }
  },
  {
    id: "demo-listing-4",
    title: "Single Room PG for Students",
    location: "Kothrud, Pune",
    rent: 6500,
    roomType: "PG",
    furnishingStatus: "Fully Furnished",
    availableFrom: new Date().toISOString(),
    description: "Ideal single occupancy room for college students or young professionals. Includes bed, study table, lockable cupboards, daily housekeeping, and hot water. Meals facility available.",
    status: "AVAILABLE",
    photos: [{ id: "photo-4", imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80" }],
    owner: { name: "Sunita Deshmukh", email: "sunita@demo.com", phone: "+91 93344 55667" }
  }
];

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interestStatus, setInterestStatus] = useState(null); // null | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  const [compData, setCompData] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Handle offline demo listings
      if (id.startsWith("demo-listing-")) {
        const found = DEMO_LISTINGS.find(d => d.id === id);
        if (found) {
          setListing(found);
          if (user?.role === "TENANT") {
            const mockScores = { "demo-listing-1": 95, "demo-listing-2": 82, "demo-listing-3": 60, "demo-listing-4": 45 };
            const scoreVal = mockScores[id];
            setCompData({
              score: scoreVal,
              explanation: `According to your budget of ₹10,000–₹18,000 and target location Koramangala, this listing is a ${scoreVal >= 80 ? "great match" : "possible match"} for your flatmate search. (Offline Demo Explanation)`
            });
            // Mock interest status if Rajesh or Anjali demo listings
            if (id === "demo-listing-1") setInterestStatus("ACCEPTED");
            if (id === "demo-listing-2") setInterestStatus("PENDING");
          }
        } else {
          setError("Listing not found.");
        }
        setLoading(false);
        return;
      }

      try {
        const res = await listingService.getListingById(id);
        if (res.success) setListing(res.data);
        else setError("Listing not found.");

        // Check if tenant already sent interest
        if (user?.role === "TENANT") {
          try {
            const check = await interestService.checkInterest(id);
            if (check.success && check.data.exists) {
              setInterestStatus(check.data.interest.status);
            }
          } catch {}

          // Fetch compatibility score
          try {
            const compRes = await compatibilityService.getScore(id);
            if (compRes.success) {
              setCompData(compRes.data);
            }
          } catch {}
        }
      } catch {
        setError("Failed to load listing.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleSendInterest = async () => {
    if (id.startsWith("demo-listing-")) {
      setSending(true);
      setTimeout(() => {
        setInterestStatus("PENDING");
        setSending(false);
      }, 1000);
      return;
    }
    setSending(true);
    try {
      const res = await interestService.sendInterest(id);
      if (res.success) setInterestStatus("PENDING");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send interest.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 gap-3">
        <FaSpinner className="animate-spin text-xl text-violet-600" /> Loading room details...
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 gap-4">
        <p>{error || "Listing not found."}</p>
        <Link to="/tenant/dashboard" className="text-violet-600 underline text-sm font-bold">Back to Dashboard</Link>
      </div>
    );
  }

  const backLink = user?.role === "OWNER" ? "/owner/dashboard" : "/tenant/dashboard";

  const interestLabel = {
    PENDING: "Interest Request Sent — Pending",
    ACCEPTED: "Interest Request Accepted ✓",
    REJECTED: "Interest Request Declined",
  };
  const interestColor = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    ACCEPTED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
  };

  const firstPhoto = listing.photos?.[0]?.imageUrl;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">RM</div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">RentMate</span>
        </div>
        <Link to={backLink} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-650 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold transition">
          <FaArrowLeft /> Back
        </Link>
      </nav>

      {/* Main Grid */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        {/* Title Block */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{listing.title}</h1>
            <p className="text-slate-500 font-semibold text-sm mt-1.5 flex items-center gap-1">
              <FaMapMarkerAlt className="text-violet-500" /> {listing.location}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-2xl font-extrabold text-emerald-600 flex items-center"><FaRupeeSign />{listing.rent.toLocaleString()}<span className="text-xs font-semibold text-slate-400">/mo</span></span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">AVAILABLE</span>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
          <div className="w-full h-80 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
            {firstPhoto ? (
              <img src={firstPhoto} alt={listing.title} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <FaHome className="text-5xl opacity-30 text-violet-600" />
                <p className="text-sm font-medium">No photo uploaded for this room listing</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Match details (Tenants only) */}
        {user?.role === "TENANT" && compData && (
          <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-white border border-violet-100 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-start">
            <div className="p-4 bg-white rounded-2xl border border-violet-100 flex flex-col items-center shadow-sm shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">AI Match</span>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-600/10">
                {compData.score}%
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1.5 justify-center py-1">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <FaBrain className="text-indigo-600 animate-bounce" /> Compatibility Explanation
              </h3>
              <p className="text-slate-650 text-xs leading-relaxed font-semibold">{compData.explanation}</p>
            </div>
          </div>
        )}

        {/* Core Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl"><FaBed className="text-lg" /></div>
            <div className="flex flex-col"><span className="text-slate-400 text-[10px] font-bold uppercase">Room Type</span><span className="text-sm font-extrabold text-slate-800">{listing.roomType}</span></div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl"><FaCouch className="text-lg" /></div>
            <div className="flex flex-col"><span className="text-slate-400 text-[10px] font-bold uppercase">Furnishing</span><span className="text-sm font-extrabold text-slate-800">{listing.furnishingStatus}</span></div>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-sky-50 text-sky-650 border border-sky-100 rounded-xl"><FaCalendarAlt className="text-lg" /></div>
            <div className="flex flex-col"><span className="text-slate-400 text-[10px] font-bold uppercase">Available From</span><span className="text-sm font-extrabold text-slate-800">{new Date(listing.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
          </div>
        </div>

        {/* Description & Contact info */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col gap-5">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-5">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Room Description</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">{listing.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-650 font-bold text-sm">
                {listing.owner.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Room Owner</p>
                <p className="text-slate-800 font-extrabold text-sm mt-0.5">{listing.owner.name}</p>
              </div>
            </div>

            {/* Interest signals buttons */}
            {user?.role === "TENANT" && (
              <div className="shrink-0 flex items-center gap-2">
                {interestStatus ? (
                  <span className={`px-4 py-2.5 rounded-xl border text-xs font-bold shadow-sm ${interestColor[interestStatus]}`}>
                    {interestLabel[interestStatus]}
                  </span>
                ) : (
                  <button
                    onClick={handleSendInterest}
                    disabled={sending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-violet-600/10"
                  >
                    {sending ? <FaSpinner className="animate-spin" /> : <FaHeart />} Express Interest
                  </button>
                )}
              </div>
            )}

            {/* Owner contact details visible if interest accepted */}
            {user?.role === "TENANT" && interestStatus === "ACCEPTED" && (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-xs text-slate-600 w-full sm:w-auto font-medium flex flex-col gap-1 shadow-sm mt-2 sm:mt-0">
                <p className="font-bold text-emerald-800 mb-0.5">📞 Contact Details:</p>
                <p>Phone: {listing.owner.phone}</p>
                <p>Email: {listing.owner.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
