import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const AdminDashboard = () => {
    const [image, setImage] = useState(null);
    const [examDate, setExamDate] = useState('');
    const [block, setBlock] = useState('');
    const [floor, setFloor] = useState('');
    const [room, setRoom] = useState('');

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    useEffect(() => {
        fetchRecords();
        // Check auth simply by triggering a private route
        api.get('/auth').catch(() => {
            localStorage.removeItem('token');
            navigate('/admin/login');
        });
    }, [navigate]);

    const fetchRecords = async () => {
        try {
            const { data } = await api.get('/admin/records');
            setRecords(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!image || !examDate || !block || !floor || !room) {
            setMessage({ type: 'error', text: 'Please fill all fields and select an image' });
            return;
        }

        const formData = new FormData();
        formData.append('image', image);
        formData.append('examDate', examDate);
        formData.append('block', block);
        formData.append('floor', floor);
        formData.append('room', room);

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await api.post('/admin/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage({ type: 'success', text: `Extracted ${data.extractedCount} roll numbers successfully!` });
            setImage(null);
            // reset form
            fetchRecords();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Upload failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this seating record?')) {
            try {
                await api.delete(`/admin/records/${id}`);
                fetchRecords();
            } catch (err) {
                setMessage({ type: 'error', text: 'Error deleting record' });
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500 mt-2">Manage examination seating plans and trigger OCR extractions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Panel */}
                <div className="lg:col-span-1">
                    <div className="glass-panel rounded-2xl p-6 border-t-4 border-t-indigo-500">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <UploadCloud className="text-indigo-500" /> Upload Seating Plan
                        </h2>

                        {message.text && (
                            <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                <p className="text-sm font-medium">{message.text}</p>
                            </div>
                        )}

                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Exam Date / Title</label>
                                <input type="text" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" placeholder="e.g. Midterms Fall 2026" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Block</label>
                                    <input type="text" value={block} onChange={(e) => setBlock(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. A" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Floor</label>
                                    <input type="text" value={floor} onChange={(e) => setFloor(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Room No.</label>
                                <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 201" />
                            </div>
                            <div className="mt-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Seating Image (OCR)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl overflow-hidden hover:border-indigo-500 transition-colors bg-slate-50 relative">
                                    <div className="space-y-1 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-slate-400" />
                                        <div className="flex text-sm text-slate-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-2 py-1">
                                                <span>Upload a file</span>
                                                <input type="file" className="sr-only" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-500">{image ? image.name : 'PNG, JPG up to 10MB'}</p>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-6 disabled:bg-indigo-400">
                                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <UploadCloud className="w-5 h-5" />}
                                {loading ? 'Processing OCR...' : 'Process Seating Plan'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Records Table */}
                <div className="lg:col-span-2">
                    <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 bg-white/50">
                            <h3 className="text-lg leading-6 font-bold text-slate-900">Seating Database</h3>
                            <p className="mt-1 text-sm text-slate-500">Currently extracted and active seating assignments.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Exam</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Roll Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {records.map((record) => (
                                        <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{record.examDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{record.rollNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {record.block} - Floor {record.floor} - Rm {record.room}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDelete(record._id)} className="text-red-500 hover:text-red-700 cursor-pointer p-2 rounded-lg hover:bg-red-50 transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {records.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-500">
                                                No seating records found. Upload a plan to begin.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
