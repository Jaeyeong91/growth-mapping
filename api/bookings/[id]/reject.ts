import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../_lib/supabase.js';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const bookingId = Array.isArray(id) ? id[0] : id;

  if (!bookingId) {
    return res.status(400).send(resultPage('오류', '잘못된 요청입니다.', 'error'));
  }

  // 1. 예약 조회
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    return res.status(404).send(resultPage('오류', '예약을 찾을 수 없습니다.', 'error'));
  }

  // 2. 이미 처리된 건인지 확인
  if (booking.status !== 'pending') {
    const statusLabels: Record<string, string> = {
      approved: '승인됨', rejected: '반려됨', cancelled: '취소됨',
    };
    return res.status(200).send(
      resultPage('이미 처리된 신청', `이 미팅 신청은 이미 "${statusLabels[booking.status] || booking.status}" 상태입니다.`, 'info')
    );
  }

  // 3. 반려 처리
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'rejected' })
    .eq('id', bookingId);

  if (updateError) {
    return res.status(500).send(resultPage('오류', '반려 처리 중 오류가 발생했습니다.', 'error'));
  }

  // 4. 기업명, 멘토명 조회
  const { data: companyUser } = await supabase
    .from('users').select('name').eq('email', booking.company_email).single();
  const { data: mentorUser } = await supabase
    .from('users').select('name').eq('email', booking.mentor_email).single();

  const companyName = escapeHtml(companyUser?.name || booking.company_email);
  const mentorName = escapeHtml(mentorUser?.name || booking.mentor_email);
  const hourStr = `${String(booking.hour).padStart(2, '0')}:00`;
  const endHourStr = `${String(booking.hour + 1).padStart(2, '0')}:00`;

  return res.status(200).send(resultPage(
    '반려 완료',
    `<strong>${companyName}</strong>의 미팅 신청이 반려되었습니다.<br><br>
    <div style="background:#f9fafb;padding:12px;border-radius:8px;margin:12px 0;">
      <p>📅 <strong>멘토:</strong> ${mentorName}</p>
      <p>📅 <strong>일정:</strong> ${booking.date} ${hourStr} ~ ${endHourStr}</p>
    </div>
    <p style="color:#6b7280;font-size:13px;">해당 슬롯은 다시 예약 가능 상태가 됩니다.</p>`,
    'success',
  ));
}

function resultPage(title: string, message: string, type: 'success' | 'error' | 'info') {
  const colors = {
    success: { bg: '#f0fdf4', border: '#16a34a', icon: '✅' },
    error: { bg: '#fef2f2', border: '#dc2626', icon: '❌' },
    info: { bg: '#eff6ff', border: '#2563eb', icon: 'ℹ️' },
  };
  const c = colors[type];
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title} - 그로스맵핑</title>
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:480px;width:90%;padding:32px;text-align:center;}
    .icon{font-size:48px;margin-bottom:16px;}
    h1{font-size:22px;color:#1a1a1a;margin:0 0 16px;}
    .msg{color:#374151;font-size:15px;line-height:1.6;}
    .msg p{margin:4px 0;}
    a.btn{display:inline-block;margin-top:20px;padding:10px 24px;background:#FF5E27;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;}
    a.btn:hover{background:#e5511f;}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${c.icon}</div>
    <h1>${title}</h1>
    <div class="msg">${message}</div>
    <a class="btn" href="https://growth-mapping.vercel.app">대시보드로 이동</a>
  </div>
</body>
</html>`;
}
