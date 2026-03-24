import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import Header from '../components/Header';
import { formatDate, formatHour } from '../utils/helpers';

export default function MentorDashboard() {
  const { currentUser, users } = useAuth();
  const { getAvailability, bookings } = useBooking();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const myAvailSlots = getAvailability(currentUser.email);
  const myBookings = bookings.filter(b => b.mentorEmail === currentUser.email && b.status !== 'rejected' && b.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">멘토 대시보드</h1>
          <button
            onClick={() => navigate('/mentor/schedule')}
            className="px-4 py-2 bg-[#FF5E27] text-white rounded-lg hover:bg-[#e5511f] transition"
          >
            일정 등록
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">등록된 슬롯</p>
            <p className="text-3xl font-bold text-[#FF5E27]">{myAvailSlots.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500">예약된 슬롯</p>
            <p className="text-3xl font-bold text-[#16A34A]">{myBookings.length}</p>
          </div>
        </div>

        {/* 예약 목록 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">예약 목록</h2>
          </div>
          {myBookings.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-400">예약된 미팅이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">날짜</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">시간</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">기업명</th>
                    <th className="text-left px-6 py-3 text-gray-500 font-medium">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myBookings
                    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour)
                    .map(b => {
                      const company = users.find(u => u.email === b.companyEmail);
                      return (
                        <tr key={b.id}>
                          <td className="px-6 py-3">{formatDate(b.date)}</td>
                          <td className="px-6 py-3">{formatHour(b.hour)} ~ {formatHour(b.hour + 1)}</td>
                          <td className="px-6 py-3">{company?.name || b.companyEmail}</td>
                          <td className="px-6 py-3">
                            <StatusBadge status={b.status} />
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
