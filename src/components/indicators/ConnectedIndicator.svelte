<script lang="ts">
    import Indicator from "../templates/Indicator.svelte";
    import { deviceStatus } from '../state.ts'
</script>

<Indicator connected={$deviceStatus.connected} />