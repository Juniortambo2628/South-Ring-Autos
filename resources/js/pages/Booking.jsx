import React, { useState } from 'react';
import Layout from '../layouts/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, CheckCircle, AlertCircle, Car, User, Clock as ClockIcon } from 'lucide-react';
import axios from 'axios';

const Booking = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        service: '',
        date: '',
        registration: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '', reference: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '', reference: '' });

        try {
            const response = await axios.post('/api/bookings', formData);
            if (response.data.success) {
                setStatus({
                    type: 'success',
                    message: response.data.message,
                    reference: response.data.reference
                });
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    service: '',
                    date: '',
                    registration: '',
                    vehicle_make: '',
                    vehicle_model: '',
                    vehicle_year: '',
                    message: ''
                });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
            setStatus({ type: 'error', message: errorMessage, reference: '' });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Layout>
            <div className="relative h-[40vh] bg-gray-900 flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-50"
                    style={{ backgroundImage: "url('/images/Car-Lift-Raised.jpg')" }}
                ></div>
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-extrabold mb-4"
                    >
                        Book Appointment
                    </motion.h1>
                    <nav className="flex justify-center text-sm font-medium uppercase tracking-wider text-gray-300">
                        <a href="/" className="hover:text-white transition-colors">Home</a>
                        <span className="mx-2">/</span>
                        <span className="text-red-500">Booking</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-20">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full text-red-600 mb-4">
                            <CalendarCheck size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Schedule Your Service</h2>
                        <p className="text-gray-600 mt-2">Fill out the form below and we'll get back to you to confirm your appointment.</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {status.message ? (
                            <motion.div
                                key="status"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-8 rounded-xl text-center ${status.type === 'success' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                                    }`}
                            >
                                {status.type === 'success' ? (
                                    <>
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                                            <CheckCircle size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-green-900 mb-2">Booking Confirmed!</h3>
                                        <p className="text-green-800 mb-4">{status.message}</p>
                                        <div className="bg-white p-4 rounded-lg inline-block border border-green-200">
                                            <span className="text-sm text-green-600 uppercase font-bold block mb-1">Reference Number</span>
                                            <span className="text-2xl font-mono font-bold text-green-900">{status.reference}</span>
                                        </div>
                                        <button
                                            onClick={() => setStatus({ type: '', message: '', reference: '' })}
                                            className="block mx-auto mt-8 text-green-700 font-semibold hover:underline"
                                        >
                                            Book another service
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
                                            <AlertCircle size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-red-900 mb-2">Oops!</h3>
                                        <p className="text-red-800 mb-6">{status.message}</p>
                                        <button
                                            onClick={() => setStatus({ type: '', message: '', reference: '' })}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        ) : (
                            <form key="form" onSubmit={handleSubmit}>
                                {/* Client Info Section */}
                                <div className="mb-8">
                                    <div className="flex items-center mb-4 text-blue-900">
                                        <User size={20} className="mr-2" />
                                        <h3 className="font-bold uppercase tracking-wider text-sm">Personal Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="name">Full Name</label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                                placeholder="Your Name"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="phone">Phone Number</label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                                placeholder="Your Phone"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="email">Email Address</label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                                placeholder="Your Email"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Section */}
                                <div className="mb-8">
                                    <div className="flex items-center mb-4 text-blue-900">
                                        <Car size={20} className="mr-2" />
                                        <h3 className="font-bold uppercase tracking-wider text-sm">Vehicle Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="registration">Registration (KXX 000X)</label>
                                            <input
                                                type="text"
                                                id="registration"
                                                value={formData.registration}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                                placeholder="Registration No."
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="vehicle_make">Car Make</label>
                                            <input
                                                type="text"
                                                id="vehicle_make"
                                                value={formData.vehicle_make}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                                placeholder="e.g. Toyota"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="vehicle_model">Car Model</label>
                                            <input
                                                type="text"
                                                id="vehicle_model"
                                                value={formData.vehicle_model}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                                placeholder="e.g. Corolla"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="vehicle_year">Year</label>
                                            <input
                                                type="number"
                                                id="vehicle_year"
                                                value={formData.vehicle_year}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                                placeholder="e.g. 2018"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Service Section */}
                                <div className="mb-8">
                                    <div className="flex items-center mb-4 text-blue-900">
                                        <ClockIcon size={20} className="mr-2" />
                                        <h3 className="font-bold uppercase tracking-wider text-sm">Service Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="service">Service Needed</label>
                                            <select
                                                id="service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                                required
                                                disabled={loading}
                                            >
                                                <option value="">Select Service...</option>
                                                <option value="General Service">General Service</option>
                                                <option value="Engine Repair">Engine & Transmission</option>
                                                <option value="Accident Repair">Accident Repair</option>
                                                <option value="Diagnostics">Diagnostics</option>
                                                <option value="Specialized Service">Specialized Service</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="date">Preferred Date</label>
                                            <input
                                                type="date"
                                                id="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="message">Additional Notes</label>
                                            <textarea
                                                id="message"
                                                rows="3"
                                                value={formData.message}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                                placeholder="Any specific issues or requests..."
                                                disabled={loading}
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all text-lg flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Confirming Booking...
                                        </span>
                                    ) : (
                                        'Confirm Booking'
                                    )}
                                </button>
                            </form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Layout>
    );
};

export default Booking;
