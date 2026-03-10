import React from 'react';
import Layout from '../layouts/Layout';
import ServiceTabs from '../components/ServiceTabs';
import { motion } from 'framer-motion';

const Services = () => {
    return (
        <Layout>
            <div className="relative h-[40vh] bg-gray-900 flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-50"
                    style={{ backgroundImage: "url('/images/stock-images/Hero-Slide-2-BG.jpg')" }}
                ></div>
                <div className="absolute inset-0 bg-black/60"></div>

                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-extrabold mb-4"
                    >
                        Our Services
                    </motion.h1>
                    <nav className="flex justify-center text-sm font-medium uppercase tracking-wider text-gray-300">
                        <a href="/" className="hover:text-white transition-colors">Home</a>
                        <span className="mx-2">/</span>
                        <span className="text-red-500">Services</span>
                    </nav>
                </div>
            </div>

            <ServiceTabs />
        </Layout>
    );
};

export default Services;
