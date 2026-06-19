import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { approvals, invoices, payments } from '$lib/db/schema';
import { getConfig } from './config';
import { getApproval, type ApprovalStatus } from './approvals';
import { getDefaultActiveMonth, monthsInYear, type YearMonth } from '$lib/utils/dates';
import { toMonthYear } from '$lib/utils/dates';

export type MonthWorkflowStatus = ApprovalStatus;

export interface MonthStatusRow {
	year: number;
	month: number;
	status: MonthWorkflowStatus;
}

async function hasOutgoingInvoice(ym: YearMonth): Promise<boolean> {
	const monthYear = toMonthYear(ym);
	const rows = await db
		.select({ count: sql<number>`COUNT(*)::int` })
		.from(invoices)
		.where(and(eq(invoices.type, 'outgoing'), eq(invoices.monthYear, monthYear)));
	return Number(rows[0]?.count ?? 0) > 0;
}

async function allPaymentsPaid(ym: YearMonth): Promise<boolean> {
	const rows = await db
		.select({ total: sql<number>`COUNT(*)::int`, paid: sql<number>`SUM(CASE WHEN ${payments.isPaid} THEN 1 ELSE 0 END)::int` })
		.from(payments)
		.where(and(eq(payments.year, ym.year), eq(payments.month, ym.month)));
	const total = Number(rows[0]?.total ?? 0);
	const paid = Number(rows[0]?.paid ?? 0);
	return total > 0 && total === paid;
}

async function maricaEmailSent(ym: YearMonth): Promise<boolean> {
	const key = `marica_sent_${ym.year}_${ym.month}`;
	const val = await getConfig(key);
	return val === '1' || val === 'true';
}

export async function resolveMonthStatus(ym: YearMonth): Promise<MonthWorkflowStatus> {
	const [approval, invoiced, paid, maricaSent] = await Promise.all([
		getApproval(ym),
		hasOutgoingInvoice(ym),
		allPaymentsPaid(ym),
		maricaEmailSent(ym)
	]);

	if (maricaSent && paid) return 'lezarva';
	if (invoiced) return 'szamlazva';

	const base = (approval?.status as MonthWorkflowStatus) ?? 'folyamatban';
	if (base === 'elfogadva' && invoiced) return 'szamlazva';
	return base;
}

export async function getMonthStatusList(
	end: YearMonth = getDefaultActiveMonth()
): Promise<MonthStatusRow[]> {
	const months = monthsInYear(end.year);
	return Promise.all(
		months.map(async (ym) => ({
			year: ym.year,
			month: ym.month,
			status: await resolveMonthStatus(ym)
		}))
	);
}
