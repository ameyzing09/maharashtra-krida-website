import { useContext } from "react";
import { RegistrationContext } from "../context/registrationContext";

export const useRegistrationContext = () => {
    const context = useContext(RegistrationContext);
    if(!context) {
        throw new Error("useRegistrationContext must be used within a RegistrationProvider");
    }
    return context;
}