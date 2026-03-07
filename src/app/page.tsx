"use client";

import { useState } from "react";
import { parseLocationFields } from "@/lib/locationParser";

export default function Home() {
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [seatingData, setSeatingData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNumber.trim()) return;

    setLoading(true);
    setError("");
    setSeatingData(null);

    try {
      const response = await fetch(`/api/seating/${encodeURIComponent(rollNumber.trim())}`);
      const result = await response.json();

      if (response.ok) {
        setSeatingData(result.data);
      } else {
        setError(result.message || "Could not find seating details.");
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parsedLocation = seatingData ? parseLocationFields(seatingData.roomNumber) : null;
  const blockNo = seatingData
    ? (seatingData.blockNumber || seatingData.blockNo || seatingData.block || parsedLocation?.blockNumber || "Unknown")
    : "Unknown";
  const roomNo = seatingData
    ? ((parsedLocation?.roomNumber && parsedLocation.roomNumber !== "Unknown" ? parsedLocation.roomNumber : seatingData.roomNumber) || "Unknown")
    : "Unknown";
  const floorNo = seatingData
    ? (seatingData.floorNumber || parsedLocation?.floorNumber || "Unknown")
    : "Unknown";
  const proxiedImageUrl = seatingData?.imageUrl
    ? `/api/image?url=${encodeURIComponent(seatingData.imageUrl)}`
    : "";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                ES
              </div>
              <span className="font-semibold text-lg tracking-tight">Exam Locator</span>
            </div>
            <div>
              <a href="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                Admin Portal
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section & Search */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-8 mt-12 mb-10">

          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-900/20 px-3 py-1 text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-4">
              <span className="flex w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2 animate-pulse"></span>
              Spring 2026 Exams Live
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Exam Seat</span> instantly
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
              No more searching through crowded notice boards. Enter your roll number below to get your exact room number and seating coordinates.
            </p>
          </div>

          {/* Search Card */}
          <div className="w-full max-w-md mt-8 bg-white dark:bg-[#111] p-2 rounded-2xl shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-200 dark:border-white/10 lg:hover:scale-[1.02] transition-transform duration-300">
            <form className="relative flex items-center" onSubmit={handleSearch}>
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </div>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="block w-full py-4 pl-12 pr-32 text-slate-900 dark:text-white bg-transparent outline-none placeholder:text-slate-400 text-lg sm:text-xl font-medium"
                placeholder="Enter Roll Number..."
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl px-6 transition-all duration-200 flex items-center justify-center shadow-md shadow-indigo-600/20"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Search"
                )}
              </button>
            </form>
          </div>

          {/* Main Error Message */}
          {error && (
            <div className="mt-4 p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/50 w-full max-w-md flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-left font-medium">{error}</span>
            </div>
          )}

        </div>

        {/* RESULTS SECTION */}
        {seatingData && (
          <div className="w-full max-w-3xl mb-20">
            <div className="bg-white dark:bg-[#111] rounded-3xl p-6 sm:p-10 shadow-2xl shadow-indigo-100/40 dark:shadow-none border border-slate-200 dark:border-white/10 relative overflow-hidden">

              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">

                {/* Left Side: Student Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-sm uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold mb-1">Student Details</h2>
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">{seatingData.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg flex items-center gap-2 mt-1">
                      {seatingData.rollNumber} • {seatingData.course}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-black/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">Block No.</p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                        {blockNo}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-black/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold mb-1">Room No.</p>
                      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-indigo-500 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        {roomNo}
                      </p>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wide font-semibold mb-1">Floor No.</p>
                      <p className="text-2xl sm:text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                        {floorNo}
                      </p>
                    </div>
                  </div>

                  {seatingData.examDate && (
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      Exam Date: {new Date(seatingData.examDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Right Side: Uploaded Image */}
                {seatingData.imageUrl && (
                  <div className="w-full md:w-64 flex flex-col gap-2">
                    <h2 className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Seating Plan Chart</h2>
                    <a href={proxiedImageUrl} target="_blank" rel="noopener noreferrer" className="group relative block w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={proxiedImageUrl}
                        alt={`Seating plan for ${roomNo}`}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white text-sm font-medium border border-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full">View Full Image</span>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={() => { setSeatingData(null); setRollNumber(""); }}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors underline-offset-4 hover:underline"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

      </main>

      <footer className="py-6 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/50">
        <p>© 2026 Exam Seating Locator System. Good luck with your exams!</p>
      </footer>
    </div>
  );
}
