<script lang="ts">
    import { rawCode } from '../state.ts'
    import { Highlighter } from '../../modules/highlighter';
    import { asm, dfu } from '../state.ts';

    const highlighter: Highlighter = new Highlighter()

    let hexFmt = $state("")

    const updateHex = async (value: string, _?: string) => {
        let data = await asm.assemble(value)

        if (data instanceof Uint8Array) {
            hexFmt = highlighter.hex(data)
        }
    }

    rawCode.subscribe(updateHex)
</script>

{@html hexFmt}