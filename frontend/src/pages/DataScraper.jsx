import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { Download, Search, X, Loader, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/axios';
import { AuthContext } from '../context/AuthContext';

/**
 * Self-contained Toast component (small, dismissible) - Enhanced UI
 */
const Toast = ({ message, type = "info", isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const styleMap = {
    error: { bg: "bg-red-500", icon: <X className="w-5 h-5" /> },
    success: { bg: "bg-emerald-500", icon: <Star className="w-5 h-5" /> },
    info: { bg: "bg-indigo-500", icon: <Search className="w-5 h-5" /> },
  };

  const { bg, icon } = styleMap[type];

  return (
    <div className="fixed right-4 bottom-6 z-50 pointer-events-none">
      <div className={`${bg} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-4 transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto`}>
        <div className="flex">{icon}</div>
        <div className="text-sm font-medium">{message}</div>
        <button
          onClick={onClose}
          className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const DataScraper = () => {
  // --- AuthContext ---
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();



  // inputs & data
  const [business, setBusiness] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // loading / UI
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  // refs to prevent race conditions
  const abortRef = useRef(null);


  const convertToLead = async (r) => {
    try {
      await API.post("/api/leads", {
        source: "scraper",
        name: r.name,
        phone: r.phone,
        address: r.address,
        website: r.website,
        rating: r.rating,
        totalRatings: r.total_ratings
      });

      showToast("Lead added to CRM", "success");
    } catch (e) {
      showToast("Failed to add lead", "error");
    }
  };


  // Add animation CSS once
  useEffect(() => {
    const css = `
      @keyframes zoomIn {
        from { opacity: 0; transform: scale(0.98) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .animate-zoomIn { animation: zoomIn 350ms ease-out forwards; }

      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-slideInUp { animation: slideInUp 300ms ease-out forwards; }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);



  // progress simulator while loading
  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }
    setProgress(12);
    const interval = setInterval(() => {
      setProgress((p) => {
        // increase gradually up to 88% and let final step set 100%
        if (p >= 88) return p;
        return p + Math.floor(Math.random() * 5) + 2; // +2..7
      });
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  // helper: show toast
  const showToast = (message, type = "info", duration = 3000) => {
    setToast({ visible: true, message, type, duration });
  };



  // CSV escape
  const escapeCSV = (value) => {
    if (value === undefined || value === null) return '""';
    const str = String(value);
    // double quotes inside must be doubled
    return `"${str.replace(/"/g, '""')}"`;
  };

  // Download CSV
  const downloadCSV = () => {
    if (!results.length) {
      showToast("No results to download", "error");
      return;
    }
    const headers = ["Name", "Address", "Phone", "Website", "Rating", "Total Ratings"];
    const rows = results.map((r) => [
      escapeCSV(r.name || ""),
      escapeCSV(r.address || ""),
      escapeCSV(r.phone || ""),
      escapeCSV(r.website || ""),
      r.rating ?? "",
      r.total_ratings ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileNameSafeBusiness = business ? business.replace(/\s+/g, "_") : "leads";
    const fileNameSafeCity = city ? city.replace(/\s+/g, "_") : "location";
    a.download = `${fileNameSafeBusiness}_${fileNameSafeCity}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV downloaded", "success");
  };

  // Core search function
  const handleSearch = async (newSearch = true) => {
    // Auth check - require logged-in user
    if (!user) {
      showToast("Please log in to search leads", "error");
      setTimeout(() => navigate('/login'), 800);
      return;
    }

    // validation
    if (!business.trim() || !city.trim()) {
      showToast("Please enter both Business Type and City/Location", "error");
      return;
    }
    if (business.trim().length < 2 || city.trim().length < 2) {
      showToast("Please provide more specific search terms (at least 2 characters)", "error");
      return;
    }

    // prepare
    const targetPage = newSearch ? 1 : page;
    if (newSearch) {
      setResults([]);
      setPage(1);
      setHasMore(false);
      setShowResults(false);
    }

    setLoading(true);
    // clear any previous abort
    if (abortRef.current) {
      abortRef.current.cancel("New request initiated");
    }
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    abortRef.current = source;

    try {
      // set a conservative minimum time to show progress UI pleasantly
      const start = Date.now();
      const res = await API.post(
        `/api/search`,
        { business: business.trim(), city: city.trim(), page: targetPage },
        { timeout: 60000, cancelToken: source.token }
      );

      // simulate nicer progress completion
      const payload = res?.data?.data ?? [];
      const elapsed = Date.now() - start;
      const ensureMin = (ms) => new Promise((r) => setTimeout(r, ms));
      if (elapsed < 500) await ensureMin(500 - elapsed);

      // finalize progress
      setProgress(96);



      // update results
      if (newSearch) {
        setResults(payload);
        setPage(2);
      } else {
        setResults((prev) => [...prev, ...payload]);
        setPage((p) => p + 1);
      }
      setHasMore(payload.length > 0);
      if ((payload.length ?? 0) > 0) {
        setShowResults(true);
        if (newSearch) {
          showToast(`Found ${payload.length} leads.`, "success");
        } else {
          showToast(`Loaded ${payload.length} more leads.`, "success");
        }
      } else if (newSearch) {
        showToast("No leads found for this query", "info");
      } else {
        showToast("Reached the end of results", "info");
      }
      // finish progress
      setProgress(100);
    } catch (err) {
      if (axios.isCancel(err)) {
        // ignore user-initiated cancels
        console.warn("Request canceled:", err.message);
      } else {
        console.error(err);
        showToast("Error fetching data. Try checking the server API URL.", "error");
      }
    } finally {
      setLoading(false);
      // reset abort token
      abortRef.current = null;
      // after a short delay, reset progress
      setTimeout(() => setProgress(0), 400);
    }
  };

  // Copy phone number helper
  const handleCopy = (phone) => {
    if (!phone) {
      showToast("No phone number available", "error");
      return;
    }
    // Using execCommand for better compatibility in iFrames
    try {
      const textarea = document.createElement('textarea');
      textarea.value = phone;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast("Phone number copied", "success");
    } catch (err) {
      showToast("Unable to copy phone (execCommand failed)", "error");
    }
  };

  // Helper to render rating stars
  const renderRating = (rating) => {
    if (rating === undefined || rating === null) return <span className="text-slate-400 text-xs">N/A</span>;

    // Convert to number and validate
    const numRating = Number(rating);
    if (isNaN(numRating) || !isFinite(numRating)) return <span className="text-slate-400 text-xs">N/A</span>;

    const fullStars = Math.max(0, Math.min(5, Math.floor(numRating))); // Ensure between 0-5
    const hasHalfStar = (numRating % 1 !== 0) && (fullStars < 5);
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0)); // Ensure non-negative


    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-amber-400 fill-amber-400" />
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="half-star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" style={{ stopColor: "rgb(251, 191, 36)", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "rgb(203, 213, 225)", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="url(#half-star-gradient)"
              stroke="rgb(251, 191, 36)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-slate-300 fill-slate-100" />
        ))}
        <span className="ml-2 text-sm font-semibold text-slate-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Helper: Validate website URL
  const isValidWebsite = (url) => {
    if (!url) return false;

    const clean = String(url).trim().toLowerCase();
    return (
      clean !== "" &&
      clean !== "null" &&
      clean !== "undefined" &&
      clean !== "n/a" &&
      clean.startsWith("http")
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-50 pt-28 font-inter">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tighter">
            Lead Intelligence Platform
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Find, qualify, and connect with high-value business leads in any location with precision.
          </p>
        </div>

        {/* Search Card - Premium Look */}
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-indigo-100 border border-slate-100 animate-slideInUp">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label htmlFor="business" className="block text-sm font-bold text-slate-700 mb-2">
                Business Type
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  id="business"
                  type="text"
                  placeholder="e.g., Hair Salon, Italian Restaurant"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(true)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-inner"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-bold text-slate-700 mb-2">
                City or Region
              </label>
              <div className="relative">
                <Star className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  id="city"
                  type="text"
                  placeholder="e.g., London, 75001, Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(true)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-inner"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex">
              <button
                onClick={() => handleSearch(true)}
                disabled={loading}
                className={`w-full h-full px-6 py-3.5 rounded-xl font-bold text-white transition-all duration-300 transform active:scale-[0.98] ${loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 shadow-xl shadow-indigo-200"
                  }`}
                title="Search leads"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Loader className="w-5 h-5 animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    {"Find Leads Now"}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* quick hint */}
          <div className="mt-6 text-sm text-slate-500 flex items-center gap-2">
            <span className="font-semibold text-indigo-500">PRO TIP:</span> Click any phone number in the results table to copy it instantly.
          </div>
        </div>

        {/* Results modal */}
        {/* Results Modal */}
        {showResults && (
          <div className="fixed inset-0 pt-28 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0">
            <div className=" w-screen h-screen bg-white shadow-2xl overflow-hidden animate-zoomIn">

              {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 border-b bg-linear-to-r from-indigo-50 to-white">
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
                    Lead Generation Report
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 mt-1">
                    Showing <span className="font-semibold">{results.length}</span> leads for "{business}" in "{city}"
                  </p>
                </div>

                <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-0">
                  <button
                    onClick={() => downloadCSV()}
                    className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-emerald-600 text-white text-xs md:text-sm font-semibold shadow hover:bg-emerald-700 transition"
                  >
                    <Download className="w-4 h-4 md:w-5 md:h-5" />
                    CSV
                  </button>

                  <button
                    onClick={() => setShowResults(false)}
                    className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Table / Card List */}
              <div className="overflow-y-auto h-[calc(100vh-160px)] md:h-auto md:max-h-[60vh] p-2 md:p-0">

                {/* MOBILE CARD VIEW */}
                <div className="md:hidden space-y-3">
                  {results.map((r, idx) => (
                    <div key={idx} className="border rounded-xl p-4 shadow-sm bg-white">
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <div className="text-slate-600 text-xs mt-1">{r.address}</div>

                      <div
                        className="text-indigo-600 text-sm font-medium mt-2"
                        onClick={() => handleCopy(r.phone)}
                      >
                        📞 {r.phone || "N/A"}
                      </div>

                      {isValidWebsite(r.website) ? (
                        <a
                          href={r.website}
                          className="text-indigo-600 underline text-xs mt-1 block"
                          target="_blank"
                        >
                          Visit Website
                        </a>
                      ) : (
                        <div className="text-slate-400 text-xs mt-1">No Website</div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-slate-500">Rating:</span>
                        {renderRating(r.rating)}
                      </div>
                      <button
                        onClick={() => convertToLead(r)}
                        className="mt-3 w-full bg-indigo-600 text-white py-2 rounded"
                      >
                        Convert to Lead
                      </button>

                    </div>
                  ))}<br />
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[900px] table-auto">
                    <thead className="sticky top-0 bg-slate-100 border-b shadow-sm">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Website</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-600">Rating</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-600">Reviews</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-600">Action</th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {results.map((r, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/40 transition">
                          <td className="px-6 py-4 text-sm font-semibold">{r.name}</td>
                          <td className="px-6 py-4 text-sm">{r.address}</td>
                          <td className="px-6 py-4 text-sm text-indigo-600 cursor-pointer" onClick={() => handleCopy(r.phone)}>
                            {r.phone || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            {isValidWebsite(r.website) ? (
                              <a href={r.website} className="text-indigo-600 underline" target="_blank">Visit Site</a>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">{renderRating(r.rating)}</td>
                          <td className="px-6 py-4 text-center text-sm">{r.total_ratings ?? "-"}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => convertToLead(r)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded text-xs"
                            >
                              Add Lead
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 md:p-6 border-t bg-slate-50">
                <div className="text-xs md:text-sm text-slate-600">
                  Showing <span className="font-bold">{results.length}</span> leads
                </div>

                <div>
                  {hasMore ? (
                    <button
                      onClick={() => handleSearch(false)}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-semibold shadow hover:bg-indigo-600 disabled:bg-slate-400"
                    >
                      Load More
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Star className="w-4 h-4 text-slate-400" />
                      End of results
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Loading overlay - Smoother, more professional */}
      {loading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 animate-zoomIn">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Finding Leads...</h4>
                <p className="text-sm text-slate-600">Gathering and validating lead information...</p>
              </div>
            </div>

            <div className="text-sm text-slate-600 mb-3 flex items-center justify-between">
              <div className="font-semibold text-indigo-600">Processing Data</div>
              <div className="font-mono">{Math.min(100, Math.max(0, Math.round(progress)))}%</div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%`, background: "linear-gradient(90deg, #6366f1, #4f46e5)" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
        duration={toast.duration ?? 3000}
      />

      {/* Scrollbar CSS for results table (Purely aesthetic improvement) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c3c3c3;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
      `}</style>
    </div>
  );
};

export default DataScraper;