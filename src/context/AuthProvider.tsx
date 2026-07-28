import { ReactNode, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "./authContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "signedIn" | "notSignedIn">(
    "loading"
  );

  useEffect(() => {
    // Seed from the persisted session, then follow auth state changes.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        setStatus("signedIn");
      } else {
        setUser(null);
        setStatus("notSignedIn");
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setStatus("signedIn");
      } else {
        setUser(null);
        setStatus("notSignedIn");
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, status }}>{children}</AuthContext.Provider>;
};
