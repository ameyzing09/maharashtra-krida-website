import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import useToast from "../hook/useToast";
import { TailSpin } from "react-loader-spinner";
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

  if (loading) return <TailSpin color="#a3e635" height={80} width={80} />;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="bg-gray-200 text-black px-4 py-3 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          {/* <h2 className="text-lg font-bold">{title}</h2> */}
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default MenuHeader;
