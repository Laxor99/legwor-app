import { env } from '$env/dynamic/private';
import { getLocaleFromCookies } from '$lib/i18n';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

const AUTH_COOKIE = 'legwor_auth';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.locale = getLocaleFromCookies(event.cookies);

	const pin = env.APP_PIN?.trim();
	event.locals.authenticated = !pin;

	if (!pin) {
		return resolve(event);
	}

	const authed = event.cookies.get(AUTH_COOKIE) === '1';
	event.locals.authenticated = authed;

	const isLogin = event.url.pathname === '/login';
	const isLocaleApi = event.url.pathname === '/api/locale';
	if (!authed && !isLogin && !isLocaleApi) {
		throw redirect(303, '/login');
	}
	if (authed && isLogin) {
		throw redirect(303, '/dashboard');
	}

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('<html lang="hu">', `<html lang="${event.locals.locale}">`)
	});
};
