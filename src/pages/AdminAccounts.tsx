import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMapping } from '../contexts/MappingContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import { Role } from '../types';

type PageTab = 'accounts' | 'mapping';

export default function AdminAccounts() {
  const [pageTab, setPageTab] = useState<PageTab>('accounts');
  const navigate = useNavigate();

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

        {/* 페이지 탭 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPageTab('accounts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              pageTab === 'accounts' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            계정 관리
          </button>
          <button
            onClick={() => setPageTab('mapping')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              pageTab === 'mapping' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            기업-매니저 매칭
          </button>
        </div>

        {pageTab === 'accounts' ? <AccountsSection /> : <MappingSection />}
      </main>
    </div>
  );
}

/* ───────── 계정 관리 섹션 ───────── */
function AccountsSection() {
  const { users, addUser, removeUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('company');
  const [roleTab, setRoleTab] = useState<Role | 'all'>('all');
  const [submitting, setSubmitting] = useState(false);

  const filteredUsers = roleTab === 'all' ? users : users.filter(u => u.role === roleTab);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setSubmitting(true);
    const success = await addUser({
      email: email.trim(),
      name: name.trim(),
      role,
      createdAt: new Date().toISOString(),
    });
    setSubmitting(false);
    if (success) {
      showToast('계정이 추가되었습니다.', 'success');
      setEmail('');
      setName('');
    } else {
      showToast('이미 등록된 이메일입니다.', 'error');
    }
  };

  const handleRemove = async (targetEmail: string) => {
    const success = await removeUser(targetEmail);
    if (!success) {
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
    <>
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
            disabled={submitting}
            className="px-6 py-2 bg-[#FF5E27] text-white rounded-lg text-sm hover:bg-[#e5511f] transition disabled:opacity-50"
          >
            {submitting ? '추가중...' : '추가'}
          </button>
        </form>
      </div>

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
    </>
  );
}

/* ───────── 기업-매니저 매칭 섹션 ───────── */
function MappingSection() {
  const { users } = useAuth();
  const { mappings, addMapping, updateMapping, removeMapping } = useMapping();
  const { showToast } = useToast();

  const [companyEmail, setCompanyEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [webhook, setWebhook] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editManagerName, setEditManagerName] = useState('');
  const [editManagerEmail, setEditManagerEmail] = useState('');
  const [editWebhook, setEditWebhook] = useState('');

  const companies = users.filter(u => u.role === 'company');
  const admins = users.filter(u => u.role === 'admin');
  const unmappedCompanies = companies.filter(c => !mappings.some(m => m.companyEmail === c.email));

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyEmail || !managerName.trim() || !managerEmail.trim()) return;
    setSubmitting(true);
    const success = await addMapping({
      companyEmail,
      managerName: managerName.trim(),
      managerEmail: managerEmail.trim(),
      googleChatWebhook: webhook.trim() || undefined,
    });
    setSubmitting(false);
    if (success) {
      showToast('매칭이 등록되었습니다.', 'success');
      setCompanyEmail('');
      setManagerName('');
      setManagerEmail('');
      setWebhook('');
    } else {
      showToast('매칭 등록에 실패했습니다.', 'error');
    }
  };

  const startEdit = (m: typeof mappings[0]) => {
    setEditId(m.id);
    setEditManagerName(m.managerName);
    setEditManagerEmail(m.managerEmail);
    setEditWebhook(m.googleChatWebhook || '');
  };

  const handleUpdate = async () => {
    if (!editId) return;
    const success = await updateMapping(editId, {
      managerName: editManagerName.trim(),
      managerEmail: editManagerEmail.trim(),
      googleChatWebhook: editWebhook.trim() || undefined,
    });
    if (success) {
      showToast('매칭이 수정되었습니다.', 'success');
      setEditId(null);
    } else {
      showToast('수정에 실패했습니다.', 'error');
    }
  };

  const handleRemove = async (id: string) => {
    const success = await removeMapping(id);
    if (success) {
      showToast('매칭이 삭제되었습니다.', 'success');
    } else {
      showToast('삭제에 실패했습니다.', 'error');
    }
  };

  // 매니저(admin) 선택 시 이름/이메일 자동 채우기
  const handleManagerSelect = (email: string, setName: (v: string) => void, setEmail: (v: string) => void) => {
    const admin = admins.find(a => a.email === email);
    if (admin) {
      setName(admin.name);
      setEmail(admin.email);
    }
  };

  return (
    <>
      {/* 매칭 등록 폼 */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">매칭 등록</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">참여기업</label>
              <select
                value={companyEmail}
                onChange={e => setCompanyEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
              >
                <option value="">기업을 선택하세요</option>
                {unmappedCompanies.map(c => (
                  <option key={c.email} value={c.email}>{c.name}</option>
                ))}
              </select>
              {unmappedCompanies.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">모든 기업이 이미 매칭되어 있습니다.</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">담당 매니저 선택</label>
              <select
                onChange={e => handleManagerSelect(e.target.value, setManagerName, setManagerEmail)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700"
              >
                <option value="">매니저를 선택하세요 (또는 직접 입력)</option>
                {admins.map(a => (
                  <option key={a.email} value={a.email}>{a.name} ({a.email})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">매니저 이름</label>
              <input
                type="text"
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#FF5E27] focus:border-[#FF5E27] outline-none"
                placeholder="매니저 이름"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">매니저 이메일</label>
              <input
                type="email"
                value={managerEmail}
                onChange={e => setManagerEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#FF5E27] focus:border-[#FF5E27] outline-none"
                placeholder="manager@dcamp.kr"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Webhook URL (선택)</label>
              <input
                type="url"
                value={webhook}
                onChange={e => setWebhook(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#FF5E27] focus:border-[#FF5E27] outline-none"
                placeholder="https://chat.googleapis.com/..."
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || unmappedCompanies.length === 0}
            className="px-6 py-2 bg-[#FF5E27] text-white rounded-lg text-sm hover:bg-[#e5511f] transition disabled:opacity-50"
          >
            {submitting ? '등록중...' : '매칭 등록'}
          </button>
        </form>
      </div>

      {/* 매칭 현황 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">매칭 현황 ({mappings.length}건)</h2>
        </div>
        {mappings.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400">등록된 매칭이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">참여기업</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">담당 매니저</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">매니저 이메일</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Webhook</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mappings.map(m => {
                  const company = companies.find(c => c.email === m.companyEmail);
                  const isEditing = editId === m.id;

                  return (
                    <tr key={m.id}>
                      <td className="px-4 py-3">{company?.name || m.companyEmail}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editManagerName}
                            onChange={e => setEditManagerName(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : m.managerName}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editManagerEmail}
                            onChange={e => setEditManagerEmail(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : m.managerEmail}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="url"
                            value={editWebhook}
                            onChange={e => setEditWebhook(e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="https://..."
                          />
                        ) : (
                          m.googleChatWebhook ? (
                            <span className="text-green-600 text-xs font-medium">설정됨</span>
                          ) : (
                            <span className="text-gray-400 text-xs">미설정</span>
                          )
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={handleUpdate}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400 transition"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1 justify-center">
                            <button
                              onClick={() => startEdit(m)}
                              className="px-2 py-1 bg-orange-50 text-[#FF5E27] rounded text-xs hover:bg-orange-100 transition"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleRemove(m.id)}
                              className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition"
                            >
                              삭제
                            </button>
                          </div>
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
    </>
  );
}
