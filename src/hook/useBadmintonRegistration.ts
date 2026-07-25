import { useContext } from "react";
import { BadmintonRegistrationContext } from "../context/badmintonRegistrationContext";

export const useBadmintonRegistration = () => {
  const context = useContext(BadmintonRegistrationContext);
  if (!context) {
    throw new Error(
      "useBadmintonRegistration must be used within a BadmintonRegistrationProvider"
    );
  }
  return context;
};
