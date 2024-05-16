<script>
    import {keyLock} from "../../../store.js";

    export let handleText
    export let text

    let inputRef
    let isEdit = false
    let newInput = ""
    const style = "font-size: 1.2em; font-weight: 500"

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async function startEdit() {
        newInput = text
        isEdit = true
        await sleep(200)
        inputRef.focus()
        document.addEventListener('keydown', handleEscape)
        keyLock.set(true)
    }

    function cleanup() {
        isEdit = false
        keyLock.set(false)
        document.removeEventListener('keydown', handleEscape)
    }

    function handleEscape(e) {
        if (e.key === 'Escape') {
            cleanup()
        } if (e.key === 'Enter') {
            console.log('handleEscape', newInput)
            handleText(newInput)

        }
    }

</script>

<div class="d-flex flex-row align-items-center py-2 gap-2">
    {#if isEdit}
        <input
                type="text"
                style={style}
                bind:this={inputRef}
                bind:value={newInput}
                on:blur={cleanup}
                class="form-control"
        />
    {:else}
        <button
                style={style}
                class="form-control"
                on:click={startEdit}
        >
            {text}
        </button>
    {/if}
</div>

