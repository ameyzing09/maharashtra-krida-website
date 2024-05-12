// src/context/AuthContext.js

import { createContext, ReactNode, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { AuthContextType } from "../types";

const initialAuthState: AuthContextType = {
  user: null,
  status: "loading",
};

export const AuthContext = createContext(initialAuthState);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "signedIn" | "notSignedIn">(
    "loading"
  );
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
     if (user) {
        setUser(user);
        setStatus("signedIn");
      } else {
        setUser(null);
        setStatus("notSignedIn");
      }
    });

    return () => unsubscribe();
  }, [auth]); 

  return <AuthContext.Provider value={{ user, status }}>{children}</AuthContext.Provider>;
};
