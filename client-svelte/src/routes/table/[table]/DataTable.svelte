<script>
    import {remote} from "../../../../../rpc/rpc.js"
    import {categories, filterCategory, headers, rows, table} from "../../../store.js"
    import _ from 'lodash'

    $: descByCategory = _.mapValues(_.keyBy($categories, 'key'), 'desc')
    $: filteredRows = filterRows($rows, $filterCategory)

    /**
     * @param  {string} category
     */
    function displayCategory(category) {
        return category + " - " + descByCategory[category]
    }

    /**
     * @param  {number} iRow
     * @param  {string} category
     */
    async function setCategory(iRow, category) {
        let filteredRow = filteredRows[iRow]
        let id = filteredRow[0]
        let row = _.find($rows, r => r[0] === id)
        let iLast = row.length - 1
        row[iLast] = category
        $rows = $rows
        await remote.update_transactions($table, id, {category})
    }

    /**
     * @param  {(string|number)[]} rows
     * @param  {string} filterCategory
     */
    function filterRows(rows, filterCategory) {
        if (!filterCategory) {
            return rows
        }
        rows = _.filter(rows, (r) => _.last(r) === filterCategory)
        if (filterCategory === "X") {
            const emptyRows = _.filter(rows, (r) => !_.last(r))
            rows = _.concat(rows, emptyRows)
        }
        return rows
    }
</script>

<table class="table">
    <thead>
    {#each $headers as header}
        <th scope="col">{header}</th>
    {/each}
    </thead>
    <tbody>
    {#each filteredRows as row, iRow}
        <tr>
            {#each row as val, iVal}
                <td>
                    {#if iVal === (row.length - 1)}
                        <select
                                class="form-select"
                                bind:value={row[iVal]}
                                aria-label="Default select example"
                                on:change={event => setCategory(iRow, event.target.value)}
                        >
                            <option disabled selected value> -- select an option --</option>
                            {#each $categories as c}
                                <option value="{c.key}">
                                    {displayCategory(c.key)}
                                </option>
                            {/each}
                        </select>
                    {:else}
                        {val}
                    {/if}
                </td>
            {/each}
        </tr>
    {/each}
    </tbody>
</table>

