import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import useToast from "../hook/useToast";
import PageLoader from "./PageLoader";
import Toast from "./common/Toast";

const MenuHeader: React.FC = () => {
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

  if (loading) return <PageLoader variant="overlay" label="Signing out..." />;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="px-4 py-3 shadow-md bg-white dark:bg-brand-charcoal text-brand-charcoal dark:text-gray-200 border-b border-black/5 dark:border-white/10">
        <div className="container mx-auto flex justify-between items-center">
          {/* <h2 className="text-lg font-bold">{title}</h2> */}
          <button
            onClick={handleSignOut}
            className="rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 transition-transform active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default MenuHeader;
