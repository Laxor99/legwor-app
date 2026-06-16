import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { t } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!env.APP_PIN?.trim()) {
		throw redirect(303, '/dashboard');
	}
	return { locale: locals.locale };
};

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		const pin = env.APP_PIN?.trim();
		if (!pin) throw redirect(303, '/dashboard');

		const form = await request.formData();
		const entered = String(form.get('pin') ?? '');

		if (entered !== pin) {
			return fail(401, { error: t(locals.locale, 'errors.wrongPin') });
		}

		cookies.set('legwor_auth', '1', {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 30
		});

		throw redirect(303, '/dashboard');
	}
};
