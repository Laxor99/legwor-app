import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { invoices } from '$lib/db/schema';
import type { YearMonth } from '$lib/utils/dates';
import { toMonthYear } from '$lib/utils/dates';
import { getCarSummary } from './car';
import { getPaymentsForMonth } from './payments';
import { getSelectedRate } from './exchange-rate';
import { getWorktimeSummary } from './worktime';

export interface MonthlyChecklistItem {
	key: string;
	href: string;
	labelKey: string;
	/** Font Awesome solid icon name (without fa- prefix) */
	icon: string;
	done: boolean;
}

function monthUrl(path: string, { year, month }: YearMonth): string {
	return `${path}?year=${year}&month=${month}`;
}

export function buildMonthlyChecklist(
	ym: YearMonth,
	data: {
		eurRate: number | null;
		worktime: { totalDays: number };
		revenue: { eur: number };
		incomingCount: number;
		car: { tripCount: number; motorwayCost: number };
		payments: Array<{ key: string; id?: number }>;
		approvalStatus?: string;
	}
): MonthlyChecklistItem[] {
	const maricaPayments = data.payments.filter((p) => p.key !== 'fleetcor');
	const paymentsSaved =
		maricaPayments.length > 0 && maricaPayments.every((p) => p.id != null);
	const approvalDone =
		data.approvalStatus === 'bekuldve' ||
		data.approvalStatus === 'elfogadva' ||
		data.approvalStatus === 'szamlazva' ||
		data.approvalStatus === 'lezarva';

	return [
		{
			key: 'car',
			href: monthUrl('/travel', ym),
			labelKey: 'dashboard.checklist.car',
			icon: 'car',
			done: data.car.tripCount > 0 || data.car.motorwayCost > 0
		},
		{
			key: 'worktime',
			href: monthUrl('/worktime', ym),
			labelKey: 'dashboard.checklist.worktime',
			icon: 'clock',
			done: data.worktime.totalDays > 0
		},
		{
			key: 'approval',
			href: monthUrl('/approval', ym),
			labelKey: 'dashboard.checklist.approval',
			icon: 'circle-check',
			done: approvalDone
		},
		{
			key: 'outgoing',
			href: monthUrl('/invoices/outgoing', ym),
			labelKey: 'dashboard.checklist.outgoing',
			icon: 'file-export',
			done: data.revenue.eur > 0
		},
		{
			key: 'incoming',
			href: monthUrl('/invoices/incoming', ym),
			labelKey: 'dashboard.checklist.incoming',
			icon: 'file-import',
			done: data.incomingCount > 0
		},
		{
			key: 'payments',
			href: monthUrl('/payments', ym),
			labelKey: 'dashboard.checklist.payments',
			icon: 'building-columns',
			done: paymentsSaved
		},
		{
			key: 'rate',
			href: monthUrl('/rates', ym),
			labelKey: 'dashboard.checklist.rate',
			icon: 'euro-sign',
			done: data.eurRate != null && data.eurRate > 0
		}
	];
}

export function checklistProgress(items: MonthlyChecklistItem[]): { done: number; total: number } {
	const done = items.filter((item) => item.done).length;
	return { done, total: items.length };
}

export async function getChecklistProgressForMonth(
	ym: YearMonth,
	approvalStatus?: string | null
): Promise<{ done: number; total: number }> {
	const monthYear = toMonthYear(ym);
	const [worktime, car, paymentRows, eurRate, incomingCountRow, outgoing] = await Promise.all([
		getWorktimeSummary(ym),
		getCarSummary(ym),
		getPaymentsForMonth(ym),
		getSelectedRate(ym),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(invoices)
			.where(and(eq(invoices.type, 'incoming'), eq(invoices.monthYear, monthYear))),
		db
			.select({
				totalEur: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.currency} = 'EUR' THEN ${invoices.grossAmount} ELSE 0 END), 0)`
			})
			.from(invoices)
			.where(and(eq(invoices.type, 'outgoing'), eq(invoices.monthYear, monthYear)))
	]);

	const checklist = buildMonthlyChecklist(ym, {
		eurRate,
		worktime,
		revenue: { eur: Number(outgoing[0]?.totalEur ?? 0) },
		incomingCount: Number(incomingCountRow[0]?.count ?? 0),
		car: { tripCount: car.trips.length, motorwayCost: car.motorwayCost },
		payments: paymentRows,
		approvalStatus: approvalStatus ?? undefined
	});

	return checklistProgress(checklist);
}
