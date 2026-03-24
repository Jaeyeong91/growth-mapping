import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';
import Header from '../components/Header';
import { WEEK_GROUPS, TIME_SLOTS } from '../data/initialData';
import { formatDate, formatHour } from '../utils/helpers';
import { useToast } from '../contexts/ToastContext';

export default function MentorSchedule() {
  const { currentUser } = useAuth();
  const { availabilities, setAvailability, isSlotBooked } = useBooking();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // 현재 멘토의 가능 슬롯 set
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser) return;
    const mySlots = availabilities
      .filter(a => a.mentorEmail === currentUser.email && a.isAvailable)
      .map(a => `${a.date}_${a.hour}`);
    setSelectedSlots(new Set(mySlots));
  }, [currentUser, availabilities]);

  if (!currentUser) return null;

  const toggleSlot = (date: string, hour: number) => {
    if (isSlotBooked(currentUser.email, date, hour)) return;
    const key = `${date}_${hour}`;
    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = () => {
    const slots = Array.from(selectedSlots).map(key => {
      const [date, hourStr] = key.split('_');
      return { date, hour: Number(hourStr), isAvailable: true };
    });
    setAvailability(currentUser.email, slots);
    showToast('일정이 저장되었습니다.', 'success');
    navigate('/mentor');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">미팅 가능 일정 등록</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/mentor')} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              취소
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition">
              저장
            </button>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex gap-4 mb-4 text-sm text-gray-600">
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-500 inline-block"></span> 선택됨</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-200 inline-block"></span> 미선택</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-gray-400 inline-block"></span> 예약됨 (수정불가)</span>
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
                        const booked = isSlotBooked(currentUser.email, date, hour);
                        const selected = selectedSlots.has(key);
                        return (
                          <td key={key} className="px-1 py-1 text-center">
                            <button
                              onClick={() => toggleSlot(date, hour)}
                              disabled={booked}
                              className={`w-full py-2 rounded text-xs font-medium transition ${
                                booked
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : selected
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {booked ? '예약됨' : selected ? '가능' : '-'}
                            </button>
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
