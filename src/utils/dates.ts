const DAY_NAMES_SHORT = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const MONTH_NAMES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

export function getWeekDays(selectedDate: string, firstDay: 'Monday' | 'Sunday' = 'Monday') {
  const date = new Date(selectedDate + 'T12:00:00');
  const dayOfWeek = date.getDay();
  const offset = firstDay === 'Monday'
    ? (dayOfWeek === 0 ? -6 : 1 - dayOfWeek)
    : -dayOfWeek;

  const days: { date: string; dayName: string; dayNumber: number; isToday: boolean; isSelected: boolean }[] = [];
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < 7; i++) {
    const d = new Date(date);
    d.setDate(date.getDate() + offset + i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      dayName: DAY_NAMES_SHORT[d.getDay()],
      dayNumber: d.getDate(),
      isToday: dateStr === today,
      isSelected: dateStr === selectedDate,
    });
  }
  return days;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${dayNames[d.getDay()]}, ${d.getDate()} de ${monthNames[d.getMonth()]} de ${d.getFullYear()}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

export function getWeekRange(weekOffset: number = 0): { start: string; end: string; days: string[] } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }

  return {
    start: days[0],
    end: days[6],
    days,
  };
}
