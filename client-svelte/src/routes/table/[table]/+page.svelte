<script>
    import {page} from '$app/stores'
    import {goto} from '$app/navigation';
    import {onMount} from "svelte";
    import {categories, filterCategory, loadTable, table} from "../../../store.js";
    import {remote} from "../../../../../rpc/rpc.js";

    import DataTable from './DataTable.svelte';
    import CategoryPlot from './CategoryPlot.svelte';
    import AutofillPanel from "./AutofillPanel.svelte";
    import SummaryPanel from "./SummaryPanel.svelte";
    import EditBox from "./EditBox.svelte";

    async function renameTable(newTable) {
        await remote.rename_table($table, newTable)
        console.log('renameTable', $table, '->', newTable)
        await goto(`/table/${newTable}`)
        await loadTable(newTable)
    }

    async function deleteTable() {
        await remote.delete_table($table)
        goto('/')
    }

    onMount(() => {
        loadTable($page.params.table)
    })
</script>

<svelte:head>
    <title>Table: {$table}</title>
</svelte:head>

<div class="d-flex flex-column p-3" style="height: calc(100vh - 70px)">
    <div class="d-flex flex-row justify-content-between align-items-center">
        <EditBox text={$table} handleText={renameTable}></EditBox>
        <button class="btn btn-outline-primary" on:click={deleteTable}>Delete</button>
    </div>

    <div style="width: 100%;">
        <CategoryPlot></CategoryPlot>
    </div>

    <div class="d-flex flex-row gap-2 my-2">
        <AutofillPanel/>
        <SummaryPanel/>
        <div>
            <select
                    class="form-select"
                    aria-label="Default select example"
                    bind:value={$filterCategory}
            >
                <option selected value={null}>-- all --</option>
                {#each $categories as c}
                    <option value="{c.key}">
                        only {c.key}
                    </option>
                {/each}
            </select>
        </div>
    </div>

    <div class="flex-grow-1 card overflow-auto p-2">
        <DataTable></DataTable>
    </div>
</div>
