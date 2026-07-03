import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import listingService from "../services/listingService";
import compatibilityService from "../services/compatibilityService";
import { useAuth } from "../contexts/AuthContext";
import {
  FaSearch, FaMapMarkerAlt, FaRupeeSign, FaBed, FaCouch,
  FaCalendarAlt, FaArrowRight, FaSpinner, FaFilter, FaTimes,
  FaHome, FaBrain, FaSortAmountDown, FaRegImage,
} from "react-icons/fa";

const ROOM_TYPES = ["Single Room", "Shared Room", "1BHK", "2BHK", "3BHK", "Studio", "PG"];
const FURNISHING_OPTS = ["Fully Furnished", "Semi Furnished", "Unfurnished"];
const SORT_OPTS = [
  { value: "newest", label: "Newest First" },
  { value: "rent-low", label: "Rent: Low to High" },
  { value: "rent-high", label: "Rent: High to Low" },
  { value: "compatibility", label: "Best Match (AI)" },
];

// Rich fallback demo room listings with Unsplash images
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
    description: "Large 1BHK apartment with modern modular wardrobes, geyser, kitchen chimney, and private balcony. Secure gated society with 24/7 security guard and power backup.",
    status: "AVAILABLE",
    photos: [{ id: "photo-2", imageUrl: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80" }],
    owner: { name: "Anjali Sharma", email: "anjali@demo.com", phone: "9988776655" }
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
    owner: { name: "Vikram Malhotra", email: "vikram@demo.com", phone: "9122334455" }
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
    owner: { name: "Sunita Deshmukh", email: "sunita@demo.com", phone: "9334455667" }
  }
];

