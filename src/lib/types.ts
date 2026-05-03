export interface Task {
	id: string;
	title: string;
	description: string;
	time: string; // 'HH:MM' or ''
	date: string; // 'YYYY-MM-DD' (start date)
	repeat: 'none' | 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';
	customDays: number[]; // 0=Sun … 6=Sat
	color: string;
	completions: Record<string, boolean>; // dateStr → completed
	createdAt: number;
}

export interface Settings {
	intervalMinutes: number;
	startTime: string; // 'HH:MM'
	endTime: string; // 'HH:MM'
	notificationsEnabled: boolean;
}

export type RepeatOption = Task['repeat'];
