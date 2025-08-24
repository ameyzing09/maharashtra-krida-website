import { User } from "firebase/auth";

export interface EventProps {
  id: string;
  name: string;
  sport: string;
  date: string;
  location: string;
  imageUrl: string;
  flyerUrl?: string;
  registrationUrl?: string;
  description: string;
}

export interface SliderImageInput {
  imageUrl: string;
  alt: string;
  title: string;
  description: string;
}

export interface SliderImage extends SliderImageInput {
  id: string;
}
export interface AuthContextType {
  user: User | null;
  status: "loading" | "signedIn" | "notSignedIn";
}
