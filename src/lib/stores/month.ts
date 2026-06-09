import { writable } from 'svelte/store';
import { getDefaultActiveMonth, type YearMonth } from '$lib/utils/dates';

export const activeMonth = writable<YearMonth>(getDefaultActiveMonth());

export function setActiveMonthFromUrl(url: URL) {
	const y = url.searchParams.get('year');
	const m = url.searchParams.get('month');
	if (y && m) {
		activeMonth.set({ year: Number(y), month: Number(m) });
	}
}

export function monthQueryParams(ym: YearMonth): string {
	return `year=${ym.year}&month=${ym.month}`;
}
