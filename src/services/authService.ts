import {
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { toServiceError } from "./error";

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
    // eslint-disable-next-line no-console
    console.error("Login failed:", error);
    throw toServiceError(error, 'Login failed');
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw toServiceError(error, 'Logout failed');
  }
};