function ScoreBadge({ score }) {
  if (score === null) return null;
  const color =
    score >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-200"
    : score >= 50 ? "bg-indigo-50 text-indigo-600 border-indigo-200"
    : "bg-rose-50 text-rose-600 border-rose-200";
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${color}`}>
      <FaBrain className="text-[9px]" /> {score}% Match
    </span>
  );
}

function ListingCard({ listing }) {
  const { user } = useAuth();
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (user?.role === "TENANT") {
      // For demo listings, show a realistic mock match score immediately
      if (listing.id.startsWith("demo-listing-")) {
        const mockScores = { "demo-listing-1": 95, "demo-listing-2": 82, "demo-listing-3": 60, "demo-listing-4": 45 };
        setScore(mockScores[listing.id]);
        return;
      }
      (async () => {
        try {
          const res = await compatibilityService.getScore(listing.id);
          if (res.success) setScore(res.data.score);
        } catch { /* silent fallback */ }
      })();
    }
  }, [listing.id, user]);

  const firstPhoto = listing.photos?.[0]?.imageUrl;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:border-violet-500/30 hover:shadow-lg transition-all group">
      {/* Thumbnail */}
      <div className="h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
        {firstPhoto ? (
          <img src={firstPhoto} alt={listing.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
        ) : (
          <FaRegImage className="text-slate-300 text-3xl" />
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-violet-600 transition flex-1">{listing.title}</h3>
          <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
              AVAILABLE
            </span>
            <ScoreBadge score={score} />
          </div>
        </div>

        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{listing.description}</p>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-violet-500" />{listing.location}</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-600"><FaRupeeSign />₹{listing.rent.toLocaleString()}/mo</span>
          <span className="flex items-center gap-1.5"><FaBed className="text-indigo-500" />{listing.roomType}</span>
          <span className="flex items-center gap-1.5"><FaCouch className="text-amber-500" />{listing.furnishingStatus}</span>
          <span className="flex items-center gap-1.5 col-span-2">
            <FaCalendarAlt className="text-sky-500" />
            Available {new Date(listing.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        {listing.owner && (
          <p className="text-[11px] text-slate-400">Owner: <span className="text-slate-600 font-semibold">{listing.owner.name}</span></p>
        )}

        <Link
          to={`/listings/${listing.id}`}
          className="mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-600 text-sm font-bold border border-violet-100 transition"
        >
          View Details <FaArrowRight className="text-xs" />
        </Link>
      </div>
    </div>
  );
}

const INIT_FILTERS = { location: "", maxRent: "", minRent: "", roomType: "", furnishingStatus: "", keyword: "", sortBy: "newest" };

export default function BrowseListings() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [allScores, setAllScores] = useState({}); // { listingId: score }
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INIT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState({ sortBy: "newest" });
  const [showFilters, setShowFilters] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Fetch scores for all listings (used for sorting by compatibility)
  const fetchScores = useCallback(async (listingIds) => {
    if (user?.role !== "TENANT") return;
    const scoreMap = {};
    await Promise.allSettled(
      listingIds.map(async (id) => {
        if (id.startsWith("demo-listing-")) {
          const mockScores = { "demo-listing-1": 95, "demo-listing-2": 82, "demo-listing-3": 60, "demo-listing-4": 45 };
          scoreMap[id] = mockScores[id];
          return;
        }
        try {
          const res = await compatibilityService.getScore(id);
          if (res.success) scoreMap[id] = res.data.score;
        } catch { /* silent */ }
      })
    );
    setAllScores((prev) => ({ ...prev, ...scoreMap }));
  }, [user]);

  const fetchListings = useCallback(async (f = {}) => {
    setLoading(true);
    try {
      const res = await listingService.getAllListings(f);
      if (res.success && res.data.length > 0) {
        setListings(res.data);
        setIsDemo(false);
        fetchScores(res.data.map((l) => l.id));
      } else {
        // No results, inject beautiful local demo listings
        let demoData = DEMO_LISTINGS;
        
        // Apply local filtering to demo data
        if (f.location) {
          demoData = demoData.filter(d => d.location.toLowerCase().includes(f.location.toLowerCase()));
        }
        if (f.maxRent) {
          demoData = demoData.filter(d => d.rent <= parseInt(f.maxRent));
        }
        if (f.minRent) {
          demoData = demoData.filter(d => d.rent >= parseInt(f.minRent));
        }
        if (f.roomType) {
          demoData = demoData.filter(d => d.roomType === f.roomType);
        }
        if (f.furnishingStatus) {
          demoData = demoData.filter(d => d.furnishingStatus === f.furnishingStatus);
        }
        if (f.keyword) {
          const k = f.keyword.toLowerCase();
          demoData = demoData.filter(d => d.title.toLowerCase().includes(k) || d.description.toLowerCase().includes(k));
        }
        
        // Apply local sort to demo data
        if (f.sortBy === "rent-low") {
          demoData.sort((a, b) => a.rent - b.rent);
        } else if (f.sortBy === "rent-high") {
          demoData.sort((a, b) => b.rent - a.rent);
        }

        setListings(demoData);
        setIsDemo(true);
        fetchScores(demoData.map((d) => d.id));
      }
    } catch {
      setListings(DEMO_LISTINGS);
      setIsDemo(true);
      fetchScores(DEMO_LISTINGS.map(d => d.id));
    } finally {
      setLoading(false);
    }
  }, [fetchScores]);

  useEffect(() => { fetchListings({ sortBy: "newest" }); }, [fetchListings]);

  // Client-side compatibility sort after scores load
  const displayListings = appliedFilters.sortBy === "compatibility"
    ? [...listings].sort((a, b) => (allScores[b.id] ?? -1) - (allScores[a.id] ?? -1))
    : listings;

  const applyFilters = () => {
    const f = {};
    if (filters.location.trim()) f.location = filters.location.trim();
    if (filters.maxRent) f.maxRent = filters.maxRent;
    if (filters.minRent) f.minRent = filters.minRent;
    if (filters.roomType) f.roomType = filters.roomType;
    if (filters.furnishingStatus) f.furnishingStatus = filters.furnishingStatus;
    if (filters.keyword.trim()) f.keyword = filters.keyword.trim();
    f.sortBy = filters.sortBy;
    setAppliedFilters(f);
    fetchListings(f);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters(INIT_FILTERS);
    setAppliedFilters({ sortBy: "newest" });
    fetchListings({ sortBy: "newest" });
  };

  const set = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.value }));

  const activeFilterCount = Object.entries(appliedFilters).filter(
    ([k, v]) => k !== "sortBy" && v
  ).length;

  const inputCls = "w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white text-slate-800 rounded-xl py-2.5 px-3 outline-none text-sm font-medium";
  const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-wider pl-1";

  return (
    <div className="flex flex-col gap-6">
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Browse Rooms</h2>
          <p className="text-slate-500 text-sm">
            {displayListings.length} listing{displayListings.length !== 1 ? "s" : ""} available {isDemo && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-600 rounded font-semibold ml-1">Demo Mode</span>}
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2 flex-wrap">
          {/* Sort */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <FaSortAmountDown className="text-slate-400 text-xs" />
            <select
              value={filters.sortBy}
              onChange={set("sortBy")}
              onBlur={applyFilters}
              className="bg-transparent text-slate-700 text-xs font-bold outline-none cursor-pointer"
            >
              {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-rose-500 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl hover:bg-rose-100 transition font-bold">
              <FaTimes /> Clear Filters
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition shadow-sm ${showFilters ? "bg-violet-55/10 border-violet-200 text-violet-600" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
          >
            <FaFilter /> Filters {activeFilterCount > 0 && (
              <span className="bg-violet-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-md">
          {/* Keyword search */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Keyword Search</label>
            <div className="relative">
              <FaSearch className="absolute inset-y-0 left-3 my-auto text-slate-400 text-xs" />
              <input value={filters.keyword} onChange={set("keyword")} placeholder="Search title, description, location..." className={`${inputCls} pl-9`} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Location</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute inset-y-0 left-3 my-auto text-slate-400 text-xs" />
                <input value={filters.location} onChange={set("location")} placeholder="e.g. Koramangala" className={`${inputCls} pl-9`} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Min Rent (₹)</label>
              <input type="number" value={filters.minRent} onChange={set("minRent")} placeholder="e.g. 5000" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Max Rent (₹)</label>
              <input type="number" value={filters.maxRent} onChange={set("maxRent")} placeholder="e.g. 25000" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Room Type</label>
              <select value={filters.roomType} onChange={set("roomType")} className={inputCls}>
                <option value="">Any Room Type</option>
                {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Furnishing</label>
              <select value={filters.furnishingStatus} onChange={set("furnishingStatus")} className={inputCls}>
                <option value="">Any Furnishing</option>
                {FURNISHING_OPTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={applyFilters} className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold transition">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 transition">
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {appliedFilters.keyword && <Chip icon={<FaSearch />} label={`"${appliedFilters.keyword}"`} />}
          {appliedFilters.location && <Chip icon={<FaMapMarkerAlt />} label={appliedFilters.location} />}
          {appliedFilters.minRent && <Chip icon={<FaRupeeSign />} label={`Min ₹${parseInt(appliedFilters.minRent).toLocaleString()}`} />}
          {appliedFilters.maxRent && <Chip icon={<FaRupeeSign />} label={`Max ₹${parseInt(appliedFilters.maxRent).toLocaleString()}`} />}
          {appliedFilters.roomType && <Chip icon={<FaBed />} label={appliedFilters.roomType} />}
          {appliedFilters.furnishingStatus && <Chip icon={<FaCouch />} label={appliedFilters.furnishingStatus} />}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
          <FaSpinner className="animate-spin text-xl text-violet-600" /> Fetching listings...
        </div>
      ) : displayListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
          <FaHome className="text-5xl opacity-20 text-violet-600" />
          <p className="text-sm font-medium">No listings found{activeFilterCount > 0 ? " for these filters" : ""}.</p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-violet-500 underline text-sm">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ icon, label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs bg-violet-50 text-violet-600 border border-violet-100 px-3 py-1 rounded-full font-semibold shadow-sm">
      {icon} {label}
    </span>
  );
}
