import { get, writable } from 'svelte/store';
import { remote } from '../../rpc/rpc.js';

import _ from 'lodash';

export const tables = writable('');
export const headers = writable([]);
export const rows = writable([]);
export const table = writable('');
export const categories = writable([]);
export const updateCount = writable(0);
export const keyLock = writable(false);
export const filterCategory = writable(null);
export const clickTransaction = writable({});
export const offset = writable(0);

export async function loadReport(name) {
	table.set(name);
	let response = await remote.get_transactions(name);
	if ('result' in response) {
		const result = response.result;
		headers.set(result.columns);
		rows.set(result.data);
	}
	response = await remote.get_report_row(name);
	if ('result' in response) {
		categories.set(JSON.parse(response.result.json_categories));
		offset.set(response.result.offset_days);
	}
}

export async function autofillReport(table, categories) {
	await remote.update_categories(categories, table);
	await remote.autofill(table);
	loadReport(table);
}

export async function getReportList() {
	const response = await remote.get_reports();
	if ('result' in response) {
		tables.set(response.result);
	}
}

/**
 * @param  {string} id
 * @param  {string} category
 */
export async function updateCategory(id, category) {
	const currRows = get(rows);
	let row = _.find(currRows, (r) => r[0] === id);
	let iLast = row.length - 1;
	row[iLast] = category;
	rows.set(currRows);
	await remote.update_transaction(get(table), id, { category });
}

export async function updateOffsetDays(offsetDays) {
	const currTable = get(table);
	await remote.update_report(currTable, { offset_days: offsetDays });
	offset.set(offsetDays);
}

export async function updateReportName(newName) {
	const currTable = get(table);
	console.log('updateReportName', currTable, '->', newName);
	await remote.rename_report(currTable, newName);
	await loadReport(newName);
}


export async function deleteReport() {
	await remote.delete_report(get(table))
}