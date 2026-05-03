<script lang="ts">
	import { store } from '$lib/store.svelte';
	import { formatDateKey, COLORS, REPEAT_LABELS, DAY_LABELS } from '$lib/utils';
	import type { Task } from '$lib/types';

	interface Props {
		date: Date;
		task?: Task | null;
		onclose: () => void;
		onsave: () => void;
	}

	let { date, task = null, onclose, onsave }: Props = $props();

	// Form state
	let title = $state(task?.title ?? '');
	let description = $state(task?.description ?? '');
	let time = $state(task?.time ?? '');
	let taskDate = $state(task?.date ?? formatDateKey(date));
	let repeat = $state<Task['repeat']>(task?.repeat ?? 'none');
	let customDays = $state<number[]>([...(task?.customDays ?? [])]);
	let color = $state(task?.color ?? COLORS[0]);

	function toggleDay(day: number) {
		customDays = customDays.includes(day) ? customDays.filter((d) => d !== day) : [...customDays, day];
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!title.trim()) return;

		const data = {
			title: title.trim(),
			description: description.trim(),
			time,
			date: taskDate,
			repeat,
			customDays: repeat === 'custom' ? customDays : [],
			color
		};

		if (task) {
			store.updateTask(task.id, data);
		} else {
			store.addTask(data);
		}
		onsave();
	}

	function handleDelete() {
		if (task && confirm(`Delete "${task.title}"?`)) {
			store.deleteTask(task.id);
			onsave();
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}
</script>

<!-- Backdrop -->
<div
	class="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
	onclick={handleOverlayClick}
	onkeydown={(e) => e.key === 'Escape' && onclose()}
	role="dialog"
	tabindex="-1"
	aria-modal="true"
	aria-label={task ? 'Edit task' : 'New task'}
>
	<div class="w-full max-w-md rounded-t-2xl bg-slate-900 p-5 shadow-2xl ring-1 ring-slate-700 sm:rounded-2xl">
		<!-- Header -->
		<div class="mb-5 flex items-center justify-between">
			<h2 class="text-lg font-semibold text-slate-100">{task ? 'Edit Task' : 'New Task'}</h2>
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

		<form onsubmit={handleSubmit} class="space-y-4">
			<!-- Title -->
			<input
				bind:value={title}
				type="text"
				id="task-title"
				placeholder="Task title"
				required
				class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
			/>

			<!-- Description -->
			<textarea
				bind:value={description}
				placeholder="Description (optional)"
				rows="2"
				class="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
			></textarea>

			<!-- Time + Date -->
			<div class="grid grid-cols-2 gap-3">
				<div>
					<label for="task-time" class="mb-1.5 block text-xs font-medium text-slate-400">Time</label>
					<input
						bind:value={time}
						type="time"
						id="task-time"
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
					/>
				</div>
				<div>
					<label for="task-date" class="mb-1.5 block text-xs font-medium text-slate-400">Date</label>
					<input
						bind:value={taskDate}
						type="date"
						id="task-date"
						class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
					/>
				</div>
			</div>

			<!-- Repeat -->
			<div>
				<label for="task-repeat" class="mb-1.5 block text-xs font-medium text-slate-400">Repeat</label>
				<select
					bind:value={repeat}
					id="task-repeat"
					class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
				>
					{#each Object.entries(REPEAT_LABELS) as [val, label]}
						<option value={val}>{label}</option>
					{/each}
				</select>
			</div>

			<!-- Custom days -->
			{#if repeat === 'custom'}
				<div>
					<p class="mb-1.5 text-xs font-medium text-slate-400">Days</p>
					<div class="flex gap-1.5">
						{#each DAY_LABELS as label, i}
							<button
								type="button"
								onclick={() => toggleDay(i)}
								class="h-9 w-9 rounded-lg text-xs font-medium transition-all
								       {customDays.includes(i)
									? 'bg-indigo-500 text-white'
									: 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700'}"
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Color -->
			<div>
				<p class="mb-1.5 text-xs font-medium text-slate-400">Color</p>
				<div class="flex gap-2 flex-wrap">
					{#each COLORS as c}
						<button
							type="button"
							onclick={() => (color = c)}
							style="background: {c}"
							class="h-7 w-7 rounded-full transition-transform {color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'}"
							aria-label="Color {c}"
						></button>
					{/each}
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center justify-between pt-1">
				{#if task}
					<button
						type="button"
						onclick={handleDelete}
						class="rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
					>
						Delete
					</button>
				{:else}
					<div></div>
				{/if}
				<div class="flex gap-2">
					<button
						type="button"
						onclick={onclose}
						class="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
					>
						Save
					</button>
				</div>
			</div>
		</form>
	</div>
</div>
