export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100">
            <nav className="border-b border-slate-200 dark:border-white/10 bg-white dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold shadow-sm">
                                A
                            </div>
                            <span className="font-semibold text-lg tracking-tight">Exam Locator <span className="text-slate-400 font-normal">| Admin</span></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <a href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                Back to Public Search
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
            {children}
        </div>
    );
}
