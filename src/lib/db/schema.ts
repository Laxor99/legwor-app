import {
	pgTable,
	serial,
	integer,
	text,
	timestamp,
	decimal,
	boolean,
	date,
	varchar
} from 'drizzle-orm/pg-core';

export const monthConfig = pgTable('month_config', {
	id: serial('id').primaryKey(),
	year: integer('year').notNull(),
	month: integer('month').notNull(),
	activeEurRate: decimal('active_eur_rate', { precision: 10, scale: 4 }),
	annualLimit: integer('annual_limit').default(220),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow()
});

export const workDays = pgTable('work_days', {
	id: serial('id').primaryKey(),
	year: integer('year').notNull(),
	month: integer('month').notNull(),
	workDate: date('work_date').notNull(),
	dayType: varchar('day_type', { length: 10 }).notNull(),
	createdAt: timestamp('created_at').defaultNow()
});

export const workMonths = pgTable('work_months', {
	id: serial('id').primaryKey(),
	year: integer('year').notNull(),
	month: integer('month').notNull(),
	normalDays: integer('normal_days').notNull().default(0),
	extraDays: integer('extra_days').notNull().default(0),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const carExpenses = pgTable('car_expenses', {
	id: serial('id').primaryKey(),
	year: integer('year').notNull(),
	month: integer('month').notNull(),
	fromLocation: text('from_location'),
	toLocation: text('to_location'),
	distanceKm: decimal('distance_km', { precision: 8, scale: 2 }),
	tripDate: date('trip_date'),
	navFuelPrice: decimal('nav_fuel_price', { precision: 8, scale: 2 }),
	consumptionNorm: decimal('consumption_norm', { precision: 4, scale: 2 }),
	amortization: decimal('amortization', { precision: 6, scale: 2 }),
	calculatedAmount: decimal('calculated_amount', { precision: 12, scale: 2 }),
	description: text('description'),
	motorwayCost: decimal('motorway_cost', { precision: 10, scale: 2 }),
	motorwayNotes: text('motorway_notes'),
	createdAt: timestamp('created_at').defaultNow()
});

export const contracts = pgTable('contracts', {
	id: serial('id').primaryKey(),
	clientName: text('client_name').notNull(),
	contractNumber: text('contract_number'),
	startDate: date('start_date'),
	endDate: date('end_date'),
	dailyRate: decimal('daily_rate', { precision: 10, scale: 2 }),
	currency: varchar('currency', { length: 10 }).default('EUR'),
	paymentTerms: text('payment_terms'),
	status: varchar('status', { length: 20 }).default('active'),
	filePath: text('file_path'),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow()
});

export const invoices = pgTable('invoices', {
	id: serial('id').primaryKey(),
	type: varchar('type', { length: 20 }).notNull(),
	issuer: text('issuer'),
	recipient: text('recipient'),
	invoiceNumber: varchar('invoice_number', { length: 100 }),
	invoiceDate: date('invoice_date'),
	netAmount: decimal('net_amount', { precision: 14, scale: 2 }),
	vatAmount: decimal('vat_amount', { precision: 14, scale: 2 }),
	grossAmount: decimal('gross_amount', { precision: 14, scale: 2 }),
	currency: varchar('currency', { length: 10 }).default('HUF'),
	eurRate: decimal('eur_rate', { precision: 10, scale: 4 }),
	hufEquivalent: decimal('huf_equivalent', { precision: 14, scale: 2 }),
	category: varchar('category', { length: 50 }),
	monthYear: varchar('month_year', { length: 7 }),
	filePath: text('file_path'),
	paymentStatus: varchar('payment_status', { length: 20 }),
	paymentDate: date('payment_date'),
	notes: text('notes'),
	contractId: integer('contract_id').references(() => contracts.id),
	createdAt: timestamp('created_at').defaultNow()
});

export const eurRates = pgTable('eur_rates', {
	id: serial('id').primaryKey(),
	year: integer('year').notNull(),
	month: integer('month').notNull(),
	spotRate: decimal('spot_rate', { precision: 10, scale: 4 }),
	avg10d: decimal('avg_10d', { precision: 10, scale: 4 }),
	avg30d: decimal('avg_30d', { precision: 10, scale: 4 }),
	selectedRate: decimal('selected_rate', { precision: 10, scale: 4 }),
	selectedAt: timestamp('selected_at'),
	source: text('source'),
	createdAt: timestamp('created_at').defaultNow()
});

export const payments = pgTable('payments', {
	id: serial('id').primaryKey(),
	year: integer('year').notNull(),
	month: integer('month').notNull(),
	paymentType: varchar('payment_type', { length: 50 }).notNull(),
	defaultAmount: decimal('default_amount', { precision: 12, scale: 2 }),
	actualAmount: decimal('actual_amount', { precision: 12, scale: 2 }),
	currency: varchar('currency', { length: 10 }).default('HUF'),
	isPaid: boolean('is_paid').default(false),
	paidDate: date('paid_date'),
	bankAccount: text('bank_account'),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow()
});

export const appConfig = pgTable('app_config', {
	key: varchar('key', { length: 100 }).primaryKey(),
	value: text('value'),
	updatedAt: timestamp('updated_at').defaultNow()
});
