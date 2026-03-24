import { google } from 'googleapis';
import { supabase } from './supabase.js';

interface BookingRow {
  id: string;
  mentor_email: string;
  company_email: string;
  date: string;
  hour: number;
}

interface CalendarResult {
  success: boolean;
  meetingEventId?: string;
  wrapupEventId?: string;
  error?: string;
}

function getCalendarClient() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not set');

  const key = JSON.parse(keyJson);
  const auth = new google.auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
    subject: process.env.GOOGLE_CALENDAR_DELEGATE_EMAIL || undefined,
  });
  return google.calendar({ version: 'v3', auth });
}

export async function createCalendarEvents(booking: BookingRow): Promise<CalendarResult> {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    // 사용자 정보 조회
    const { data: companyUser } = await supabase
      .from('users').select('name, email').eq('email', booking.company_email).single();
    const { data: mentorUser } = await supabase
      .from('users').select('name, email').eq('email', booking.mentor_email).single();
    const { data: mapping } = await supabase
      .from('company_manager_mapping').select('*').eq('company_email', booking.company_email).single();

    const companyName = companyUser?.name || booking.company_email;
    const mentorName = mentorUser?.name || booking.mentor_email;

    // 시간 계산
    const startHour = String(booking.hour).padStart(2, '0');
    const endHour = String(booking.hour + 1).padStart(2, '0');
    const wrapupEndHour = String(booking.hour + 2).padStart(2, '0');

    const startTime = `${booking.date}T${startHour}:00:00+09:00`;
    const endTime = `${booking.date}T${endHour}:00:00+09:00`;
    const wrapupEndTime = `${booking.date}T${wrapupEndHour}:00:00+09:00`;

    // 참석자 목록
    const meetingAttendees = [
      { email: booking.company_email },
      { email: booking.mentor_email },
    ];
    const wrapupAttendees = [
      { email: booking.company_email },
    ];
    if (mapping?.manager_email) {
      meetingAttendees.push({ email: mapping.manager_email });
      wrapupAttendees.push({ email: mapping.manager_email });
    }

    // 1. 미팅 캘린더 일정 생성
    const meetingEvent = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: `[그로스맵핑] ${companyName} x ${mentorName}`,
        description: `그로스맵핑 멘토링 미팅\n\n참여기업: ${companyName}\n멘토: ${mentorName}\n담당매니저: ${mapping?.manager_name || '미지정'}`,
        start: { dateTime: startTime, timeZone: 'Asia/Seoul' },
        end: { dateTime: endTime, timeZone: 'Asia/Seoul' },
        attendees: meetingAttendees,
        conferenceData: {
          createRequest: {
            requestId: `gm-meeting-${booking.id}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 30 }],
        },
      },
    });

    // 2. Wrap-up 캘린더 일정 생성
    const wrapupEvent = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: `[그로스맵핑 Wrap-up] ${companyName}`,
        description: `그로스맵핑 멘토링 후속 논의\n\n참여기업: ${companyName}\n담당매니저: ${mapping?.manager_name || '미지정'}\n\n* 멘토는 이 미팅에 참석하지 않습니다.`,
        start: { dateTime: endTime, timeZone: 'Asia/Seoul' },
        end: { dateTime: wrapupEndTime, timeZone: 'Asia/Seoul' },
        attendees: wrapupAttendees,
        conferenceData: {
          createRequest: {
            requestId: `gm-wrapup-${booking.id}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 10 }],
        },
      },
    });

    return {
      success: true,
      meetingEventId: meetingEvent.data.id || undefined,
      wrapupEventId: wrapupEvent.data.id || undefined,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('Calendar creation failed:', message);
    return { success: false, error: message };
  }
}
