import { formatMonthEn } from '$lib/utils/dates';
import type { getDashboardData } from '$lib/services/dashboard';

type Dashboard = Awaited<ReturnType<typeof getDashboardData>>;

const EXPENSE_CATEGORY_ORDER = ['Hotel', 'Üzemanyag', 'FleetCor', 'Egyéb'] as const;

const CATEGORY_LABELS_EN: Record<string, string> = {
	Hotel: 'Hotel',
	Üzemanyag: 'Fuel',
	FleetCor: 'FleetCor',
	Egyéb: 'Other'
};

function formatHuf(amount: number): string {
	return Math.round(amount).toLocaleString('hu-HU');
}

function formatLine(label: string, value: string): string {
	return `${label.padEnd(16)} ${value}`;
}

function categoryLabel(category: string): string {
	return CATEGORY_LABELS_EN[category] ?? category;
}

function buildTimeSection(d: Dashboard): string {
	return [
		'Time',
		formatLine('Normal working', `${d.worktime.normalDays} days`),
		formatLine('Extra days', `${d.worktime.extraDays} days`),
		formatLine('In total', `${d.worktime.totalDays} days`),
		formatLine('Targeted annual', `${d.worktime.yearlyWorked}/${d.worktime.limit} days`)
	].join('\n');
}

function buildExpenseSection(d: Dashboard): string {
	const lines: string[] = ['Expenses'];
	const byCategory = d.expenses.byCategory ?? {};
	const addedCategories = new Set<string>();
	let total = 0;

	const carTotal = d.car?.totalAmount ?? d.expenses.car ?? 0;
	if (carTotal > 0) {
		lines.push(formatLine('Car', `${formatHuf(carTotal)} HUF`));
		total += carTotal;

		const tripAmount = d.car?.tripAmount ?? 0;
		const motorwayCost = d.car?.motorwayCost ?? 0;
		if (tripAmount > 0) {
			lines.push(formatLine('  Travel', `${formatHuf(tripAmount)} HUF`));
		}
		if (motorwayCost > 0) {
			lines.push(formatLine('  Motorway', `${formatHuf(motorwayCost)} HUF`));
		}
	}

	for (const category of EXPENSE_CATEGORY_ORDER) {
		const amount = Number(byCategory[category] ?? 0);
		if (amount <= 0) continue;
		lines.push(formatLine(categoryLabel(category), `${formatHuf(amount)} HUF`));
		addedCategories.add(category);
		total += amount;
	}

	for (const [category, amountRaw] of Object.entries(byCategory)) {
		if (addedCategories.has(category)) continue;
		const amount = Number(amountRaw);
		if (amount <= 0) continue;
		lines.push(formatLine(categoryLabel(category), `${formatHuf(amount)} HUF`));
		total += amount;
	}

	if (lines.length === 1) {
		lines.push(formatLine('(none recorded)', '0 HUF'));
	} else {
		lines.push(formatLine('Total', `${formatHuf(total)} HUF`));
	}

	return lines.join('\n');
}

function buildRevenueSection(d: Dashboard): string | null {
	if (d.revenue.eur <= 0 && d.revenue.huf <= 0) return null;

	const lines = ['Revenue'];
	if (d.revenue.eur > 0) {
		lines.push(
			formatLine(
				'Invoice',
				`${d.revenue.eur.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} EUR`
			)
		);
	}
	if (d.revenue.huf > 0) {
		lines.push(formatLine('HUF equivalent', `${formatHuf(d.revenue.huf)} HUF`));
	}
	if (d.revenue.rate) {
		lines.push(formatLine('EUR/HUF rate', String(d.revenue.rate)));
	}
	return lines.join('\n');
}

export function buildApprovalEmail(
	year: number,
	month: number,
	dashboard: Dashboard,
	config: Record<string, string>
): { subject: string; body: string; mailto: string } {
	const monthEn = formatMonthEn({ year, month });
	const subject = `Ferenc Kiss Time and Expense ${year} [${monthEn}]`;

	const bodyParts = [
		'Hello Vincent,\n',
		buildTimeSection(dashboard),
		'',
		buildExpenseSection(dashboard)
	];

	const revenueSection = buildRevenueSection(dashboard);
	if (revenueSection) {
		bodyParts.push('', revenueSection);
	}

	bodyParts.push(
		'',
		'Please approve with reply to this email',
		'Many thanks in advance',
		'Regards',
		'',
		config.employee_name || 'Ferenc Kiss',
		config.employee_title || 'Automation Technology Manager',
		'Mobile: +36704520246, +36 30 3480 915',
		"Givaudan International SA, Bence u. 1., Váci Greens, 'B' building, H-1138 Budapest, Hungary"
	);

	const body = bodyParts.join('\n');

	const vincentEmail = config.vincent_email || '';
	const mailto = vincentEmail
		? `mailto:${encodeURIComponent(vincentEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
		: '';

	return { subject, body, mailto };
}

export function buildApprovalMailto(
	subject: string,
	body: string,
	config: Record<string, string>
): string {
	const vincentEmail = config.vincent_email || '';
	if (!vincentEmail) return '';
	return `mailto:${encodeURIComponent(vincentEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function statusLabelKey(status: string): string {
	return `status.${status}`;
}

export function statusBadgeClass(status: string): string {
	switch (status) {
		case 'folyamatban':
			return 'bg-muted/20 text-muted border-border';
		case 'bekuldve':
			return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
		case 'elfogadva':
			return 'bg-success/15 text-success border-success/30';
		case 'elutasitva':
			return 'bg-danger/15 text-danger border-danger/30';
		case 'szamlazva':
			return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
		case 'lezarva':
			return 'bg-emerald-700/20 text-emerald-400 border-emerald-600/30';
		default:
			return 'bg-muted/20 text-muted border-border';
	}
}
