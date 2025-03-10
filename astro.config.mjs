// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  site: 'https://www.cs.ox.ac.uk/people/alex.rogers/arietta',
  base: '/people/alex.rogers/arietta',
  trailingSlash: 'always',
  integrations: [svelte()]
});