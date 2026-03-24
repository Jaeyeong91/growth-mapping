import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import Header from '../components/Header';
import { formatDate, formatHour } from '../utils/helpers';

export default function CompanyDashboard() {
  const { currentUser, users } = useAuth();
  const { bookings, getAvailability } = useBooking();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const myBookings = bookings.filter(b => b.companyEmail === currentUser.email);
  const mentors = users.filter(u => u.role === 'mentor');

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
            const bookedCount = bookings.filter(b => b.mentorEmail === mentor.email && b.status !== 'rejected').length;
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
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
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
  };
  const labels = { pending: '대기중', approved: '승인됨', rejected: '거절됨' };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || ''}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
