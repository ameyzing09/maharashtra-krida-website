import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../component/common/Toast";
import { login } from "../services/authService";
import { useAuth } from "../hook/useAuth";
import useToast from "../hook/useToast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { status } = useAuth();
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (status === "signedIn") {
      navigate("/menu", { replace: true });
    }
  }, [status, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await login(email, password);
      showToast("Logged in successfully", "success");
      navigate("/menu");
    } catch (error) {
      showToast("Login failed!!", "error");
    }
  };

  return (
    <>
        {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="min-h-screen flex items-center justify-center bg-brand-paper dark:bg-brand-charcoal py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="glass-panel p-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Sign in to your account
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="space-y-4">
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="glass-input w-full px-3 py-2"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="glass-input w-full px-3 py-2"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="glass-button-primary w-full py-2 px-4"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
