import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AuthCallback from '../pages/AuthCallback';
import CompleteProfile from '../pages/CompleteProfile';
import ProtectedRoute from './ProtectedRoute';
import { ToastProvider } from '../context/ToastContext';

import About from '../pages/About';
import Services from '../pages/Services';
import Blog from '../pages/Blog';
import BlogPost from '../pages/BlogPost';
import JournalList from '../pages/JournalList';
import JournalDetail from '../pages/JournalDetail';
import Booking from '../pages/Booking';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminBookings from '../pages/admin/Bookings';
import AdminBlog from '../pages/admin/Blog';
import AdminBlogPostForm from '../pages/admin/BlogPostForm';
import AdminMessages from '../pages/admin/Messages';
import AdminServices from '../pages/admin/Services';
import AdminJournals from '../pages/admin/Journals';
import AdminSettings from '../pages/admin/Settings';
import ClientDashboard from '../pages/client/Dashboard';
import ClientBookings from '../pages/client/Bookings';
import ClientVehicles from '../pages/client/Vehicles';
import ClientPayments from '../pages/client/Payments';
import ClientProfile from '../pages/client/Profile';
import MyJournals from '../pages/client/MyJournals';

const App = () => {
    return (
        <Router>
            <ToastProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/journal" element={<JournalList />} />
                    <Route path="/journal/:id" element={<JournalDetail />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/complete-profile" element={<CompleteProfile />} />

                    {/* Admin Routes - Protected */}
                    <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/bookings" element={<ProtectedRoute><AdminBookings /></ProtectedRoute>} />
                    <Route path="/admin/services" element={<ProtectedRoute><AdminServices /></ProtectedRoute>} />
                    <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
                    <Route path="/admin/blog/new" element={<ProtectedRoute><AdminBlogPostForm /></ProtectedRoute>} />
                    <Route path="/admin/blog/edit/:id" element={<ProtectedRoute><AdminBlogPostForm /></ProtectedRoute>} />
                    <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
                    <Route path="/admin/journals" element={<ProtectedRoute><AdminJournals /></ProtectedRoute>} />
                    <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />

                    {/* Client Dashboard Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
                    <Route path="/dashboard/bookings" element={<ProtectedRoute><ClientBookings /></ProtectedRoute>} />
                    <Route path="/dashboard/vehicles" element={<ProtectedRoute><ClientVehicles /></ProtectedRoute>} />
                    <Route path="/dashboard/payments" element={<ProtectedRoute><ClientPayments /></ProtectedRoute>} />
                    <Route path="/dashboard/profile" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
                    <Route path="/dashboard/journals" element={<ProtectedRoute><MyJournals /></ProtectedRoute>} />

                    {/* Fallback for other pages to be implemented */}
                    <Route path="*" element={<Home />} />
                </Routes>
            </ToastProvider>
        </Router>
    );
};

export default App;
