import { and, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { payments } from '$lib/db/schema';
import type { YearMonth } from '$lib/utils/dates';

export const PAYMENT_TYPES = [
	{ key: 'ber', label: 'Bér', defaultAmount: 800000, bankAccount: '', note: 'havonta' },
	{ key: 'szja', label: 'SZJA', defaultAmount: 481000, bankAccount: 'NAV', note: 'havonta' },
	{ key: 'szha', label: 'SZHA', defaultAmount: 157000, bankAccount: 'NAV', note: 'havonta' },
	{ key: 'tb', label: 'TB', defaultAmount: 222000, bankAccount: 'NAV', note: 'havonta' },
	{
		key: 'tarsasagi_ado',
		label: 'Társasági adó',
		defaultAmount: 180000,
		bankAccount: 'NAV',
		note: 'havonta'
	},
	{
		key: 'cegauto_ado',
		label: 'Cégautó adó',
		defaultAmount: 0,
		bankAccount: 'NAV',
		note: 'kéthavonta, váltakozva'
	},
	{ key: 'ipa', label: 'IPA', defaultAmount: 0, bankAccount: 'NAV', note: 'félévente' },
	{
		key: 'fleetcor',
		label: 'FleetCor',
		defaultAmount: 0,
		bankAccount: '',
		note: 'nem Maricától jön'
	}
] as const;

export async function getPaymentsForMonth({ year, month }: YearMonth) {
	const rows = await db.query.payments.findMany({
		where: and(eq(payments.year, year), eq(payments.month, month))
	});
	const map = new Map(rows.map((r) => [r.paymentType, r]));
	return PAYMENT_TYPES.map((pt) => {
		const existing = map.get(pt.key);
		return {
			...pt,
			id: existing?.id,
			actualAmount: existing?.actualAmount
				? Number(existing.actualAmount)
				: pt.defaultAmount,
			isPaid: existing?.isPaid ?? false,
			paidDate: existing?.paidDate ?? null,
			bankAccount: existing?.bankAccount ?? pt.bankAccount,
			notes: existing?.notes ?? pt.note
		};
	});
}

export async function upsertPayment(data: {
	year: number;
	month: number;
	paymentType: string;
	actualAmount: number;
	isPaid: boolean;
	paidDate?: string | null;
	bankAccount?: string;
	notes?: string;
}) {
	const pt = PAYMENT_TYPES.find((p) => p.key === data.paymentType);
	const existing = await db.query.payments.findFirst({
		where: and(
			eq(payments.year, data.year),
			eq(payments.month, data.month),
			eq(payments.paymentType, data.paymentType)
		)
	});
	const values = {
		year: data.year,
		month: data.month,
		paymentType: data.paymentType,
		defaultAmount: (pt?.defaultAmount ?? 0).toString(),
		actualAmount: data.actualAmount.toString(),
		isPaid: data.isPaid,
		paidDate: data.paidDate || null,
		bankAccount: data.bankAccount ?? pt?.bankAccount ?? '',
		notes: data.notes ?? pt?.note ?? ''
	};
	if (existing) {
		await db.update(payments).set(values).where(eq(payments.id, existing.id));
	} else {
		await db.insert(payments).values(values);
	}
}
