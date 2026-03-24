const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzk1JAPCEIRpW4i9ToRiHJn5C6z-O415qv9VP2zHzKVD03dNtuF4KNcW-X8T-lv1UwL/exec';

function sendLog(data: Record<string, string | number>) {
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(data),
  }).catch(() => {});
}

export function logLogin(email: string, name: string, role: string) {
  sendLog({ type: 'login', email, name, role });
}

export function logSchedule(email: string, name: string, slotCount: number) {
  sendLog({ type: 'schedule', email, name, slotCount });
}

export function logBooking(
  companyEmail: string, companyName: string,
  mentorEmail: string, mentorName: string,
  date: string, hour: string,
) {
  sendLog({ type: 'booking', companyEmail, companyName, mentorEmail, mentorName, date, hour });
}

export function logCancel(
  companyEmail: string, companyName: string,
  mentorEmail: string, mentorName: string,
  date: string, hour: string,
) {
  sendLog({ type: 'cancel', companyEmail, companyName, mentorEmail, mentorName, date, hour });
}

export function logApproval(
  adminName: string, mentorName: string, companyName: string,
  date: string, hour: string, status: string,
) {
  sendLog({ type: 'approval', adminName, mentorName, companyName, date, hour, status });
}
