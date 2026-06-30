import type { NavItem } from './navigation';

export const WORKFLOW_TASK_KEYS = [
	'worktime',
	'rate',
	'travel',
	'incoming',
	'approval',
	'outgoing',
	'marica'
] as const;

export type WorkflowTaskKey = (typeof WORKFLOW_TASK_KEYS)[number];

export interface WorkflowNavItem extends NavItem {
	key: WorkflowTaskKey;
}

/** Monthly workflow steps in order (spec B). */
export const workflowSteps: WorkflowNavItem[] = [
	{ key: 'worktime', href: '/worktime', labelKey: 'nav.worktime', headerLabelKey: 'nav.worktimeShort', icon: 'clock' },
	{ key: 'rate', href: '/rates', labelKey: 'nav.rates', headerLabelKey: 'nav.ratesShort', icon: 'euro-sign' },
	{ key: 'travel', href: '/travel', labelKey: 'nav.travel', headerLabelKey: 'nav.travelShort', icon: 'car' },
	{
		key: 'incoming',
		href: '/invoices/incoming',
		labelKey: 'nav.incoming',
		headerLabelKey: 'nav.incomingShort',
		icon: 'file-import'
	},
	{ key: 'approval', href: '/approval', labelKey: 'nav.approval', headerLabelKey: 'nav.approvalShort', icon: 'circle-check' },
	{
		key: 'outgoing',
		href: '/invoices/outgoing',
		labelKey: 'nav.outgoing',
		headerLabelKey: 'nav.outgoingShort',
		icon: 'file-export'
	},
	{
		key: 'marica',
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
	{ href: '/payments', labelKey: 'nav.payments', headerLabelKey: 'nav.paymentsShort', icon: 'building-columns' },
	{ href: '/contracts', labelKey: 'nav.contracts', headerLabelKey: 'nav.contractsShort', icon: 'file-contract' }
];

export const settingsNavItem: NavItem = {
	href: '/settings',
	labelKey: 'nav.settings',
	headerLabelKey: 'nav.settingsShort',
	icon: 'gear'
};
