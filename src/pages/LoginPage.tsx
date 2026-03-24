import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const user = login(email.trim());
    if (!user) {
      showToast('등록되지 않은 이메일입니다.', 'error');
      return;
    }
    showToast(`${user.name}님 환영합니다!`, 'success');
    const routes = { mentor: '/mentor', company: '/company', admin: '/admin' };
    navigate(routes[user.role]);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">그로스맵핑</h1>
            <p className="text-gray-500 mt-2">미팅 신청 플랫폼</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 주소
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              로그인
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-6">
            사전 등록된 이메일만 로그인 가능합니다
          </p>
        </div>
      </div>
    </div>
  );
}
