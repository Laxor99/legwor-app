import { json } from '@sveltejs/kit';
import { pickFolder } from '$lib/server/pick-folder';
import { t } from '$lib/i18n';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	const result = await pickFolder(t(locals.locale, 'settings.pickFolderPrompt'));

	if (result.ok) {
		return json({ path: result.path });
	}
	if (result.cancelled) {
		return json({ cancelled: true });
	}
	return json({ error: result.error }, { status: 501 });
};
