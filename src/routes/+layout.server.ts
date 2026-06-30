import { getMonthStatusList } from '$lib/services/month-status';
import { getWorkflowTaskStates } from '$lib/services/workflow-tasks';
import { getDefaultActiveMonth } from '$lib/utils/dates';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, locals }) => {
	const year = Number(url.searchParams.get('year')) || getDefaultActiveMonth().year;
	const month = Number(url.searchParams.get('month')) || getDefaultActiveMonth().month;
	let monthStatuses: Awaited<ReturnType<typeof getMonthStatusList>> = [];
	let workflowTasks: Awaited<ReturnType<typeof getWorkflowTaskStates>> = [];
	try {
		[monthStatuses, workflowTasks] = await Promise.all([
			getMonthStatusList({ year, month }),
			getWorkflowTaskStates({ year, month })
		]);
	} catch {
		monthStatuses = [];
		workflowTasks = [];
	}
	return { year, month, locale: locals.locale, monthStatuses, workflowTasks };
};
