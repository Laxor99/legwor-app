import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import {
	approvals,
	carExpenses,
	eurRates,
	invoices,
	workflowTaskOverrides,
	workDays,
	workMonths
} from '$lib/db/schema';
import type { YearMonth } from '$lib/utils/dates';
import { toMonthYear } from '$lib/utils/dates';
import { getConfig } from './config';
import { WORKFLOW_TASK_KEYS, type WorkflowTaskKey } from '$lib/config/workflow';

export type WorkflowTaskStatus = 'pending' | 'in_progress' | 'done' | 'skipped';

export interface WorkflowTaskState {
	key: WorkflowTaskKey;
	status: WorkflowTaskStatus;
}

interface MonthTaskSignals {
	skipped: Set<WorkflowTaskKey>;
	worktimeTotalDays: number;
	worktimeHasEdits: boolean;
	rateSelected: number | null;
	rateHasRow: boolean;
	carDone: boolean;
	carHasEdits: boolean;
	incomingCount: number;
	outgoingEur: number;
	approvalStatus: string | null;
	approvalHasRecord: boolean;
	maricaSent: boolean;
}

function isTaskDone(key: WorkflowTaskKey, data: MonthTaskSignals): boolean {
	switch (key) {
		case 'worktime':
			return data.worktimeTotalDays > 0;
		case 'rate':
			return data.rateSelected != null && data.rateSelected > 0;
		case 'travel':
			return data.carDone;
		case 'incoming':
			return data.incomingCount > 0;
		case 'approval':
			return (
				data.approvalStatus === 'bekuldve' ||
				data.approvalStatus === 'elfogadva' ||
				data.approvalStatus === 'szamlazva' ||
				data.approvalStatus === 'lezarva'
			);
		case 'outgoing':
			return data.outgoingEur > 0;
		case 'marica':
			return data.maricaSent;
	}
}

function isTaskInProgress(key: WorkflowTaskKey, data: MonthTaskSignals): boolean {
	if (isTaskDone(key, data)) return false;

	switch (key) {
		case 'worktime':
			return data.worktimeHasEdits;
		case 'rate':
			return data.rateHasRow;
		case 'travel':
			return data.carHasEdits;
		case 'incoming':
			return false;
		case 'approval':
			return (
				data.approvalHasRecord &&
				(data.approvalStatus === 'folyamatban' || data.approvalStatus === 'elutasitva')
			);
		case 'outgoing':
			return false;
		case 'marica':
			return false;
	}
}

function resolveTaskStatus(key: WorkflowTaskKey, data: MonthTaskSignals): WorkflowTaskStatus {
	if (data.skipped.has(key)) return 'skipped';
	if (isTaskDone(key, data)) return 'done';
	if (isTaskInProgress(key, data)) return 'in_progress';
	return 'pending';
}

