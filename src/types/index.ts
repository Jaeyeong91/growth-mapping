export type Role = 'mentor' | 'company' | 'admin';

export interface User {
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface MentorAvailability {
  mentorEmail: string;
  date: string; // YYYY-MM-DD
  hour: number; // 9~17
  isAvailable: boolean;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Booking {
  id: string;
  mentorEmail: string;
  companyEmail: string;
  date: string; // YYYY-MM-DD
  hour: number; // 9~17
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}
