<script>
    import {page} from '$app/stores'
    import {onMount} from "svelte";
    import {categories, filterCategory, keyLock, loadTable, table} from "../../../store.js";
    import DataTable from './DataTable.svelte';
    import CategoryPlot from './CategoryPlot.svelte';
    import AutofillPanel from "./AutofillPanel.svelte";
    import SummaryPanel from "./SummaryPanel.svelte";
    import {remote} from "../../../../../rpc/rpc.js";
    import {goto} from '$app/navigation';

    let inputRef
    let isEdit = false
    let newTable = ""

    function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

    async function startRename() {
        newTable = $table
        isEdit = true
        await sleep(200)
        inputRef.focus()
        document.addEventListener('keydown', keydown)
        keyLock.set(true)
    }

    function cleanupRename() {
        isEdit = false
        keyLock.set(false)
        document.removeEventListener('keydown', keydown)
    }

    function keydown(e) {
        if (e.key === 'Escape') {
            cleanupRename()
        }
    }

    async function renameTable() {
        await remote.rename_table($table, newTable)
        console.log($table, '->', newTable)
        keyLock.set(false)
        await goto(`/table/${newTable}`)
        await loadTable(newTable)
        cleanupRename()
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
        <div class="d-flex flex-row align-items-center py-2 gap-2">
            {#if isEdit}
                <input
                        type="text"
                        id="input-rename"
                        style="font-size: 2em; font-weight: 500"
                        bind:this={inputRef}
                        bind:value={newTable}
                        class="form-control"
                />
                <button
                        class="btn btn-outline-primary"
                        on:click={renameTable}
                >
                    Rename
                </button>
                <button
                        class="btn btn-outline-primary"
                        on:click={cleanupRename}
                >
                    X
                </button>
            {:else}
                <div
                        style="font-size: 2em; font-weight: 500;"
                        class="form-control"
                >
                    {$table}
                </div>
                <button
                        class="btn btn-outline-primary"
                        on:click={startRename}
                >
                    Edit
                </button>
            {/if}
        </div>

        <div>
            <button class="btn btn-outline-primary" on:click={deleteTable}>Delete</button>
        </div>
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
