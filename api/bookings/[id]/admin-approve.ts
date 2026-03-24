import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const bookingId = Array.isArray(id) ? id[0] : id;

  if (!bookingId) {
    return res.status(400).json({ error: 'Missing booking ID' });
  }

  // 1. 예약 조회
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.status !== 'pending') {
    return res.status(409).json({ error: 'Booking already processed', status: booking.status });
  }

  // 2. 승인 처리
  await supabase
    .from('bookings')
    .update({ status: 'approved' })
    .eq('id', bookingId);

  // 3. Google Calendar 일정 생성 시도
  let calendarCreated = false;
  let calendarError = '';

  try {
    const googleKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (googleKey) {
      const { createCalendarEvents } = await import('../../_lib/calendar.js');
      const result = await createCalendarEvents(booking);
      if (result.success) {
        calendarCreated = true;
        await supabase
          .from('bookings')
          .update({
            calendar_created: true,
            google_event_id: result.meetingEventId,
            wrapup_event_id: result.wrapupEventId,
          })
          .eq('id', bookingId);
      } else {
        calendarError = result.error || 'Unknown error';
      }
    }
  } catch (e) {
    calendarError = e instanceof Error ? e.message : 'Calendar creation failed';
  }

  return res.status(200).json({
    success: true,
    calendarCreated,
    calendarError: calendarError || undefined,
  });
}
