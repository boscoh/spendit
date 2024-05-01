<script>
    import {onMount} from "svelte"
    import {tables, getTables} from "../store.js"

    onMount(getTables)
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

