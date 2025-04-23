<script lang="ts">
    import Button from "../templates/Button.svelte";
    import { asm, rawCode, hexCode } from '../state.ts'

    async function assemble(): Promise<void> {
        let raw = rawCode.get()
        let data = await asm.assemble(raw, true)

        if (data instanceof Uint8Array) {
            let cast = new Uint8Array(data) // casts from Uint8Array<ArrayBufferLike> to Uint8Array<ArrayBuffer>
            hexCode.set(cast)
        }
    }
</script>

<Button clickable={assemble} disabled={false}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
          
</Button>