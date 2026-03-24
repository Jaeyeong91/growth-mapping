import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MentorAvailability, Booking, BookingStatus } from '../types';
import { generateId } from '../utils/helpers';

interface BookingContextType {
  availabilities: MentorAvailability[];
  bookings: Booking[];
  setAvailability: (mentorEmail: string, slots: { date: string; hour: number; isAvailable: boolean }[]) => void;
  getAvailability: (mentorEmail: string) => MentorAvailability[];
  createBooking: (mentorEmail: string, companyEmail: string, date: string, hour: number) => Booking | null;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  isSlotBooked: (mentorEmail: string, date: string, hour: number) => boolean;
  getBookingForSlot: (mentorEmail: string, date: string, hour: number) => Booking | undefined;
}

const BookingContext = createContext<BookingContextType | null>(null);

const AVAIL_KEY = 'gm_availabilities';
const BOOKINGS_KEY = 'gm_bookings';

function load<T>(key: string, fallback: T[]): T[] {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [availabilities, setAvailabilities] = useState<MentorAvailability[]>(() => load(AVAIL_KEY, []));
  const [bookings, setBookings] = useState<Booking[]>(() => load(BOOKINGS_KEY, []));

  useEffect(() => {
    localStorage.setItem(AVAIL_KEY, JSON.stringify(availabilities));
  }, [availabilities]);

  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const setAvailability = (mentorEmail: string, slots: { date: string; hour: number; isAvailable: boolean }[]) => {
    setAvailabilities(prev => {
      const filtered = prev.filter(a => a.mentorEmail !== mentorEmail);
      const newSlots: MentorAvailability[] = slots.map(s => ({
        mentorEmail,
        date: s.date,
        hour: s.hour,
        isAvailable: s.isAvailable,
      }));
      return [...filtered, ...newSlots];
    });
  };

  const getAvailability = (mentorEmail: string) =>
    availabilities.filter(a => a.mentorEmail === mentorEmail && a.isAvailable);

  const isSlotBooked = (mentorEmail: string, date: string, hour: number) =>
    bookings.some(b => b.mentorEmail === mentorEmail && b.date === date && b.hour === hour && b.status !== 'rejected');

  const getBookingForSlot = (mentorEmail: string, date: string, hour: number) =>
    bookings.find(b => b.mentorEmail === mentorEmail && b.date === date && b.hour === hour && b.status !== 'rejected');

  const createBooking = (mentorEmail: string, companyEmail: string, date: string, hour: number): Booking | null => {
    if (isSlotBooked(mentorEmail, date, hour)) return null;
    const now = new Date().toISOString();
    const booking: Booking = {
      id: generateId(),
      mentorEmail,
      companyEmail,
      date,
      hour,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    setBookings(prev => [...prev, booking]);
    return booking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status, updatedAt: new Date().toISOString() } : b)
    );
  };

  return (
    <BookingContext.Provider value={{
      availabilities, bookings, setAvailability, getAvailability,
      createBooking, updateBookingStatus, isSlotBooked, getBookingForSlot,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
