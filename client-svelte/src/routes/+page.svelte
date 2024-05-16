<script>
    import {onMount} from "svelte"
    import {getReportList, tables} from "../store.js"
    import {remoteUpload} from "../../../rpc/rpc.js";

    let files = [];

    async function submit(e) {
        console.log('submit', files)
        const file = files[0]
        await remoteUpload(file, 'upload_csv')
        await getReportList()
        const inputElement = document.querySelector(".form-control")
        if (inputElement) {
            inputElement.value = ""
        }
    }

    onMount(getReportList)
</script>

<svelte:head>
    <title>Spendit Tables</title>
</svelte:head>

<h1>Tables</h1>

<ul class="mt-3 list-group">
    {#each $tables as table}
        <a
                href={'./table/' + table}
                class="list-group-item list-group-item-action"
        >
            { table }
        </a>
    {/each}
</ul>

<div class="py-3">
    <form ref="uploadForm" class="form-group">
        <label for="uploadInput"l>Upload CSV</label>
        <div class="d-flex flex-row gap-2">
            <input class="form-control" style="width: 20em" type="file" id="uploadInput" bind:files/>
            <button class="btn btn-outline-secondary" on:click={submit}>Upload</button>
        </div>
    </form>
</div>


