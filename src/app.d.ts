import type { Locale } from '$lib/i18n';

declare global {
	namespace App {
		interface Locals {
			authenticated: boolean;
			locale: Locale;
		}
		interface PageData {}
		interface PageState {}
		interface Platform {}
	}
}

export {};
