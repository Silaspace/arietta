<script lang="ts">
    let { connected } : { connected: boolean } = $props();
</script>

{#if connected}
    <div class="flex flex-col justify-center">
        <div class="flex-none rounded-full bg-emerald-500/20 p-[2px]">
            <div class="size-1.5 rounded-full bg-emerald-500"></div>
        </div>
    </div>
{:else}
    <div class="flex flex-col justify-center">
        <div class="flex-none rounded-full bg-gray-500/20 p-[2px]">
            <div class="size-1.5 rounded-full bg-gray-500"></div>
        </div>
    </div>
{/if}