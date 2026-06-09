import { error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { resolveUploadPath } from '$lib/services/uploads';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const relativePath = params.path;
	if (!relativePath) throw error(404, 'Not found');

	const fullPath = resolveUploadPath(relativePath);
	if (!fullPath) throw error(400, 'Invalid path');

	try {
		const data = await readFile(fullPath);
		return new Response(data, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `inline; filename="${relativePath.split('/').pop()}"`
			}
		});
	} catch {
		throw error(404, 'File not found');
	}
};
