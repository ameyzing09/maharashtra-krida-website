import { SPINNER_COLOR } from "../constants";
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Toast from "./common/Toast";
import { TailSpin } from "react-loader-spinner";
import { motion } from "framer-motion";
import { logout } from "../services/authService";
import useToast from "../hook/useToast";
import useTheme from "../hook/useTheme";

type Theme = "light" | "dark";

// Hoisted out of the component: these never depend on props or state, so the
// navLinks useMemo below can honestly declare [location.pathname] as its only
// dependency.
const linkBase =
  "block px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 dark:focus:ring-offset-slate-950";
const hover = "hover:text-slate-900 dark:hover:text-white";
const isActive = (pathname: string, path: string) =>
  pathname === path ? "text-slate-900 dark:text-white font-semibold" : "text-slate-600 dark:text-slate-300";

const Header: React.FC = () => {
  const location = useLocation();
  const isMenuPage = /\/menu/.test(location.pathname);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
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

  const navLinks = useMemo(
    () => (
      <>
        <Link to="/" className={`${linkBase} ${hover} ${isActive(location.pathname, "/")}`} aria-current={location.pathname === "/" ? "page" : undefined}>
          Home
        </Link>
        <Link to="/gallery" className={`${linkBase} ${hover} ${isActive(location.pathname, "/gallery")}`} aria-current={location.pathname === "/gallery" ? "page" : undefined}>
          Gallery
        </Link>
        <Link to="/news" className={`${linkBase} ${hover} ${isActive(location.pathname, "/news")}`} aria-current={location.pathname === "/news" ? "page" : undefined}>
          News
        </Link>
        <Link
          to="/badminton"
          className="block px-4 py-2 rounded-xl glass-button-primary font-semibold"
          aria-current={location.pathname === "/badminton" ? "page" : undefined}
        >
          Register
        </Link>
      </>
    ), [location.pathname]
  );

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <TailSpin color={SPINNER_COLOR} height={80} width={80} />
      </div>
    );
  const CommonLinks = (
    <>
      {navLinks}
    </>
  );

  const MenuLinks = (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate(-1)}
        className="glass-button-secondary inline-flex items-center gap-2 px-4 py-2 font-medium text-slate-700 dark:text-slate-200"
      >
        {/* left chevron */}
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        <span>Back</span>
      </button>
      <button
        onClick={handleSignOut}
        className="glass-button-outline inline-flex items-center gap-2 px-4 py-2 font-medium"
      >
        {loading && <TailSpin color={SPINNER_COLOR} height={16} width={16} />}
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <header className="w-full sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-slate-100" aria-hidden="true" />
                <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">Maharashtra Krida</span>
              </Link>
            </motion.div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-2">
              {isMenuPage ? (
                <div className="flex items-center gap-2">
                  {MenuLinks}
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {CommonLinks}
                  <ThemeToggle theme={theme} setTheme={setTheme} />
                </div>
              )}
            </nav>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center gap-1">
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <button
                type="button"
                aria-label="Toggle menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="glass-button-secondary p-2 text-slate-700 dark:text-slate-200"
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
            <nav className="flex flex-col py-2 gap-1 text-slate-700 dark:text-slate-200">
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
const ThemeToggle: React.FC<{ theme: Theme; setTheme: (t: Theme) => void }> = ({ theme, setTheme }) => {
  const title = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title={title}
      aria-label={title}
      className="glass-button-secondary p-2 text-slate-700 dark:text-slate-200"
    >
      {theme === "dark" ? (
        // Sun icon
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5.6 5.6l-1.4-1.4M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4" />
        </svg>
      ) : (
        // Moon icon
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </svg>
      )}
    </button>
  );
};
