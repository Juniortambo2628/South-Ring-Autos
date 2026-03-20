import React, { useState } from 'react';
import Layout from '../layouts/Layout';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await axios.post('/api/contact', formData);
            if (response.data.success) {
                setStatus({ type: 'success', message: response.data.message });
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
            setStatus({ type: 'error', message: errorMessage });
        } finally {
            setLoading(false);
        }
    };
    return (
        <Layout>
            {/* Page Header */}
            <div className="relative h-[40vh] bg-gray-900 flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-50"
                    style={{ backgroundImage: "url('/images/Car-GX-1.jpg')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>

                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-extrabold mb-4"
                    >
                        Contact Us
                    </motion.h1>
                    <nav className="flex justify-center text-sm font-medium uppercase tracking-wider text-gray-300">
                        <a href="/" className="hover:text-white transition-colors">Home</a>
                        <span className="mx-2">/</span>
                        <span className="text-red-500">Contact</span>
                    </nav>
                </div>
            </div>

            {/* Contact Content */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h6 className="text-red-600 font-bold uppercase tracking-widest mb-2">Contact Us</h6>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                        Contact For Any <span className="text-blue-900">Query</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-gray-100 p-8 rounded-lg text-center hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full text-red-600 mb-6 shadow-sm">
                            <Phone size={28} />
                        </div>
                        <h5 className="font-bold text-lg mb-2 uppercase">Phone</h5>
                        <p className="text-gray-600">+254 704 113 472</p>
                    </div>
                    <div className="bg-gray-100 p-8 rounded-lg text-center hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full text-red-600 mb-6 shadow-sm">
                            <Mail size={28} />
                        </div>
                        <h5 className="font-bold text-lg mb-2 uppercase">Email</h5>
                        <p className="text-gray-600">southringautos@gmail.com</p>
                    </div>
                    <div className="bg-gray-100 p-8 rounded-lg text-center hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full text-red-600 mb-6 shadow-sm">
                            <MapPin size={28} />
                        </div>
                        <h5 className="font-bold text-lg mb-2 uppercase">Location</h5>
                        <p className="text-gray-600">Bogani East Lane, Nairobi</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Map & Info */}
                    <div className="lg:w-1/2">
                        <div className="bg-gray-50 p-8 rounded-xl h-full shadow-inner">
                            <h4 className="text-2xl font-bold text-blue-900 mb-6">Visit Our Workshop</h4>

                            <div className="space-y-6">
                                <div className="flex">
                                    <MapPin className="text-red-600 flex-shrink-0 mt-1 mr-4" size={24} />
                                    <div>
                                        <h5 className="font-bold text-gray-900 mb-1">Address:</h5>
                                        <p className="text-gray-600">Bogani East Lane, off Bogani East Road<br />(Adjacent to Catholic University of East Africa)</p>
                                        <p className="text-gray-600 mt-1">P.O. Box 40664-00100, Nairobi</p>
                                    </div>
                                </div>

                                <div className="flex">
                                    <Phone className="text-red-600 flex-shrink-0 mt-1 mr-4" size={24} />
                                    <div>
                                        <h5 className="font-bold text-gray-900 mb-1">Phone:</h5>
                                        <p className="text-gray-600">+254 704 113 472</p>
                                    </div>
                                </div>

                                <div className="flex">
                                    <Mail className="text-red-600 flex-shrink-0 mt-1 mr-4" size={24} />
                                    <div>
                                        <h5 className="font-bold text-gray-900 mb-1">Email:</h5>
                                        <p className="text-gray-600">southringautos@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex">
                                    <Clock className="text-red-600 flex-shrink-0 mt-1 mr-4" size={24} />
                                    <div>
                                        <h5 className="font-bold text-gray-900 mb-1">Hours:</h5>
                                        <p className="text-gray-600">Mon-Fri: 8:00 — 18:00</p>
                                        <p className="text-gray-600">Sat: 8:00 — 14:00</p>
                                    </div>
                                </div>
                            </div>

                            {/* Placeholder for Google Map Embed if needed later */}
                            <div className="mt-8 h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                <span>Google Maps Embed Placeholder</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:w-1/2">
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                            <p className="text-gray-600 mb-8">
                                Have a question or want to book a free vehicle inspection? Drop us a message and we'll get back to you promptly.
                            </p>

                            {status.message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-6 p-4 rounded-lg flex items-center ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {status.type === 'success' ? <CheckCircle size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                                    {status.message}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="name">Your Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                            placeholder="Your Name"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Your Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                            placeholder="Your Email"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="subject">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                        placeholder="Subject"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-700 font-medium mb-2" htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                                        placeholder="Leave a message here"
                                        required
                                        disabled={loading}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center transform ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        <>
                                            <Send className="mr-2" size={20} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;
