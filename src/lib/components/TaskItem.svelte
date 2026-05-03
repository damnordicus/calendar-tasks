<script lang="ts">
	import { formatTime, REPEAT_LABELS } from '$lib/utils';
	import type { Task } from '$lib/types';

	interface Props {
		task: Task;
		dateStr: string;
		completed: boolean;
		ontoggle: () => void;
		onedit: () => void;
	}

	let { task, dateStr, completed, ontoggle, onedit }: Props = $props();
</script>

<div
	class="group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all
	       {completed
		? 'border-slate-700/40 bg-slate-800/40 opacity-60'
		: 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-750'}"
	role="button"
	tabindex="0"
	onclick={onedit}
	onkeydown={(e) => e.key === 'Enter' && onedit()}
	aria-label="Edit task: {task.title}"
>
	<!-- Color accent bar -->
	<div
		class="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
		style="background: {task.color}"
	></div>

	<!-- Checkbox -->
	<button
		class="mt-0.5 flex-shrink-0 focus:outline-none"
		onclick={(e) => { e.stopPropagation(); ontoggle(); }}
		aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
	>
		<div
			class="h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all"
			style="border-color: {task.color}; {completed ? `background: ${task.color}` : ''}"
		>
			{#if completed}
				<svg class="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
					<path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			{/if}
		</div>
	</button>

	<!-- Content -->
	<div class="min-w-0 flex-1 pl-0.5">
		<div class="flex items-start justify-between gap-2">
			<span class="font-medium text-slate-100 leading-snug {completed ? 'line-through text-slate-500' : ''}">
				{task.title}
			</span>
			<div class="flex flex-shrink-0 items-center gap-1.5">
				{#if task.repeat !== 'none'}
					<span class="text-[10px] text-slate-500" title={REPEAT_LABELS[task.repeat]}>↻</span>
				{/if}
				{#if task.time}
					<span class="text-xs text-slate-400 whitespace-nowrap">{formatTime(task.time)}</span>
				{/if}
			</div>
		</div>
		{#if task.description}
			<p class="mt-0.5 text-sm text-slate-400 leading-snug line-clamp-2">{task.description}</p>
		{/if}
	</div>
</div>
