export interface NavItem {
	href: string;
	label: string;
	/** Short label for compact header (one line) */
	headerLabel: string;
	icon: string;
}

export const navItems: NavItem[] = [
	{ href: '/dashboard', label: 'Havi Összesítő', headerLabel: 'Összesítő', icon: '📅' },
	{ href: '/worktime', label: 'Munkaidő nyilvántartás', headerLabel: 'Munkaidő', icon: '⏱️' },
	{ href: '/car', label: 'Utazási elszámolás', headerLabel: 'Autó', icon: '🚗' },
	{ href: '/invoices', label: 'Számlák', headerLabel: 'Számlák', icon: '🧾' },
	{ href: '/email', label: 'Email Asszisztens', headerLabel: 'Email', icon: '✉️' },
	{ href: '/rates', label: 'EUR/HUF Árfolyam', headerLabel: 'EUR/HUF', icon: '💶' },
	{ href: '/contracts', label: 'Szerződések', headerLabel: 'Szerződések', icon: '📋' },
	{ href: '/payments', label: 'Bankszámla / Fizetések', headerLabel: 'Fizetések', icon: '🏦' }
];
