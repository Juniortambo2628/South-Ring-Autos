import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, Menu, X, CalendarCheck, Facebook, Twitter, Instagram, User, LogOut, ChevronDown, Settings, LayoutDashboard, ExternalLink } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = React.useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [location]);

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path ? 'text-red-600' : 'text-slate-700 hover:text-red-600';

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
            setUser(null);
            navigate('/login');
            setIsOpen(false);
        }
    };

    return (
        <header className="w-full sticky top-0 z-50 shadow-sm">
            {/* Topbar - Legacy Style */}
            <div className="bg-white border-b border-slate-100 py-1 hidden lg:block text-[11px] font-medium text-slate-500">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex space-x-6">
                        <div className="flex items-center space-x-1.5">
                            <MapPin size={12} className="text-red-600" />
                            <span>Bogani East Lane, off Bogani East Road (Adjacent to CUEA)</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-1.5">
                            <Phone size={12} className="text-red-600" />
                            <span>+254 704 113 472</span>
                        </div>
                        <div className="flex items-center space-x-3 border-l border-slate-200 ml-4 pl-4">
                            <a href="#" className="hover:text-red-600 transition-colors"><Facebook size={12} /></a>
                            <a href="#" className="hover:text-red-600 transition-colors"><Twitter size={12} /></a>
                            <a href="#" className="hover:text-red-600 transition-colors"><Instagram size={12} /></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 h-20 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img
                            src="/images/South-ring-logos/SR-Logo-Transparent-BG.png"
                            alt="South Ring Autos"
                            className="h-16 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-10 font-black text-[11px] uppercase tracking-[0.2em]">
                        <Link to="/" className={`${isActive('/')} transition-colors px-2`}>HOME</Link>
                        <Link to="/about" className={`${isActive('/about')} transition-colors px-2`}>ABOUT</Link>
                        <Link to="/services" className={`${isActive('/services')} transition-colors px-2`}>SERVICES</Link>
                        <Link to="/journal" className={`${isActive('/journal')} transition-colors px-2`}>JOURNAL</Link>
                        <Link to="/blog" className={`${isActive('/blog')} transition-colors px-2`}>BLOG</Link>
                        <Link to="/contact" className={`${isActive('/contact')} transition-colors px-2`}>CONTACT</Link>
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <Link to="/booking" className="bg-[#003366] text-white px-5 py-2.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all flex items-center shadow-lg shadow-blue-900/10">
                            Book Appointment
                        </Link>

                        {user ? (
                            <div className="relative pl-4 border-l border-slate-100" ref={profileRef}>
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full border border-slate-200" />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                            <User size={16} className="text-slate-400" />
                                        </div>
                                    )}
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">{user.name.split(' ')[0]}</span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Profile Dropdown */}
                                {profileOpen && (
                                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <LayoutDashboard size={16} className="text-slate-400" />
                                                <span className="font-medium">Dashboard</span>
                                            </Link>
                                            <Link
                                                to="/complete-profile"
                                                onClick={() => setProfileOpen(false)}
                                                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <Settings size={16} className="text-slate-400" />
                                                <span className="font-medium">Profile Settings</span>
                                            </Link>

                                            {user.role === 'admin' && (
                                                <>
                                                    <div className="my-1 border-t border-slate-100"></div>
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setProfileOpen(false)}
                                                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <ExternalLink size={16} />
                                                        <span className="font-medium">Admin Panel</span>
                                                    </Link>
                                                </>
                                            )}

                                            <div className="my-1 border-t border-slate-100"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                                            >
                                                <LogOut size={16} />
                                                <span className="font-medium">Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="border-2 border-red-600 text-red-600 px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-red-600 text-white px-5 py-2.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/10">
                                    Signup
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="lg:hidden text-slate-900" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 py-6 px-4 shadow-xl absolute w-full z-50">
                    <div className="flex flex-col space-y-4 font-bold text-sm uppercase tracking-wide">
                        <Link to="/" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Home</Link>
                        <Link to="/about" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>About</Link>
                        <Link to="/services" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Services</Link>
                        <Link to="/journal" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Journal</Link>
                        <Link to="/blog" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Blog</Link>
                        <Link to="/contact" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Contact</Link>
                        <hr className="border-slate-100" />

                        {user ? (
                            <div className="flex flex-col space-y-4 pt-2">
                                <div className="flex items-center space-x-3 text-slate-700">
                                    <User size={20} />
                                    <span>{user.name}</span>
                                </div>
                                <Link to="/dashboard" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                <Link to="/complete-profile" className="text-slate-700 hover:text-red-600" onClick={() => setIsOpen(false)}>Profile Settings</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-red-600" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 text-red-600"
                                >
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/booking" className="bg-[#003366] text-white text-center py-3 rounded" onClick={() => setIsOpen(false)}>Book Appointment</Link>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/login" className="border-2 border-red-600 text-red-600 text-center py-2.5 rounded" onClick={() => setIsOpen(false)}>Login</Link>
                                    <Link to="/register" className="bg-red-600 text-white text-center py-2.5 rounded" onClick={() => setIsOpen(false)}>Signup</Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
