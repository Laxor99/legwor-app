import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { carExpenses, invoices, payments, workDays, workMonths } from '$lib/db/schema';
import { getConfig } from './config';
import { getApproval, type ApprovalStatus } from './approvals';
import { getChecklistProgressForMonth } from './monthly-checklist';
import { getDefaultActiveMonth, monthsInYear, type YearMonth } from '$lib/utils/dates';
import { toMonthYear } from '$lib/utils/dates';

export type MonthWorkflowStatus = ApprovalStatus;

export interface MonthStatusRow {
	year: number;
	month: number;
	status: MonthWorkflowStatus | null;
	progressDone: number;
	progressTotal: number;
}

async function hasMonthActivity(
	ym: YearMonth,
	approval: Awaited<ReturnType<typeof getApproval>>
): Promise<boolean> {
	if (approval != null) return true;

	const monthYear = toMonthYear(ym);
	const [workMonth, workDayCount, carCount, invoiceCount, paymentCount] = await Promise.all([
		db.query.workMonths.findFirst({
			where: and(eq(workMonths.year, ym.year), eq(workMonths.month, ym.month))
		}),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(workDays)
			.where(and(eq(workDays.year, ym.year), eq(workDays.month, ym.month))),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(carExpenses)
			.where(and(eq(carExpenses.year, ym.year), eq(carExpenses.month, ym.month))),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(invoices)
			.where(eq(invoices.monthYear, monthYear)),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(payments)
			.where(and(eq(payments.year, ym.year), eq(payments.month, ym.month)))
	]);

	const hasWork =
		Number(workDayCount[0]?.count ?? 0) > 0 ||
		(workMonth != null &&
			((workMonth.normalDays ?? 0) > 0 ||
				(workMonth.extraDays ?? 0) > 0 ||
				Boolean(workMonth.notes?.trim())));

	return (
		hasWork ||
		Number(carCount[0]?.count ?? 0) > 0 ||
		Number(invoiceCount[0]?.count ?? 0) > 0 ||
		Number(paymentCount[0]?.count ?? 0) > 0
	);
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

async function resolveMonthStatusFor(
	ym: YearMonth,
	approval: Awaited<ReturnType<typeof getApproval>>
): Promise<MonthWorkflowStatus | null> {
	const [invoiced, paid, maricaSent, started] = await Promise.all([
		hasOutgoingInvoice(ym),
		allPaymentsPaid(ym),
		maricaEmailSent(ym),
		hasMonthActivity(ym, approval)
	]);

	if (maricaSent && paid) return 'lezarva';
	if (invoiced) return 'szamlazva';

	const base = (approval?.status as MonthWorkflowStatus) ?? 'folyamatban';
	if (base === 'elfogadva' && invoiced) return 'szamlazva';
	if (base === 'folyamatban' && !started) return null;
	return base;
}

export async function resolveMonthStatus(ym: YearMonth): Promise<MonthWorkflowStatus | null> {
	const approval = await getApproval(ym);
	return resolveMonthStatusFor(ym, approval);
}

async function loadMonthRow(ym: YearMonth): Promise<MonthStatusRow> {
	const approval = await getApproval(ym);
	const [status, progress] = await Promise.all([
		resolveMonthStatusFor(ym, approval),
		getChecklistProgressForMonth(ym, approval?.status)
	]);
	return {
		year: ym.year,
		month: ym.month,
		status,
		progressDone: progress.done,
		progressTotal: progress.total
	};
}

export async function getMonthStatusList(
	end: YearMonth = getDefaultActiveMonth()
): Promise<MonthStatusRow[]> {
	const months = monthsInYear(end.year);
	return Promise.all(months.map(loadMonthRow));
}
