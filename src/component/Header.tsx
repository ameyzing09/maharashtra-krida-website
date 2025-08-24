import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Toast from "./common/Toast";
import { TailSpin } from "react-loader-spinner";
import { logout } from "../services/authService";
import useToast from "../hook/useToast";

const Header: React.FC = () => {
  const location = useLocation();
  const isMenuPage = /\/menu/.test(location.pathname);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
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

  const linkBase = "block px-3 py-2 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60";
  const isActive = (path: string) =>
    location.pathname === path ? "bg-white/15" : "";

  if (loading) return <TailSpin color="#a3e635" height={80} width={80} />;
  const CommonLinks = (
    <>
      <Link to="/" className={`${linkBase} ${isActive("/")}`}>Home</Link>
      <Link to="/about" className={`${linkBase} ${isActive("/about")}`}>About</Link>
      <Link to="/contact" className={`${linkBase} ${isActive("/contact")}`}>Contact</Link>
      <Link to="/register" className={`${linkBase} ${isActive("/register")}`}>Register</Link>
      <Link to="/upcoming-events" className={`${linkBase} ${isActive("/upcoming-events")}`}>
        Events
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
      <header className="bg-lime-400 text-white shadow-md w-full sticky top-0 z-40">
        {/* top bar */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Brand */}
            <Link to="/" className="text-lg sm:text-xl font-extrabold tracking-tight">
              <span className="sm:hidden block leading-4">
                Maharashtra<br />Krida
              </span>
              <span className="hidden sm:inline">Maharashtra Krida</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {isMenuPage ? MenuLinks : CommonLinks}
            </nav>

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
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

        {/* Mobile panel */}
        <div
          className={`md:hidden transition-[max-height] duration-300 overflow-hidden bg-lime-400/95 backdrop-blur ${open ? "max-h-96" : "max-h-0"
            }`}
        >
          <div className="mx-auto max-w-6xl px-4 pb-3">
            <nav className="flex flex-col py-2 gap-1">
              {isMenuPage ? MenuLinks : CommonLinks}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};


export default Header;
