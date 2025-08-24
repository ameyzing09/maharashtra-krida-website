import { createContext, useReducer } from "react";
import { Attendee, PriceBreakup, RegistrationState } from "../types/registration";

type RegistrationAction =
    | { type: 'SET_ATTENDEE', payload: Attendee }
    | { type: 'SET_PRICE_BREAKUP', payload: PriceBreakup }
    | { type: 'SET_EVENT', payload: string }
    | { type: 'SET_ORDER', payload: string }
    | { type: 'NEXT' }
    | { type: 'BACK' }
    | { type: 'RESET' };

const initial: RegistrationState = {
    step: 0,
    attendee: null,
    priceBreakup: { registrationFee: 0},
    eventId: '',
    orderId: '',
};

function reducer(state: RegistrationState, action: RegistrationAction): RegistrationState {
    switch (action.type) {
        case 'SET_ATTENDEE':
            return { ...state, attendee: action.payload };
        case 'SET_PRICE_BREAKUP':
            return { ...state, priceBreakup: action.payload };
        case 'SET_EVENT':
            return { ...state, eventId: action.payload };
        case 'SET_ORDER':
            return { ...state, orderId: action.payload };
        case 'NEXT':
            return { ...state, step: (state.step + 1) as RegistrationState['step'] };
        case 'BACK':
            return { ...state, step: (state.step - 1) as RegistrationState['step'] };
        case 'RESET':
            return initial
        default:
            return state;
    }
}

export const RegistrationContext = createContext<{
    state: RegistrationState;
    dispatch: React.Dispatch<RegistrationAction>;
} | null>(null)

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initial);
    return (
        <RegistrationContext.Provider value={{ state, dispatch }}>
            {children}
        </RegistrationContext.Provider>
    );
}