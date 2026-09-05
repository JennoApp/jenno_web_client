<script lang="ts">
	import Autoplay from 'embla-carousel-autoplay';
	import * as Carousel from '$lib/components/ui/carousel/index.js';

	const autoplay = Autoplay({
		delay: 5000,
		stopOnInteraction: true
	});

	const slides = [
		{
			id: 1,
			label: 'NOVEDADES',
			title: 'Descubre lo nuevo en Jenno',
			description: 'Encuentra productos recién llegados y descubre nuevas opciones para tu próxima compra.',
			image: '/promotions/nuevos.jpg',
			button: 'Ver novedades'
		},
		{
			id: 2,
			label: 'OFERTAS',
			title: 'Encuentra grandes oportunidades',
			description: 'Descubre productos seleccionados y aprovecha nuestras ofertas especiales.',
			image: '/promotions/ofertas.jpg',
			button: 'Ver ofertas'
		},
		{
			id: 3,
			label: 'DESTACADOS',
			title: 'Productos que pueden interesarte',
			description: 'Explora algunos de los productos que están llamando la atención esta semana.',
			image: '/promotions/destacados.jpg',
			button: 'Explorar'
		}
	];
</script>

<div class="w-full">

	<Carousel.Root
		opts={{
			align: 'start',
			loop: true
		}}
		plugins={[autoplay]}
		class="w-full"
		onmouseenter={autoplay.stop}
		onmouseleave={autoplay.reset}
	>
		<Carousel.Content>

			{#each slides as slide (slide.id)}

				<Carousel.Item class="basis-full">

					<div
						class="relative overflow-hidden
						       rounded-2xl
						       border border-gray-200 dark:border-[#303030]
						       bg-gray-100 dark:bg-[#202020]
						       min-h-[190px] sm:min-h-[220px]"
					>

						<!-- Imagen -->
						<div class="absolute inset-0">

							<img
								src={slide.image}
								alt={slide.title}
								class="h-full w-full object-cover"
							/>

						</div>


						<!-- Overlay -->
						<div
							class="absolute inset-0
							       bg-gradient-to-r
							       from-gray-100 via-gray-100/90 to-transparent
							       dark:from-[#202020] dark:via-[#202020]/90"
						></div>


						<!-- Contenido -->
						<div
							class="relative z-10
							       flex min-h-[190px] sm:min-h-[220px]
							       items-center"
						>

							<div class="max-w-xl p-6 sm:p-8">

								<span
									class="text-[11px]
									       font-semibold
									       tracking-[0.15em]
									       text-gray-500
									       dark:text-gray-400"
								>
									{slide.label}
								</span>


								<h2
									class="mt-2
									       text-2xl sm:text-3xl
									       font-bold
									       tracking-tight
									       text-gray-900
									       dark:text-gray-100"
								>
									{slide.title}
								</h2>


								<p
									class="mt-2
									       max-w-md
									       text-sm
									       leading-relaxed
									       text-gray-600
									       dark:text-gray-400"
								>
									{slide.description}
								</p>


								<button
									type="button"
									class="mt-5
									       h-10
									       rounded-lg
									       bg-gray-900
									       dark:bg-white
									       px-5
									       text-sm
									       font-semibold
									       text-white
									       dark:text-black
									       shadow-sm
									       transition-all
									       hover:bg-gray-700
									       dark:hover:bg-gray-200
									       hover:shadow-md
									       active:scale-[0.98]"
								>
									{slide.button}
								</button>

							</div>

						</div>

					</div>

				</Carousel.Item>

			{/each}

		</Carousel.Content>


		<!-- Previous
		<Carousel.Previous
			class="left-3
			       bg-white/90
			       dark:bg-[#161616]/90
			       border border-gray-200
			       dark:border-[#303030]
			       text-gray-700
			       dark:text-gray-200
			       shadow-sm
			       hover:bg-white
			       dark:hover:bg-[#202020]"
		/> -->


		<!-- Next
		<Carousel.Next
			class="right-3
			       bg-white/90
			       dark:bg-[#161616]/90
			       border border-gray-200
			       dark:border-[#303030]
			       text-gray-700
			       dark:text-gray-200
			       shadow-sm
			       hover:bg-white
			       dark:hover:bg-[#202020]"
		/> -->

	</Carousel.Root>

</div>
