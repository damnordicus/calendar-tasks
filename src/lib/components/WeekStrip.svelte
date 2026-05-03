<script lang="ts">
	import { getWeekDates, formatDateKey, formatDayName, isToday, isSameDay } from '$lib/utils';
	import { getTasksForDate } from '$lib/utils';
	import { store } from '$lib/store.svelte';

	interface Props {
		currentDate: Date;
		onselect: (date: Date) => void;
	}

	let { currentDate, onselect }: Props = $props();

	let weekDates = $derived(getWeekDates(currentDate));
</script>

<div class="flex justify-between px-1 pb-1">
	{#each weekDates as date (formatDateKey(date))}
		{@const dateStr = formatDateKey(date)}
		{@const tasks = getTasksForDate(store.tasks, dateStr)}
		{@const hasIncomplete = tasks.some((t) => !store.isCompleted(t, dateStr))}
		{@const hasAny = tasks.length > 0}
		{@const selected = isSameDay(date, currentDate)}
		{@const todayDate = isToday(date)}
		<button
			onclick={() => onselect(date)}
			class="flex flex-col items-center gap-1 rounded-xl px-2.5 py-2 transition-all
			       {selected ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}
			       {todayDate && !selected ? 'text-indigo-400' : ''}"
		>
			<span class="text-[11px] font-medium uppercase tracking-wide">
				{formatDayName(date)}
			</span>
			<span class="text-base font-semibold leading-none">
				{date.getDate()}
			</span>
			<span class="h-1.5 w-1.5 rounded-full
			       {hasAny ? (hasIncomplete ? 'bg-current opacity-60' : 'bg-emerald-400 opacity-80') : 'opacity-0 bg-current'}"
			></span>
		</button>
	{/each}
</div>
