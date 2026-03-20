import React from 'react';
import { motion } from 'framer-motion';

const brands = [
    { name: 'Audi', logo: '/images/car-logos-dataset-master/logos/optimized/audi.png' },
    { name: 'BMW', logo: '/images/car-logos-dataset-master/logos/optimized/bmw.png' },
    { name: 'Honda', logo: '/images/car-logos-dataset-master/logos/optimized/honda.png' },
    { name: 'Toyota', logo: '/images/car-logos-dataset-master/logos/optimized/toyota.png' },
    { name: 'Mercedes-Benz', logo: '/images/car-logos-dataset-master/logos/optimized/mercedes-benz.png' },
    { name: 'Nissan', logo: '/images/car-logos-dataset-master/logos/optimized/nissan.png' },
    { name: 'Mazda', logo: '/images/car-logos-dataset-master/logos/optimized/mazda.png' },
    { name: 'Volkswagen', logo: '/images/car-logos-dataset-master/logos/optimized/volkswagen.png' },
    { name: 'Hyundai', logo: '/images/car-logos-dataset-master/logos/optimized/hyundai.png' },
    { name: 'Kia', logo: '/images/car-logos-dataset-master/logos/optimized/kia.png' },
    { name: 'Land Rover', logo: '/images/car-logos-dataset-master/logos/optimized/land-rover.png' },
    { name: 'Subaru', logo: '/images/car-logos-dataset-master/logos/optimized/subaru.png' }
];

const BrandsSection = () => {
    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4 mb-12">
                <div className="text-center">
                    <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 flex items-center justify-center">
                        <span className="w-8 h-[1px] bg-red-600 mr-3"></span>
                        WE SERVICE ALL MAKES
                        <span className="w-8 h-[1px] bg-red-600 ml-3"></span>
                    </h6>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Car Brands We <span className="text-red-600">Service</span></h2>
                </div>
            </div>

            <div className="relative flex overflow-x-hidden">
                <div className="py-12 animate-marquee whitespace-nowrap flex items-center">
                    {[...brands, ...brands].map((brand, index) => (
                        <div key={index} className="mx-8 w-24 h-24 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-110">
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            ` }} />
        </section>
    );
};

export default BrandsSection;
