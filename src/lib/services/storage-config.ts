import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { storageConfig } from '$lib/db/schema';
import { env } from '$env/dynamic/private';
import path from 'path';

export type StorageType = 'local' | 'supabase';

export interface StorageConfigRow {
	storageType: StorageType;
	localRootPath: string;
	supabaseUrl: string;
	supabaseBucket: string;
	supabaseKeyEncrypted: string;
	lastTestedAt: Date | null;
	lastTestSuccess: boolean | null;
}

const DEFAULT_LOCAL = './uploads';

export async function getStorageConfig(): Promise<StorageConfigRow> {
	const row = await db.query.storageConfig.findFirst({
		where: eq(storageConfig.isActive, true),
		orderBy: [desc(storageConfig.id)]
	});
	return {
		storageType: (row?.storageType as StorageType) ?? 'local',
		localRootPath: row?.localRootPath ?? env.UPLOAD_DIR ?? DEFAULT_LOCAL,
		supabaseUrl: row?.supabaseUrl ?? '',
		supabaseBucket: row?.supabaseBucket ?? '',
		supabaseKeyEncrypted: row?.supabaseKeyEncrypted ?? '',
		lastTestedAt: row?.lastTestedAt ?? null,
		lastTestSuccess: row?.lastTestSuccess ?? null
	};
}

export async function saveStorageConfig(data: Partial<StorageConfigRow>): Promise<void> {
	const existing = await db.query.storageConfig.findFirst({
		where: eq(storageConfig.isActive, true),
		orderBy: [desc(storageConfig.id)]
	});
	const now = new Date();
	if (existing) {
		await db
			.update(storageConfig)
			.set({
				storageType: data.storageType ?? existing.storageType,
				localRootPath: data.localRootPath ?? existing.localRootPath,
				supabaseUrl: data.supabaseUrl ?? existing.supabaseUrl,
				supabaseBucket: data.supabaseBucket ?? existing.supabaseBucket,
				supabaseKeyEncrypted:
					data.supabaseKeyEncrypted !== undefined
						? data.supabaseKeyEncrypted
						: existing.supabaseKeyEncrypted,
				updatedAt: now
			})
			.where(eq(storageConfig.id, existing.id));
	} else {
		await db.insert(storageConfig).values({
			storageType: data.storageType ?? 'local',
			localRootPath: data.localRootPath ?? DEFAULT_LOCAL,
			supabaseUrl: data.supabaseUrl ?? '',
			supabaseBucket: data.supabaseBucket ?? '',
			supabaseKeyEncrypted: data.supabaseKeyEncrypted ?? '',
			isActive: true
		});
	}
}

export async function markStorageTest(success: boolean): Promise<void> {
	const existing = await db.query.storageConfig.findFirst({
		where: eq(storageConfig.isActive, true),
		orderBy: [desc(storageConfig.id)]
	});
	if (!existing) return;
	await db
		.update(storageConfig)
		.set({ lastTestedAt: new Date(), lastTestSuccess: success, updatedAt: new Date() })
		.where(eq(storageConfig.id, existing.id));
}

export const STORAGE_SUBDIRS = {
	incomingInvoices: 'szamlak/beerkezo',
	outgoingInvoices: 'szamlak/kiallitott',
	excelExport: 'excel_export',
	pdfExport: 'pdf_export',
	contracts: 'szerzodesek',
	approvalDocs: 'approval_dokumentumok'
} as const;

export function resolveLocalRoot(config: StorageConfigRow): string {
	return path.resolve(config.localRootPath || DEFAULT_LOCAL);
}
