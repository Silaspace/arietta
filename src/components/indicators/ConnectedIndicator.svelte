<script lang="ts">
    import Indicator from "../templates/Indicator.svelte";
    import { deviceStatus } from '../../modules/state.ts'
</script>

<Indicator connected={$deviceStatus.connected} />