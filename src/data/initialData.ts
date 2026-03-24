import { User } from '../types';

export const INITIAL_USERS: User[] = [
  // 관리자 (9명 - 디캠프)
  { email: 'jaeyeong@dcamp.kr', name: '이재영', role: 'admin', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'hyeongcheol@dcamp.kr', name: '윤형철', role: 'admin', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'jungjoo@dcamp.kr', name: '김정주', role: 'admin', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'smeun@dcamp.kr', name: '은수미', role: 'admin', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'choyeon@dcamp.kr', name: '김초연', role: 'admin', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'woohyeon@dcamp.kr', name: '김우현', role: 'admin', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'dwkim@dcamp.kr', name: '김도완', role: 'admin', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'donghyun@dcamp.kr', name: '이동현', role: 'admin', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'myungwoo@dcamp.kr', name: '이명우', role: 'admin', createdAt: '2026-03-24T00:00:00Z' },

  // 멘토 (8명)
  { email: 'akcron300@gmail.com', name: '홍기현', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: '4940hch@gmail.com', name: '황희철', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'highzero74@gmail.com', name: '정성훈', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'stopstar@soslab.co', name: '정지성', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'dannis@vyte.io', name: '김현준', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'june@gridwiz.com', name: '류준우', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'jppark@naraspace.com', name: '박재필', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'yoohwan.choi@gmail.com', name: '최유환', role: 'mentor', createdAt: '2026-03-24T00:00:00Z' },

  // 참여기업 (8개)
  { email: 'h2j@hydroxpand.com', name: '(주)하이드로엑스팬드', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'imeditech@imeditech.kr', name: '주식회사 아이메디텍', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'dk.cho@withpoints.co.kr', name: '주식회사 위드포인츠', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'khlee@rx.energy', name: '알엑스 주식회사', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'taerang.jung@readi.co.kr', name: '레디로버스트머신 주식회사', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'ceo@enerkeeper.com', name: '주식회사 에너테크', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'sungjae@provalabs.com', name: '프로바랩스 주식회사', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
  { email: 'haedkim@workerinspace.com', name: '주식회사 워커린스페이스', role: 'company', createdAt: '2026-03-24T00:00:00Z' },
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
