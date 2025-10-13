import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  parse,
  startOfMonth,
  subDays
} from 'date-fns';

export const ISO_FORMAT = 'yyyy-MM-dd';

export const formatDate = (date: Date, dateFormat: string = ISO_FORMAT) => format(date, dateFormat);

export const parseISODate = (date: string) => parse(date, ISO_FORMAT, new Date());

export const toISODate = (date: Date) => format(date, ISO_FORMAT);

export const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const isDateToday = (date: string | Date) => {
  const target = typeof date === 'string' ? parseISODate(date) : date;
  return isSameDay(target, new Date());
};

export const getDatesForMonth = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });
  const leadingDays = Array.from({ length: start.getDay() }, (_, index) => subDays(start, start.getDay() - index));
  const trailingDays = Array.from({ length: 6 - end.getDay() }, (_, index) => addDays(end, index + 1));
  return [...leadingDays, ...days, ...trailingDays];
};

export const parseTimeToDate = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

export const formatDisplayTime = (time?: string) => {
  if (!time) return '';
  return format(parseTimeToDate(time), 'p');
};

export const getWeekStartDate = (date: Date) => {
  const currentDay = date.getDay();
  return subDays(date, currentDay);
};

export const getLast7Days = () => {
  const today = startOfToday();
  return Array.from({ length: 7 }, (_, index) => subDays(today, index)).reverse();
};
