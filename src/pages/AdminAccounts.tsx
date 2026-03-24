import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import { Role } from '../types';

export default function AdminAccounts() {
  const { users, addUser, removeUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('company');
  const [roleTab, setRoleTab] = useState<Role | 'all'>('all');

  const filteredUsers = roleTab === 'all' ? users : users.filter(u => u.role === roleTab);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    const success = addUser({
      email: email.trim(),
      name: name.trim(),
      role,
      createdAt: new Date().toISOString(),
    });
    if (success) {
      showToast('계정이 추가되었습니다.', 'success');
      setEmail('');
      setName('');
    } else {
      showToast('이미 등록된 이메일입니다.', 'error');
    }
  };

  const handleRemove = (targetEmail: string) => {
    if (!removeUser(targetEmail)) {
      showToast('최초 관리자 계정은 삭제할 수 없습니다.', 'error');
      return;
    }
    showToast('계정이 삭제되었습니다.', 'success');
  };

  const ROLE_LABELS: Record<string, string> = { mentor: '멘토', company: '기업', admin: '관리자' };
  const tabs: { label: string; value: Role | 'all' }[] = [
    { label: '전체', value: 'all' },
    { label: '멘토', value: 'mentor' },
    { label: '기업', value: 'company' },
    { label: '관리자', value: 'admin' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-700">
            &larr; 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900">계정 관리</h1>
        </div>

        {/* 계정 추가 폼 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">계정 추가</h2>
          <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#FF5E27] focus:border-[#FF5E27] outline-none"
                placeholder="email@example.com"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm text-gray-600 mb-1">이름</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#FF5E27] focus:border-[#FF5E27] outline-none"
                placeholder="이름"
              />
            </div>
            <div className="min-w-[120px]">
              <label className="block text-sm text-gray-600 mb-1">역할</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
              >
                <option value="mentor">멘토</option>
                <option value="company">기업</option>
                <option value="admin">관리자</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[#FF5E27] text-white rounded-lg text-sm hover:bg-[#e5511f] transition"
            >
              추가
            </button>
          </form>
        </div>

        {/* 계정 목록 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex gap-2">
            {tabs.map(t => (
              <button
                key={t.value}
                onClick={() => setRoleTab(t.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  roleTab === t.value ? 'bg-[#FF5E27] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label} ({t.value === 'all' ? users.length : users.filter(u => u.role === t.value).length})
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">이메일</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">이름</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">역할</th>
                  <th className="text-center px-6 py-3 text-gray-500 font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map(u => (
                  <tr key={u.email}>
                    <td className="px-6 py-3 text-gray-700">{u.email}</td>
                    <td className="px-6 py-3">{u.name}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'mentor' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {u.email.toLowerCase() === 'jaeyeong@dcamp.kr' ? (
                        <span className="text-xs text-gray-400">최초 관리자</span>
                      ) : (
                        <button
                          onClick={() => handleRemove(u.email)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition"
                        >
                          삭제
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
