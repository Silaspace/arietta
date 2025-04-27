<script lang="ts">
    import type { Snippet } from 'svelte';
    let { children } : { children: Snippet } = $props()
</script>

<div class="flex justify-center">
    <span class="flex font-sans font-thin tracking-tight text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
        {@render children()}
    </span>
</div>