import { browser } from '$app/environment';
import type { Task, Settings } from './types';
import { generateId, isTaskForDate } from './utils';

const TASKS_KEY = 'dt_tasks';
const SETTINGS_KEY = 'dt_settings';

const DEFAULT_SETTINGS: Settings = {
	intervalMinutes: 120,
	startTime: '08:00',
	endTime: '22:00',
	notificationsEnabled: false
};

function load<T>(key: string, fallback: T): T {
	if (!browser) return fallback;
	try {
		const val = localStorage.getItem(key);
		return val ? (JSON.parse(val) as T) : fallback;
	} catch {
		return fallback;
	}
}

class AppStore {
	tasks = $state<Task[]>(load(TASKS_KEY, []));
	settings = $state<Settings>({ ...DEFAULT_SETTINGS, ...load<Partial<Settings>>(SETTINGS_KEY, {}) });

	private persist() {
		if (browser) localStorage.setItem(TASKS_KEY, JSON.stringify(this.tasks));
	}

	private persistSettings() {
		if (browser) localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
	}

	addTask(data: Omit<Task, 'id' | 'completions' | 'createdAt'>): Task {
		const task: Task = { ...data, id: generateId(), completions: {}, createdAt: Date.now() };
		this.tasks = [...this.tasks, task];
		this.persist();
		return task;
	}

	updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'completions'>>) {
		this.tasks = this.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
		this.persist();
	}

	deleteTask(id: string) {
		this.tasks = this.tasks.filter((t) => t.id !== id);
		this.persist();
	}

	toggleCompletion(id: string, dateStr: string) {
		this.tasks = this.tasks.map((t) => {
			if (t.id !== id) return t;
			return { ...t, completions: { ...t.completions, [dateStr]: !t.completions[dateStr] } };
		});
		this.persist();
	}

	isCompleted(task: Task, dateStr: string): boolean {
		return !!task.completions[dateStr];
	}

	getIncompleteTodayCount(): number {
		if (!browser) return 0;
		const today = new Date();
		const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
		return this.tasks.filter((t) => isTaskForDate(t, dateStr) && !t.completions[dateStr]).length;
	}

	updateSettings(updates: Partial<Settings>) {
		this.settings = { ...this.settings, ...updates };
		this.persistSettings();
	}
}

export const store = new AppStore();
