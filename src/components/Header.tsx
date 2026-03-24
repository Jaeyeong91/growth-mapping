import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ROLE_LABELS = { mentor: '멘토', company: '기업', admin: '관리자' } as const;

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  return (
    <header className="bg-[#1A1A1A] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(`/${currentUser.role === 'company' ? 'company' : currentUser.role}`)} className="font-bold text-lg hover:text-[#FF5E27] transition">
          그로스맵핑
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-90">
            {currentUser.name} ({ROLE_LABELS[currentUser.role]})
          </span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm border border-white/30 px-3 py-1 rounded hover:bg-[#FF5E27] hover:border-[#FF5E27] transition"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}
