import type { NavItem } from './navigation';

/** Monthly workflow steps in order (spec B). */
export const workflowSteps: NavItem[] = [
	{ href: '/travel', labelKey: 'nav.travel', headerLabelKey: 'nav.travelShort', icon: 'car' },
	{ href: '/worktime', labelKey: 'nav.worktime', headerLabelKey: 'nav.worktimeShort', icon: 'clock' },
	{ href: '/approval', labelKey: 'nav.approval', headerLabelKey: 'nav.approvalShort', icon: 'circle-check' },
	{
		href: '/invoices/outgoing',
		labelKey: 'nav.outgoing',
		headerLabelKey: 'nav.outgoingShort',
		icon: 'file-export'
	},
	{
		href: '/invoices/incoming',
		labelKey: 'nav.incoming',
		headerLabelKey: 'nav.incomingShort',
		icon: 'file-import'
	},
	{ href: '/payments', labelKey: 'nav.payments', headerLabelKey: 'nav.paymentsShort', icon: 'building-columns' },
	{
		href: '/email/marica-summary',
		labelKey: 'nav.maricaEmail',
		headerLabelKey: 'nav.maricaEmailShort',
		icon: 'envelope'
	}
];

export const overviewNavItem: NavItem = {
	href: '/dashboard',
	labelKey: 'nav.dashboard',
	headerLabelKey: 'nav.dashboardShort',
	icon: 'chart-pie'
};

export const secondaryNavItems: NavItem[] = [
	{ href: '/rates', labelKey: 'nav.rates', headerLabelKey: 'nav.ratesShort', icon: 'euro-sign' },
	{ href: '/contracts', labelKey: 'nav.contracts', headerLabelKey: 'nav.contractsShort', icon: 'file-contract' }
];

export const settingsNavItem: NavItem = {
	href: '/settings',
	labelKey: 'nav.settings',
	headerLabelKey: 'nav.settingsShort',
	icon: 'gear'
};

export function getNextWorkflowStep(pathname: string, searchParams?: URLSearchParams): NavItem | null {
	let current = -1;
	if (pathname.startsWith('/car') || pathname.startsWith('/travel')) current = 0;
	else if (pathname.startsWith('/worktime')) current = 1;
	else if (pathname.startsWith('/approval')) current = 2;
	else if (
		pathname.startsWith('/invoices/outgoing') ||
		(pathname.startsWith('/invoices') && searchParams?.get('tab') === 'outgoing')
	)
		current = 3;
	else if (
		pathname.startsWith('/invoices/incoming') ||
		(pathname.startsWith('/invoices') && searchParams?.get('tab') === 'incoming')
	)
		current = 4;
	else if (pathname.startsWith('/payments')) current = 5;
	else if (pathname.startsWith('/email')) current = 6;

	if (current < 0 || current >= workflowSteps.length - 1) return null;
	return workflowSteps[current + 1];
}
