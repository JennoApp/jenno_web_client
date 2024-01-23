<script>
	export let closeMenu = true;
</script>

<nav
	class={!closeMenu
		? 'bg-white dark:bg-[#121212] fixed top-14 left-0 w-52 h-[calc(100vh-56px)] z-50'
		: 'bg-white dark:bg-[#121212] fixed top-14 left-0 w-20 h-[calc(100vh-56px)] z-50'}
>
	<div
		class={!closeMenu ? 'flex flex-col justify-between items-center mx-3' : 'flex flex-col mx-3'}
	>
		<ul>
			<a
				href="/"
				class={!closeMenu
					? 'group text h-10 w-44 px-3 list-none flex items-center rounded-xl hover:bg-txt'
					: 'group text h-10 w-14 px-3 list-none flex items-center justify-center rounded-xl hover:bg-txt'}
			>
				<iconify-icon
					icon="lucide:home"
					height="1.3rem"
					width="1.3rem"
					class={!closeMenu
						? 'text-[#707070] text-xl ml-[2px] group-hover:text-[#fff]'
						: 'text-[#707070] text-xl group-hover:text-[#fff]'}
				/>
				<span
					class={!closeMenu ? 'text-[#707070] text-base ml-3 group-hover:text-[#fff]' : 'hidden'}
					>Inicio</span
				>
			</a>

			<a
				href="/explore"
				class={!closeMenu
					? 'group text h-10 w-44 mt-2 px-3 list-none flex items-center rounded-xl hover:bg-txt'
					: 'group text h-10 w-14 mt-2 px-3 list-none flex items-center justify-center rounded-xl hover:bg-txt'}
			>
				<iconify-icon
					icon="material-symbols-light:explore"
					height="1.3rem"
					width="1.3rem"
					class={!closeMenu
						? 'text-[#707070] text-xl ml-[2px] group-hover:text-[#fff]'
						: 'text-[#707070] text-xl group-hover:text-[#fff]'}
				/>
				<span
					class={!closeMenu ? 'text-[#707070] text-base ml-3 group-hover:text-[#fff]' : 'hidden'}
					>Explorar</span
				>
			</a>

			<a
				href="/subscriptions"
				class={!closeMenu
					? 'group text h-10 w-44 mt-2 px-3 list-none flex items-center rounded-xl hover:bg-txt'
					: 'group text h-10 w-14 mt-2 px-3 list-none flex items-center justify-center rounded-xl hover:bg-txt'}
			>
				<iconify-icon
					icon="eos-icons:product-subscriptions"
					height="1.3rem"
					width="1.3rem"
					class={!closeMenu
						? 'text-[#707070] text-xl ml-[2px] group-hover:text-[#fff]'
						: 'text-[#707070] text-xl group-hover:text-[#fff]'}
				/>
				<span
					class={!closeMenu ? 'text-[#707070] text-base ml-3 group-hover:text-[#fff]' : 'hidden'}
					>Subscripción</span
				>
			</a>
		</ul>
	</div>
</nav>
