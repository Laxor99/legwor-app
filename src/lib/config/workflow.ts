import type { NavItem } from './navigation';

/** Monthly workflow steps in order (spec B). */
export const workflowSteps: NavItem[] = [
	{ href: '/travel', labelKey: 'nav.travel', headerLabelKey: 'nav.travelShort', icon: '🚗' },
	{ href: '/worktime', labelKey: 'nav.worktime', headerLabelKey: 'nav.worktimeShort', icon: '⏱️' },
	{ href: '/approval', labelKey: 'nav.approval', headerLabelKey: 'nav.approvalShort', icon: '✅' },
	{
		href: '/invoices/outgoing',
		labelKey: 'nav.outgoing',
		headerLabelKey: 'nav.outgoingShort',
		icon: '📤'
	},
	{
		href: '/invoices/incoming',
		labelKey: 'nav.incoming',
		headerLabelKey: 'nav.incomingShort',
		icon: '📥'
	},
	{ href: '/payments', labelKey: 'nav.payments', headerLabelKey: 'nav.paymentsShort', icon: '🏦' },
	{
		href: '/email/marica-summary',
		labelKey: 'nav.maricaEmail',
		headerLabelKey: 'nav.maricaEmailShort',
		icon: '✉️'
	}
];

export const overviewNavItem: NavItem = {
	href: '/dashboard',
	labelKey: 'nav.dashboard',
	headerLabelKey: 'nav.dashboardShort',
	icon: '📅'
};

export const secondaryNavItems: NavItem[] = [
	{ href: '/rates', labelKey: 'nav.rates', headerLabelKey: 'nav.ratesShort', icon: '💶' },
	{ href: '/contracts', labelKey: 'nav.contracts', headerLabelKey: 'nav.contractsShort', icon: '📋' }
];

export const settingsNavItem: NavItem = {
	href: '/settings',
	labelKey: 'nav.settings',
	headerLabelKey: 'nav.settingsShort',
	icon: '⚙️'
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
