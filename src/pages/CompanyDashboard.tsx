import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import { formatDate, formatHour } from '../utils/helpers';
import { logCancel } from '../utils/logger';
import { Booking } from '../types';

export default function CompanyDashboard() {
  const { currentUser, users } = useAuth();
  const { bookings, getAvailability, cancelBooking } = useBooking();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [cancelModal, setCancelModal] = useState<Booking | null>(null);

  if (!currentUser) return null;

  const myBookings = bookings.filter(b => b.companyEmail === currentUser.email && b.status !== 'cancelled');
  const mentors = users.filter(u => u.role === 'mentor');

  const handleCancel = () => {
    if (!cancelModal) return;
    const mentor = users.find(u => u.email === cancelModal.mentorEmail);
    logCancel(
      currentUser.email, currentUser.name,
      cancelModal.mentorEmail, mentor?.name || cancelModal.mentorEmail,
      cancelModal.date, formatHour(cancelModal.hour),
    );
    cancelBooking(cancelModal.id);
    setCancelModal(null);
    showToast('예약이 취소되었습니다.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">기업 대시보드</h1>

        {/* 멘토 카드 리스트 */}
        <h2 className="text-lg font-semibold text-gray-800 mb-3">멘토 선택</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mentors.map(mentor => {
            const availSlots = getAvailability(mentor.email);
            const bookedCount = bookings.filter(b => b.mentorEmail === mentor.email && b.status !== 'rejected' && b.status !== 'cancelled').length;
            const openCount = availSlots.length - bookedCount;
            return (
              <button
                key={mentor.email}
                onClick={() => navigate(`/company/mentor/${encodeURIComponent(mentor.email)}`)}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{mentor.name}</h3>
                  {openCount > 0 && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {openCount}개 가능
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{mentor.email}</p>
              </button>
            );
          })}
        </div>

        {/* 내 예약 목록 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">내 예약 목록</h2>
          </div>
          {myBookings.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-400">예약된 미팅이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">멘토명</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">날짜</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">시간</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">상태</th>
                    <th className="text-center px-6 py-3 text-gray-500 font-medium">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myBookings
                    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour)
                    .map(b => {
                      const mentor = users.find(u => u.email === b.mentorEmail);
                      return (
                        <tr key={b.id}>
                          <td className="px-6 py-3">{mentor?.name || b.mentorEmail}</td>
                          <td className="px-6 py-3">{formatDate(b.date)}</td>
                          <td className="px-6 py-3">{formatHour(b.hour)} ~ {formatHour(b.hour + 1)}</td>
                          <td className="px-6 py-3"><StatusBadge status={b.status} /></td>
                          <td className="px-6 py-3 text-center">
                            {b.status === 'pending' ? (
                              <button
                                onClick={() => setCancelModal(b)}
                                className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 transition"
                              >
                                취소
                              </button>
                            ) : (
                              <span className="text-gray-300 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 취소 확인 모달 */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">예약 취소 확인</h3>
            <p className="text-sm text-gray-600 mb-4">아래 예약을 취소하시겠습니까?</p>
            <div className="space-y-2 text-sm text-gray-700 mb-6 bg-gray-50 rounded-lg p-4">
              <p><span className="font-medium">멘토:</span> {users.find(u => u.email === cancelModal.mentorEmail)?.name || cancelModal.mentorEmail}</p>
              <p><span className="font-medium">날짜:</span> {formatDate(cancelModal.date)}</p>
              <p><span className="font-medium">시간:</span> {formatHour(cancelModal.hour)} ~ {formatHour(cancelModal.hour + 1)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                돌아가기
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                예약 취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  const labels = { pending: '대기중', approved: '승인됨', rejected: '거절됨', cancelled: '취소됨' };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || ''}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
