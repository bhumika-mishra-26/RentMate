import { Link } from "react-router-dom";
import { FaExclamationTriangle, FaHome } from "react-icons/fa";

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-rose-200/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-violet-200/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-md w-full text-center z-10 flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 text-3xl shadow-sm">
          <FaExclamationTriangle />
        </div>
        
        <div>
          <h1 className="text-6xl font-extrabold text-slate-900 tracking-tighter">404</h1>
          <h2 className="text-xl font-bold mt-2 text-slate-700">Page Not Found</h2>
          <p className="text-slate-500 text-sm mt-3 max-w-xs mx-auto font-medium">
            The page you are looking for doesn't exist or you don't have permission to access it.
          </p>
        </div>

        <Link
          to="/"
          className="mt-4 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl transition duration-300 font-bold shadow-md text-sm"
        >
          <FaHome />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;