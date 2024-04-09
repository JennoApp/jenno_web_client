<script lang="ts">
	import Conversation from '$lib/components/Conversation.svelte';
	import Message from '$lib/components/Message.svelte';
	import { page } from '$app/stores';

	let conversations: any[] = [];

	const getConversations = async (userid: string) => {
		try {
			const response = await fetch(`http://localhost:3000/chat/conversations/${userid}`);
			const data = await response.json();
			// conversations.push(data.conversation);
			// console.log(conversations);
			return data.conversation;
		} catch (error) {
			console.log(error);
		}
	};

	$: {
		getConversations($page.data.user._id).then(data => console.log(data))
	}
</script>

<div class="flex m-0 p-0">
	<!-- ChatMenu -->
	<div class="w-1/4 h-[calc(100vh-56px)]">
		<div class="p-3">
			<input
				type="text"
				placeholder="Search for users"
				class="w-[90%] py-3 border-t-0 border-b-2 border-b-[#202020] bg-[#121212] placeholder:text-[#707070] outline-none"
			/>
			{#await getConversations($page.data.user._id)}
				<p>fetching...</p>
			{:then data}
				{#each data as result}
          <Conversation conversation={result} userId={$page.data.user._id}/>
				{/each}
			{/await}
		</div>
	</div>

	<!-- ChatBox -->
	<div class="flex flex-col w-3/4 h-[calc(100vh-50px)]">
		<div class="p-3 h-full">
			<!-- ChatBox Head -->
			<div class="flex items-center h-[8%] w-full bg-[#121212]">
				<img
					src="https://img.freepik.com/foto-gratis/retrato-hermoso-mujer-joven-posicion-pared-gris_231208-10760.jpg?size=626&ext=jpg&ga=GA1.1.1488620777.1712534400&semt=sph"
					alt="user"
					class="w-12 h-12 rounded-full object-cover mx-5 cursor-pointer"
				/>
				<span class="font-medium text-lg cursor-pointer">Jhon Doe</span>
			</div>

			<!-- Chatbox Body -->
			<div class="mx-5 pr-5 h-[82%] overflow-y-scroll">
				<Message own={true} />
				<Message own={false} />
				<Message own={false} />
				<Message own={true} />
			</div>

			<!-- Chatbox SendMessages -->
			<div class="bg-[#121212] w-full h-">
				<div class="flex items-center justify-evenly mt-1 h-20">
					<textarea
						class="flex flex-wrap w-4/5 p-1 h-10 bg-[#121212] border border-[#202020] rounded-2xl placeholder:px-1"
						placeholder="write something"
						id=""
					></textarea>
					<button
						class="w-20 h-10 border-none rounded-lg bg-[#202020]"
						on:click={() => alert('enviando mensaje')}>Send</button
					>
				</div>
			</div>
		</div>
	</div>
</div>
