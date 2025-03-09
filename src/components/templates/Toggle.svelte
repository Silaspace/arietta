<script lang="ts">
    let { state = $bindable() } : { state: boolean } = $props();
</script>

<div class="relative inline-block w-11 h-5">
    <input bind:checked={state} id="toggle" type="checkbox" class="peer appearance-none w-11 h-5 bg-gray-100 rounded-full checked:bg-gray-700 cursor-pointer transition-colors duration-150" />
    <label for="toggle" class="absolute top-0 left-0 w-5 h-5 bg-white rounded-full border border-gray-300 shadow-sm transition-transform duration-150 peer-checked:translate-x-6 peer-checked:border-gray-800 cursor-pointer"></label>
</div>