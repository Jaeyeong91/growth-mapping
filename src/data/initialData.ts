import { User } from '../types';

export const INITIAL_USERS: User[] = [
  // Admin
  { email: 'jaeyeong@dcamp.kr', name: '관리자', role: 'admin', createdAt: '2026-03-24T00:00:00Z' },

  // Mentors (8명)
  { email: 'mentor1@example.com', name: '멘토 1', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'mentor2@example.com', name: '멘토 2', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'mentor3@example.com', name: '멘토 3', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'mentor4@example.com', name: '멘토 4', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'mentor5@example.com', name: '멘토 5', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'mentor6@example.com', name: '멘토 6', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'mentor7@example.com', name: '멘토 7', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'mentor8@example.com', name: '멘토 8', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },

  // Companies (5개)
  { email: 'company1@example.com', name: '기업 A', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'company2@example.com', name: '기업 B', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'company3@example.com', name: '기업 C', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'company4@example.com', name: '기업 D', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'company5@example.com', name: '기업 E', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
];

// 미팅 가능 날짜: 4/6~4/10, 4/13~4/17, 4/20, 4/21
export const MEETING_DATES = [
  '2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10',
  '2026-04-13', '2026-04-14', '2026-04-15', '2026-04-16', '2026-04-17',
  '2026-04-20', '2026-04-21',
];

// 시간 슬롯: 09:00 ~ 17:00 (9개)
export const TIME_SLOTS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

// 주차별 날짜 그룹
export const WEEK_GROUPS = [
  { label: 'Week 1 (4/6 ~ 4/10)', dates: ['2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10'] },
  { label: 'Week 2 (4/13 ~ 4/17)', dates: ['2026-04-13', '2026-04-14', '2026-04-15', '2026-04-16', '2026-04-17'] },
  { label: 'Week 3 (4/20 ~ 4/21)', dates: ['2026-04-20', '2026-04-21'] },
];
