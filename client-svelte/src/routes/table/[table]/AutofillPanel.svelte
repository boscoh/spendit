<script>
    import {autofillReport, categories, keyLock, table} from '../../../store.js';
</script>

<div class="d-inline">
    <button
            class="btn btn-outline-primary"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasExample"
            aria-controls="offcanvasExample"
    >
        Autofill
    </button>
</div>

<div
        class="offcanvas offcanvas-start"
        tabindex="-1"
        id="offcanvasExample"
        aria-labelledby="autofillPanel"
>
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="autofillPanel">Autofill panel</h5>
        <div class="px-2"></div>
        <button
                class="btn btn-outline-primary"
                on:click={(e) => {
				autofillReport($table, $categories);
			}}
        >
            Recalculate
        </button>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
        {#each $categories as category}
            <div>
                <div class="d-flex flex-row mb-3">
                    <label class="mt-2" for={category + 'Form'}>{category.key}</label>
                    <textarea
                            bind:value={category.filter}
                            class="ms-2 form-control"
                            id="category + 'Form'"
                            on:blur={() => {
                                $keyLock = true;
                            }}
                            on:focus={() => {
                                $keyLock = false;
                            }}
                            rows="3"
                    ></textarea>
                </div>
            </div>
        {/each}
    </div>
</div>
