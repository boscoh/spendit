<script>
    import {page} from '$app/stores'
    import {onMount} from "svelte";
    import {categories, filterCategory, loadTable, table} from "../../../store.js";
    import DataTable from './DataTable.svelte';
    import CategoryPlot from './CategoryPlot.svelte';
    import AutofillPanel from "./AutofillPanel.svelte";
    import SummaryPanel from "./SummaryPanel.svelte";

    onMount(() => loadTable($page.params.table))
</script>

<svelte:head>
    <title>Table: {$table}</title>
</svelte:head>

<div class="d-flex flex-column p-3" style="height: calc(100vh - 56px)">
    <h1>Table: {$table}</h1>

    <div style="width: 100%;">
        <CategoryPlot></CategoryPlot>
    </div>

    <div class="d-flex flex-row gap-2 mb-2">
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
