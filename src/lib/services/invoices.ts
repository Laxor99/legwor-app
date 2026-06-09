import { and, eq } from 'drizzle-orm';
import { db } from '$lib/db';
import { invoices } from '$lib/db/schema';
import type { YearMonth } from '$lib/utils/dates';
import { toMonthYear } from '$lib/utils/dates';
import { getSelectedRate } from './exchange-rate';

export async function getInvoicesForMonth(ym: YearMonth, type?: 'incoming' | 'outgoing') {
	const monthYear = toMonthYear(ym);
	const conditions = [eq(invoices.monthYear, monthYear)];
	if (type) conditions.push(eq(invoices.type, type));
	return db.query.invoices.findMany({
		where: and(...conditions),
		orderBy: (t, { desc }) => [desc(t.invoiceDate)]
	});
}

export async function createInvoice(data: {
	type: 'incoming' | 'outgoing';
	issuer?: string;
	recipient?: string;
	invoiceNumber: string;
	invoiceDate: string;
	netAmount?: number;
	vatAmount?: number;
	grossAmount: number;
	currency?: string;
	category?: string;
	monthYear: string;
	paymentStatus?: string;
	paymentDate?: string;
	notes?: string;
	contractId?: number;
	filePath?: string;
	year: number;
	month: number;
}) {
	let eurRate: number | null = null;
	let hufEquivalent: number | null = null;

	if (data.currency === 'EUR') {
		eurRate = await getSelectedRate({ year: data.year, month: data.month });
		hufEquivalent = eurRate ? data.grossAmount * eurRate : null;
	} else {
		hufEquivalent = data.grossAmount;
	}

	const [row] = await db
		.insert(invoices)
		.values({
			type: data.type,
			issuer: data.issuer,
			recipient: data.recipient,
			invoiceNumber: data.invoiceNumber,
			invoiceDate: data.invoiceDate,
			netAmount: data.netAmount?.toString(),
			vatAmount: data.vatAmount?.toString(),
			grossAmount: data.grossAmount.toString(),
			currency: data.currency ?? 'HUF',
			eurRate: eurRate?.toString(),
			hufEquivalent: hufEquivalent?.toString(),
			category: data.category,
			monthYear: data.monthYear,
			paymentStatus: data.paymentStatus ?? 'Fizetendő',
			paymentDate: data.paymentDate || null,
			notes: data.notes,
			contractId: data.contractId,
			filePath: data.filePath
		})
		.returning();
	return row;
}

export async function updateInvoice(
	id: number,
	data: Partial<{
		paymentStatus: string;
		paymentDate: string;
		notes: string;
	}>
) {
	await db.update(invoices).set(data).where(eq(invoices.id, id));
}

export async function deleteInvoice(id: number) {
	const row = await db.query.invoices.findFirst({ where: eq(invoices.id, id) });
	if (row?.filePath) {
		const { deleteUpload } = await import('./uploads');
		await deleteUpload(row.filePath);
	}
	await db.delete(invoices).where(eq(invoices.id, id));
}

export async function attachInvoiceFile(id: number, filePath: string) {
	const row = await db.query.invoices.findFirst({ where: eq(invoices.id, id) });
	if (row?.filePath) {
		const { deleteUpload } = await import('./uploads');
		await deleteUpload(row.filePath);
	}
	await db.update(invoices).set({ filePath }).where(eq(invoices.id, id));
}

export async function createFleetCorQuick(ym: YearMonth, grossAmount: number, invoiceNumber: string) {
	return createInvoice({
		type: 'incoming',
		issuer: 'FleetCor Hungary Kft.',
		invoiceNumber,
		invoiceDate: new Date(ym.year, ym.month, 1).toISOString().slice(0, 10),
		grossAmount,
		netAmount: Math.round(grossAmount / 1.27),
		vatAmount: grossAmount - Math.round(grossAmount / 1.27),
		currency: 'HUF',
		category: 'FleetCor',
		monthYear: toMonthYear(ym),
		paymentStatus: 'Fizetendő',
		notes: 'FleetCor havi számla',
		year: ym.year,
		month: ym.month
	});
}
