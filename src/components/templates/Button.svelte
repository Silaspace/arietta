<script lang="ts">
    import type { Snippet } from 'svelte';
    let { clickable, disabled, children } : { clickable: (e: Event) => void, disabled: boolean, children: Snippet } = $props();
</script>

<button
    onclick={clickable}
    disabled={disabled}
    class="
    p-2 rounded-lg
    focus:outline-none focus:ring-gray-500
    text-gray-950 dark:text-gray-100
    disabled:text-gray-300 dark:disabled:text-gray-700
    hover:bg-gray-200 dark:hover:bg-gray-700
    disabled:hover:bg-transparent dark:disabled:hover:bg-transparent
    active:bg-gray-300 dark:active:bg-gray-600">
    {@render children()}
</button>