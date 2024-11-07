import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { paraglide } from "@inlang/paraglide-sveltekit/vite"

export default defineConfig(({ mode }) => ({
	plugins: [
    paraglide({
      project: "./project.inlang",
      outdir: "./src/paraglide"
    }),
    sveltekit(),
	],
	ssr: {
		noExternal: ['three']
	},
  resolve: {
    alias: {
      $img: mode === 'production' ? './static' : '..'
    }
  }
}))
