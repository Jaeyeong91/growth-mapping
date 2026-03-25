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
  meetingCalendarUrl?: string;
  wrapupCalendarUrl?: string;
  error?: string;
}

function toGoogleCalendarUrl(params: {
  title: string;
  description: string;
  startDate: string;
  startHour: number;
  durationHours: number;
  attendeeEmails?: string[];
}): string {
  // Google Calendar URL 형식: YYYYMMDDTHHMMSS
  const dateStr = params.startDate.replace(/-/g, '');
  const startH = String(params.startHour).padStart(2, '0');
  const endH = String(params.startHour + params.durationHours).padStart(2, '0');

  // KST → UTC 변환 (-9시간)
  const utcStartH = params.startHour - 9;
  const utcEndH = utcStartH + params.durationHours;

  // 날짜가 바뀔 수 있으므로 Date 객체 사용
  const start = new Date(`${params.startDate}T${startH}:00:00+09:00`);
  const end = new Date(start.getTime() + params.durationHours * 60 * 60 * 1000);

  const fmt = (d: Date) =>
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0') + 'T' +
    String(d.getUTCHours()).padStart(2, '0') +
    String(d.getUTCMinutes()).padStart(2, '0') +
    String(d.getUTCSeconds()).padStart(2, '0') + 'Z';

  const dates = `${fmt(start)}/${fmt(end)}`;

  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates,
    details: params.description,
    ctz: 'Asia/Seoul',
  });

  if (params.attendeeEmails && params.attendeeEmails.length > 0) {
    query.set('add', params.attendeeEmails.join(','));
  }

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

export async function createCalendarLinks(booking: BookingRow): Promise<CalendarResult> {
  try {
    // 사용자 정보 조회
    const { data: companyUser } = await supabase
      .from('users').select('name, email').eq('email', booking.company_email).single();
    const { data: mentorUser } = await supabase
      .from('users').select('name, email').eq('email', booking.mentor_email).single();
    const { data: mapping } = await supabase
      .from('company_manager_mapping').select('*').eq('company_email', booking.company_email).single();

    const companyName = companyUser?.name || booking.company_email;
    const mentorName = mentorUser?.name || booking.mentor_email;
    const managerInfo = mapping?.manager_name ? `${mapping.manager_name} (${mapping.manager_email})` : '미지정';

    // 참석자 이메일 목록
    const meetingAttendees = [booking.company_email, booking.mentor_email];
    const wrapupAttendees = [booking.company_email];
    if (mapping?.manager_email) {
      meetingAttendees.push(mapping.manager_email);
      wrapupAttendees.push(mapping.manager_email);
    }

    // 미팅 캘린더 링크
    const meetingCalendarUrl = toGoogleCalendarUrl({
      title: `[그로스맵핑] ${companyName} x ${mentorName}`,
      description: `그로스맵핑 멘토링 미팅\n\n참여기업: ${companyName} (${booking.company_email})\n멘토: ${mentorName} (${booking.mentor_email})\n담당매니저: ${managerInfo}`,
      startDate: booking.date,
      startHour: booking.hour,
      durationHours: 1,
      attendeeEmails: meetingAttendees,
    });

    // Wrap-up 캘린더 링크
    const wrapupCalendarUrl = toGoogleCalendarUrl({
      title: `[그로스맵핑 Wrap-up] ${companyName}`,
      description: `그로스맵핑 멘토링 후속 논의\n\n참여기업: ${companyName} (${booking.company_email})\n담당매니저: ${managerInfo}\n\n※ 멘토는 이 미팅에 참석하지 않습니다.`,
      startDate: booking.date,
      startHour: booking.hour + 1,
      durationHours: 1,
      attendeeEmails: wrapupAttendees,
    });

    return {
      success: true,
      meetingCalendarUrl,
      wrapupCalendarUrl,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('Calendar link creation failed:', message);
    return { success: false, error: message };
  }
}
