<script lang="ts">
	import type { PageServerData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { enhance } from '$app/forms';

	export let data: PageServerData;
</script>

<div class="flex items-center w-11/12 h-32 border-2 border-[#141414] rounded-md">
	<form
		method="POST"
		enctype="multipart/form-data"
		action="?/uploadProfileImg"
		class="flex justify-between items-center w-full"
		use:enhance
	>
		<div class="flex items-center">
			<div class="w-36">
				{#if data?.user?.profileImg !== ''}
					<div class="flex justify-center items-center h-24 w-24 ml-5 bg-[#202020] rounded-full">
						<img src={`${data?.user?.profileImg}`} alt={`${data?.user?.username}`} class="rounded-full"/>
					</div>
				{:else}
					<div class="flex justify-center items-center h-24 w-24 ml-5 bg-[#202020] rounded-full">
						<iconify-icon icon="mdi:user" height="3rem" width="3rem" class="text-[#707070]" />
					</div>
				{/if}
			</div>

			<Input type="file" name="profile" class="ml-10" />
		</div>
		<Button type="submit" class="ml-5">Upload Image</Button>
	</form>
</div>
