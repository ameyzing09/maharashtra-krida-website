import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "./common/Toast";
import { TailSpin } from "react-loader-spinner";
import { logout } from "../services/authService";
import useToast from "../hook/useToast";

const Header: React.FC = () => {
  const location = useLocation();
  const isMenuPage = /\/menu/.test(location.pathname);

  const [loading, setLoading] = useState(false);
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

  if (loading) return <TailSpin color="#a3e635" height={80} width={80} />;
  const renderHeaderItems = () => {
    if (isMenuPage) {
      return (
        <ul className="flex space-x-4">
          <li>
            <a
              href="/login"
              className="hover:text-vivid-orange-500"
              onClick={handleSignOut}
            >
              Sign Out
            </a>
          </li>
        </ul>
      );
    } else {
      return (
        <ul className="flex space-x-4">
          <li>
            <a href="/" className="hover:text-vivid-orange-500">
              Home
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-vivid-orange-500">
              About
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:text-vivid-orange-500">
              Contact
            </a>
          </li>
          <li>
            <a href="/upcoming-events" className="hover:text-vivid-orange-500">
              Events
            </a>
          </li>
        </ul>
      );
    }
  };
  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <header className="bg-lime-400 text-white p-4 shadow-md w-full">
        <div className="container mx-auto flex justify-between items-center">
          <li className="text-xl font-bold list-none cursor-pointer"><a href="/">Maharashtra Krida</a></li>
          <nav>{renderHeaderItems()}</nav>
        </div>
      </header>
    </>
  );
};

export default Header;
