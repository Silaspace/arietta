<script lang="ts">
    import { AVRDFU } from '../../modules/avrdfu'
    import Text from "../templates/Text.svelte";
    import type { DeviceStatus } from '../state.ts'
    import { deviceStatus } from '../state.ts'

    const convertStatus = (status: DeviceStatus): string => {
        if (!status.connected) {
            return "--"
        }

        return AVRDFU.bStatusDescription(status.bStatus)
    }

</script>

<Text>{convertStatus($deviceStatus)}</Text>