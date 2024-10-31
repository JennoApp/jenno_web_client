<script lang="ts">
	import Conversation from '$lib/components/Conversation.svelte';
	import Message from '$lib/components/Message.svelte';
	import { page } from '$app/stores';
	import { io, type Socket } from 'socket.io-client';
  import * as m from '$paraglide/messages'
  import { PRIVATE_SERVER_URL } from '$env/static/private'

	let conversations: any[];
	let messages: any[] = [];
	let currentChat: any = null;
	let newMessage: string = '';
	let socket: Socket;
	let arrivalMessage: any = null;

	$: {
		socket = io(`${PRIVATE_SERVER_URL}`);
		socket?.on('connect', () => {
			socket?.emit('removeUser', $page.data.user._id); // si el usuario existe es eliminado
			socket?.emit('addUser', $page.data.user._id); // se agrega el usuario la nueva conexion
			console.log('Successful connect socket');
		});

		socket?.on('disconnect', () => {
			socket?.emit('removeUser', $page.data.user._id); // si el usuario existe es eliminado
			console.log('Succesful disconnect socket');
		});

		socket?.on('getMessage', (data) => {
			arrivalMessage = {
				sender: data.senderId,
				text: data.text,
				createAt: Date.now()
			};
		});
	}

	$: console.log(socket);
	$: console.log({ conversations });
	$: console.log({ arrivalMessage });

	const getConversations = async (userid: string) => {
		try {
			const response = await fetch(`${PRIVATE_SERVER_URL}/chat/conversations/${userid}`);
			const data = await response.json();
			conversations = data.conversation;
			// console.log(conversations);
			return data.conversation;
		} catch (error) {
			console.log(error);
		}
	};

	const getMessages = async (currentChatId: string) => {
		try {
			const response = await fetch(`${PRIVATE_SERVER_URL}/chat/messages/${currentChatId}`);
			const data = await response.json();
			messages = [...data?.messages];
			return data;
		} catch (err) {
			console.log(err);
		}
	};

	$: {
		getConversations($page.data.user._id).then((data) => console.log(data));
	}

	$: if (currentChat) {
		getMessages(currentChat?._id).then((data) => console.log(data));
	}

	const handleSendMessage = async () => {
		const message = {
			sender: $page.data.user._id,
			text: newMessage,
			conversationId: currentChat._id
		};

		const receiverId = currentChat?.members.find((member) => member !== $page.data.user._id);

		socket?.emit('sendMessage', {
			senderId: $page.data.user._id,
			receiverId: receiverId,
			text: newMessage
		});

		try {
			const response = await fetch(`${PRIVATE_SERVER_URL}/chat/messages`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					conversationId: message.conversationId,
					sender: message.sender,
					text: message.text
				})
			});

			const data = await response.json();
			messages = [...messages, data?.savedMessage];

			console.log(data);
			return data;
		} catch (err) {
			console.log(err);
		}
	};

	$: console.log({ messages });
	$: console.log({ currentChat });

	$: if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
		messages = [...messages, arrivalMessage];
	}

	import { afterUpdate } from 'svelte';

	// get element
	let element: HTMLDivElement;

	const scrollToBottom = async (node: HTMLDivElement) => {
		node?.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	afterUpdate(() => {
		if (messages) scrollToBottom(element);
	});

	$: if (messages && element) {
		scrollToBottom(element);
	}

	$: console.log({ element });

	////
	let isSmallview: boolean = false;
  
  let friendId: string

  $: if (currentChat !== null) {
    friendId = currentChat.members.find((member: any) => member !== $page.data.user._id)
    console.log(friendId)
  }
</script>

<div class="flex m-0 p-0">
	<!-- ChatMenu -->

	<div
		class={`w-full md:w-1/4 top-14 h-[calc(100vh-56px)] ${isSmallview === true ? 'hidden md:block' : ''}`}
	>
		<div class="w-full p-3">
			<!-- Buscador de usuarios de mensajes dejado para despues; se agrega 'hidden' -->
			<input
				type="text"
				placeholder="Search for users"
				class="w-[90%] py-3 border-t-0 border-b-2 border-b-gray-300 dark:border-b-[#202020] dark:bg-[#121212] placeholder:text-[#707070] placeholder:pl-3 outline-none hidden"
			/>
			{#await getConversations($page.data.user._id)}
				<p>fetching...</p>
			{:then data}
				{#each data as result}
					<button
						class="w-full"
						on:click={() => {
							currentChat = result;
							isSmallview = !isSmallview;
						}}
					>
						<Conversation conversation={result} userId={$page.data.user._id} />
					</button>
				{/each}
			{/await}
		</div>
	</div>

	<!-- ChatBox -->
	<div class={`w-full ${isSmallview === true ? '' : 'hidden'}`}>
		<div class="flex flex-col w-full top-14 h-[calc(100vh-56px)]">
			<div class="p-3 h-[calc(100vh-100px)]">
				<!-- ChatBox Head -->
				{#if isSmallview === true}
					<button
						class={`${isSmallview === true ? '' : 'hidden'}`}
						on:click={() => {
							isSmallview = !isSmallview;
						}}
					>
						<!-- Close Icon -->
						<iconify-icon icon="ion:arrow-back" height="1.5rem" width="1.5rem"></iconify-icon>
					</button>
				{/if}

				{#if currentChat}
					<!-- Chatbox Body -->
					<div bind:this={element} class="mx-5 pt-5 pr-5 h-[90%] overflow-y-scroll">
						{#each messages as message}
							<Message own={message?.sender === $page.data.user._id} friendId={friendId} {message} />
						{/each}
					</div>

					<!-- Chatbox SendMessages -->
					<div class="dark:bg-[#121212] w-full">
						<!-- <div class="flex items-center justify-evenly mt-1 h-20"> -->
						<form class="flex items-center justify-evenly mt-1 h-20" on:submit={handleSendMessage}>
							<textarea
								class="flex flex-wrap w-4/5 p-1 h-10 dark:bg-[#121212] border border-gray-200 dark:border-[#202020] rounded-2xl placeholder:px-1"
								placeholder={m.chat_page_message_input()}
								id=""
								bind:value={newMessage}
							></textarea>
							<button
								class="w-20 h-10 border-none rounded-lg bg-purple-600 dark:bg-[#202020] text-white"
							>
								{m.chat_page_message_button()}
							</button>
						</form>
					</div>
					<!-- </div> -->
				{/if}
			</div>
		</div>
	</div>
</div>
