<script lang="ts">
    import { Log } from '../../modules/log.ts';
    import LogText from './LogText.svelte';
    import LogError from './LogError.svelte';
    let { log }: { log: Log.Line } = $props();

    const time = new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });
</script>

<div class="flex flex-row pl-4 bg-transparent">
    <LogText>{time.format(log.datetime)}</LogText>
    
    <div class="flex justify-start h-auto min-w-28 pl-4">
        <LogText>{log.context}</LogText>
    </div>

    {#if log.level == Log.Level.ERROR}
        <LogError>{log.message}</LogError>
    {:else}
        <LogText>{log.message}</LogText>
    {/if}
</div>