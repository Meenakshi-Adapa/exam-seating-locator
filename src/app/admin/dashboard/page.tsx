"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleLogout = async () => {
        // Basic logout by just clearing the cookie via a new api route or client side deletion
        document.cookie = "admin_token=; Max-Age=0; path=/;";
        router.push("/admin");
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file && !image) {
            setError("Please select at least a CSV data file or a Seating Plan image.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        const formData = new FormData();
        if (file) formData.append("file", file);
        if (image) formData.append("image", image);

        try {
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || "Upload successful!");
                setFile(null);
                setImage(null);
            } else {
                setError(data.message || "Upload failed.");
            }
        } catch (err) {
            setError("An error occurred during upload.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-8 mt-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#111] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                        <p className="text-sm text-slate-500">Manage seating plans and student data</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Upload Section */}
                <div className="bg-white dark:bg-[#111] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <h2 className="text-lg font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload New Seating Plan
                    </h2>

                    <form onSubmit={handleUpload} className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* CSV Upload */}
                            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 bg-slate-50 dark:bg-black/50 text-center hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                                <input
                                    type="file"
                                    id="csvFile"
                                    accept=".csv"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                <label htmlFor="csvFile" className="cursor-pointer flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {file ? file.name : "Select CSV / Excel File (Data)"}
                                    </div>
                                </label>
                            </div>

                            {/* Image Upload */}
                            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 bg-slate-50 dark:bg-black/50 text-center hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                                <input
                                    type="file"
                                    id="imageFile"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                <label htmlFor="imageFile" className="cursor-pointer flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {image ? image.name : "Select Seating Plan Image (Visual)"}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Messages */}
                        {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>}
                        {message && <div className="text-emerald-500 text-sm font-medium p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">{message}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold transition-colors flex items-center justify-center shadow-lg shadow-indigo-600/20"
                        >
                            {loading ? "Processing Upload..." : "Upload and Save"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
