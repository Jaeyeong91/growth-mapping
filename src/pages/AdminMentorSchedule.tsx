import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import { WEEK_GROUPS, TIME_SLOTS } from '../data/initialData';
import { formatDate, formatHour } from '../utils/helpers';

export default function AdminMentorSchedule() {
  const { id } = useParams<{ id: string }>();
  const mentorEmail = decodeURIComponent(id || '');
  const { users } = useAuth();
  const { getAvailability, isSlotBooked, isSlotBlocked, toggleBlockSlot } = useBooking();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const mentor = users.find(u => u.email === mentorEmail);
  const availSlots = getAvailability(mentorEmail);
  const availSet = new Set(availSlots.map(a => `${a.date}_${a.hour}`));

  const handleToggle = async (date: string, hour: number) => {
    const wasBlocked = isSlotBlocked(mentorEmail, date, hour);
    await toggleBlockSlot(mentorEmail, date, hour);
    showToast(wasBlocked ? '블록이 해제되었습니다.' : '슬롯이 블록되었습니다.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-700">
            &larr; 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{mentor?.name || mentorEmail} 일정 관리</h1>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          멘토가 오픈한 슬롯을 블록하면 기업이 해당 시간에 예약할 수 없습니다.
        </p>

        <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#FF5E27] inline-block"></span> 예약 가능</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-400 inline-block"></span> 관리자 블록</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-400 inline-block"></span> 예약됨</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-100 inline-block border"></span> 미등록</span>
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
                            {!available ? (
                              <span className="block w-full py-2 rounded text-xs text-gray-300 bg-gray-50">-</span>
                            ) : booked ? (
                              <span className="block w-full py-2 rounded text-xs font-medium bg-gray-400 text-white cursor-not-allowed">
                                예약됨
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggle(date, hour)}
                                className={`w-full py-2 rounded text-xs font-medium transition ${
                                  blocked
                                    ? 'bg-red-400 text-white hover:bg-red-500'
                                    : 'bg-[#FF5E27] text-white hover:bg-[#e5511f]'
                                }`}
                              >
                                {blocked ? '블록됨' : '가능'}
                              </button>
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
    </div>
  );
}
