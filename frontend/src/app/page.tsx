"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ServiceHighlights from "@/components/landing/ServiceHighlights";
import AboutSection from "@/components/landing/AboutSection";
import FactsSection from "@/components/landing/FactsSection";
import ServiceTabs from "@/components/landing/ServiceTabs";
import BrandsSection from "@/components/landing/BrandsSection";
import BookingCTA from "@/components/landing/BookingCTA";
import Testimonials from "@/components/landing/Testimonials";
import FeaturedJournals from "@/components/landing/FeaturedJournals";
import LatestBlogs from "@/components/landing/LatestBlogs";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

// Default configuration fallback
const DEFAULT_SECTIONS = [
  { id: 'hero', visible: true, component: HeroSection },
  { id: 'services', visible: true, component: ServiceTabs },
  { id: 'appraisal', visible: true, component: ServiceHighlights },
  { id: 'featured_journals', visible: true, component: FeaturedJournals },
  { id: 'latest_blogs', visible: true, component: LatestBlogs },
  { id: 'testimonials', visible: true, component: Testimonials },
  { id: 'contact', visible: true, component: BookingCTA }
];

const COMPONENT_MAP: Record<string, React.FC> = {
  'hero': HeroSection,
  'services': ServiceTabs,
  'appraisal': ServiceHighlights,
  'featured_journals': FeaturedJournals,
  'latest_blogs': LatestBlogs,
  'testimonials': Testimonials,
  'contact': BookingCTA,
};

export default function HomePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/settings').then(res => {
      const data = res.data.settings;
      if (data && data.landing_page_sections) {
        try {
          const parsed = typeof data.landing_page_sections === 'string' ? JSON.parse(data.landing_page_sections) : data.landing_page_sections;
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            setSections(parsed);
          } else {
            setSections(DEFAULT_SECTIONS);
          }
        } catch (e) {
          setSections(DEFAULT_SECTIONS);
        }
      } else {
        setSections(DEFAULT_SECTIONS);
      }
    }).catch(err => {
      console.error("Could not load landing sections", err);
      setSections(DEFAULT_SECTIONS);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-white">
        <Loader2 size={40} className="animate-spin text-red-600 mb-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-800 antialiased selection:bg-red-600 selection:text-white">
      <Navbar />
      <main className="flex-grow">
        {sections.map((sectionConfig) => {
          if (!sectionConfig.visible) return null;

          const SectionComponent = COMPONENT_MAP[sectionConfig.id];
          if (!SectionComponent) return null;

          return <SectionComponent key={sectionConfig.id} />;
        })}
      </main>
      <Footer />
    </div>
  );
}
