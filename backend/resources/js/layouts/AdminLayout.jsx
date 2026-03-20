import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    CalendarDays,
    FileText,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    UserCircle,
    Bell,
    Wrench,
    Book,
    ChevronDown,
    ExternalLink
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: CalendarDays, label: 'Bookings', path: '/admin/bookings' },
        { icon: Wrench, label: 'Services', path: '/admin/services' },
        { icon: Book, label: 'Journals', path: '/admin/journals' },
        { icon: FileText, label: 'Blog Posts', path: '/admin/blog' },
        { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

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

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <Link to="/admin" className="flex items-center space-x-3 group">
                        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform">
                            S
                        </div>
                        <span className="font-bold text-lg text-white tracking-wider">ADMin</span>
                    </Link>
                    <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="mt-8 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

const Header = ({ toggleSidebar }) => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    return (
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
            <button onClick={toggleSidebar} className="p-2 lg:hidden text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
            </button>

            <div className="hidden lg:flex items-center bg-slate-100 px-4 py-2 rounded-full border border-slate-200/50 focus-within:ring-2 ring-red-500/20 w-80">
                <LayoutDashboard size={18} className="text-slate-400 mr-2" />
                <span className="text-slate-500 text-sm">Search administrative tools...</span>
            </div>

            <div className="flex items-center space-x-4">
                <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-px bg-slate-200"></div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center space-x-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">{user?.name || 'Admin User'}</p>
                            <p className="text-xs text-slate-500 font-medium lowercase italic">{user?.role || 'admin'}</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle size={32} className="text-slate-400" />
                            )}
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {profileOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* User Info Header */}
                            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle size={28} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Admin User'}</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <Link
                                    to="/admin"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center space-x-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <LayoutDashboard size={16} className="text-slate-400" />
                                    <span className="font-medium">Dashboard</span>
                                </Link>
                                <Link
                                    to="/admin/settings"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center space-x-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <Settings size={16} className="text-slate-400" />
                                    <span className="font-medium">Profile Settings</span>
                                </Link>

                                <div className="my-1 border-t border-slate-100"></div>

                                <a
                                    href="/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center space-x-3 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <ExternalLink size={16} className="text-slate-400" />
                                    <span className="font-medium">Visit Website</span>
                                </a>

                                <div className="my-1 border-t border-slate-100"></div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                                >
                                    <LogOut size={16} />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="lg:pl-64 flex flex-col min-h-screen">
                <Header toggleSidebar={toggleSidebar} />

                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>

                <footer className="p-4 lg:p-8 pt-0 text-slate-400 text-sm italic">
                    <div className="border-t border-slate-200 pt-6">
                        &copy; {new Date().getFullYear()} South Ring Autos Admin Console v2.0
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
