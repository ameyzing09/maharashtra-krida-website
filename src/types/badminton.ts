import { BadmintonCategory } from "../constants/badminton";

export type Player = {
  name: string;
  phone: string;
  /** Official / company email — mandatory. */
  officialEmail: string;
  /** Personal email — optional. */
  personalEmail?: string;
  /** Designation / employee id — optional. */
  designation?: string;
};

export type CategoryEntry = {
  /** Stable client-side id for list rendering / removal. */
  id: string;
  category: BadmintonCategory;
  /** Empty for the team event — it collects only a team name. */
  players: Player[];
  /** Team event only. */
  teamName?: string;
};

export type Organization = {
  companyName: string;
  contactPersonName: string;
  /** Official / company email — mandatory. */
  officialEmail: string;
  phone: string;
  /** Personal email — optional. */
  personalEmail?: string;
};

export type BadmintonRegistrationState = {
  step: 0 | 1 | 2 | 3;
  organization: Organization | null;
  entries: CategoryEntry[];
  orderId: string;
};

/** Payload sent to the create-badminton-order Netlify function. */
export type BadmintonOrderPayload = {
  organization: Organization;
  entries: CategoryEntry[];
};
