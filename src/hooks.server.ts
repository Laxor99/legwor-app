import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

const AUTH_COOKIE = 'legwor_auth';

export const handle: Handle = async ({ event, resolve }) => {
	const pin = env.APP_PIN?.trim();
	event.locals.authenticated = !pin;

	if (!pin) {
		return resolve(event);
	}

	const authed = event.cookies.get(AUTH_COOKIE) === '1';
	event.locals.authenticated = authed;

	const isLogin = event.url.pathname === '/login';
	if (!authed && !isLogin) {
		throw redirect(303, '/login');
	}
	if (authed && isLogin) {
		throw redirect(303, '/dashboard');
	}

	return resolve(event);
};
