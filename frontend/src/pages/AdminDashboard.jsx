import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import adminService from "../services/adminService";
import {
  FaUserShield, FaUsers, FaListAlt, FaComments, FaChartPie, FaSignOutAlt,
  FaSpinner, FaExclamationCircle, FaSearch, FaBan, FaTrash, FaCheck,
  FaHome, FaInbox, FaCheckCircle,
  FaTimesCircle, FaMapMarkerAlt, FaRupeeSign,
} from "react-icons/fa";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Dashboard Stats & Analytics
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Management
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Listings Management
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);

  // Error/Success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Action states to show spinners during actions
  const [actionUserId, setActionUserId] = useState(null);
  const [actionListingId, setActionListingId] = useState(null);

  // Fetch functions
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await adminService.getStats();
      if (res.success) {
        setStats(res.data.statistics);
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      setError("Failed to fetch dashboard metrics.");
      // Fallback Admin stats for demo
      setStats({ users: 8, owners: 3, tenants: 5, listings: 4, filledListings: 1, messages: 12, requests: 4 });
      setAnalytics({ dailyRegistrations: 2, totalRequests: 4, roomsFilled: 1, averageScore: 82 });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async (searchQuery = "") => {
    setLoadingUsers(true);
    try {
      const res = await adminService.getUsers(searchQuery);
      if (res.success) {
        setUsers(res.data);
      }
    } catch {
      setError("Failed to load user accounts.");
      // Fallback Admin users for demo
      setUsers([
        { id: "u-1", name: "Rajesh Kumar", email: "rajesh@demo.com", phone: "9876543210", role: "OWNER", isDisabled: false, createdAt: new Date().toISOString() },
        { id: "u-2", name: "Anjali Sharma", email: "anjali@demo.com", phone: "9988776655", role: "OWNER", isDisabled: false, createdAt: new Date().toISOString() },
        { id: "u-3", name: "John Tenant", email: "john.tenant@gmail.com", phone: "9123456789", role: "TENANT", isDisabled: false, createdAt: new Date().toISOString() },
        { id: "u-4", name: "Saurav Mishra", email: "saurav.mishra@gmail.com", phone: "9456789123", role: "TENANT", isDisabled: true, createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const res = await adminService.getListings();
      if (res.success) {
        setListings(res.data);
      }
    } catch {
      setError("Failed to load listings database.");
      // Fallback Admin listings for demo
      setListings([
        {
          id: "demo-listing-1",
          title: "Premium Cozy Studio Apartment",
          location: "Koramangala, Bangalore",
          rent: 14000,
          status: "AVAILABLE",
          owner: { name: "Rajesh Kumar", email: "rajesh@demo.com" }
        },
        {
          id: "demo-listing-2",
          title: "Spacious 1BHK Flat near Tech Park",
          location: "Marathahalli, Bangalore",
          rent: 18500,
          status: "AVAILABLE",
          owner: { name: "Anjali Sharma", email: "anjali@demo.com" }
        }
      ]);
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "overview") fetchStats();
    if (activeTab === "users") fetchUsers(userSearch);
    if (activeTab === "listings") fetchListings();
  }, [activeTab, fetchStats, fetchUsers, fetchListings, userSearch]);

  // Actions
  const handleToggleUserDisable = async (userId) => {
    if (String(userId).startsWith("u-")) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isDisabled: !u.isDisabled } : u))
      );
      setSuccess("Mock User status toggled successfully.");
      return;
    }
    setActionUserId(userId);
    try {
      const res = await adminService.toggleUserDisabled(userId);
      if (res.success) {
        setSuccess(res.message);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isDisabled: !u.isDisabled } : u))
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle user status.");
    } finally {
      setActionUserId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`CRITICAL: Are you sure you want to permanently delete "${userName}"?\n\nThis will remove all their profiles, listings, interests, and chat records. This action CANNOT be undone.`)) return;
    if (String(userId).startsWith("u-")) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSuccess("Mock User deleted successfully.");
      return;
    }
    setActionUserId(userId);
    setError("");
    try {
      const res = await adminService.deleteUser(userId);
      if (res.success) {
        setSuccess(`User "${userName}" deleted successfully.`);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        fetchStats();
      } else {
        setError(res.message || "Failed to delete user account.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete user account.");
    } finally {
      setActionUserId(null);
    }
  };

  const handleMarkListingFilled = async (listingId) => {
    if (listingId.startsWith("demo-")) {
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: "FILLED" } : l))
      );
      setSuccess("Mock Listing status updated.");
      return;
    }
    setActionListingId(listingId);
    try {
      const res = await adminService.markListingFilled(listingId);
      if (res.success) {
        setSuccess("Listing successfully marked as filled.");
        setListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, status: "FILLED" } : l))
        );
        fetchStats();
      }
    } catch {
      setError("Failed to mark listing as filled.");
    } finally {
      setActionListingId(null);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing? (This will perform a soft-delete).")) return;
    if (listingId.startsWith("demo-")) {
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setSuccess("Mock Listing deleted.");
      return;
    }
    setActionListingId(listingId);
    try {
      const res = await adminService.deleteListing(listingId);
      if (res.success) {
        setSuccess("Listing soft deleted successfully.");
        setListings((prev) => prev.filter((l) => l.id !== listingId));
        fetchStats();
      }
    } catch {
      setError("Failed to delete listing.");
    } finally {
      setActionListingId(null);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">RM</div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            RentMate (Admin Portal)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100/60 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-sm font-bold text-slate-700">System Admin</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 rounded-lg border border-rose-150 transition font-bold"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      {/* Main Dashboard Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-1 self-start sticky top-24 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Admin Actions</p>
          <button
            onClick={() => { setActiveTab("overview"); clearMessages(); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-left w-full transition ${
              activeTab === "overview"
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <FaChartPie /> Control Dashboard
          </button>
          <button
            onClick={() => { setActiveTab("users"); clearMessages(); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-left w-full transition ${
              activeTab === "users"
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <FaUsers /> Manage Users
          </button>
          <button
            onClick={() => { setActiveTab("listings"); clearMessages(); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-left w-full transition ${
              activeTab === "listings"
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <FaListAlt /> Manage Listings
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          {error && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-sm shadow-sm">
              <FaExclamationCircle className="shrink-0" /> {error}
              <button onClick={() => setError("")} className="ml-auto text-xs underline font-bold">Dismiss</button>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-xl text-sm shadow-sm">
              <span className="font-bold">✓</span> {success}
              <button onClick={() => setSuccess("")} className="ml-auto text-xs underline font-bold">Dismiss</button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              {/* Welcome Banner */}
              <section className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border border-amber-150 rounded-3xl p-6 md:p-8 flex flex-col justify-center min-h-[160px] shadow-sm">
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-300/10 rounded-full blur-3xl pointer-events-none"></div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-slate-900">Control Center</h1>
                <p className="text-slate-500 max-w-lg text-sm font-medium">
                  "Rent Smarter. Live Better." Oversight of registrations, room listings, interest signal activity, and compatibility score metrics.
                </p>
              </section>

              {loadingStats ? (
                <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
                  <FaSpinner className="animate-spin text-2xl text-amber-500" /> Calculating metrics...
                </div>
              ) : (
                <>
                  {/* Platform Analytics Cards */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-1">Platform Analytics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-1 shadow-sm">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Daily Signups</span>
                        <span className="text-3xl font-extrabold mt-1 text-amber-600">{analytics.dailyRegistrations}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Registered today</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-1 shadow-sm">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Signals</span>
                        <span className="text-3xl font-extrabold mt-1 text-cyan-600">{analytics.totalRequests}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Interest Requests</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-1 shadow-sm">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Rooms Filled</span>
                        <span className="text-3xl font-extrabold mt-1 text-emerald-600">{analytics.roomsFilled}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Matches closed</span>
                      </div>
                      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col gap-1 shadow-sm">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Average Match</span>
                        <span className="text-3xl font-extrabold mt-1 text-violet-600">{analytics.averageScore}%</span>
                        <span className="text-[10px] text-slate-400 font-medium">Compatibility index</span>
                      </div>
                    </div>
                  </div>

                  {/* Core System Database Stats */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-1">System Database Records</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <MetricCard icon={FaUsers} label="Total Users" value={stats.users} color="text-sky-650 bg-sky-50 border-sky-100" />
                      <MetricCard icon={FaUserShield} label="Owners" value={stats.owners} color="text-indigo-650 bg-indigo-50 border-indigo-100" />
                      <MetricCard icon={FaUsers} label="Tenants" value={stats.tenants} color="text-violet-650 bg-violet-50 border-violet-100" />
                      <MetricCard icon={FaHome} label="Active listings" value={stats.listings} color="text-emerald-600 bg-emerald-50 border-emerald-100" />
                      <MetricCard icon={FaCheckCircle} label="Filled Rooms" value={stats.filledListings} color="text-emerald-700 bg-emerald-50 border-emerald-100" />
                      <MetricCard icon={FaComments} label="Messages" value={stats.messages} color="text-cyan-600 bg-cyan-50 border-cyan-100" />
                      <MetricCard icon={FaInbox} label="Interest signals" value={stats.requests} color="text-amber-600 bg-amber-50 border-amber-100" />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === "users" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">User Accounts</h2>
                <div className="relative w-64">
                  <FaSearch className="absolute inset-y-0 left-3 my-auto text-slate-400 text-xs" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name, email, phone..."
                    className="w-full bg-white border border-slate-200 focus:border-amber-550 text-slate-800 rounded-xl py-2 pl-9 pr-4 outline-none text-xs font-medium shadow-sm"
                  />
                </div>
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-20 text-slate-400"><FaSpinner className="animate-spin text-amber-500" /> Fetching accounts...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">No users found.</div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider">
                          <th className="p-4">Name / ID</th>
                          <th className="p-4">Contact Info</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{u.id}</div>
                            </td>
                            <td className="p-4 font-semibold">
                              <div className="text-slate-800 text-xs">{u.email}</div>
                              <div className="text-slate-500 text-xs mt-0.5">{u.phone}</div>
                            </td>
                            <td className="p-4">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                                u.role === "ADMIN" ? "bg-amber-50 text-amber-600 border-amber-100"
                                : u.role === "OWNER" ? "bg-indigo-50 text-indigo-650 border-indigo-100"
                                : "bg-violet-50 text-violet-650 border-violet-100"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              {u.isDisabled ? (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 font-bold">Suspended</span>
                              ) : (
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">Active</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                {u.role !== "ADMIN" && (
                                  <>
                                    <button
                                      onClick={() => handleToggleUserDisable(u.id)}
                                      disabled={actionUserId === u.id}
                                      title={u.isDisabled ? "Enable User Account" : "Disable User Account"}
                                      className={`p-2 rounded-lg border text-xs font-semibold transition ${
                                        u.isDisabled
                                          ? "bg-emerald-50 text-emerald-600 border-emerald-150 hover:bg-emerald-100"
                                          : "bg-orange-50 text-orange-600 border-orange-150 hover:bg-orange-100"
                                      }`}
                                    >
                                      {actionUserId === u.id ? <FaSpinner className="animate-spin" /> : <FaBan />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u.id, u.name)}
                                      disabled={actionUserId === u.id}
                                      title="Permanently Delete User"
                                      className="p-2 bg-rose-50 text-rose-600 border border-rose-150 hover:bg-rose-100 rounded-lg text-xs transition"
                                    >
                                      {actionUserId === u.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Listings Management Tab */}
          {activeTab === "listings" && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-slate-900">Manage Listing Database</h2>
              {loadingListings ? (
                <div className="flex items-center justify-center py-20 text-slate-400"><FaSpinner className="animate-spin text-emerald-600" /> Loading listings database...</div>
              ) : listings.length === 0 ? (
                <div className="text-center py-16 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">No active listings in database.</div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider">
                          <th className="p-4">Room Details</th>
                          <th className="p-4">Owner Info</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {listings.map((l) => (
                          <tr key={l.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{l.title}</div>
                              <div className="text-xs text-slate-400 mt-1 flex gap-3 font-semibold">
                                <span className="flex items-center gap-1"><FaMapMarkerAlt /> {l.location}</span>
                                <span className="flex items-center gap-0.5 text-emerald-600 font-bold"><FaRupeeSign />₹{l.rent.toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="p-4 font-semibold">
                              <div className="text-slate-800 text-xs">{l.owner.name}</div>
                              <div className="text-slate-500 text-xs font-mono mt-0.5">{l.owner.email}</div>
                            </td>
                            <td className="p-4">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                                l.status === "AVAILABLE" ? "bg-emerald-50 text-emerald-650 border-emerald-100"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>
                                {l.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                {l.status === "AVAILABLE" && (
                                  <button
                                    onClick={() => handleMarkListingFilled(l.id)}
                                    disabled={actionListingId === l.id}
                                    title="Mark Listing as Filled"
                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-650 border border-emerald-150 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                  >
                                    {actionListingId === l.id ? <FaSpinner className="animate-spin" /> : <FaCheck />} Filled
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteListing(l.id)}
                                  disabled={actionListingId === l.id}
                                  title="Soft Delete Listing"
                                  className="p-2 bg-rose-50 text-rose-600 border border-rose-150 hover:bg-rose-100 rounded-lg text-xs transition"
                                >
                                  {actionListingId === l.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition">
      <div className={`p-3 rounded-xl border ${color}`}>
        <Icon className="text-lg" />
      </div>
      <div className="flex flex-col">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</span>
        <span className="text-xl font-extrabold text-slate-800 mt-0.5">{value}</span>
      </div>
    </div>
  );
}
