import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { paraglide } from "@inlang/paraglide-sveltekit/vite"
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [
    paraglide({
      project: "./project.inlang",
      outdir: "./src/paraglide",
    }),
    tailwindcss(),
    sveltekit(),
	],
	ssr: {
		noExternal: ['three']
	}
})
