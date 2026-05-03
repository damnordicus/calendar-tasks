<script lang="ts">
	import { store } from '$lib/store.svelte';
	import { requestPermission, getPermissionStatus, sendToSW, cancelSWNotifications } from '$lib/notifications';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	let permStatus = $state(getPermissionStatus());
	let intervalMinutes = $state(store.settings.intervalMinutes);
	let startTime = $state(store.settings.startTime);
	let endTime = $state(store.settings.endTime);
	let enabled = $state(store.settings.notificationsEnabled);

	async function enableNotifications() {
		const perm = await requestPermission();
		permStatus = perm;
		if (perm === 'granted') {
			enabled = true;
			saveSettings();
		}
	}

	function saveSettings() {
		const settings = { intervalMinutes, startTime, endTime, notificationsEnabled: enabled };
		store.updateSettings(settings);
		if (enabled && permStatus === 'granted') {
			sendToSW(store.tasks, store.settings);
		} else {
			cancelSWNotifications();
		}
	}

	function toggleEnabled() {
		enabled = !enabled;
		saveSettings();
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}

	const intervalOptions = [
		{ value: 30, label: 'Every 30 min' },
		{ value: 60, label: 'Every hour' },
		{ value: 120, label: 'Every 2 hours' },
		{ value: 180, label: 'Every 3 hours' },
		{ value: 240, label: 'Every 4 hours' }
	];
</script>

<div
	class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
	onclick={handleOverlayClick}
	onkeydown={(e) => e.key === 'Escape' && onclose()}
	role="dialog"
	tabindex="-1"
	aria-modal="true"
	aria-label="Settings"
>
	<div class="w-full max-w-md rounded-t-2xl bg-slate-900 p-5 shadow-2xl ring-1 ring-slate-700 sm:rounded-2xl">
		<!-- Header -->
		<div class="mb-5 flex items-center justify-between">
			<h2 class="text-lg font-semibold text-slate-100">Settings</h2>
			<button
				onclick={onclose}
				class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
				aria-label="Close"
			>
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
				</svg>
			</button>
		</div>

		<div class="space-y-5">
			<!-- Notification toggle -->
			<div class="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5">
				<div>
					<p class="font-medium text-slate-100">Task reminders</p>
					<p class="text-sm text-slate-400">Get notified about incomplete tasks</p>
				</div>
				{#if permStatus === 'unsupported'}
					<span class="text-xs text-slate-500">Not supported</span>
				{:else if permStatus === 'denied'}
					<span class="text-xs text-red-400">Blocked in browser</span>
				{:else if permStatus === 'granted'}
					<button
						onclick={toggleEnabled}
						class="relative h-6 w-11 rounded-full transition-colors {enabled ? 'bg-indigo-500' : 'bg-slate-600'}"
						aria-label={enabled ? 'Disable reminders' : 'Enable reminders'}
					>
						<span
							class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform {enabled ? 'translate-x-5' : ''}"
						></span>
					</button>
				{:else}
					<button
						onclick={enableNotifications}
						class="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-400 transition-colors"
					>
						Enable
					</button>
				{/if}
			</div>

			<!-- Interval -->
			<div>
				<label for="reminder-interval" class="mb-1.5 block text-xs font-medium text-slate-400">Reminder frequency</label>
				<select
					bind:value={intervalMinutes}
					id="reminder-interval"
					onchange={saveSettings}
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
				>
					{#each intervalOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
			</div>

			<!-- Time range -->
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="reminder-start" class="mb-1.5 block text-xs font-medium text-slate-400">Start time</label>
					<input
						bind:value={startTime}
						type="time"
						id="reminder-start"
						onchange={saveSettings}
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
					/>
				</div>
				<div>
					<label for="reminder-end" class="mb-1.5 block text-xs font-medium text-slate-400">End time</label>
					<input
						bind:value={endTime}
						type="time"
						id="reminder-end"
						onchange={saveSettings}
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none"
					/>
				</div>
			</div>

			<!-- Info -->
			<p class="text-xs text-slate-500 leading-relaxed">
				Reminders fire when the app is open. For background notifications, install this app to your home screen.
			</p>
		</div>
	</div>
</div>
