<script>
    import {page} from '$app/stores'
    import {goto} from '$app/navigation';
    import {onMount} from "svelte";
    import {categories, deleteReport, filterCategory, loadReport, updateReportName, table} from "../../../store.js";

    import DataTable from './DataTable.svelte';
    import CategoryPlot from './CategoryPlot.svelte';
    import AutofillPanel from "./AutofillPanel.svelte";
    import SummaryPanel from "./SummaryPanel.svelte";
    import EditBox from "./EditBox.svelte";

    async function onRename(newTable) {
        await updateReportName(newTable)
        await goto(`/table/${newTable}`)
    }

    async function onDelete() {
        await deleteReport($table)
        goto('/')
    }

    onMount(() => {
        loadReport($page.params.table)
    })
</script>

<svelte:head>
    <title>Table: {$table}</title>
</svelte:head>

<div class="d-flex flex-column p-3" style="height: calc(100vh - 70px)">
    <div class="d-flex flex-row justify-content-between align-items-center">
        <EditBox handleText={onRename} text={$table}></EditBox>
        <button class="btn btn-outline-primary" on:click={onDelete}>Delete</button>
    </div>

    <div style="width: 100%;">
        <CategoryPlot></CategoryPlot>
    </div>

    <div class="d-flex flex-row gap-2 my-2">
        <AutofillPanel/>
        <SummaryPanel/>
        <div>
            <select
                    aria-label="Default select example"
                    bind:value={$filterCategory}
                    class="form-select"
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
