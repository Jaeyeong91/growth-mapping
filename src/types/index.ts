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
  googleEventId?: string;
  wrapupEventId?: string;
  chatMessageId?: string;
  chatNotified?: boolean;
  calendarCreated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyManagerMapping {
  id: string;
  companyEmail: string;
  managerName: string;
  managerEmail: string;
  googleChatWebhook?: string;
  createdAt: string;
}
