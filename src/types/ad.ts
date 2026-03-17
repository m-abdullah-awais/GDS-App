/**
 * GDS Driving School — Ad / Exclusive Offer Type
 * =================================================
 * Mirrors the web `Ad` type so mobile and web share
 * the same Firestore document shape.
 */

export type Ad = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  imagePosition?: string;
  link?: string;
  active: boolean;
  category?: string;
  offerCode?: string;
  fullDescription?: string;
  terms?: string;
  postcodes?: string[];
  showToStudents?: boolean;
  showToInstructors?: boolean;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  cities?: string[];
  clientName?: string;
  revenue?: number;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  amountPaid?: number;
  amountOutstanding?: number;
  views?: number;
  clicks?: number;
};
