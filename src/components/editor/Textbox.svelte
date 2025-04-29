<script lang="ts">
    import { rawCode } from '../../modules/state.ts'

    let firstLoad: boolean = true
    let value: string = $state('')

    $effect(() => rawCode.set(value))

    rawCode.subscribe((update, _) => {
        if (firstLoad) {
            value = update
            firstLoad = false
        }
    })
</script>

<textarea
    bind:value
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    class="
        m-0 h-full w-full
        resize-none select-none overflow-hidden
        font-mono text-base text-transparent
        outline-none caret-rose-800 dark:caret-amber-300"></textarea>