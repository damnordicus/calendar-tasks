/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// ── Types (duplicated here so the SW is self-contained) ──────────────────────
interface Task {
	id: string;
	title: string;
	date: string;
	time: string;
	repeat: string;
	customDays: number[];
	completions: Record<string, boolean>;
}

interface Settings {
	intervalMinutes: number;
	startTime: string;
	endTime: string;
	notificationsEnabled: boolean;
}

// ── State ─────────────────────────────────────────────────────────────────────
let storedTasks: Task[] = [];
let storedSettings: Settings = {
	intervalMinutes: 120,
	startTime: '08:00',
	endTime: '22:00',
	notificationsEnabled: false
};
let timerId: ReturnType<typeof setTimeout> | null = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function todayStr(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isTaskForDate(task: Task, dateStr: string): boolean {
	const date = new Date(dateStr + 'T12:00:00');
	const start = new Date((task.date || dateStr) + 'T12:00:00');
	const dow = date.getDay();
	if (date < start) return false;
	switch (task.repeat) {
		case 'none':
			return task.date === dateStr;
		case 'daily':
			return true;
		case 'weekly':
			return start.getDay() === dow;
		case 'weekdays':
			return dow >= 1 && dow <= 5;
		case 'weekends':
			return dow === 0 || dow === 6;
		case 'custom':
			return task.customDays?.includes(dow) ?? false;
		default:
			return false;
	}
}

// ── Scheduling ────────────────────────────────────────────────────────────────
function cancelTimer() {
	if (timerId !== null) {
		clearTimeout(timerId);
		timerId = null;
	}
}

function scheduleNext() {
	cancelTimer();
	if (!storedSettings.notificationsEnabled) return;

	const now = new Date();
	const [sh, sm] = storedSettings.startTime.split(':').map(Number);
	const [eh, em] = storedSettings.endTime.split(':').map(Number);
	const intervalMs = storedSettings.intervalMinutes * 60 * 1000;

	const startMs = new Date(now).setHours(sh, sm, 0, 0);
	const endMs = new Date(now).setHours(eh, em, 0, 0);
	const nowMs = now.getTime();

	if (nowMs > endMs) return; // past end for today

	const elapsed = Math.max(0, nowMs - startMs);
	const n = Math.floor(elapsed / intervalMs) + 1;
	const nextMs = startMs + n * intervalMs;

	if (nextMs > endMs) return;

	const delay = nextMs - nowMs;
	timerId = setTimeout(async () => {
		await fireNotification();
		scheduleNext();
	}, delay);
}

async function fireNotification() {
	const date = todayStr();
	const tasks = storedTasks.filter((t) => isTaskForDate(t, date));
	const incomplete = tasks.filter((t) => !t.completions?.[date]);

	if (incomplete.length === 0) return;

	const preview = incomplete
		.slice(0, 3)
		.map((t) => t.title)
		.join(', ');
	const body =
		incomplete.length === 1
			? `Still to do: ${preview}`
			: `${incomplete.length} tasks remaining — ${preview}${incomplete.length > 3 ? '…' : ''}`;

	await self.registration.showNotification('DayTasks Reminder', {
		body,
		icon: '/icons/icon-192.svg',
		badge: '/icons/icon-72.svg',
		tag: 'daytasks-reminder',
		data: { url: '/' }
	} as NotificationOptions);
}

// ── SW events ─────────────────────────────────────────────────────────────────
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('message', (e: ExtendableMessageEvent) => {
	const { type, data } = e.data ?? {};
	if (type === 'SCHEDULE_NOTIFICATIONS') {
		storedTasks = data.tasks ?? [];
		storedSettings = { ...storedSettings, ...(data.settings ?? {}) };
		scheduleNext();
	} else if (type === 'CANCEL_NOTIFICATIONS') {
		cancelTimer();
	}
});

self.addEventListener('notificationclick', (e: NotificationEvent) => {
	e.notification.close();
	const url: string = e.notification.data?.url ?? '/';
	e.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
			const existing = clients.find((c) => c.url.includes(url));
			return existing ? existing.focus() : self.clients.openWindow(url);
		})
	);
});
