import { mkdir, writeFile, readFile, unlink, readdir } from 'fs/promises';
import path from 'path';
import {
	getStorageConfig,
	markStorageTest,
	resolveLocalRoot,
	type StorageConfigRow
} from './storage-config';

function safeSegment(value: string): string {
	return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function resolvePath(config: StorageConfigRow, relativePath: string): string | null {
	const root = resolveLocalRoot(config);
	const resolved = path.resolve(root, relativePath);
	if (!resolved.startsWith(root + path.sep) && resolved !== root) return null;
	return resolved;
}

async function saveLocal(
	config: StorageConfigRow,
	subdir: string,
	data: Buffer,
	filename: string
): Promise<string> {
	const dir = path.join(resolveLocalRoot(config), subdir);
	await mkdir(dir, { recursive: true });
	const safeName = `${Date.now()}-${safeSegment(filename)}`;
	const fullPath = path.join(dir, safeName);
	await writeFile(fullPath, data);
	return path.posix.join(subdir, safeName);
}

export async function saveFile(
	subdir: string,
	file: File | Buffer,
	filename: string
): Promise<string> {
	const config = await getStorageConfig();
	const data = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

	if (config.storageType === 'supabase') {
		throw new Error('Supabase Storage is not configured in this build. Use local storage.');
	}
	return saveLocal(config, subdir, data, filename);
}

export async function getFile(relativePath: string): Promise<Buffer | null> {
	const config = await getStorageConfig();
	if (config.storageType === 'supabase') {
		throw new Error('Supabase Storage is not configured in this build.');
	}
	const full = resolvePath(config, relativePath);
	if (!full) return null;
	try {
		return await readFile(full);
	} catch {
		return null;
	}
}

export async function deleteFile(relativePath: string | null | undefined): Promise<void> {
	if (!relativePath) return;
	const config = await getStorageConfig();
	if (config.storageType === 'supabase') return;
	const full = resolvePath(config, relativePath);
	if (!full) return;
	try {
		await unlink(full);
	} catch {
		// already gone
	}
}

export async function listFiles(subdir: string): Promise<string[]> {
	const config = await getStorageConfig();
	if (config.storageType === 'supabase') return [];
	const dir = path.join(resolveLocalRoot(config), subdir);
	try {
		const entries = await readdir(dir);
		return entries.map((e) => path.posix.join(subdir, e));
	} catch {
		return [];
	}
}

export async function testStorageConnection(): Promise<{ ok: boolean; message: string }> {
	const config = await getStorageConfig();
	try {
		if (config.storageType === 'supabase') {
			await markStorageTest(false);
			return { ok: false, message: 'Supabase Storage SDK not installed. Use local storage.' };
		}
		const testName = `.legwor-test-${Date.now()}.txt`;
		const rel = await saveLocal(config, '.tests', Buffer.from('ok'), testName);
		const full = resolvePath(config, rel);
		if (!full) throw new Error('Invalid path');
		const content = await readFile(full, 'utf8');
		await unlink(full);
		if (content !== 'ok') throw new Error('Read mismatch');
		await markStorageTest(true);
		return { ok: true, message: 'Local storage OK' };
	} catch (e) {
		await markStorageTest(false);
		return { ok: false, message: e instanceof Error ? e.message : 'Test failed' };
	}
}
