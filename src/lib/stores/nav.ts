import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'legwor_sidebar_collapsed';

function readCollapsed(): boolean {
	if (!browser) return false;
	return localStorage.getItem(STORAGE_KEY) === '1';
}

export const sidebarCollapsed = writable(readCollapsed());

export function toggleSidebarCollapsed() {
	sidebarCollapsed.update((v) => {
		const next = !v;
		if (browser) localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
		return next;
	});
}

export const mobileNavOpen = writable(false);

export function toggleMobileNav() {
	mobileNavOpen.update((v) => !v);
}
