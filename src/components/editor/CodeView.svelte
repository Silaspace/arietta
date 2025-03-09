<script lang="ts">
    import { rawCode } from '../state.ts'
    import { Highlighter } from '../../modules/highlighter';

    const highlighter: Highlighter = new Highlighter()
    let highlighted = $state("")
    rawCode.subscribe((value, _) => highlighted = highlighter.highlight(value))
</script>

{@html highlighted}