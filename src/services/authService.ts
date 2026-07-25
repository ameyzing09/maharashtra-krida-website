import { supabase } from "./supabaseClient";
import { toServiceError } from "./error";

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw toServiceError(error, "Login failed");
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw toServiceError(error, "Logout failed");
  }
};
