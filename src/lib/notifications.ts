import type { Task, Settings } from './types';

export async function requestPermission(): Promise<NotificationPermission> {
	if (!('Notification' in window)) return 'denied';
	return Notification.requestPermission();
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
	if (!('Notification' in window)) return 'unsupported';
	return Notification.permission;
}

export function sendToSW(tasks: Task[], settings: Settings) {
	if (!navigator?.serviceWorker?.controller) return;
	navigator.serviceWorker.controller.postMessage({ type: 'SCHEDULE_NOTIFICATIONS', data: { tasks, settings } });
}

export function cancelSWNotifications() {
	if (!navigator?.serviceWorker?.controller) return;
	navigator.serviceWorker.controller.postMessage({ type: 'CANCEL_NOTIFICATIONS' });
}

export async function registerSW() {
	if (!('serviceWorker' in navigator)) return;
	try {
		const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			// New SW took control — re-send schedule
			dispatchEvent(new CustomEvent('sw-ready'));
		});
		await navigator.serviceWorker.ready;
		return reg;
	} catch (e) {
		console.error('SW registration failed:', e);
	}
}
