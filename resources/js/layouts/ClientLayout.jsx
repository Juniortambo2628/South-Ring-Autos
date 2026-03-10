import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Car,
    CreditCard,
    User,
    LogOut,
    Menu,
    X,
    Bell,
    Settings,
    ChevronRight,
    Book
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ClientLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                await axios.post('/api/logout', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Bookings', path: '/dashboard/bookings', icon: Calendar },
        { name: 'My Vehicles', path: '/dashboard/vehicles', icon: Car },
        { name: 'My Journals', path: '/dashboard/journals', icon: Book },
        { name: 'Payments', path: '/dashboard/payments', icon: CreditCard },
        { name: 'Profile', path: '/dashboard/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="flex-grow container mx-auto px-4 py-8 flex gap-8">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
                        <div className="p-6 bg-slate-900 text-white">
                            <div className="flex items-center space-x-3 mb-1">
                                <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-lg">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-400 truncate uppercase tracking-wider">{user?.role || 'Client'}</p>
                                </div>
                            </div>
                        </div>

                        <nav className="p-4 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/dashboard'}
                                    className={({ isActive }) => `
                                        flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-red-50 text-red-600 font-bold shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon size={20} className={({ isActive }) => isActive ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                        <span>{item.name}</span>
                                    </div>
                                    <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </NavLink>
                            ))}

                            <hr className="my-4 border-slate-100" />

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                            >
                                <LogOut size={20} className="text-slate-400 group-hover:text-red-600" />
                                <span>Sign Out</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-grow min-w-0">
                    {children}
                </main>
            </div>

            <Footer />
        </div>
    );
};

export default ClientLayout;
