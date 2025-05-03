<script lang="ts">
    import type { Snippet } from 'svelte';
    let { children } : { children: Snippet } = $props()
</script>

<span class="flex font-mono font-medium text-sm md:text-base text-red-700 dark:text-red-500">
    {@render children()}
</span>