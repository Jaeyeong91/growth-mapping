import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import { formatDate, formatHour } from '../utils/helpers';
import { BookingStatus } from '../types';
import { logApproval } from '../utils/logger';

export default function AdminDashboard() {
  const { currentUser, users } = useAuth();
  const { bookings, updateBookingStatus, getAvailability } = useBooking();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mentorFilter, setMentorFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const mentors = users.filter(u => u.role === 'mentor');

  // 통계
  const total = bookings.length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const approved = bookings.filter(b => b.status === 'approved').length;
  const rejected = bookings.filter(b => b.status === 'rejected').length;

  // 필터링된 예약
  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (mentorFilter !== 'all' && b.mentorEmail !== mentorFilter) return false;
    if (dateFilter !== 'all' && b.date !== dateFilter) return false;
    return true;
  });

  const uniqueDates = [...new Set(bookings.map(b => b.date))].sort();

  const handleStatus = (id: string, status: BookingStatus) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      const mentor = users.find(u => u.email === booking.mentorEmail);
      const company = users.find(u => u.email === booking.companyEmail);
      logApproval(
        currentUser?.name || '', mentor?.name || booking.mentorEmail,
        company?.name || booking.companyEmail, booking.date,
        formatHour(booking.hour), status === 'approved' ? '승인' : '거절',
      );
    }
    updateBookingStatus(id, status);
    showToast(status === 'approved' ? '승인되었습니다.' : '거절되었습니다.', status === 'approved' ? 'success' : 'info');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          <button
            onClick={() => navigate('/admin/accounts')}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition"
          >
            계정 관리
          </button>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="총 예약" value={total} color="text-gray-900" />
          <StatCard label="대기중" value={pending} color="text-amber-600" />
          <StatCard label="승인됨" value={approved} color="text-green-600" />
          <StatCard label="거절됨" value={rejected} color="text-red-600" />
        </div>

        {/* 멘토별 현황 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">멘토별 예약 현황</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">멘토명</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">등록 슬롯</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">예약됨</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">잔여</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mentors.map(m => {
                  const slots = getAvailability(m.email).length;
                  const booked = bookings.filter(b => b.mentorEmail === m.email && b.status !== 'rejected').length;
                  return (
                    <tr key={m.email}>
                      <td className="px-6 py-3">{m.name}</td>
                      <td className="px-6 py-3 text-center">{slots}</td>
                      <td className="px-6 py-3 text-center">{booked}</td>
                      <td className="px-6 py-3 text-center">{Math.max(0, slots - booked)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex flex-wrap items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900 mr-auto">전체 예약 목록</h2>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700"
            >
              <option value="all">전체 상태</option>
              <option value="pending">대기중</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거절됨</option>
            </select>
            <select
              value={mentorFilter}
              onChange={e => setMentorFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700"
            >
              <option value="all">전체 멘토</option>
              {mentors.map(m => <option key={m.email} value={m.email}>{m.name}</option>)}
            </select>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700"
            >
              <option value="all">전체 날짜</option>
              {uniqueDates.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-400">예약 내역이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">멘토명</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">기업명</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">날짜</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">시간</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">상태</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium">처리</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map(b => {
                      const mentor = users.find(u => u.email === b.mentorEmail);
                      const company = users.find(u => u.email === b.companyEmail);
                      return (
                        <tr key={b.id}>
                          <td className="px-4 py-3">{mentor?.name || b.mentorEmail}</td>
                          <td className="px-4 py-3">{company?.name || b.companyEmail}</td>
                          <td className="px-4 py-3">{formatDate(b.date)}</td>
                          <td className="px-4 py-3">{formatHour(b.hour)} ~ {formatHour(b.hour + 1)}</td>
                          <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                          <td className="px-4 py-3 text-center">
                            {b.status === 'pending' ? (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleStatus(b.id, 'approved')}
                                  className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handleStatus(b.id, 'rejected')}
                                  className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                                >
                                  거절
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">처리 완료</span>
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
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
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
