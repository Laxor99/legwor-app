import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const target = new URL(url);
	target.pathname = '/car';
	throw redirect(307, target.pathname + target.search);
};
