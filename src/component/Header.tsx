import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Toast from "./common/Toast";
import { TailSpin } from "react-loader-spinner";
import { logout } from "../services/authService";
import useToast from "../hook/useToast";
import useTheme from "../hook/useTheme";

type Theme = "light" | "dark";

const Header: React.FC = () => {
  const location = useLocation();
  const isMenuPage = /\/menu/.test(location.pathname);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const { toast, showToast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      showToast("Sign out failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // theme class toggling handled by ThemeProvider

  const linkBase =
    "block px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70 transition-colors";
  const isActive = (path: string) => (location.pathname === path ? "text-brand-lime" : "text-gray-700 dark:text-gray-200");
  const hover = "hover:text-brand-lime";

  const navLinks = useMemo(
    () => (
      <>
        <Link to="/" className={`${linkBase} ${hover} ${isActive("/")}`} aria-current={location.pathname === "/" ? "page" : undefined}>
          Home
        </Link>
        <Link to="/gallery" className={`${linkBase} ${hover} ${isActive("/gallery")}`} aria-current={location.pathname === "/gallery" ? "page" : undefined}>
          Gallery
        </Link>
        <Link to="/news" className={`${linkBase} ${hover} ${isActive("/news")}`} aria-current={location.pathname === "/news" ? "page" : undefined}>
          News
        </Link>
      </>
    ), [location.pathname]
  );

  if (loading) return <TailSpin color="#84cc16" height={80} width={80} />;
  const CommonLinks = (
    <>
      {navLinks}
    </>
  );

  const MenuLinks = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(-1)}
        className={`inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 px-4 py-2 font-medium text-brand-charcoal dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70`}
      >
        {/* left chevron */}
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        <span>Back</span>
      </button>
      <button
        onClick={handleSignOut}
        className={`${linkBase} inline-flex items-center gap-2`}
      >
        {loading && <TailSpin color="#fff" height={16} width={16} />}
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <header className="w-full sticky top-0 z-40 glass glass-shine border-b-0">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-brand-lime" aria-hidden="true" />
              <span className="font-display text-lg font-bold tracking-tight text-brand-charcoal dark:text-white">Maharashtra Krida</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-2">
              {isMenuPage ? (
                <div className="flex items-center gap-2">
                  {MenuLinks}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {CommonLinks}
                </div>
              )}
            </nav>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center gap-1">
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center justify-center p-2 rounded-md text-brand-charcoal dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                  {open ? (
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                  ) : (
                    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`md:hidden transition-[max-height] duration-300 overflow-hidden ${open ? "max-h-96" : "max-h-0"}`}>
          <div className="mx-auto max-w-6xl px-4 pb-3">
            <nav className="flex flex-col py-2 gap-1 text-brand-charcoal dark:text-gray-200">
              {isMenuPage ? MenuLinks : navLinks}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};


export default Header;

// lightweight theme toggle button to support dark mode (class-based)
// Theme toggle removed (always dark)
