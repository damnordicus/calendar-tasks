import type { Task } from './types';

export function formatDateKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
	return new Date(dateStr + 'T12:00:00');
}

export function isToday(date: Date): boolean {
	return formatDateKey(date) === formatDateKey(new Date());
}

export function isSameDay(a: Date, b: Date): boolean {
	return formatDateKey(a) === formatDateKey(b);
}

export function addDays(date: Date, n: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + n);
	return d;
}

export function getWeekDates(date: Date): Date[] {
	const start = new Date(date);
	start.setDate(date.getDate() - date.getDay());
	return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDayName(date: Date, long = false): string {
	return date.toLocaleDateString('en-US', { weekday: long ? 'long' : 'short' });
}

export function formatFullDate(date: Date): string {
	return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatTime(timeStr: string): string {
	if (!timeStr) return '';
	const [h, m] = timeStr.split(':').map(Number);
	const ampm = h >= 12 ? 'PM' : 'AM';
	const hour = h % 12 || 12;
	return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function isTaskForDate(task: Task, dateStr: string): boolean {
	const date = parseDate(dateStr);
	const startDate = parseDate(task.date || dateStr);
	const dayOfWeek = date.getDay();

	if (date < startDate) return false;

	switch (task.repeat) {
		case 'none':
			return task.date === dateStr;
		case 'daily':
			return true;
		case 'weekly':
			return startDate.getDay() === dayOfWeek;
		case 'weekdays':
			return dayOfWeek >= 1 && dayOfWeek <= 5;
		case 'weekends':
			return dayOfWeek === 0 || dayOfWeek === 6;
		case 'custom':
			return task.customDays?.includes(dayOfWeek) ?? false;
		default:
			return false;
	}
}

export function getTasksForDate(tasks: Task[], dateStr: string): Task[] {
	return tasks
		.filter((t) => isTaskForDate(t, dateStr))
		.sort((a, b) => {
			if (!a.time && !b.time) return 0;
			if (!a.time) return 1;
			if (!b.time) return -1;
			return a.time.localeCompare(b.time);
		});
}

export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const COLORS = [
	'#6366f1', // indigo
	'#10b981', // emerald
	'#f59e0b', // amber
	'#ef4444', // red
	'#8b5cf6', // violet
	'#06b6d4', // cyan
	'#ec4899', // pink
	'#f97316' // orange
];

export const REPEAT_LABELS: Record<string, string> = {
	none: 'No repeat',
	daily: 'Every day',
	weekly: 'Every week',
	weekdays: 'Weekdays (Mon–Fri)',
	weekends: 'Weekends',
	custom: 'Custom days'
};

export const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
