<script lang="ts">
    import { rawCode } from '../state.ts'
    import { Highlighter } from '../../modules/highlighter';

    const highlighter: Highlighter = new Highlighter()
    let lines = $state(1)
	rawCode.subscribe((value, _) => lines = highlighter.countLines(value))
</script>

{#each { length: Math.max(lines, 10) }, i}
    <span class="flex font-sans font-thin tracking-tight text-base text-zinc-600 dark:text-zinc-400">
        {i + 1}
    </span>
{/each}