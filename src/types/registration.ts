export type Attendee = {
    name: string;
    companyEmail: string;
    phone: string;
    other?: string;
}

export type PriceBreakup = {
    registrationFee: number;
}

export type RegistrationState = {
    step : 0 | 1 | 2 | 3;
    attendee: Attendee | null;
    priceBreakup: PriceBreakup;
    eventId: string;
    orderId: string;
}