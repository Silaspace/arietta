<script lang="ts">
    import { rawCode } from '../state.ts'

    const update = (e: Event) => {
        if (e.target instanceof HTMLTextAreaElement) {
            rawCode.set(e.target.value)
        }
    }

</script>

<textarea
    oninput={update}
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    class="
        m-0 h-full w-full
        resize-none select-none overflow-hidden
        font-mono text-base text-transparent
        outline-none caret-rose-800 dark:caret-amber-300"></textarea>