"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

const ASSET = process.env.NEXT_PUBLIC_ASSET_URL || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

// Used when the API has nothing to offer (first paint / backend down).
const FALLBACK_BRANDS = [
    { name: "Audi", logo: "/car-logos/audi.png" },
    { name: "BMW", logo: "/car-logos/bmw.png" },
    { name: "Honda", logo: "/car-logos/honda.png" },
    { name: "Toyota", logo: "/car-logos/toyota.png" },
    { name: "Mercedes-Benz", logo: "/car-logos/mercedes-benz.png" },
    { name: "Nissan", logo: "/car-logos/nissan.png" },
    { name: "Mazda", logo: "/car-logos/mazda.png" },
    { name: "Volkswagen", logo: "/car-logos/volkswagen.png" },
    { name: "Hyundai", logo: "/car-logos/hyundai.png" },
    { name: "Kia", logo: "/car-logos/kia.png" },
    { name: "Land Rover", logo: "/car-logos/land-rover.png" },
    { name: "Subaru", logo: "/car-logos/subaru.png" },
];

interface Brand {
    name: string;
    logo: string;
}

function resolveLogo(logo: string): string {
    if (!logo) return "";
    if (/^https?:\/\//.test(logo)) return logo;
    // Served by the frontend itself — never prefix the backend asset URL.
    if (logo.startsWith("/car-logos/")) return logo;
    // Backend-hosted uploads (/storage/...) need the API origin.
    if (logo.startsWith("/storage/")) return `${API_ORIGIN}${logo}`;
    return `${ASSET}${logo}`;
}

export default function BrandsSection() {
    const [brands, setBrands] = useState<Brand[]>(FALLBACK_BRANDS);

    useEffect(() => {
        api.get("/car-brands")
            .then((res) => {
                const data = res.data?.data;
                if (Array.isArray(data) && data.length > 0) setBrands(data);
            })
            .catch(() => {
                /* keep the fallback list */
            });
    }, []);

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container mx-auto px-4 mb-12">
                <div className="text-center">
                    <h6 className="text-red-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4 flex items-center justify-center">
                        <span className="w-8 h-[1px] bg-red-600 mr-3" />WE SERVICE ALL MAKES<span className="w-8 h-[1px] bg-red-600 ml-3" />
                    </h6>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Car Brands We <span className="text-red-600">Service</span></h2>
                </div>
            </div>

            <div className="relative flex overflow-x-hidden">
                <div className="py-12 animate-marquee whitespace-nowrap flex items-center">
                    {[...brands, ...brands].map((brand, index) => (
                        <div key={index} className="mx-8 w-24 h-24 flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-110">
                            <img src={resolveLogo(brand.logo)} alt={brand.name} className="max-w-full max-h-full object-contain" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
