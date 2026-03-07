"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/admin/dashboard");
            } else {
                setError(data.message || "Invalid password");
            }
        } catch (err) {
            setError("An error occurred during login.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#111] rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500">Admin Login</h1>
                    <p className="text-sm text-slate-500 mt-2">Enter the master password to access the seating dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold transition-colors flex items-center justify-center shadow-lg shadow-red-600/20"
                    >
                        {loading ? "Verifying..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
