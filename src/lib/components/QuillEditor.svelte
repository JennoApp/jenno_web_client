<script lang="ts">
	import { onMount } from 'svelte';

	export let productId: string;
	export let value = '';
	export let onChange = (html: string) => {};

	let editorDiv: HTMLDivElement;
	let quill: any;

	const toolbarOptions = [
		[{ size: ['large', false, 'small'] }],
		['bold', 'italic', 'underline', 'strike'],
		[{ list: 'ordered' }, { list: 'bullet' }],
		['image'],
		[{ align: [] }],
		['clean']
	];

	function imageHandler() {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.click();

		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;

			// Elegir endpoint según tengamos o no productId
			const isDraft = !productId;
			const endpoint = isDraft
				? '/api/upload-additional-info-draft'
				: `/api/uploadAdditionalInfoImage?productId=${productId}`;

			const formData = new FormData();
			formData.append('file', file);

			try {
				const response = await fetch(endpoint, {
					method: 'POST',
					body: formData
				});

				if (!response.ok) throw new Error('Error al subir imagen');

				const data = await response.json();
				const url = data.url ?? (Array.isArray(data.urls) && data.urls[0]);
				if (!url) throw new Error('La respuesta no incluye ninguna URL');

				const range = quill.getSelection(true);
				quill.insertEmbed(range.index, 'image', url);
				quill.setSelection(range.index + 1);
			} catch (err) {
				console.error('Error al subir imagen:', err);
			}
		};
	}

	onMount(async () => {
		await import('quill/dist/quill.snow.css');
		await import('quill/modules/toolbar');
		await import('quill/formats/align');
		await import('quill/formats/size');

		const Quill = (await import('quill')).default;

		quill = new Quill(editorDiv, {
			theme: 'snow',
			modules: {
				toolbar: {
					container: toolbarOptions,
					handlers: {
						image: imageHandler
					}
				}
			}
		});

		quill.root.innerHTML = value;

		quill.on('text-change', () => {
			const html = quill.root.innerHTML;
			onChange(html);
		});
	});

	export function getHTML() {
		return quill?.root.innerHTML ?? '';
	}
</script>

<div bind:this={editorDiv} class="quill-editor" />

<style>
	:global(.quill-editor .ql-toolbar) {
		background-color: white;
		color: black;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem 0.5rem 0 0;
	}

	:global(html.dark .quill-editor .ql-toolbar) {
		background-color: #27272a;
		color: white;
		border-color: #4b5563;
	}

	:global(.quill-editor .ql-container) {
		background-color: white;
		color: black;
		border-top: none;
		border: 1px solid #d1d5db;
		border-radius: 0 0 0.5rem 0.5rem;
		min-height: 300px;
	}

	:global(html.dark .quill-editor .ql-container) {
		background-color: #18181b;
		color: white;
		border-color: #4b5563;
	}

	:global(.quill-editor .ql-editor) {
		font-size: 1rem;
		line-height: 1.625;
		color: inherit;
	}
</style>
