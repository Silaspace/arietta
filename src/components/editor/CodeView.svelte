<script lang="ts">
    import { rawCode } from '../../modules/state.ts'
    import { View } from '../../modules/view.ts';

    let highlighted = $state("")
    rawCode.subscribe((value, _) => highlighted = View.asm(value))
</script>

{@html highlighted}