<script lang="ts">
    import { Log } from '../../modules/log.ts'
    import LogLine from './LogLine.svelte'

    let logs: Array<Log.Line> = $state([])   
    const update = (logline: Log.Line) => logs.push(logline)
    Log.subscribe(update) 
</script>

{#each logs as log}
    <LogLine log = {log}/>
{/each}