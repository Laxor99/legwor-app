export interface NavItem {
	href: string;
	labelKey: string;
	headerLabelKey: string;
	/** Font Awesome solid icon name (without fa- prefix) */
	icon: string;
}

export const navItems: NavItem[] = [
	{ href: '/dashboard', labelKey: 'nav.dashboard', headerLabelKey: 'nav.dashboardShort', icon: '📅' },
	{ href: '/worktime', labelKey: 'nav.worktime', headerLabelKey: 'nav.worktimeShort', icon: '⏱️' },
	{ href: '/car', labelKey: 'nav.car', headerLabelKey: 'nav.carShort', icon: '🚗' },
	{ href: '/invoices', labelKey: 'nav.invoices', headerLabelKey: 'nav.invoicesShort', icon: '🧾' },
	{ href: '/email', labelKey: 'nav.email', headerLabelKey: 'nav.emailShort', icon: '✉️' },
	{ href: '/rates', labelKey: 'nav.rates', headerLabelKey: 'nav.ratesShort', icon: '💶' },
	{ href: '/contracts', labelKey: 'nav.contracts', headerLabelKey: 'nav.contractsShort', icon: '📋' },
	{ href: '/payments', labelKey: 'nav.payments', headerLabelKey: 'nav.paymentsShort', icon: '🏦' }
];
