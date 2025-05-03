<script lang="ts">
    import type { Snippet } from 'svelte';
    let { children } : { children: Snippet } = $props()
</script>

<span class="flex font-mono font-medium text-sm md:text-base text-zinc-600 dark:text-zinc-400">
    {@render children()}
</span>