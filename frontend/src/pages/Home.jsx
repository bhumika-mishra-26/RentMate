import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaHome, FaUsers, FaBrain, FaArrowRight, FaSignInAlt, FaUserPlus,
  FaCheckCircle, FaCommentDots, FaMapMarkerAlt, FaRupeeSign, FaShieldAlt,
  FaStar, FaEnvelope, FaChevronDown,
} from "react-icons/fa";

const STATS = [
  { value: "10,000+", label: "Rooms Listed" },
  { value: "95%", label: "Match Accuracy" },
  { value: "3 mins", label: "Avg. Match Time" },
  { value: "4.9 ★", label: "User Rating" },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Software Engineer, Bangalore",
    avatar: "PS",
    color: "from-violet-500 to-indigo-600",
    text: "Found my perfect Koramangala studio in under 10 minutes. The AI score explained exactly why it matched my budget and commute preferences!",
    score: 98,
  },
  {
    name: "Arjun Mehta",
    role: "Owner, HSR Layout",
    avatar: "AM",
    color: "from-emerald-500 to-teal-600",
    text: "Got 5 interest requests in the first day. The chat portal made it so easy to shortlist tenants — no more WhatsApp spam!",
    score: 100,
  },
  {
    name: "Sneha Reddy",
    role: "MBA Student, Hyderabad",
    avatar: "SR",
    color: "from-fuchsia-500 to-pink-600",
    text: "As a student, I was worried about finding a safe place within budget. RentMate's compatibility score gave me so much confidence before visiting.",
    score: 91,
  },
];

const FEATURES = [
  {
    icon: <FaHome className="text-2xl" />,
    title: "Instant Room Listings",
    desc: "Create rich listings with photos, furnishing details, and availability in under 2 minutes.",
    bullets: ["Photo uploads via Cloudinary", "Set status: Available or Filled", "Location & budget details"],
    color: "violet",
    link: "/register",
    linkText: "List your room",
  },
  {
    icon: <FaBrain className="text-2xl" />,
    title: "Gemini AI Matching",
    desc: "Our Google Gemini engine reads listing descriptions and tenant profiles to compute an honest compatibility percentage.",
    bullets: ["AI-written match explanations", "Rule-engine fallback for reliability", "Scores cached for speed"],
    color: "indigo",
    link: "/register",
    linkText: "See your AI score",
  },
  {
    icon: <FaUsers className="text-2xl" />,
    title: "Smart Tenant Profiles",
    desc: "Tenants set their ideal location, budget range, and move-in date once — and get personalized matches every browse.",
    bullets: ["Location preference filters", "Min/max budget mapping", "Move-in date targeting"],
    color: "cyan",
    link: "/register",
    linkText: "Build your profile",
  },
  {
    icon: <FaCommentDots className="text-2xl" />,
    title: "Real-Time Chat",
    desc: "Once an owner accepts your interest, a private Socket.IO chat room opens instantly — no third-party apps needed.",
    bullets: ["Live typing indicators", "Persistent message history", "Secure JWT auth"],
    color: "emerald",
    link: "/register",
    linkText: "Start chatting",
  },
  {
    icon: <FaEnvelope className="text-2xl" />,
    title: "Automated Notifications",
    desc: "Get Brevo-powered email alerts for every key event: new interest, acceptance, and chat activity.",
    bullets: ["Interest received alerts", "Acceptance confirmations", "Powered by Brevo SMTP"],
    color: "amber",
    link: "/register",
    linkText: "Stay updated",
  },
  {
    icon: <FaShieldAlt className="text-2xl" />,
    title: "Admin Moderation",
    desc: "A dedicated admin panel monitors all users and listings, with full suspension and audit controls.",
    bullets: ["User suspension controls", "Platform-wide stats", "Full listing oversight"],
    color: "rose",
    link: "/register",
    linkText: "Learn more",
  },
];

