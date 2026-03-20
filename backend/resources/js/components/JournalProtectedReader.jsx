import React, { useEffect } from 'react';
import { ShieldAlert, BookOpen } from 'lucide-react';

const JournalProtectedReader = ({ children, isProtected = false }) => {
    useEffect(() => {
        if (!isProtected) return;

        // Prevent right-click
        const handleContextMenu = (e) => e.preventDefault();

        // Prevent keyboard shortcuts (Ctrl+C, Ctrl+P, Ctrl+S, etc.)
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'p' || e.key === 's' || e.key === 'u')) {
                e.preventDefault();
                alert('This content is protected and cannot be copied or printed.');
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isProtected]);

    if (!isProtected) return <>{children}</>;

    return (
        <div className="relative journal-protected-container select-none">
            {/* Custom Print styles injected here */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { display: none !important; }
                    .journal-protected-container { display: none !important; }
                }
                .journal-protected-container {
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                }
            `}} />

            <div className="bg-slate-50 border-x border-t border-slate-100 p-4 rounded-t-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center space-x-2">
                    <ShieldAlert size={14} className="text-red-600" />
                    <span>Protected Journal Content</span>
                </div>
                <div className="flex items-center space-x-2">
                    <BookOpen size={14} />
                    <span>Exclusive Reader</span>
                </div>
            </div>

            <div className="relative group">
                <div className="absolute inset-0 pointer-events-none border-x border-b border-slate-100 rounded-b-2xl opacity-50"></div>
                {children}
            </div>
        </div>
    );
};

export default JournalProtectedReader;
