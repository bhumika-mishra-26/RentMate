import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import listingService from "../services/listingService";
import interestService from "../services/interestService";
import ChatPage from "./ChatPage";
import {
  FaHome, FaPlus, FaInbox, FaChartLine, FaSignOutAlt,
  FaMapMarkerAlt, FaRupeeSign, FaBed, FaCouch, FaCalendarAlt,
  FaEdit, FaTrash, FaEye, FaSpinner, FaExclamationCircle, FaComment,
  FaCloudUploadAlt, FaRegImage, FaTimes, FaBrain, FaCheckCircle,
  FaTimesCircle, FaClock,
} from "react-icons/fa";

const STATUS_COLORS = {
  AVAILABLE: "text-emerald-600 bg-emerald-50 border-emerald-100",
  FILLED: "text-slate-500 bg-slate-100 border-slate-200",
};

// Fallback Owner Listings
const DEMO_OWNER_LISTINGS = [
  {
    id: "demo-listing-1",
    title: "Premium Cozy Studio Apartment",
    location: "Koramangala, Bangalore",
    rent: 14000,
    roomType: "Studio",
    furnishingStatus: "Fully Furnished",
    availableFrom: new Date().toISOString(),
    status: "AVAILABLE",
    photos: [{ id: "photo-1", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80" }],
    _count: { interests: 2 }
  }
];

// Fallback received requests
const DEMO_RECEIVED_INTERESTS = [
  {
    id: "demo-req-1",
    status: "PENDING",
    compatibilityScore: 95,
    listing: { title: "Premium Cozy Studio Apartment" },
    tenant: {
      name: "John Tenant",
      email: "john.tenant@gmail.com",
      phone: "9876543210",
      tenantProfile: {
        preferredLocation: "Koramangala, Bangalore",
        minBudget: 12000,
        maxBudget: 16000,
        moveInDate: new Date().toISOString()
      }
    }
  },
  {
    id: "demo-req-2",
    status: "ACCEPTED",
    compatibilityScore: 82,
    listing: { title: "Premium Cozy Studio Apartment" },
    tenant: {
      name: "Saurav Mishra",
      email: "saurav.mishra@gmail.com",
      phone: "9123456789",
      tenantProfile: {
        preferredLocation: "Indiranagar, Bangalore",
        minBudget: 10000,
        maxBudget: 15000,
        moveInDate: new Date().toISOString()
      }
    }
  }
];

function StatCard({ label, value, color, sub, icon: Icon }) {
  return (
    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col gap-1 shadow-sm hover:shadow-md transition">
      <div className={`flex items-center gap-2 text-slate-500 text-sm font-semibold`}>
        {Icon && <Icon className={color} />} {label}
      </div>
      <span className={`text-2xl font-extrabold mt-1 text-slate-900`}>{value}</span>
      {sub && <span className="text-xs text-slate-400 font-medium">{sub}</span>}
    </div>
  );
}

function ListingCard({ listing, onEdit, onDelete, deleting }) {
  const firstPhoto = listing.photos?.[0]?.imageUrl;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all">
      {/* Photo thumbnail */}
      <div className="h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
        {firstPhoto
          ? <img src={firstPhoto} alt={listing.title} className="w-full h-full object-cover" />
          : <FaRegImage className="text-slate-350 text-3xl" />
        }
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-extrabold text-slate-900 text-base leading-tight flex-1">{listing.title}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-bold shrink-0 ${STATUS_COLORS[listing.status]}`}>
            {listing.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-violet-500" />{listing.location}</span>
          <span className="flex items-center gap-1.5 text-emerald-600 font-bold"><FaRupeeSign />₹{listing.rent.toLocaleString()}/mo</span>
          <span className="flex items-center gap-1.5"><FaBed className="text-indigo-500" />{listing.roomType}</span>
          <span className="flex items-center gap-1.5"><FaCouch className="text-amber-500" />{listing.furnishingStatus}</span>
          <span className="flex items-center gap-1.5 col-span-2">
            <FaCalendarAlt className="text-sky-500" />
            Available {new Date(listing.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        {listing._count && (
          <p className="text-xs text-slate-400 font-bold mt-1">{listing._count.interests} interest request{listing._count.interests !== 1 ? "s" : ""}</p>
        )}

        <div className="flex gap-2 mt-auto pt-2">
          <Link to={`/listings/${listing.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition shadow-sm border border-slate-200">
            <FaEye /> View
          </Link>
          <button onClick={() => onEdit(listing)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-xs font-bold border border-indigo-100 transition shadow-sm">
            <FaEdit /> Edit
          </button>
          <button onClick={() => onDelete(listing.id)} disabled={deleting === listing.id} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-100 transition disabled:opacity-50 shadow-sm">
            {deleting === listing.id ? <FaSpinner className="animate-spin" /> : <FaTrash />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const NAV = [
  { key: "dashboard", icon: FaChartLine, label: "Overview" },
  { key: "listings", icon: FaHome, label: "My Listings" },
  { key: "create", icon: FaPlus, label: "Create Listing" },
  { key: "interests", icon: FaInbox, label: "Interest Requests" },
  { key: "chats", icon: FaComment, label: "Chats" },
];

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  const [interests, setInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [processingInterestId, setProcessingInterestId] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listingService.getMyListings();
      if (res.success && res.data.length > 0) {
        setListings(res.data);
        setIsDemo(false);
      } else {
        setListings(DEMO_OWNER_LISTINGS);
        setIsDemo(true);
      }
    } catch {
      setListings(DEMO_OWNER_LISTINGS);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInterests = useCallback(async () => {
    setLoadingInterests(true);
    try {
      const res = await interestService.getReceivedInterests();
      if (res.success && res.data.length > 0) {
        setInterests(res.data);
        setIsDemo(false);
      } else {
        setInterests(DEMO_RECEIVED_INTERESTS);
        setIsDemo(true);
      }
    } catch {
      setInterests(DEMO_RECEIVED_INTERESTS);
      setIsDemo(true);
    } finally {
      setLoadingInterests(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);
  useEffect(() => { if (activeTab === "interests") fetchInterests(); }, [activeTab, fetchInterests]);

  const handleAcceptInterest = async (id) => {
    if (String(id).startsWith("demo-")) {
      setInterests((prev) => prev.map((item) => item.id === id ? { ...item, status: "ACCEPTED" } : item));
      return;
    }
    setProcessingInterestId(id);
    try {
      const res = await interestService.updateStatus(id, "ACCEPTED");
      if (res.success) setInterests((prev) => prev.map((item) => item.id === id ? { ...item, status: "ACCEPTED" } : item));
    } catch { setError("Failed to accept interest request."); }
    finally { setProcessingInterestId(null); }
  };

  const handleRejectInterest = async (id) => {
    if (!window.confirm("Are you sure you want to decline this tenant interest request?")) return;
    if (String(id).startsWith("demo-")) {
      setInterests((prev) => prev.map((item) => item.id === id ? { ...item, status: "REJECTED" } : item));
      return;
    }
    setProcessingInterestId(id);
    try {
      const res = await interestService.updateStatus(id, "REJECTED");
      if (res.success) setInterests((prev) => prev.map((item) => item.id === id ? { ...item, status: "REJECTED" } : item));
    } catch { setError("Failed to decline interest request."); }
    finally { setProcessingInterestId(null); }
  };

  const handleDelete = async (id) => {
    if (String(id).startsWith("demo-")) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      return;
    }
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    setDeleting(id);
    try {
      await listingService.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch { setError("Failed to delete listing."); }
    finally { setDeleting(null); }
  };

  const handleEdit = (listing) => {
    if (listing.id.startsWith("demo-")) {
      alert("Demo listings cannot be edited.");
      return;
    }
    navigate(`/owner/listings/${listing.id}/edit`);
  };

  const available = listings.filter((l) => l.status === "AVAILABLE").length;
  const filled = listings.filter((l) => l.status === "FILLED").length;
  const totalInterests = listings.reduce((sum, l) => sum + (l._count?.interests || 0), 0);
  const pendingInterests = interests.filter((i) => i.status === "PENDING").length;
  const acceptedInterests = interests.filter((i) => i.status === "ACCEPTED").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg shadow-teal-500/20">RM</div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RentMate</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {user?.name} · Owner
          </span>
          <button onClick={logout} className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-lg border border-rose-150 transition font-bold text-sm">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col gap-1 bg-white border border-slate-200 rounded-2xl p-4 self-start sticky top-24 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Management</p>
          {NAV.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition text-left w-full ${activeTab === key ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            ><Icon /> {label}</button>
          ))}
        </aside>

        {/* Mobile Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 flex z-40 shadow-lg">
          {NAV.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-bold transition ${activeTab === key ? "text-emerald-600" : "text-slate-400"}`}
            ><Icon className="text-base" /> {label}</button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col gap-6 pb-24 md:pb-0">
          {error && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm shadow-sm">
              <FaExclamationCircle className="shrink-0" /> {error}
              <button onClick={() => setError("")} className="ml-auto text-xs underline font-bold">Dismiss</button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-6">
              <section className="relative overflow-hidden bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-150 rounded-3xl p-6 md:p-8 min-h-[150px] flex flex-col justify-center shadow-sm">
                <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none" />
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-slate-900">
                  Welcome back, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{user?.name}</span>!
                </h1>
                <p className="text-slate-500 text-sm font-medium">"Rent Smarter. Live Better." Manage listings and review interest signals.</p>
              </section>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={FaHome} label="Total Listings" value={listings.length} color="text-emerald-600" sub="Published" />
                <StatCard icon={FaCheckCircle} label="Available" value={available} color="text-sky-500" sub="Ready to rent" />
                <StatCard icon={FaTimesCircle} label="Filled" value={filled} color="text-indigo-500" sub="Occupied" />
                <StatCard icon={FaInbox} label="Total Interests" value={totalInterests} color="text-amber-500" sub="All listings" />
                <StatCard icon={FaClock} label="Pending" value={pendingInterests} color="text-orange-500" sub="Awaiting review" />
                <StatCard icon={FaCheckCircle} label="Accepted" value={acceptedInterests} color="text-teal-600" sub="Tenants found" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setActiveTab("create")} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-600/10">
                  <FaPlus /> Create New Listing
                </button>
                <button onClick={() => setActiveTab("listings")} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm border border-slate-200 transition shadow-sm">
                  <FaHome /> View My Listings
                </button>
                <button onClick={() => { setActiveTab("interests"); fetchInterests(); }} className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-600 px-5 py-3 rounded-xl font-bold text-sm border border-amber-200 transition shadow-sm">
                  <FaInbox /> View Requests
                </button>
              </div>
            </div>
          )}

          {/* My Listings Tab */}
          {activeTab === "listings" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">My Listings <span className="text-slate-400 text-base font-normal">({listings.length})</span> {isDemo && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded font-semibold ml-1">Demo</span>}</h2>
                <button onClick={() => setActiveTab("create")} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm transition">
                  <FaPlus /> New Listing
                </button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-16 text-slate-400 gap-3"><FaSpinner className="animate-spin text-xl text-emerald-600" /> Loading listings...</div>
              ) : listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
                  <FaHome className="text-4xl opacity-30" />
                  <p className="text-sm">You haven't created any listings yet.</p>
                  <button onClick={() => setActiveTab("create")} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">Create Your First Listing</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} onEdit={handleEdit} onDelete={handleDelete} deleting={deleting} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Listing Tab */}
          {activeTab === "create" && (
            <CreateListingForm onSuccess={() => { fetchListings(); setActiveTab("listings"); }} />
          )}

          {/* Interest Requests Tab */}
          {activeTab === "interests" && (
            <OwnerInterestsTab
              interests={interests}
              loading={loadingInterests}
              onAccept={handleAcceptInterest}
              onReject={handleRejectInterest}
              processingId={processingInterestId}
              onChatRedirect={() => setActiveTab("chats")}
              isDemo={isDemo}
            />
          )}

          {/* Chats Tab */}
          {activeTab === "chats" && <ChatPage />}
        </main>
      </div>
    </div>
  );
}

/* ─── Owner Interests Tab ────────────────────────────────── */
function OwnerInterestsTab({ interests, loading, onAccept, onReject, processingId, onChatRedirect, isDemo }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "REJECTED": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  if (loading) return <div className="flex items-center justify-center py-16 text-slate-400 gap-3"><FaSpinner className="animate-spin text-xl text-emerald-600" /> Fetching interest requests...</div>;

  if (interests.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <FaInbox className="text-4xl opacity-30" />
      <p className="text-sm">You haven't received any interest requests yet.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-slate-900">Received Tenant Interests {isDemo && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded font-semibold">Demo</span>}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interests.map((req) => (
          <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{req.tenant.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Listing: <span className="text-slate-600 font-bold">{req.listing.title}</span></p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusBadge(req.status)}`}>{req.status}</span>
            </div>

            {req.tenant.tenantProfile && (
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs text-slate-500 flex flex-col gap-1 font-medium">
                <p>📍 Preferred: {req.tenant.tenantProfile.preferredLocation}</p>
                <p>💰 Budget: ₹{req.tenant.tenantProfile.minBudget.toLocaleString()}–₹{req.tenant.tenantProfile.maxBudget.toLocaleString()}/mo</p>
                <p>📅 Move-in: {new Date(req.tenant.tenantProfile.moveInDate).toLocaleDateString("en-IN")}</p>
              </div>
            )}

            {req.compatibilityScore !== null && req.compatibilityScore !== undefined && (
              <div className="bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl text-xs text-indigo-700 font-bold flex items-center gap-1.5">
                <FaBrain className="text-indigo-600 animate-pulse" />
                <span>{req.compatibilityScore}% AI Compatibility Match</span>
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex gap-2">
              {req.status === "PENDING" ? (
                <>
                  <button onClick={() => onAccept(req.id)} disabled={processingId === req.id} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-sm">Accept</button>
                  <button onClick={() => onReject(req.id)} disabled={processingId === req.id} className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-150 disabled:opacity-50 text-rose-600 text-xs font-bold rounded-xl transition">Decline</button>
                </>
              ) : req.status === "ACCEPTED" ? (
                <div className="w-full flex flex-col gap-2">
                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                    <p>📞 Phone: {req.tenant.phone}</p>
                    <p className="mt-0.5">✉️ Email: {req.tenant.email}</p>
                  </div>
                  <button onClick={onChatRedirect} className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition text-center shadow-sm">Chat in App</button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Declined</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Create / Edit Listing Form (with Photo Upload) ─────── */
function CreateListingForm({ onSuccess, prefill = null, isEdit = false, listingId = null }) {
  const [form, setForm] = useState({
    title: prefill?.title || "",
    location: prefill?.location || "",
    rent: prefill?.rent || "",
    roomType: prefill?.roomType || "",
    furnishingStatus: prefill?.furnishingStatus || "",
    availableFrom: prefill?.availableFrom ? prefill.availableFrom.slice(0, 10) : "",
    description: prefill?.description || "",
    status: prefill?.status || "AVAILABLE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Photo upload state
  const [savedListingId, setSavedListingId] = useState(listingId || null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(prefill?.photos?.[0]?.imageUrl || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be smaller than 5MB.");
      return;
    }
    setPhotoError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async (lId) => {
    if (!photoFile || !lId) return;
    setUploadingPhoto(true);
    setPhotoError("");
    try {
      await listingService.uploadPhoto(lId, photoFile);
      setPhotoFile(null);
      setSuccess("Listing and photo saved successfully!");
    } catch (err) {
      setPhotoError(err.response?.data?.message || "Photo upload failed. Add credentials to .env first.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!form.title || !form.location || !form.rent || !form.roomType || !form.furnishingStatus || !form.availableFrom || !form.description) {
      setError("All fields are required.");
      return;
    }
    if (Number(form.rent) <= 0) {
      setError("Rent must be a positive number.");
      return;
    }

    setLoading(true);
    try {
      let newId = savedListingId;
      if (isEdit && listingId) {
        await listingService.updateListing(listingId, form);
        newId = listingId;
      } else {
        const res = await listingService.createListing(form);
        newId = res.data?.id;
        setSavedListingId(newId);
      }

      // Upload photo if selected
      if (photoFile && newId) {
        await handleUploadPhoto(newId);
      } else {
        setSuccess(isEdit ? "Listing updated successfully!" : "Listing created successfully!");
      }

      setTimeout(() => onSuccess(), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save listing.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white text-slate-800 rounded-xl py-3 px-4 outline-none transition text-sm font-medium";
  const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-wider pl-1";

  return (
    <div className="flex flex-col gap-5 max-w-2xl bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm">
      <h2 className="text-xl font-extrabold text-slate-900">{isEdit ? "Edit Listing" : "Create New Listing"}</h2>

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-xs">
          <FaExclamationCircle className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-600 p-3 rounded-xl text-xs">
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Listing Title</label>
          <input value={form.title} onChange={set("title")} placeholder="e.g. Spacious 1BHK near metro" className={inputCls} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Location</label>
            <input value={form.location} onChange={set("location")} placeholder="e.g. Koramangala, Bangalore" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Monthly Rent (₹)</label>
            <input type="number" min="1" value={form.rent} onChange={set("rent")} placeholder="e.g. 15000" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Room Type</label>
            <select value={form.roomType} onChange={set("roomType")} className={inputCls}>
              <option value="">Select room type</option>
              {["Single Room", "Shared Room", "1BHK", "2BHK", "3BHK", "Studio", "PG"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Furnishing Status</label>
            <select value={form.furnishingStatus} onChange={set("furnishingStatus")} className={inputCls}>
              <option value="">Select furnishing</option>
              {["Fully Furnished", "Semi Furnished", "Unfurnished"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Available From</label>
            <input type="date" value={form.availableFrom} onChange={set("availableFrom")} className={inputCls} />
          </div>
          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={set("status")} className={inputCls}>
                <option value="AVAILABLE">Available</option>
                <option value="FILLED">Filled</option>
              </select>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Description</label>
          <textarea value={form.description} onChange={set("description")} rows={4} placeholder="Describe the room, amenities, house rules, nearby facilities..." className={`${inputCls} resize-none`} />
        </div>

        {/* Photo Upload */}
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Room Photo <span className="normal-case text-slate-400 font-medium">(optional, max 5MB)</span></label>
          <div
            className="border-2 border-dashed border-slate-200 hover:border-emerald-500/50 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition bg-slate-50"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoPreview ? (
              <div className="relative w-full">
                <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <>
                <FaCloudUploadAlt className="text-3xl text-slate-400" />
                <p className="text-xs text-slate-500 font-semibold">Click to select an image, or drag & drop</p>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          </div>
          {photoError && <p className="text-xs text-rose-500">{photoError}</p>}
        </div>

        <button type="submit" disabled={loading || uploadingPhoto} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-600/10">
          {(loading || uploadingPhoto) ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          {isEdit ? "Save Changes" : "Create Listing"}
        </button>
      </form>
    </div>
  );
}

export { CreateListingForm };