const COLOR_MAP = {
  violet: { bg: "bg-violet-50", border: "border-violet-100", icon: "text-violet-600", hover: "hover:border-violet-300 hover:shadow-violet-100/40", badge: "bg-violet-600", link: "text-violet-600", orb: "bg-violet-500/5" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-100", icon: "text-indigo-600", hover: "hover:border-indigo-300 hover:shadow-indigo-100/40", badge: "bg-indigo-600", link: "text-indigo-600", orb: "bg-indigo-500/5" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-100", icon: "text-cyan-600", hover: "hover:border-cyan-300 hover:shadow-cyan-100/40", badge: "bg-cyan-600", link: "text-cyan-600", orb: "bg-cyan-500/5" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600", hover: "hover:border-emerald-300 hover:shadow-emerald-100/40", badge: "bg-emerald-600", link: "text-emerald-600", orb: "bg-emerald-500/5" },
  amber: { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600", hover: "hover:border-amber-300 hover:shadow-amber-100/40", badge: "bg-amber-600", link: "text-amber-600", orb: "bg-amber-500/5" },
  rose: { bg: "bg-rose-50", border: "border-rose-100", icon: "text-rose-600", hover: "hover:border-rose-300 hover:shadow-rose-100/40", badge: "bg-rose-600", link: "text-rose-600", orb: "bg-rose-500/5" },
};

function AnimatedCounter({ target, duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(start);
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function Home() {
  const { user } = useAuth();
  const [matchScore, setMatchScore] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const dashboardLink = user
    ? user.role === "ADMIN" ? "/admin/dashboard"
      : user.role === "OWNER" ? "/owner/dashboard"
      : "/tenant/dashboard"
    : null;

  useEffect(() => {
    const t = setTimeout(() => {
      let curr = 0;
      const interval = setInterval(() => {
        curr += 1;
        if (curr >= 95) clearInterval(interval);
        setMatchScore(curr);
      }, 14);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-violet-100 selection:text-violet-900 overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/20 text-lg group-hover:rotate-6 transition-transform duration-300">
              RM
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              RentMate
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {[["#how-it-works", "How It Works"], ["#features", "Features"], ["#testimonials", "Reviews"], ["#about", "About"]].map(([href, label]) => (
              <a key={href} href={href} className="relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-violet-600 hover:after:w-full after:transition-all after:duration-300 hover:text-violet-600 transition-colors">{label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link to={dashboardLink} className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-600/10 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all">
                Dashboard <FaArrowRight className="text-xs" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-1.5 text-slate-600 hover:text-violet-600 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-transparent hover:border-slate-200 transition-all text-sm font-bold active:scale-95">
                  <FaSignInAlt /> Login
                </Link>
                <Link to="/register" className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all">
                  <FaUserPlus /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Animated orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[130px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[130px] animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
          {/* Left */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-indigo-200 px-4 py-1.5 rounded-full border border-white/10 text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ✨ Powered by Google Gemini AI
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              Find Your{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                Perfect Room
              </span>
              <br />& Flatmate
            </h1>

            <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed max-w-xl font-medium">
              Skip the awkward visits and endless scrolling. RentMate's AI engine matches tenants with rooms based on budget, location, and lifestyle — and opens a real-time chat portal the moment there's a fit.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-10">
              {["No spam calls", "AI-powered matching", "Real-time chat", "Free to join"].map(tag => (
                <span key={tag} className="flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <FaCheckCircle className="text-emerald-400 text-[10px]" /> {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {user ? (
                <Link to={dashboardLink} className="px-8 py-4 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/40 hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all">
                  Go to Dashboard <FaArrowRight />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/40 hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all">
                    Get Started Free <FaArrowRight />
                  </Link>
                  <Link to="/login" className="px-8 py-4 bg-white/10 hover:bg-white/15 backdrop-blur-sm text-white rounded-2xl border border-white/10 font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right — AI Match Widget */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl shadow-2xl w-full max-w-sm relative hover:-translate-y-2 hover:shadow-3xl transition-all duration-500 group">
              <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live AI
              </div>

              <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-white/10">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white text-xs">JD</div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tenant Profile</div>
                  <div className="text-sm font-extrabold text-white">John Doe · Koramangala</div>
                </div>
              </div>

              <div className="border border-white/10 rounded-2xl overflow-hidden mb-4 group-hover:border-violet-400/30 transition-all duration-300">
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=80"
                    alt="Room preview"
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-3 text-white">
                    <div className="text-xs font-black">Spacious Studio in Koramangala</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-300 font-semibold">
                      <FaMapMarkerAlt className="text-violet-400" /> Koramangala
                      <span className="ml-2 text-emerald-400 font-bold">₹14,000/mo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border border-violet-500/20 p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <FaBrain className="text-indigo-400" /> AI Compatibility Score
                  </span>
                  <span className="text-lg font-black text-white">{matchScore}<span className="text-sm text-indigo-300">%</span></span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-75 ease-out"
                    style={{ width: `${matchScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
                  "Rent perfectly matches your ₹12k–15k budget. Located in your preferred area of Koramangala. Excellent compatibility!"
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 pt-1">
                  <FaCheckCircle /> Interest request sent · Chat unlocked
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 text-[11px] font-semibold animate-bounce">
          <span>Scroll to explore</span>
          <FaChevronDown className="text-xs" />
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-white border-b border-slate-200 py-6 z-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 group">
              <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                {s.value}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="bg-slate-50 py-20 md:py-28 z-10">
        <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100 mb-4 shadow-sm">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            How RentMate Works
          </h2>
          <p className="text-slate-500 font-medium max-w-xl text-sm md:text-base mb-16 leading-relaxed">
            From signup to secured room in three intelligent, automated steps.
          </p>

          <div className="relative flex flex-col md:flex-row items-stretch justify-center gap-8 w-full max-w-5xl">
            <div className="hidden md:block absolute top-[30%] left-[25%] right-[25%] h-[2px] border-t-2 border-dashed border-slate-200 pointer-events-none" />

            {[
              { num: "01", icon: <FaUserPlus />, title: "Set Preferences", desc: "Sign up as tenant or owner. Tenants set their budget, preferred location, and move-in date. Owners create rich listings with photos.", color: "violet" },
              { num: "02", icon: <FaBrain />, title: "Get AI-Matched", desc: "Our Google Gemini engine computes compatibility scores and provides written explanations — for every listing you browse.", color: "indigo" },
              { num: "03", icon: <FaCommentDots />, title: "Connect & Chat", desc: "Express interest with one click. When the owner accepts, a private real-time chat portal opens instantly — no third-party apps.", color: "emerald" },
            ].map((step) => {
              const c = COLOR_MAP[step.color];
              return (
                <div key={step.num} className={`flex-1 bg-white border border-slate-200/60 ${c.hover} p-8 rounded-3xl flex flex-col items-center gap-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group`}>
                  <div className="relative">
                    <span className={`absolute -top-2 -right-2 ${c.badge} text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md`}>{step.num}</span>
                    <div className={`w-16 h-16 rounded-2xl ${c.bg} ${c.border} border flex items-center justify-center ${c.icon} text-2xl shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      {step.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="bg-white py-20 md:py-28 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center flex flex-col items-center mb-14">
            <span className="text-xs font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-3.5 py-1.5 rounded-full border border-violet-100 mb-4 shadow-sm">
              Platform Features
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Everything Built In
            </h2>
            <p className="text-slate-500 font-medium max-w-xl text-sm md:text-base leading-relaxed">
              No subscriptions. No third-party apps. Every feature you need to find or fill a room — in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const c = COLOR_MAP[f.color];
              return (
                <div key={f.title} className={`bg-slate-50/50 hover:bg-white border border-slate-200/80 ${c.hover} p-7 rounded-3xl flex flex-col justify-between shadow-sm hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${c.orb} rounded-full blur-2xl pointer-events-none`} />
                  <div className="flex flex-col gap-4">
                    <div className={`w-13 h-13 w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center ${c.icon} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      {f.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-1.5 group-hover:text-slate-700 transition-colors">{f.title}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed font-medium mb-3">{f.desc}</p>
                      <ul className="flex flex-col gap-1.5">
                        {f.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.badge}`} /> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Link to={f.link} className={`mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold ${c.link} hover:underline`}>
                    {f.linkText} <FaArrowRight className="text-[9px] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-[20%] w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 z-10">
          <div className="text-center flex flex-col items-center mb-14">
            <span className="text-xs font-black text-violet-300 uppercase tracking-widest bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full mb-4">
              Loved by Users
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
              Real Stories, Real Matches
            </h2>
            <p className="text-slate-400 font-medium max-w-lg text-sm md:text-base leading-relaxed">
              Over 10,000 users have found their perfect room or tenant through RentMate.
            </p>
          </div>

          {/* Active Testimonial Card */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${TESTIMONIALS[activeTestimonial].color} flex items-center justify-center font-black text-white text-sm shadow-lg`}>
                  {TESTIMONIALS[activeTestimonial].avatar}
                </div>
                <div>
                  <div className="font-extrabold text-white text-base">{TESTIMONIALS[activeTestimonial].name}</div>
                  <div className="text-xs text-slate-400 font-medium">{TESTIMONIALS[activeTestimonial].role}</div>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full">
                  <FaBrain className="text-indigo-400 text-[10px]" />
                  <span className="text-xs font-black text-indigo-300">{TESTIMONIALS[activeTestimonial].score}% Match</span>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <FaStar key={i} className="text-amber-400 text-sm" />)}
              </div>

              <p className="text-slate-300 leading-relaxed text-sm font-medium italic">
                "{TESTIMONIALS[activeTestimonial].text}"
              </p>
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? "bg-violet-400 w-6" : "bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-indigo-600/20 hover:rotate-6 transition-transform duration-300 cursor-default">
            RM
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Ready to Find Your{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Perfect Match?
            </span>
          </h2>
          <p className="text-slate-500 font-medium text-sm md:text-base max-w-lg leading-relaxed">
            Join thousands of tenants and owners who use RentMate to connect smarter, faster, and safer.
          </p>
          {user ? (
            <Link to={dashboardLink} className="px-10 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-base flex items-center gap-3 shadow-lg shadow-indigo-600/20 hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all">
              Go to Dashboard <FaArrowRight />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="px-10 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-base flex items-center gap-3 shadow-lg shadow-indigo-600/20 hover:-translate-y-1 hover:shadow-xl active:scale-95 transition-all">
                Get Started Free <FaArrowRight />
              </Link>
              <Link to="/login" className="px-10 py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 font-bold text-base flex items-center gap-2 shadow-sm hover:border-slate-300 hover:-translate-y-0.5 active:scale-95 transition-all">
                Sign In
              </Link>
            </div>
          )}
          <p className="text-xs text-slate-400 font-semibold">Free to join · No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer id="about" className="border-t border-slate-800 bg-slate-900 py-14 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md">RM</div>
              <span className="text-xl font-black text-white">RentMate</span>
            </div>
            <p className="text-xs text-violet-400 font-black uppercase tracking-wider">"Rent Smarter. Live Better."</p>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-medium mt-1">
              An AI-powered rental matchmaking system designed for college students, young professionals, and smart landlords across India.
            </p>
            <div className="flex gap-1 mt-2">
              {[...Array(5)].map((_, i) => <FaStar key={i} className="text-amber-400 text-xs" />)}
              <span className="text-xs text-slate-500 font-bold ml-1">4.9 / 5 from 2,400+ reviews</span>
            </div>
          </div>

          <div>
            <h4 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">Platform</h4>
            <ul className="flex flex-col gap-2.5 text-xs font-semibold text-slate-400">
              {[["#how-it-works", "How It Works"], ["#features", "Features"], ["#testimonials", "Reviews"], ["/register", "Register"], ["/login", "Login"]].map(([href, label]) => (
                <li key={label}>
                  {href.startsWith("#") ? (
                    <a href={href} className="hover:text-violet-400 transition-colors">{label}</a>
                  ) : (
                    <Link to={href} className="hover:text-violet-400 transition-colors">{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">Tech Stack</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              React · Vite · TailwindCSS · Socket.IO
              <br /><br />
              Node.js · Express · Prisma ORM · PostgreSQL (Neon)
              <br /><br />
              Google Gemini AI · Brevo SMTP · Cloudinary
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-600 mt-10 border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© {new Date().getFullYear()} RentMate. All rights reserved.</span>
          <span className="text-slate-600">Built with ❤️ for smarter renting in India</span>
        </div>
      </footer>
    </div>
  );
}