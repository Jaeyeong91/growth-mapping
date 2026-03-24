import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MentorAvailability, Booking, BookingStatus } from '../types';
import { supabase } from '../lib/supabase';

interface BookingContextType {
  availabilities: MentorAvailability[];
  bookings: Booking[];
  loading: boolean;
  setAvailability: (mentorEmail: string, slots: { date: string; hour: number; isAvailable: boolean }[]) => Promise<boolean>;
  getAvailability: (mentorEmail: string) => MentorAvailability[];
  createBooking: (mentorEmail: string, companyEmail: string, date: string, hour: number) => Promise<Booking | null>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  isSlotBooked: (mentorEmail: string, date: string, hour: number) => boolean;
  getBookingForSlot: (mentorEmail: string, date: string, hour: number) => Booking | undefined;
  toggleBlockSlot: (mentorEmail: string, date: string, hour: number) => Promise<boolean>;
  isSlotBlocked: (mentorEmail: string, date: string, hour: number) => boolean;
  refreshBookings: () => Promise<void>;
  refreshAvailabilities: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [availabilities, setAvailabilities] = useState<MentorAvailability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const refreshAvailabilities = useCallback(async () => {
    const { data, error } = await supabase
      .from('mentor_availabilities')
      .select('*')
      .eq('is_available', true);
    if (error) {
      console.error('일정 조회 실패:', error.message);
      return;
    }
    if (data) {
      setAvailabilities(data.map(row => ({
        mentorEmail: row.mentor_email,
        date: row.date,
        hour: row.hour,
        isAvailable: row.is_available,
      })));
    }
  }, []);

  const refreshBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('예약 조회 실패:', error.message);
      return;
    }
    if (data) {
      setBookings(data.map(row => ({
        id: row.id,
        mentorEmail: row.mentor_email,
        companyEmail: row.company_email,
        date: row.date,
        hour: row.hour,
        status: row.status as BookingStatus,
        googleEventId: row.google_event_id,
        wrapupEventId: row.wrapup_event_id,
        chatMessageId: row.chat_message_id,
        chatNotified: row.chat_notified,
        calendarCreated: row.calendar_created,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })));
    }
  }, []);

  const refreshBlockedSlots = useCallback(async () => {
    const { data, error } = await supabase.from('blocked_slots').select('*');
    if (error) {
      console.error('블록 슬롯 조회 실패:', error.message);
      return;
    }
    if (data) {
      setBlockedSlots(new Set(data.map(row => `${row.mentor_email}_${row.date}_${row.hour}`)));
    }
  }, []);

  useEffect(() => {
    Promise.all([refreshAvailabilities(), refreshBookings(), refreshBlockedSlots()])
      .then(() => setLoading(false));
  }, [refreshAvailabilities, refreshBookings, refreshBlockedSlots]);

  const setAvailability = async (mentorEmail: string, slots: { date: string; hour: number; isAvailable: boolean }[]): Promise<boolean> => {
    const { error: delError } = await supabase
      .from('mentor_availabilities')
      .delete()
      .eq('mentor_email', mentorEmail);
    if (delError) {
      console.error('일정 삭제 실패:', delError.message);
      return false;
    }

    if (slots.length > 0) {
      const { error: insError } = await supabase
        .from('mentor_availabilities')
        .insert(slots.map(s => ({
          mentor_email: mentorEmail,
          date: s.date,
          hour: s.hour,
          is_available: s.isAvailable,
        })));
      if (insError) {
        console.error('일정 저장 실패:', insError.message);
        return false;
      }
    }
    await refreshAvailabilities();
    return true;
  };

  const getAvailability = (mentorEmail: string) =>
    availabilities.filter(a => a.mentorEmail === mentorEmail && a.isAvailable);

  const isSlotBooked = (mentorEmail: string, date: string, hour: number) =>
    bookings.some(b => b.mentorEmail === mentorEmail && b.date === date && b.hour === hour && b.status !== 'rejected' && b.status !== 'cancelled');

  const getBookingForSlot = (mentorEmail: string, date: string, hour: number) =>
    bookings.find(b => b.mentorEmail === mentorEmail && b.date === date && b.hour === hour && b.status !== 'rejected' && b.status !== 'cancelled');

  const createBooking = async (mentorEmail: string, companyEmail: string, date: string, hour: number): Promise<Booking | null> => {
    if (isSlotBooked(mentorEmail, date, hour)) return null;
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        mentor_email: mentorEmail,
        company_email: companyEmail,
        date,
        hour,
        status: 'pending',
      })
      .select()
      .single();
    if (error || !data) {
      console.error('예약 생성 실패:', error?.message);
      return null;
    }
    const booking: Booking = {
      id: data.id,
      mentorEmail: data.mentor_email,
      companyEmail: data.company_email,
      date: data.date,
      hour: data.hour,
      status: data.status as BookingStatus,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    await refreshBookings();
    return booking;
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus): Promise<boolean> => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
    if (error) {
      console.error('예약 상태 변경 실패:', error.message);
      return false;
    }
    await refreshBookings();
    return true;
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('status', 'pending');
    if (error) {
      console.error('예약 취소 실패:', error.message);
      return false;
    }
    await refreshBookings();
    return true;
  };

  const isSlotBlocked = (mentorEmail: string, date: string, hour: number) =>
    blockedSlots.has(`${mentorEmail}_${date}_${hour}`);

  const toggleBlockSlot = async (mentorEmail: string, date: string, hour: number): Promise<boolean> => {
    const key = `${mentorEmail}_${date}_${hour}`;
    if (blockedSlots.has(key)) {
      const { error } = await supabase
        .from('blocked_slots')
        .delete()
        .eq('mentor_email', mentorEmail)
        .eq('date', date)
        .eq('hour', hour);
      if (error) {
        console.error('블록 해제 실패:', error.message);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('blocked_slots')
        .insert({ mentor_email: mentorEmail, date, hour });
      if (error) {
        console.error('블록 설정 실패:', error.message);
        return false;
      }
    }
    await refreshBlockedSlots();
    return true;
  };

  return (
    <BookingContext.Provider value={{
      availabilities, bookings, loading,
      setAvailability, getAvailability,
      createBooking, updateBookingStatus, cancelBooking,
      isSlotBooked, getBookingForSlot,
      toggleBlockSlot, isSlotBlocked,
      refreshBookings, refreshAvailabilities,
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
