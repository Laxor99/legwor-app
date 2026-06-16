import { and, eq, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { workDays, workMonths } from '$lib/db/schema';
import type { YearMonth } from '$lib/utils/dates';
import { getAnnualLimit } from './config';

export type WorkDayType = 'normal' | 'extra';

function toDateKey(value: string | Date | null | undefined): string {
	if (!value) return '';
	if (typeof value === 'string') return value.slice(0, 10);
	const y = value.getFullYear();
	const m = String(value.getMonth() + 1).padStart(2, '0');
	const d = String(value.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export async function getWorkDaysForMonth({ year, month }: YearMonth) {
	return db.query.workDays.findMany({
		where: and(eq(workDays.year, year), eq(workDays.month, month)),
		orderBy: (t, { asc }) => [asc(t.workDate)]
	});
}

export async function getWorkDaysMap({ year, month }: YearMonth): Promise<Record<string, WorkDayType>> {
	const rows = await getWorkDaysForMonth({ year, month });
	const map: Record<string, WorkDayType> = {};
	for (const row of rows) {
		const key = toDateKey(row.workDate);
		if (key) map[key] = row.dayType as WorkDayType;
	}
	return map;
}

export async function saveWorkDays(
	{ year, month }: YearMonth,
	days: Record<string, WorkDayType>
): Promise<{ normalDays: number; extraDays: number }> {
	await db.delete(workDays).where(and(eq(workDays.year, year), eq(workDays.month, month)));

	const entries = Object.entries(days);
	if (entries.length > 0) {
		await db.insert(workDays).values(
			entries.map(([workDate, dayType]) => ({
				year,
				month,
				workDate,
				dayType
			}))
		);
	}

	const normalDays = entries.filter(([, t]) => t === 'normal').length;
	const extraDays = entries.filter(([, t]) => t === 'extra').length;
	return { normalDays, extraDays };
}

export async function getWorkMonth({ year, month }: YearMonth) {
	return db.query.workMonths.findFirst({
		where: and(eq(workMonths.year, year), eq(workMonths.month, month))
	});
}

export async function upsertWorkMonth(data: {
	year: number;
	month: number;
	normalDays: number;
	extraDays: number;
	notes?: string;
	workDaysMap?: Record<string, WorkDayType>;
}) {
	if (data.workDaysMap !== undefined) {
		const counts = await saveWorkDays(
			{ year: data.year, month: data.month },
			data.workDaysMap
		);
		data.normalDays = counts.normalDays;
		data.extraDays = counts.extraDays;
	}
	const existing = await getWorkMonth(data);
	const totalDays = data.normalDays + data.extraDays;
	if (existing) {
		await db
			.update(workMonths)
			.set({
				normalDays: data.normalDays,
				extraDays: data.extraDays,
				notes: data.notes ?? existing.notes,
				updatedAt: new Date()
			})
			.where(eq(workMonths.id, existing.id));
		return { ...existing, ...data, totalDays };
	}
	const [row] = await db
		.insert(workMonths)
		.values({
			year: data.year,
			month: data.month,
			normalDays: data.normalDays,
			extraDays: data.extraDays,
			notes: data.notes
		})
		.returning();
	return { ...row, totalDays };
}

export async function getYearlyWorkedDays(year: number): Promise<number> {
	const rows = await db
		.select({
			total: sql<number>`COALESCE(SUM(${workMonths.normalDays} + ${workMonths.extraDays}), 0)`
		})
		.from(workMonths)
		.where(eq(workMonths.year, year));
	return Number(rows[0]?.total ?? 0);
}

export async function getWorktimeSummary({ year, month }: YearMonth) {
	const current = await getWorkMonth({ year, month });
	const yearlyWorked = await getYearlyWorkedDays(year);
	const limit = await getAnnualLimit(year);
	const normalDays = current?.normalDays ?? 0;
	const extraDays = current?.extraDays ?? 0;
	return {
		normalDays,
		extraDays,
		totalDays: normalDays + extraDays,
		yearlyWorked,
		limit
	};
}
