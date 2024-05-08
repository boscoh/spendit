<script>
	import {remote} from '../../../../../rpc/rpc.js';
	import {onMount} from 'svelte';
	import {categories, clickTransaction,updateCategory, filterCategory, headers, keyLock, rows, table} from '../../../store.js';
	import _ from 'lodash';

	let iRowActive = 0;
    $: filteredRows = displayRows($rows, $filterCategory);
    $: dummy = handleClick(filteredRows, $clickTransaction);


    function handleClick(rows, transaction) {
        if (!transaction) {
            return;
        }
        for (let i = 0; i < rows.length; i += 1) {
            const row = rows[i];
            if (transaction.time === row[1] && transaction.category === _.last(row)) {
                console.log('goto', row[0], transaction);
                document.getElementById(row[0]).scrollIntoView();
                iRowActive = i;
                clickTransaction.set({})
                return;
            }
        }
    }

    /**
     * @param  {(string|number)[]} rows
     * @param  {string} filterCategory
     */
    function displayRows(rows, filterCategory) {
        console.log('displayRows', clickTransaction);
        if (!filterCategory) {
            return rows;
        }
        rows = _.filter(rows, (r) => _.last(r) === filterCategory);
        if (filterCategory === 'X') {
            const emptyRows = _.filter(rows, (r) => !_.last(r));
            rows = _.concat(rows, emptyRows);
        }
        return rows;
    }

    async function onKeydown(event) {
        if ($keyLock) {
            return;
        }
        const rows = filteredRows;
        if (event.key === 'ArrowDown') {
            iRowActive += 1;
            if (iRowActive === rows.length) {
                iRowActive = 0;
            }
        } else if (event.key === 'ArrowUp') {
            iRowActive -= 1;
            if (iRowActive < 0) {
                iRowActive = rows.length - 1;
            }
        } else {
            let category = event.key.toUpperCase();
            if (_.find($categories, (c) => c.key === category)) {
                const row = filteredRows[iRowActive]
                await updateCategory(row[0], category);
            }
        }
    }

    function clickRow(iRow) {
        iRowActive = iRow;
    }

    onMount(() => {
        document.addEventListener('keydown', onKeydown);
    });
</script>

<style>
    table thead th { position: sticky; top: 0; z-index: 2000; background-color: white}
</style>

<table class="table">
    <thead>
    {#each $headers as header}
        <th scope="col">{header}</th>
    {/each}
    </thead>
    <tbody>
    {#each filteredRows as row, iRow}
        <tr id={row[0]} on:click={(e) => clickRow(iRow)}>
            {#each row as val, iCol}
                <td style={iRow === iRowActive ? 'background-color: #ffe;' : ''}>
                    {#if iCol < row.length - 1}
                        {val}
                    {:else}
                        <select
                                class="form-select"
                                bind:value={row[iCol]}
                                aria-label="Default select example"
                                on:change={(e) => updateCategory(row[0], e.target.value)}
                        >
                            <option disabled selected value> -- select an option --</option>
                            {#each $categories as c}
                                <option value={c.key}>
                                    {c.key + ' - ' + c.desc}
                                </option>
                            {/each}
                        </select>
                    {/if}
                </td>
            {/each}
        </tr>
    {/each}
    </tbody>
</table>
