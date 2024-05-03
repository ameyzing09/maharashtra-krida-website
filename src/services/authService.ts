import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

export const login = async (email: string, password: string) => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};
