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
      <div className="min-h-screen flex items-center justify-center bg-transparent py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-brand-charcoal dark:text-white">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-2xl border border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-white/10 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-brand-slate rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-white/10 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 dark:bg-brand-slate rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2.5 px-4 border border-white/10 rounded-full text-sm font-semibold text-brand-charcoal bg-brand-lime hover:bg-brand-limeDark shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
