import React, { useState } from 'react';
import { Search, MapPin, Building2, Hash, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const StudentSearch = () => {
    const [rollNumber, setRollNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // We should define setting state correctly
    const [seating, setSeating] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setSeating(null);
        if (!rollNumber || rollNumber.length !== 10) {
            setError('Please enter a valid 10-character roll number.');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.get(`/student/search/${rollNumber}`);
            setSeating(data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError('No seating information found for this roll number.');
            } else {
                setError('An error occurred while searching. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
            {/* Decorative Blob */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-xl z-10">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 tracking-tight">
                        Find Your Seat, Instantly.
                    </h1>
                    <p className="text-lg text-slate-600 font-medium">
                        Enter your 10-character roll number to locate your exam room.
                    </p>
                </div>

                <div className="glass-panel p-8 rounded-3xl relative">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="flex items-center bg-white rounded-full p-2 shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                            <Search className="w-6 h-6 text-gray-400 ml-4" />
                            <input
                                type="text"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                                placeholder="e.g. 22481A05K1"
                                className="flex-grow bg-transparent border-none focus:ring-0 text-gray-800 font-semibold px-4 text-lg outline-none uppercase placeholder-gray-400"
                                maxLength={10}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition-colors disabled:bg-indigo-400 flex items-center justify-center shadow-md shadow-indigo-200"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <ArrowRight className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                        {error && (
                            <p className="absolute -bottom-8 left-4 text-red-500 text-sm font-medium animate-pulse">
                                {error}
                            </p>
                        )}
                    </form>

                    {/* Results Area */}
                    <div className={`mt-8 transition-all duration-500 ease-in-out overflow-hidden ${seating ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        {seating && (
                            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 border border-indigo-100 shadow-xl shadow-indigo-100/50">
                                <div className="text-center mb-6">
                                    <p className="text-sm font-semibold text-indigo-500 uppercase tracking-wider">Exam Details</p>
                                    <p className="text-gray-900 font-bold text-xl mt-1">{seating.rollNumber}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-xl">
                                        <Building2 className="w-8 h-8 text-indigo-500 mb-2" />
                                        <p className="text-xs text-slate-500 font-medium uppercase">Block</p>
                                        <p className="text-2xl font-bold text-indigo-900">{seating.block}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl">
                                        <MapPin className="w-8 h-8 text-purple-500 mb-2" />
                                        <p className="text-xs text-slate-500 font-medium uppercase">Floor</p>
                                        <p className="text-2xl font-bold text-purple-900">{seating.floor}</p>
                                    </div>
                                    <div className="flex flex-col items-center p-4 bg-pink-50 rounded-xl">
                                        <Hash className="w-8 h-8 text-pink-500 mb-2" />
                                        <p className="text-xs text-slate-500 font-medium uppercase">Room</p>
                                        <p className="text-2xl font-bold text-pink-900">{seating.room}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSearch;
