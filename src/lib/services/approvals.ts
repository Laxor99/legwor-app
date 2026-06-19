import { and, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { approvals } from '$lib/db/schema';
import type { YearMonth } from '$lib/utils/dates';

export type ApprovalStatus =
	| 'folyamatban'
	| 'bekuldve'
	| 'elfogadva'
	| 'elutasitva'
	| 'szamlazva'
	| 'lezarva';

export async function getApproval({ year, month }: YearMonth) {
	return db.query.approvals.findFirst({
		where: and(eq(approvals.year, year), eq(approvals.month, month))
	});
}

export async function getOrCreateApproval(ym: YearMonth) {
	const existing = await getApproval(ym);
	if (existing) return existing;
	const [row] = await db
		.insert(approvals)
		.values({ year: ym.year, month: ym.month, status: 'folyamatban' })
		.returning();
	return row;
}

export async function submitForApproval(ym: YearMonth) {
	const now = new Date();
	await getOrCreateApproval(ym);
	await db
		.update(approvals)
		.set({ status: 'bekuldve', submittedAt: now, updatedAt: now })
		.where(and(eq(approvals.year, ym.year), eq(approvals.month, ym.month)));
}

export async function markApproved(ym: YearMonth, response?: string) {
	const now = new Date();
	await db
		.update(approvals)
		.set({
			status: 'elfogadva',
			approvedAt: now,
			approverResponse: response ?? null,
			rejectionReason: null,
			updatedAt: now
		})
		.where(and(eq(approvals.year, ym.year), eq(approvals.month, ym.month)));
}

export async function markRejected(ym: YearMonth, reason: string) {
	const now = new Date();
	await db
		.update(approvals)
		.set({
			status: 'elutasitva',
			rejectionReason: reason,
			updatedAt: now
		})
		.where(and(eq(approvals.year, ym.year), eq(approvals.month, ym.month)));
}

export async function setApprovalFile(ym: YearMonth, filePath: string) {
	const now = new Date();
	await db
		.update(approvals)
		.set({ approvalFilePath: filePath, updatedAt: now })
		.where(and(eq(approvals.year, ym.year), eq(approvals.month, ym.month)));
}
