import { User } from "firebase/auth";

export interface EventProps {
  id: string;
  name: string;
  sport: string;
  date: string;
  location: string;
  imageUrl: string;
  flyerUrl?: string;
  description: string;
}

export interface AuthContextType {
  user: User | null;
  status: "loading" | "signedIn" | "notSignedIn";
}
