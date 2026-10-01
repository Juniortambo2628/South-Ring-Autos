import Navbar from "./Navbar";
import Footer from "./Footer";

interface PublicShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared chrome for every public (unauthenticated) page: landing header,
 * page content, landing footer. Keeps the full-height flex column so the
 * footer always sits at the bottom of the viewport.
 */
export default function PublicShell({
  children,
  className = "font-sans text-gray-800 antialiased selection:bg-red-500 selection:text-white",
}: PublicShellProps) {
  return (
    <div className={`flex flex-col min-h-screen ${className}`}>
      <Navbar />
      <div className="flex-grow flex flex-col">{children}</div>
      <Footer />
    </div>
  );
}
