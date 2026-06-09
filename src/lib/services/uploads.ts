import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { env } from '$env/dynamic/private';

const ALLOWED_TYPES = new Set(['application/pdf']);

function uploadRoot(): string {
	return path.resolve(env.UPLOAD_DIR ?? './uploads');
}

function safeSegment(value: string): string {
	return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function savePdfUpload(file: File, subdir: string): Promise<string> {
	if (!file || file.size === 0) {
		throw new Error('Üres fájl.');
	}
	if (!ALLOWED_TYPES.has(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
		throw new Error('Csak PDF fájl tölthető fel.');
	}
	if (file.size > 10 * 1024 * 1024) {
		throw new Error('A fájl maximum 10 MB lehet.');
	}

	const dir = path.join(uploadRoot(), subdir);
	await mkdir(dir, { recursive: true });

	const filename = `${Date.now()}-${safeSegment(file.name)}`;
	const fullPath = path.join(dir, filename);
	await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));

	return path.posix.join(subdir, filename);
}

export function resolveUploadPath(relativePath: string): string | null {
	const root = uploadRoot();
	const resolved = path.resolve(root, relativePath);
	if (!resolved.startsWith(root + path.sep) && resolved !== root) {
		return null;
	}
	return resolved;
}

export async function deleteUpload(relativePath: string | null | undefined): Promise<void> {
	if (!relativePath) return;
	const full = resolveUploadPath(relativePath);
	if (!full) return;
	try {
		await unlink(full);
	} catch {
		// file may already be gone
	}
}
