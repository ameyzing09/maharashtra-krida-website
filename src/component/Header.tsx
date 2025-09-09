import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Toast from "./common/Toast";
import { TailSpin } from "react-loader-spinner";
import { motion } from "framer-motion";
import { logout } from "../services/authService";
import useToast from "../hook/useToast";
import useTheme from "../hook/useTheme";

type Theme = "light" | "dark";

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

  const linkBase =
    "block px-3 py-2 rounded-xl glass-button-secondary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:ring-offset-2";
  const isActive = (path: string) => (location.pathname === path ? "text-lime-600 dark:text-lime-400" : "text-gray-800 dark:text-white");
  const hover = "hover:text-lime-600 dark:hover:text-lime-400";

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
        className="glass-button-secondary inline-flex items-center gap-2 px-4 py-2 font-medium text-gray-800 dark:text-white"
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
        {loading && <TailSpin color="#84cc16" height={16} width={16} />}
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <header className="w-full sticky top-0 z-40 glass-panel-strong border-b border-white/20 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="h-8 w-8 rounded-full bg-lime-500 glass-glow group-hover:glass-glow-hover transition-all duration-300" aria-hidden="true" />
                <span className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">Maharashtra Krida</span>
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
                className="glass-button-secondary p-2 text-gray-800 dark:text-white"
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
            <nav className="flex flex-col py-2 gap-1 text-gray-800 dark:text-white">
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
      className="glass-button-secondary p-2 text-gray-800 dark:text-white"
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
