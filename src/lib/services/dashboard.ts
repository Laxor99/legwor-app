import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { invoices } from '$lib/db/schema';
import type { YearMonth } from '$lib/utils/dates';
import { toMonthYear } from '$lib/utils/dates';
import { getWorktimeSummary } from './worktime';
import { getCarSummary } from './car';
import { getPaymentsForMonth } from './payments';
import { getSelectedRate } from './exchange-rate';
import { buildMonthlyChecklist } from './monthly-checklist';
import { resolveMonthStatus } from './month-status';

export async function getDashboardData(ym: YearMonth) {
	const monthYear = toMonthYear(ym);
	const [worktime, car, paymentRows, eurRate] = await Promise.all([
		getWorktimeSummary(ym),
		getCarSummary(ym),
		getPaymentsForMonth(ym),
		getSelectedRate(ym)
	]);

	const [expenseRows, incomingCountRow, outgoing, approvalStatus] = await Promise.all([
		db
			.select({
				category: invoices.category,
				total: sql<number>`COALESCE(SUM(${invoices.grossAmount}), 0)`
			})
			.from(invoices)
			.where(and(eq(invoices.type, 'incoming'), eq(invoices.monthYear, monthYear)))
			.groupBy(invoices.category),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(invoices)
			.where(and(eq(invoices.type, 'incoming'), eq(invoices.monthYear, monthYear))),
		db
			.select({
				totalEur: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.currency} = 'EUR' THEN ${invoices.grossAmount} ELSE 0 END), 0)`,
				totalHuf: sql<number>`COALESCE(SUM(${invoices.hufEquivalent}), 0)`
			})
			.from(invoices)
			.where(and(eq(invoices.type, 'outgoing'), eq(invoices.monthYear, monthYear))),
		resolveMonthStatus(ym)
	]);

	const expenses: Record<string, number> = {};
	for (const row of expenseRows) {
		expenses[row.category ?? 'Egyéb'] = Number(row.total);
	}

	const incomingCount = Number(incomingCountRow[0]?.count ?? 0);
	const revenueEur = Number(outgoing[0]?.totalEur ?? 0);
	const revenueHuf =
		Number(outgoing[0]?.totalHuf ?? 0) || (eurRate ? revenueEur * eurRate : 0);

	const checklist = buildMonthlyChecklist(ym, {
		eurRate,
		worktime,
		revenue: { eur: revenueEur },
		incomingCount,
		car: { tripCount: car.trips.length, motorwayCost: car.motorwayCost },
		payments: paymentRows,
		approvalStatus
	});

	return {
		worktime,
		revenue: { eur: revenueEur, huf: revenueHuf, rate: eurRate },
		car: {
			totalAmount: car.totalAmount,
			tripAmount: car.tripAmount,
			motorwayCost: car.motorwayCost,
			tripCount: car.trips.length
		},
		expenses: {
			hotel: expenses['Hotel'] ?? 0,
			car: car.totalAmount,
			fleetcor: expenses['FleetCor'] ?? expenses['Üzemanyag'] ?? 0,
			other: expenses['Egyéb'] ?? 0,
			byCategory: expenses
		},
		payments: paymentRows,
		checklist
	};
}
