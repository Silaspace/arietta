<script lang="ts">
    import { hexCode } from '../../modules/state.ts'
    import { View } from '../../modules/view.ts';

    let hexFmt = $state("")
    hexCode.subscribe((value, _) => hexFmt = View.hex(value))
</script>

{@html hexFmt}