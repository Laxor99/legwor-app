import { json, error } from '@sveltejs/kit';
import {
	setWorkflowTaskSkipped,
	type WorkflowTaskState
} from '$lib/services/workflow-tasks';
import { WORKFLOW_TASK_KEYS, type WorkflowTaskKey } from '$lib/config/workflow';
import type { RequestHandler } from './$types';

function isWorkflowTaskKey(value: string): value is WorkflowTaskKey {
	return (WORKFLOW_TASK_KEYS as readonly string[]).includes(value);
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const year = Number(body.year);
	const month = Number(body.month);
	const taskKey = String(body.taskKey ?? '');
	const skipped = body.skipped !== false;

	if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
		throw error(400, 'Invalid month');
	}
	if (!isWorkflowTaskKey(taskKey)) {
		throw error(400, 'Invalid task');
	}

	await setWorkflowTaskSkipped({ year, month }, taskKey, skipped);
	return json({ success: true } satisfies { success: true });
};

export type { WorkflowTaskState };