async function loadMonthTaskSignals(ym: YearMonth): Promise<MonthTaskSignals> {
	const monthYear = toMonthYear(ym);
	const [
		skipRows,
		workMonth,
		workDayCount,
		rateRow,
		carCount,
		carTripCount,
		motorwayRow,
		incomingCountRow,
		outgoingRow,
		approval,
		maricaSentVal
	] = await Promise.all([
		db.query.workflowTaskOverrides.findMany({
			where: and(
				eq(workflowTaskOverrides.year, ym.year),
				eq(workflowTaskOverrides.month, ym.month),
				eq(workflowTaskOverrides.skipped, true)
			)
		}),
		db.query.workMonths.findFirst({
			where: and(eq(workMonths.year, ym.year), eq(workMonths.month, ym.month))
		}),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(workDays)
			.where(and(eq(workDays.year, ym.year), eq(workDays.month, ym.month))),
		db.query.eurRates.findFirst({
			where: and(eq(eurRates.year, ym.year), eq(eurRates.month, ym.month))
		}),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(carExpenses)
			.where(and(eq(carExpenses.year, ym.year), eq(carExpenses.month, ym.month))),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(carExpenses)
			.where(
				and(
					eq(carExpenses.year, ym.year),
					eq(carExpenses.month, ym.month),
					sql`(${carExpenses.fromLocation} IS NOT NULL OR ${carExpenses.toLocation} IS NOT NULL)`
				)
			),
		db
			.select({ total: sql<number>`COALESCE(SUM(${carExpenses.motorwayCost}), 0)` })
			.from(carExpenses)
			.where(and(eq(carExpenses.year, ym.year), eq(carExpenses.month, ym.month))),
		db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(invoices)
			.where(and(eq(invoices.type, 'incoming'), eq(invoices.monthYear, monthYear))),
		db
			.select({
				totalEur: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.currency} = 'EUR' THEN ${invoices.grossAmount} ELSE 0 END), 0)`
			})
			.from(invoices)
			.where(and(eq(invoices.type, 'outgoing'), eq(invoices.monthYear, monthYear))),
		getApprovalRecord(ym),
		getConfig(`marica_sent_${ym.year}_${ym.month}`)
	]);

	const skipped = new Set(
		skipRows.map((row) => row.taskKey).filter((key): key is WorkflowTaskKey => isWorkflowTaskKey(key))
	);

	const normalDays = workMonth?.normalDays ?? 0;
	const extraDays = workMonth?.extraDays ?? 0;
	const workDayCountNum = Number(workDayCount[0]?.count ?? 0);
	const motorwayCost = Number(motorwayRow[0]?.total ?? 0);
	const tripCount = Number(carTripCount[0]?.count ?? 0);

	return {
		skipped,
		worktimeTotalDays: normalDays + extraDays,
		worktimeHasEdits: workDayCountNum > 0 || workMonth != null,
		rateSelected: rateRow?.selectedRate != null ? Number(rateRow.selectedRate) : null,
		rateHasRow: rateRow != null,
		carDone: tripCount > 0 || motorwayCost > 0,
		carHasEdits: Number(carCount[0]?.count ?? 0) > 0,
		incomingCount: Number(incomingCountRow[0]?.count ?? 0),
		outgoingEur: Number(outgoingRow[0]?.totalEur ?? 0),
		approvalStatus: approval?.status ?? null,
		approvalHasRecord: approval != null,
		maricaSent: maricaSentVal === '1' || maricaSentVal === 'true'
	};
}

async function getApprovalRecord(ym: YearMonth) {
	return db.query.approvals.findFirst({
		where: and(eq(approvals.year, ym.year), eq(approvals.month, ym.month))
	});
}

function isWorkflowTaskKey(value: string): value is WorkflowTaskKey {
	return (WORKFLOW_TASK_KEYS as readonly string[]).includes(value);
}

export async function getWorkflowTaskStates(ym: YearMonth): Promise<WorkflowTaskState[]> {
	const signals = await loadMonthTaskSignals(ym);
	return WORKFLOW_TASK_KEYS.map((key) => ({
		key,
		status: resolveTaskStatus(key, signals)
	}));
}

export async function setWorkflowTaskSkipped(
	ym: YearMonth,
	taskKey: WorkflowTaskKey,
	skipped: boolean
): Promise<void> {
	if (!skipped) {
		await db
			.delete(workflowTaskOverrides)
			.where(
				and(
					eq(workflowTaskOverrides.year, ym.year),
					eq(workflowTaskOverrides.month, ym.month),
					eq(workflowTaskOverrides.taskKey, taskKey)
				)
			);
		return;
	}

	await db
		.insert(workflowTaskOverrides)
		.values({
			year: ym.year,
			month: ym.month,
			taskKey,
			skipped: true,
			updatedAt: new Date()
		})
		.onConflictDoUpdate({
			target: [
				workflowTaskOverrides.year,
				workflowTaskOverrides.month,
				workflowTaskOverrides.taskKey
			],
			set: { skipped: true, updatedAt: new Date() }
		});
}
