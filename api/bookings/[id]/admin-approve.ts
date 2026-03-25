import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase.js';
import { createCalendarLinks } from '../../_lib/calendar.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const bookingId = Array.isArray(id) ? id[0] : id;

  if (!bookingId) {
    return res.status(400).json({ error: 'Missing booking ID' });
  }

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

  // 승인 처리
  await supabase
    .from('bookings')
    .update({ status: 'approved' })
    .eq('id', bookingId);

  // 캘린더 링크 생성
  const result = await createCalendarLinks(booking);

  if (result.success) {
    await supabase
      .from('bookings')
      .update({
        calendar_created: true,
        google_event_id: result.meetingCalendarUrl,
        wrapup_event_id: result.wrapupCalendarUrl,
      })
      .eq('id', bookingId);
  }

  return res.status(200).json({
    success: true,
    calendarCreated: result.success,
    meetingCalendarUrl: result.meetingCalendarUrl,
    wrapupCalendarUrl: result.wrapupCalendarUrl,
    calendarError: result.error || undefined,
  });
}
