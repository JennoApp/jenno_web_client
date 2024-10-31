<script lang="ts">
  import { PRIVATE_SERVER_URL } from '$env/static/private'

	export let conversation: any[];
	export let userId: string;

	let user: any = null;

	$: {
		const friendId = conversation?.members.find((m) => m !== userId);

		const getUser = async () => {
			try {
				const response = await fetch(`${PRIVATE_SERVER_URL}/users/${friendId}`);
				const data = await response.json();
				user = data;
				console.log(data);
			} catch (err) {
				console.log(err);
			}
		};
		getUser();
	}
</script>
<div class="flex items-center p-3 mt-3 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-[#202020]">
	{#if user?.profileImg !== ''}
		<img
			src={user?.profileImg}
			alt={user?.username}
			class="w-10 h-10 rounded-full object-cover mr-5"
		/>
	{:else}
		<iconify-icon
			icon="mdi:user"
			height="1.5rem"
			width="1.5rem"
			class="dark:text-gray-200 flex justify-center items-center h-9 w-9 ml-1 bg-gray-200 dark:bg-[#181818] rounded-full mr-5"
		/>
	{/if}
	<span class="font-medium">{user?.username}</span>
</div>
