import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mentorEmail, companyEmail, date, hour } = req.body;

  if (!mentorEmail || !companyEmail || !date || hour === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1. 이미 예약된 슬롯인지 확인
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('mentor_email', mentorEmail)
    .eq('date', date)
    .eq('hour', hour)
    .not('status', 'in', '("rejected","cancelled")')
    .limit(1);

  if (existing && existing.length > 0) {
    return res.status(409).json({ error: 'Slot already booked' });
  }

  // 2. 예약 생성
  const { data: booking, error: bookingError } = await supabase
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

  if (bookingError || !booking) {
    return res.status(500).json({ error: 'Failed to create booking', detail: bookingError?.message });
  }

  // 3. 담당 매니저 매칭 조회
  const { data: mapping } = await supabase
    .from('company_manager_mapping')
    .select('*')
    .eq('company_email', companyEmail)
    .single();

  let chatNotified = false;

  // 4. Webhook URL이 있으면 Google Chat 알림 전송
  if (mapping?.google_chat_webhook) {
    // 기업명, 멘토명 조회
    const { data: companyUser } = await supabase
      .from('users')
      .select('name')
      .eq('email', companyEmail)
      .single();
    const { data: mentorUser } = await supabase
      .from('users')
      .select('name')
      .eq('email', mentorEmail)
      .single();

    const companyName = companyUser?.name || companyEmail;
    const mentorName = mentorUser?.name || mentorEmail;
    const baseUrl = process.env.APP_BASE_URL || 'https://growth-mapping.vercel.app';
    const hourStr = `${String(hour).padStart(2, '0')}:00`;
    const endHourStr = `${String(hour + 1).padStart(2, '0')}:00`;

    const chatPayload = {
      cardsV2: [{
        cardId: `booking_${booking.id}`,
        card: {
          header: {
            title: '📅 그로스맵핑 미팅 신청',
            subtitle: '승인 대기 중',
          },
          sections: [{
            widgets: [
              { decoratedText: { topLabel: '참여기업', text: companyName } },
              { decoratedText: { topLabel: '멘토', text: mentorName } },
              { decoratedText: { topLabel: '신청 일정', text: `${date} ${hourStr} ~ ${endHourStr}` } },
              { decoratedText: { topLabel: '담당 매니저', text: `${mapping.manager_name}` } },
              {
                buttonList: {
                  buttons: [
                    {
                      text: '🔗 앱에서 확인',
                      onClick: {
                        openLink: {
                          url: `${baseUrl}/admin`,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          }],
        },
      }],
    };

    // Webhook 전송 (최대 3회 재시도)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const chatRes = await fetch(mapping.google_chat_webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chatPayload),
        });
        if (chatRes.ok) {
          chatNotified = true;
          break;
        }
      } catch {
        // 재시도 간격: 1초, 5초
        const delays = [1000, 5000];
        if (attempt < delays.length) {
          await new Promise(r => setTimeout(r, delays[attempt]));
        }
      }
    }

    // Chat 알림 전송 결과 업데이트
    await supabase
      .from('bookings')
      .update({ chat_notified: chatNotified })
      .eq('id', booking.id);
  }

  return res.status(201).json({
    booking: {
      id: booking.id,
      mentorEmail: booking.mentor_email,
      companyEmail: booking.company_email,
      date: booking.date,
      hour: booking.hour,
      status: booking.status,
      chatNotified,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
    },
  });
}
