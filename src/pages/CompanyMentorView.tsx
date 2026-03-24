import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import { WEEK_GROUPS, TIME_SLOTS } from '../data/initialData';
import { formatDate, formatHour } from '../utils/helpers';
import { logBooking } from '../utils/logger';

export default function CompanyMentorView() {
  const { id } = useParams<{ id: string }>();
  const mentorEmail = decodeURIComponent(id || '');
  const { currentUser, users } = useAuth();
  const { getAvailability, isSlotBooked, isSlotBlocked, refreshBookings } = useBooking();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [modal, setModal] = useState<{ date: string; hour: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) return null;

  const mentor = users.find(u => u.email === mentorEmail);
  const availSlots = getAvailability(mentorEmail);
  const availSet = new Set(availSlots.map(a => `${a.date}_${a.hour}`));

  const handleBook = async () => {
    if (!modal) return;
    setSubmitting(true);
    try {
      // API를 통해 예약 생성 + Chat 알림 전송
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorEmail,
          companyEmail: currentUser.email,
          date: modal.date,
          hour: modal.hour,
        }),
      });
      if (response.ok) {
        logBooking(currentUser.email, currentUser.name, mentorEmail, mentor?.name || mentorEmail, modal.date, formatHour(modal.hour));
        // BookingContext 새로고침
        await refreshBookings();
        setModal(null);
        showToast('예약이 신청되었습니다. 관리자 승인을 기다려주세요.', 'success');
        navigate('/company');
      } else if (response.status === 409) {
        setModal(null);
        showToast('이미 예약된 슬롯입니다.', 'error');
      } else {
        setModal(null);
        showToast('예약 처리 중 오류가 발생했습니다.', 'error');
      }
    } catch {
      setModal(null);
      showToast('네트워크 오류가 발생했습니다.', 'error');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/company')} className="text-gray-500 hover:text-gray-700">
            &larr; 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{mentor?.name || mentorEmail} 일정</h1>
        </div>

        <div className="flex gap-4 mb-4 text-sm text-gray-600">
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#FF5E27] inline-block"></span> 예약 가능</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-400 inline-block"></span> 예약됨</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-100 inline-block border"></span> 미팅 불가</span>
        </div>

        {WEEK_GROUPS.map(week => (
          <div key={week.label} className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{week.label}</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-gray-500 font-medium w-20">시간</th>
                    {week.dates.map(d => (
                      <th key={d} className="px-3 py-2 text-center text-gray-500 font-medium">{formatDate(d)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {TIME_SLOTS.map(hour => (
                    <tr key={hour}>
                      <td className="px-3 py-2 text-gray-600 font-medium">{formatHour(hour)}</td>
                      {week.dates.map(date => {
                        const key = `${date}_${hour}`;
                        const available = availSet.has(key);
                        const booked = isSlotBooked(mentorEmail, date, hour);
                        const blocked = isSlotBlocked(mentorEmail, date, hour);
                        return (
                          <td key={key} className="px-1 py-1 text-center">
                            {available && !booked && !blocked ? (
                              <button
                                onClick={() => setModal({ date, hour })}
                                className="w-full py-2 rounded text-xs font-medium bg-[#FF5E27] text-white hover:bg-[#e5511f] transition"
                              >
                                예약
                              </button>
                            ) : booked || blocked ? (
                              <span className="block w-full py-2 rounded text-xs font-medium bg-gray-400 text-white">
                                {booked ? '예약됨' : '블록'}
                              </span>
                            ) : (
                              <span className="block w-full py-2 rounded text-xs text-gray-300 bg-gray-50">
                                -
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">예약 확인</h3>
            <div className="space-y-2 text-sm text-gray-700 mb-6">
              <p><span className="font-medium">멘토:</span> {mentor?.name || mentorEmail}</p>
              <p><span className="font-medium">날짜:</span> {formatDate(modal.date)}</p>
              <p><span className="font-medium">시간:</span> {formatHour(modal.hour)} ~ {formatHour(modal.hour + 1)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                onClick={handleBook}
                disabled={submitting}
                className="flex-1 py-2 bg-[#FF5E27] text-white rounded-lg hover:bg-[#e5511f] transition disabled:opacity-50"
              >
                {submitting ? '처리중...' : '예약 신청'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
