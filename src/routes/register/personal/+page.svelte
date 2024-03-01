<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<div class="flex flex-col items-center justify-center h-screen w-full">
	<!-- Header -->
	<h1 class="text-3xl font-semibold dark:text-gray-200 tracking-tight mb-10">
		Crear Usuario Personal
	</h1>

	<!-- Form -->
	<form method="POST" action="?/login" class="flex-col gap-2 min-w-xs w-96 mx-auto" use:enhance>
		<!-- Username Input -->
		<div class="flex flex-col">
			<label for="username" class="text-base dark:text-gray-200 font-medium">Username</label>
			<input
				type="text"
				name="username"
				class="h-8 border rounded-md text-black font-semibold px-2"
			/>
		</div>

		<!-- Email Input -->
		<div class="flex flex-col">
			<label for="email" class="text-base dark:text-gray-200 font-medium">Email</label>
			<input
				type="email"
				name="email"
				class="h-8 border rounded-md text-black font-semibold px-2"
			/>
		</div>

		<!-- Password Input -->
		<div class="flex flex-col">
			<label for="password" class="text-base dark:text-gray-200 font-medium">Password</label>
			<input
				type="password"
				name="password"
				class="h-8 border text-black font-semibold px-2 text-xl rounded-md"
			/>
		</div>

		<!-- verified Password Input -->
		<div class="flex flex-col">
			<label for="password" class="text-base dark:text-gray-200 font-medium">Password confirmation</label>
			<input
				type="password"
				name="password"
				class="h-8 border text-black font-semibold px-2 text-xl rounded-md"
			/>
		</div>

		<!-- Login Submit -->
		<button
			class="h-10 w-full mt-4 border border-[#222222] bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-[#252525]"
			>Create User</button
		>
	</form>

	<!-- Terms & Services Info -->
	<p class="px-8 mt-6 text-center text-sm dark:text-gray-200 text-muted-foreground">
		By clicking Create User, you agree to our{' '}
		<a href="/terms" class="underline underline-offset-4 hover:text-primary">
			Terms of Service
		</a>{' '}
		and{' '}
		<a href="/privacy" class="underline underline-offset-4 hover:text-primary"> Privacy Policy </a>
		.
	</p>
</div>
