import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MentorAvailability, Booking, BookingStatus } from '../types';
import { generateId } from '../utils/helpers';

interface BookingContextType {
  availabilities: MentorAvailability[];
  bookings: Booking[];
  blockedSlots: Set<string>;
  setAvailability: (mentorEmail: string, slots: { date: string; hour: number; isAvailable: boolean }[]) => void;
  getAvailability: (mentorEmail: string) => MentorAvailability[];
  createBooking: (mentorEmail: string, companyEmail: string, date: string, hour: number) => Booking | null;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string) => void;
  isSlotBooked: (mentorEmail: string, date: string, hour: number) => boolean;
  getBookingForSlot: (mentorEmail: string, date: string, hour: number) => Booking | undefined;
  toggleBlockSlot: (mentorEmail: string, date: string, hour: number) => void;
  isSlotBlocked: (mentorEmail: string, date: string, hour: number) => boolean;
}

const BookingContext = createContext<BookingContextType | null>(null);

const AVAIL_KEY = 'gm_availabilities';
const BOOKINGS_KEY = 'gm_bookings';
const BLOCKED_KEY = 'gm_blocked_slots';

function load<T>(key: string, fallback: T[]): T[] {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [availabilities, setAvailabilities] = useState<MentorAvailability[]>(() => load(AVAIL_KEY, []));
  const [bookings, setBookings] = useState<Booking[]>(() => load(BOOKINGS_KEY, []));
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(BLOCKED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem(AVAIL_KEY, JSON.stringify(availabilities));
  }, [availabilities]);

  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(BLOCKED_KEY, JSON.stringify([...blockedSlots]));
  }, [blockedSlots]);

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
    bookings.some(b => b.mentorEmail === mentorEmail && b.date === date && b.hour === hour && b.status !== 'rejected' && b.status !== 'cancelled');

  const getBookingForSlot = (mentorEmail: string, date: string, hour: number) =>
    bookings.find(b => b.mentorEmail === mentorEmail && b.date === date && b.hour === hour && b.status !== 'rejected' && b.status !== 'cancelled');

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

  const cancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId && b.status === 'pending'
        ? { ...b, status: 'cancelled' as BookingStatus, updatedAt: new Date().toISOString() }
        : b)
    );
  };

  const isSlotBlocked = (mentorEmail: string, date: string, hour: number) =>
    blockedSlots.has(`${mentorEmail}_${date}_${hour}`);

  const toggleBlockSlot = (mentorEmail: string, date: string, hour: number) => {
    const key = `${mentorEmail}_${date}_${hour}`;
    setBlockedSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <BookingContext.Provider value={{
      availabilities, bookings, blockedSlots, setAvailability, getAvailability,
      createBooking, updateBookingStatus, cancelBooking, isSlotBooked, getBookingForSlot,
      toggleBlockSlot, isSlotBlocked,
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
