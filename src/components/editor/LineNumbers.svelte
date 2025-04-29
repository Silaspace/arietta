<script lang="ts">
    import { rawCode } from '../../modules/state.ts'
    import { View } from '../../modules/view.ts';

    let lines = $state(1)
	rawCode.subscribe((value, _) => lines = View.lines(value))
</script>

{#each { length: Math.max(lines, 10) }, i}
    <span class="flex font-sans font-thin tracking-tight text-base text-zinc-600 dark:text-zinc-400">
        {i + 1}
    </span>
{/each}