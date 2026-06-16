import type { YearMonth } from '$lib/utils/dates';

export interface MonthlyChecklistItem {
	key: string;
	href: string;
	labelKey: string;
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
	}
): MonthlyChecklistItem[] {
	const maricaPayments = data.payments.filter((p) => p.key !== 'fleetcor');
	const paymentsSaved =
		maricaPayments.length > 0 && maricaPayments.every((p) => p.id != null);

	return [
		{
			key: 'rate',
			href: monthUrl('/rates', ym),
			labelKey: 'dashboard.checklist.rate',
			icon: '💶',
			done: data.eurRate != null && data.eurRate > 0
		},
		{
			key: 'worktime',
			href: monthUrl('/worktime', ym),
			labelKey: 'dashboard.checklist.worktime',
			icon: '⏱️',
			done: data.worktime.totalDays > 0
		},
		{
			key: 'outgoing',
			href: monthUrl('/invoices', ym),
			labelKey: 'dashboard.checklist.outgoing',
			icon: '🧾',
			done: data.revenue.eur > 0
		},
		{
			key: 'incoming',
			href: monthUrl('/invoices', ym),
			labelKey: 'dashboard.checklist.incoming',
			icon: '📥',
			done: data.incomingCount > 0
		},
		{
			key: 'car',
			href: monthUrl('/car', ym),
			labelKey: 'dashboard.checklist.car',
			icon: '🚗',
			done: data.car.tripCount > 0 || data.car.motorwayCost > 0
		},
		{
			key: 'payments',
			href: monthUrl('/payments', ym),
			labelKey: 'dashboard.checklist.payments',
			icon: '🏦',
			done: paymentsSaved
		}
	];
}
