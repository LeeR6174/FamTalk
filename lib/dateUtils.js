export function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

export function getSundayOfWeek(d) {
  const result = new Date(d);
  const day = result.getDay(); // 0 (Sun) to 6 (Sat)
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function getSaturdayOfWeek(d) {
  const result = new Date(d);
  const day = result.getDay(); // 0 (Sun) to 6 (Sat)
  result.setDate(result.getDate() + (6 - day));
  result.setHours(23, 59, 59, 999);
  return result;
}

export function getMeetingDates(meetingNumber) {
  const baselineDate = new Date(2026, 4, 9); // Saturday, May 9, 2026 (local timezone)
  const baselineCount = 63;
  const offsetWeeks = meetingNumber - baselineCount;
  
  // Calculate meetingSaturday (Saturday of that week)
  const meetingSaturday = new Date(baselineDate.getTime() + offsetWeeks * 7 * 24 * 60 * 60 * 1000);
  
  // Under Sunday-start:
  // startDate is Sunday (6 days before Saturday)
  const startDate = new Date(meetingSaturday.getTime() - 6 * 24 * 60 * 60 * 1000);
  // endDate is Saturday (the meetingSaturday itself)
  const endDate = meetingSaturday;
  
  return {
    startDate: getLocalDateString(startDate),
    endDate: getLocalDateString(endDate)
  };
}

export function calculateMeetingCount(meetingOffset = 0) {
  const baselineDate = new Date(2026, 4, 9); // Saturday, May 9, 2026 (local timezone)
  const baselineCount = 63;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today - baselineDate;
  const diffWeeks = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));
  
  return baselineCount + diffWeeks - meetingOffset;
}
