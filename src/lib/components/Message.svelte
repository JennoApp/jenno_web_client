<script lang="ts">
	import { format } from 'timeago.js';
	import { page } from '$app/stores';
  import { PRIVATE_SERVER_URL } from '$env/static/private'

	export let own: boolean;
	export let friendId: any;
	export let message: any;

	let friendImg: string;

	const getFriendImg = async (id: string) => {
		const response = await fetch(`${PRIVATE_SERVER_URL}/users/getprofileimg/${id}`);
		const data = await response.json();
		friendImg = data;

		return data;
	};

	$: {
		getFriendImg(friendId);
	}

	$: console.log(friendImg);
	$: console.log(friendId);
</script>

<div class="flex flex-col mb-3">
	{#if own}
		<div class="flex self-end">
			{#if $page.data.user.profileImg !== ''}
				<img
					src={$page.data.user.profileImg}
					alt=""
					class="w-8 h-8 rounded-full object-cover mr-3"
				/>
			{:else}
				<iconify-icon
					icon="mdi:user"
					height="1.3rem"
					width="1.3rem"
					class="dark:text-gray-200 flex justify-center items-center h-9 w-9 mr-3 bg-gray-200 dark:bg-[#202020] rounded-full"
				/>
			{/if}
			<p class={'p-2 rounded-3xl bg-gray-200 dark:bg-[#202020] max-w-72'}>{message.text}</p>
		</div>
		<div class="text-sm mt-2 self-end">
			{format(message.createdAt)}
		</div>
	{/if}

{#if own === false}
		<div class="flex">
			{#if friendImg?.profileImg !== ''}
				<img
					src={friendImg?.profileImg}
					alt=""
					class="w-8 h-8 rounded-full object-cover mr-3"
				/>
			{:else}
				<iconify-icon
					icon="mdi:user"
					height="1.3rem"
					width="1.3rem"
					class="dark:text-gray-200 flex justify-center items-center h-9 w-9 mr-3 bg-gray-200 dark:bg-[#202020] rounded-full"
				/>
			{/if}
			<p class={'p-2 rounded-3xl bg-gray-200 dark:bg-[#202020] max-w-72'}>{message.text}</p>
		</div>
		<div class="text-sm mt-2">
			{format(message.createdAt)}
		</div>
	{/if}
</div>
