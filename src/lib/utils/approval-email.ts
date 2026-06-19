import type { Locale } from '$lib/i18n';
import { formatMonthEn } from '$lib/utils/dates';
import type { getDashboardData } from '$lib/services/dashboard';

type Dashboard = Awaited<ReturnType<typeof getDashboardData>>;

export function buildApprovalEmail(
	year: number,
	month: number,
	dashboard: Dashboard,
	config: Record<string, string>
): { subject: string; body: string; mailto: string } {
	const monthEn = formatMonthEn({ year, month });
	const d = dashboard;
	const subject = `Ferenc Kiss Time and Expense ${year} [${monthEn}]`;
	const body = `Hello Vincent,

Time
Normal working   ${d.worktime.normalDays} days
Extra days       ${d.worktime.extraDays} days
In total         ${d.worktime.totalDays} days
Targeted annual  ${d.worktime.yearlyWorked}/${d.worktime.limit} days

Expenses
Hotel            ${d.expenses.hotel.toLocaleString('hu-HU')} HUF
Car              ${d.expenses.car.toLocaleString('hu-HU')} HUF

Please approve with reply to this email
Many thanks in advance
Regards

${config.employee_name || 'Ferenc Kiss'}
${config.employee_title || 'Automation Technology Manager'}
Mobile: +36704520246, +36 30 3480 915
Givaudan International SA, Bence u. 1., Váci Greens, 'B' building, H-1138 Budapest, Hungary`;

	const vincentEmail = config.vincent_email || '';
	const mailto = vincentEmail
		? `mailto:${encodeURIComponent(vincentEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
		: '';

	return { subject, body, mailto };
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
