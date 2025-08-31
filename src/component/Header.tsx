import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Toast from "./common/Toast";
import { TailSpin } from "react-loader-spinner";
import { logout } from "../services/authService";
import useToast from "../hook/useToast";

type Theme = "light" | "dark";

const Header: React.FC = () => {
  const location = useLocation();
  const isMenuPage = /\/menu/.test(location.pathname);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("theme") as Theme) || "light");
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

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

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
        <Link to="/about" className={`${linkBase} ${hover} ${isActive("/about")}`} aria-current={location.pathname === "/about" ? "page" : undefined}>
          About
        </Link>
        <Link to="/contact" className={`${linkBase} ${hover} ${isActive("/contact")}`} aria-current={location.pathname === "/contact" ? "page" : undefined}>
          Contact
        </Link>
        <Link to="/upcoming-events" className={`${linkBase} ${hover} ${isActive("/upcoming-events")}`} aria-current={location.pathname === "/upcoming-events" ? "page" : undefined}>
          Events
        </Link>
      </>
    ), [location.pathname]
  );

  if (loading) return <TailSpin color="#84cc16" height={80} width={80} />;
  const CommonLinks = (
    <>
      {navLinks}
      <Link
        to="/register"
        className="ml-1 inline-flex items-center justify-center rounded-full bg-brand-lime hover:bg-brand-limeDark text-white px-4 py-2 font-semibold shadow-soft"
      >
        Register
      </Link>
    </>
  );

  const MenuLinks = (
    <button
      onClick={handleSignOut}
      className={`${linkBase} inline-flex items-center gap-2`}
    >
      {loading && <TailSpin color="#fff" height={16} width={16} />}
      <span>Sign Out</span>
    </button>
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <header className="w-full sticky top-0 z-40 border-b border-black/5 bg-white/90 dark:bg-brand-charcoal/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-brand-charcoal/60">
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
              {isMenuPage ? MenuLinks : (
                <>
                  {navLinks}
                  <Link
                    to="/register"
                    className="mt-1 inline-flex items-center justify-center rounded-full bg-brand-lime hover:bg-brand-limeDark text-white px-4 py-2 font-semibold shadow-soft"
                  >
                    Register
                  </Link>
                </>
              )}
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
      className="inline-flex items-center justify-center p-2 rounded-md text-brand-charcoal dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70"
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
