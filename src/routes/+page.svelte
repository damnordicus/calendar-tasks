<script lang="ts">
	import { onMount } from 'svelte';
	import { store } from '$lib/store.svelte';
	import { formatDateKey, formatDayName, formatFullDate, getTasksForDate, isToday, addDays } from '$lib/utils';
	import { registerSW, sendToSW } from '$lib/notifications';
	import WeekStrip from '$lib/components/WeekStrip.svelte';
	import TaskItem from '$lib/components/TaskItem.svelte';
	import TaskModal from '$lib/components/TaskModal.svelte';
	import SettingsModal from '$lib/components/SettingsModal.svelte';
	import type { Task } from '$lib/types';

	let currentDate = $state(new Date());
	let showTaskModal = $state(false);
	let showSettingsModal = $state(false);
	let editingTask = $state<Task | null>(null);

	let dateStr = $derived(formatDateKey(currentDate));
	let tasksForDay = $derived(getTasksForDate(store.tasks, dateStr));
	let incomplete = $derived(tasksForDay.filter((t) => !store.isCompleted(t, dateStr)));
	let completed = $derived(tasksForDay.filter((t) => store.isCompleted(t, dateStr)));

	function prevDay() {
		currentDate = addDays(currentDate, -1);
	}

	function nextDay() {
		currentDate = addDays(currentDate, 1);
	}

	function openNew() {
		editingTask = null;
		showTaskModal = true;
	}

	function openEdit(task: Task) {
		editingTask = task;
		showTaskModal = true;
	}

	function handleSave() {
		showTaskModal = false;
		editingTask = null;
		if (store.settings.notificationsEnabled) {
			sendToSW(store.tasks, store.settings);
		}
	}

	function handleClose() {
		showTaskModal = false;
		editingTask = null;
	}

	// Keyboard navigation
	function handleKeydown(e: KeyboardEvent) {
		if (showTaskModal || showSettingsModal) return;
		if (e.key === 'ArrowLeft') prevDay();
		if (e.key === 'ArrowRight') nextDay();
		if (e.key === 'n' && !e.ctrlKey && !e.metaKey) openNew();
		if (e.key === 't') currentDate = new Date();
	}

	onMount(async () => {
		await registerSW();
		if (store.settings.notificationsEnabled) {
			sendToSW(store.tasks, store.settings);
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex min-h-screen flex-col bg-slate-950 text-slate-100">
	<!-- Header -->
	<header class="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-4 pt-4 pb-2">
		<div class="mb-3 flex items-center justify-between">
			<button
				onclick={prevDay}
				class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
				aria-label="Previous day"
			>
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"/>
				</svg>
			</button>

			<button
				onclick={() => (currentDate = new Date())}
				class="text-center transition-opacity hover:opacity-80"
				aria-label="Go to today"
			>
				<div class="text-xs font-medium uppercase tracking-widest {isToday(currentDate) ? 'text-indigo-400' : 'text-slate-500'}">
					{isToday(currentDate) ? 'Today' : formatDayName(currentDate, true)}
				</div>
				<div class="text-xl font-bold text-slate-100">{formatFullDate(currentDate)}</div>
			</button>

			<div class="flex items-center gap-1">
				<button
					onclick={() => (showSettingsModal = true)}
					class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
					aria-label="Settings"
				>
					<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
					</svg>
				</button>
				<button
					onclick={nextDay}
					class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
					aria-label="Next day"
				>
					<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/>
					</svg>
				</button>
			</div>
		</div>

		<WeekStrip {currentDate} onselect={(d) => (currentDate = d)} />
	</header>

	<!-- Task list -->
	<main class="flex-1 px-4 py-4">
		{#if tasksForDay.length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
					<svg class="h-8 w-8 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
					</svg>
				</div>
				<p class="font-medium text-slate-400">No tasks for this day</p>
				<p class="mt-1 text-sm text-slate-600">Tap + to add one</p>
			</div>
		{:else}
			<div class="space-y-2.5">
				{#each incomplete as task (task.id)}
					<TaskItem
						{task}
						{dateStr}
						completed={false}
						ontoggle={() => store.toggleCompletion(task.id, dateStr)}
						onedit={() => openEdit(task)}
					/>
				{/each}

				{#if completed.length > 0}
					<div class="pt-2">
						<p class="mb-2 text-xs font-medium uppercase tracking-widest text-slate-600">
							{completed.length} completed
						</p>
						<div class="space-y-2">
							{#each completed as task (task.id)}
								<TaskItem
									{task}
									{dateStr}
									completed={true}
									ontoggle={() => store.toggleCompletion(task.id, dateStr)}
									onedit={() => openEdit(task)}
								/>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</main>

	<!-- FAB -->
	<button
		onclick={openNew}
		class="fixed bottom-6 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 active:scale-95 transition-all z-20"
		aria-label="Add task"
	>
		<svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
		</svg>
	</button>
</div>

<!-- Modals -->
{#if showTaskModal}
	<TaskModal
		date={currentDate}
		task={editingTask}
		onclose={handleClose}
		onsave={handleSave}
	/>
{/if}

{#if showSettingsModal}
	<SettingsModal onclose={() => (showSettingsModal = false)} />
{/if}
