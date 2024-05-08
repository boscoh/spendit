import { writable } from 'svelte/store';
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

export async function loadTable(newTable) {
	table.set(newTable);
	let response = await remote.get_transactions(newTable);
	if ('result' in response) {
		const result = response.result;
		headers.set(result.columns);
		rows.set(result.data);
	}
	response = await remote.get_categories();
	if ('result' in response) {
		categories.set(response.result);
	}
}

export async function autofillTable(table, categories) {
	await remote.set_categories(categories);
	await remote.autofill(table);
	loadTable(table);
}

export async function getTables() {
	const response = await remote.get_tables();
	if ('result' in response) {
		tables.set(response.result);
	}
}

/**
 * @param  {string} id
 * @param  {string} category
 */
export async function updateCategory(id, category) {
	let row = _.find(rows, (r) => r[0] === id);
	let iLast = row.length - 1;
	row[iLast] = category;
	rows.set(rows);
	await remote.update_transactions(table, id, { category });
}
