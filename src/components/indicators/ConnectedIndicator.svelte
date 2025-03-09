<script lang="ts">
    import Indicator from "../templates/Indicator.svelte";
    import { deviceConnected } from '../state.ts'
</script>

<Indicator connected={$deviceConnected} />