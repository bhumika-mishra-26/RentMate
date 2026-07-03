import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaUser, FaCompass, FaSignOutAlt, FaChartBar, FaComment,
  FaHeart, FaInfoCircle, FaMapMarkerAlt, FaRupeeSign, FaSpinner,
  FaBrain, FaClock, FaCheckCircle, FaTimesCircle, FaBed,
} from "react-icons/fa";
import BrowseListings from "./BrowseListings";
import TenantProfile from "./TenantProfile";
import ChatPage from "./ChatPage";
import interestService from "../services/interestService";
import listingService from "../services/listingService";
import compatibilityService from "../services/compatibilityService";

const NAV = [
  { key: "dashboard", icon: FaChartBar, label: "Overview" },
  { key: "browse", icon: FaCompass, label: "Browse Rooms" },
  { key: "requests", icon: FaHeart, label: "My Requests" },
  { key: "chats", icon: FaComment, label: "Chats" },
  { key: "profile", icon: FaUser, label: "My Profile" },
];

// Fallback listings with Unsplash images
const DEMO_RECOMMENDED_LISTINGS = [
  {
    id: "demo-listing-1",
    title: "Premium Cozy Studio Apartment",
    location: "Koramangala, Bangalore",
    rent: 14000,
    roomType: "Studio",
    furnishingStatus: "Fully Furnished",
    availableFrom: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Beautiful independent studio room with detached private kitchen, premium work-desk setup, and high-speed fiber internet.",
    status: "AVAILABLE",
    photos: [{ id: "photo-1", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80" }],
    owner: { name: "Rajesh Kumar", email: "rajesh@demo.com", phone: "9876543210" }
  },
  {
    id: "demo-listing-2",
    title: "Spacious 1BHK Flat near Tech Park",
    location: "Marathahalli, Bangalore",
    rent: 18500,
    roomType: "1BHK",
    furnishingStatus: "Semi Furnished",
    availableFrom: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Large 1BHK apartment with modern modular wardrobes, geyser, kitchen chimney, and private balcony.",
    status: "AVAILABLE",
    photos: [{ id: "photo-2", imageUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80" }],
    owner: { name: "Anjali Sharma", email: "anjali@demo.com", phone: "9988776655" }
  }
];

const DEMO_SENT_REQUESTS = [
  {
    id: "demo-req-1",
    status: "ACCEPTED",
    compatibilityScore: 95,
    listing: {
      id: "demo-listing-1",
      title: "Premium Cozy Studio Apartment",
      location: "Koramangala, Bangalore",
      rent: 14000,
      roomType: "Studio",
      furnishingStatus: "Fully Furnished"
    },
    owner: {
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      email: "rajesh.kumar@brevo-demo.com"
    }
  },
  {
    id: "demo-req-2",
    status: "PENDING",
    compatibilityScore: 82,
    listing: {
      id: "demo-listing-2",
      title: "Spacious 1BHK Flat near Tech Park",
      location: "Marathahalli, Bangalore",
      rent: 18500,
      roomType: "1BHK",
      furnishingStatus: "Semi Furnished"
    },
    owner: {
      name: "Anjali Sharma",
      phone: "+91 99887 76655",
      email: "anjali.sharma@brevo-demo.com"
    }
  }
];

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col gap-1 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
        <Icon className={color} /> {label}
      </div>
      <span className={`text-2xl font-extrabold mt-1 text-slate-900`}>{value}</span>
      {sub && <span className="text-xs text-slate-400 font-medium">{sub}</span>}
    </div>
  );
}

function MiniListingCard({ listing, score }) {
  const scoreColor = score === null ? "" : score >= 80 ? "text-emerald-600 bg-emerald-50 border-emerald-100" : score >= 50 ? "text-indigo-600 bg-indigo-50 border-indigo-100" : "text-rose-600 bg-rose-50 border-rose-100";
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition">
      {listing.photos?.[0] && (
        <img src={listing.photos[0].imageUrl} alt={listing.title} className="w-full h-28 object-cover rounded-lg mb-1" />
      )}
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-slate-800 text-sm leading-tight flex-1 line-clamp-1">{listing.title}</h4>
        {score !== null && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded-full flex items-center gap-0.5 shrink-0 ${scoreColor}`}>
            <FaBrain className="text-[9px]" />{score}%
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
        <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-violet-500" />{listing.location}</span>
        <span className="flex items-center gap-1 text-emerald-600 font-bold"><FaRupeeSign />₹{listing.rent.toLocaleString()}/mo</span>
        <span className="flex items-center gap-1"><FaBed className="text-indigo-500" />{listing.roomType}</span>
      </div>
      <Link
        to={`/listings/${listing.id}`}
        className="mt-1 text-center py-2 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 text-xs font-bold border border-violet-100 transition"
      >
        View Details
      </Link>
    </div>
  );
}

export default function TenantDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [error, setError] = useState("");
  const [isDemo, setIsDemo] = useState(false);

  // Overview data
  const [latestListings, setLatestListings] = useState([]);
  const [recommendedListings, setRecommendedListings] = useState([]);
  const [listingScores, setListingScores] = useState({});
  const [loadingOverview, setLoadingOverview] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await interestService.getSentInterests();
      if (res.success && res.data.length > 0) {
        setRequests(res.data);
        setIsDemo(false);
      } else {
        setRequests(DEMO_SENT_REQUESTS);
        setIsDemo(true);
      }
    } catch {
      setRequests(DEMO_SENT_REQUESTS);
      setIsDemo(true);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const fetchOverviewData = useCallback(async () => {
    setLoadingOverview(true);
    try {
      // Get newest listings
      const res = await listingService.getAllListings({ sortBy: "newest" });
      if (res.success && res.data.length > 0) {
        const all = res.data.slice(0, 10);
        setLatestListings(all.slice(0, 3));

        // Fetch compatibility scores
        const scoreMap = {};
        await Promise.allSettled(
          all.map(async (l) => {
            try {
              const sc = await compatibilityService.getScore(l.id);
              if (sc.success) scoreMap[l.id] = sc.data.score;
            } catch { /* silent fallback */ }
          })
        );
        setListingScores(scoreMap);

        const sorted = [...all].sort((a, b) => (scoreMap[b.id] ?? -1) - (scoreMap[a.id] ?? -1));
        setRecommendedListings(sorted.slice(0, 3));
        setIsDemo(false);
      } else {
        // Fallback to local demo data
        setLatestListings(DEMO_RECOMMENDED_LISTINGS);
        setRecommendedListings(DEMO_RECOMMENDED_LISTINGS);
        setListingScores({ "demo-listing-1": 95, "demo-listing-2": 82 });
        setIsDemo(true);
      }
    } catch {
      setLatestListings(DEMO_RECOMMENDED_LISTINGS);
      setRecommendedListings(DEMO_RECOMMENDED_LISTINGS);
      setListingScores({ "demo-listing-1": 95, "demo-listing-2": 82 });
      setIsDemo(true);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "requests") fetchRequests();
  }, [activeTab, fetchRequests]);

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchOverviewData();
      // Fetch requests count for stats
      fetchRequests();
    }
  }, [activeTab, fetchOverviewData, fetchRequests]);

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const accepted = requests.filter((r) => r.status === "ACCEPTED").length;
  const rejected = requests.filter((r) => r.status === "REJECTED").length;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "ACCEPTED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "REJECTED": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/20">RM</div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">RentMate</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            {user?.name} · Tenant
          </span>
          <button onClick={logout} className="flex items-center gap-2 bg-rose-50 hover:bg-rose-105 text-rose-600 px-4 py-2 rounded-lg border border-rose-150 transition font-bold text-sm">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-56 shrink-0 flex-col gap-1 bg-white border border-slate-200 rounded-2xl p-4 self-start sticky top-24 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu</p>
          {NAV.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition text-left w-full ${
                activeTab === key ? "bg-violet-50 text-violet-600 border border-violet-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon /> {label}
            </button>
          ))}
        </aside>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 flex z-40 shadow-lg">
          {NAV.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-bold transition ${activeTab === key ? "text-violet-600" : "text-slate-400"}`}
            >
              <Icon className="text-base" /> {label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col gap-6 pb-24 md:pb-0">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-xs flex items-center gap-2">
              <FaInfoCircle /> {error}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-6">
              {/* Hero */}
              <section className="relative overflow-hidden bg-gradient-to-r from-violet-50 via-indigo-50/50 to-white border border-violet-100 rounded-3xl p-6 md:p-8 flex flex-col justify-center min-h-[150px] shadow-sm">
                <div className="absolute top-0 right-0 w-72 h-72 bg-violet-300/10 rounded-full blur-3xl pointer-events-none" />
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-slate-900">
                  Welcome back, <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{user?.name}</span>!
                </h1>
                <p className="text-slate-500 text-sm max-w-lg font-medium">
                  "Rent Smarter. Live Better." Find your ideal flatmate and home using our automated AI compatibility lookup.
                </p>
              </section>

              {/* Stats from requests */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={FaHeart} label="Total Requests" value={requests.length} color="text-violet-600" sub="Sent by you" />
                <StatCard icon={FaClock} label="Pending" value={pending} color="text-amber-500" sub="Awaiting response" />
                <StatCard icon={FaCheckCircle} label="Accepted" value={accepted} color="text-emerald-600" sub="Ready to move in" />
                <StatCard icon={FaTimesCircle} label="Declined" value={rejected} color="text-rose-600" sub="Keep searching" />
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setActiveTab("browse")} className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/10">
                  <FaCompass /> Browse Available Rooms
                </button>
                <button onClick={() => setActiveTab("requests")} className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm border border-slate-200 transition shadow-sm">
                  <FaHeart /> Track My Requests
                </button>
              </div>

              {loadingOverview ? (
                <div className="flex items-center justify-center py-8 text-slate-400 gap-3">
                  <FaSpinner className="animate-spin text-violet-600" /> Loading recommendations...
                </div>
              ) : (
                <>
                  {/* Recommended Listings */}
                  {recommendedListings.length > 0 && (
                    <section className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
                          <FaBrain className="text-indigo-600 animate-pulse" /> Recommended For You {isDemo && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded font-semibold">Demo</span>}
                        </h2>
                        <button onClick={() => setActiveTab("browse")} className="text-xs text-violet-600 font-bold hover:underline">View All</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {recommendedListings.map((l) => (
                          <MiniListingCard key={l.id} listing={l} score={listingScores[l.id] ?? null} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Latest Listings */}
                  {latestListings.length > 0 && (
                    <section className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h2 className="font-extrabold text-slate-900 flex items-center gap-2">
                          <FaClock className="text-sky-500" /> Newly Added {isDemo && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded font-semibold">Demo</span>}
                        </h2>
                        <button onClick={() => setActiveTab("browse")} className="text-xs text-violet-600 font-bold hover:underline">View All</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {latestListings.map((l) => (
                          <MiniListingCard key={l.id} listing={l} score={listingScores[l.id] ?? null} />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          )}

          {/* Browse Rooms Tab */}
          {activeTab === "browse" && <BrowseListings />}

          {/* My Requests Tab */}
          {activeTab === "requests" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-slate-900">My Sent Interest Requests {isDemo && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded font-semibold">Demo</span>}</h2>
              {loadingRequests ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-3">
                  <FaSpinner className="animate-spin text-xl text-violet-600" /> Fetching requests...
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <FaHeart className="text-4xl opacity-20" />
                  <p className="text-sm">You haven't expressed interest in any rooms yet.</p>
                  <button onClick={() => setActiveTab("browse")} className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition">Browse Rooms</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requests.map((req) => (
                    <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <h3 className="font-extrabold text-slate-900 text-sm">{req.listing.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getStatusBadgeClass(req.status)}`}>{req.status}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-col gap-1.5 font-medium">
                        <p className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-violet-500" /> {req.listing.location}</p>
                        <p className="flex items-center gap-1.5"><FaRupeeSign className="text-emerald-600" /> ₹{req.listing.rent.toLocaleString()}/mo</p>
                      </div>
                      {req.compatibilityScore !== null && req.compatibilityScore !== undefined && (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl text-xs text-indigo-700 font-bold">
                          <FaBrain className="text-indigo-600" />
                          <span>{req.compatibilityScore}% Compatibility Match</span>
                        </div>
                      )}
                      <div className="border-t border-slate-100 pt-3 flex flex-col gap-1">
                        <p className="text-xs text-slate-400">Room Owner: <span className="text-slate-700 font-bold">{req.owner.name}</span></p>
                        {req.status === "ACCEPTED" && (
                          <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl text-xs text-slate-600 mt-2 flex flex-col gap-1">
                            <p>📞 Phone: {req.owner.phone}</p>
                            <p>✉️ Email: {req.owner.email}</p>
                            <button onClick={() => setActiveTab("chats")} className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-center transition">
                              Open Chat Portal
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chats Tab */}
          {activeTab === "chats" && <ChatPage />}

          {/* Profile Tab */}
          {activeTab === "profile" && <TenantProfile />}
        </main>
      </div>
    </div>
  );
}
