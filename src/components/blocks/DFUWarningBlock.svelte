<script lang="ts">
    import type { Snippet } from 'svelte';
    import { webUSB } from '../state.ts'
    let { children } : { children: Snippet } = $props();
</script>

{#if !webUSB}
    {@render children()}
{/if}