import { LOCALE_COOKIE, parseLocale } from '$lib/i18n';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const form = await request.formData();
	const locale = parseLocale(String(form.get('locale') ?? ''));
	cookies.set(LOCALE_COOKIE, locale, {
		path: '/',
		maxAge: 60 * 60 * 24 * 365,
		httpOnly: false,
		sameSite: 'lax'
	});
	const redirectTo = String(form.get('redirect') ?? '/dashboard');
	throw redirect(303, redirectTo);
};
