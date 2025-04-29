<script lang="ts">
    import Toggle from "../templates/Toggle.svelte";
    import { settings } from '../../modules/state.ts'
	import { subscribeKeys } from 'nanostores'

    let darkMode = $state(false);

	subscribeKeys(settings, ['theme'], (value, oldValue, changed) => {
        darkMode = (value['theme'] == 'dark')
    })

    $effect(() => {
        let theme: 'dark' | 'light' = darkMode ? 'dark' : 'light'
        settings.setKey('theme', theme)
    })
</script>

<Toggle bind:state = {darkMode} />