<script lang="ts">
	import Conversation from '$lib/components/Conversation.svelte';
	import Message from '$lib/components/Message.svelte';
	import { page } from '$app/stores';
	import { io, type Socket } from 'socket.io-client';

  let conversations: any[]
	let messages: any[] = [];
	let currentChat: any = null;
	let newMessage: string = '';
	let socket: Socket;
  let arrivalMessage: any = null

	$: {
		socket = io('http://localhost:3000');
		socket?.on('connect', () => {
			socket?.emit('removeUser', $page.data.user._id); // si el usuario existe es eliminado
			socket?.emit('addUser', $page.data.user._id); // se agrega el usuario la nueva conexion
			console.log('Successful connect socket');
		});

		socket?.on('disconnect', () => {
			socket?.emit('removeUser', $page.data.user._id); // si el usuario existe es eliminado
			console.log('Succesful disconnect socket');
		});

    socket?.on("getMessage", (data) => {
      arrivalMessage = {
        sender: data.senderId,
        text: data.text,
        createAt: Date.now()
      }
    })
	}	

	$: console.log(socket);
  $: console.log({conversations})
  $: console.log({arrivalMessage})

	const getConversations = async (userid: string) => {
		try {
			const response = await fetch(`http://localhost:3000/chat/conversations/${userid}`);
			const data = await response.json();
			conversations = data.conversation
			// console.log(conversations);
			return data.conversation;
		} catch (error) {
			console.log(error);
		}
	};

	const getMessages = async (currentChatId: string) => {
		try {
			const response = await fetch(`http://localhost:3000/chat/messages/${currentChatId}`);
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

    const receiverId = currentChat?.members.find(member => member !== $page.data.user._id)

    socket?.emit("sendMessage", {
      senderId: $page.data.user._id,
      receiverId: receiverId,
      text: newMessage
    })

		try {
			const response = await fetch(`http://localhost:3000/chat/messages`, {
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
  $: console.log({ currentChat })

  $: if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
     messages = [...messages, arrivalMessage]
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
</script>

<div class="flex m-0 p-0">
	<!-- ChatMenu -->
	<div class="w-1/4 h-[calc(100vh-56px)]">
		<div class="p-3">
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
					<button class="w-full" on:click={() => (currentChat = result)}>
						<Conversation conversation={result} userId={$page.data.user._id} />
					</button>
				{/each}
			{/await}
		</div>
	</div>

	<!-- ChatBox -->
	<div class="flex flex-col w-3/4 h-[calc(100vh-50px)]">
		<div class="p-3 h-full">
			<!-- ChatBox Head -->
			<!-- <div class="flex items-center h-[8%] w-full bg-[#121212]">
				<img
					src="https://img.freepik.com/foto-gratis/retrato-hermoso-mujer-joven-posicion-pared-gris_231208-10760.jpg?size=626&ext=jpg&ga=GA1.1.1488620777.1712534400&semt=sph"
					alt="user"
					class="w-12 h-12 rounded-full object-cover mx-5 cursor-pointer"
				/>
				<span class="font-medium text-lg cursor-pointer">Jhon Doe</span>
			</div>
 -->
			{#if currentChat}
				<!-- Chatbox Body -->
				<div bind:this={element} class="mx-5 pt-5 pr-5 h-[90%] overflow-y-scroll">
					{#each messages as message}
						<Message own={message?.sender === $page.data.user._id} {message} />
					{/each}
				</div>

				<!-- Chatbox SendMessages -->
				<div class="dark:bg-[#121212] w-full">
					<!-- <div class="flex items-center justify-evenly mt-1 h-20"> -->
					<form class="flex items-center justify-evenly mt-1 h-20" on:submit={handleSendMessage}>
						<textarea
							class="flex flex-wrap w-4/5 p-1 h-10 dark:bg-[#121212] border border-gray-200 dark:border-[#202020] rounded-2xl placeholder:px-1"
							placeholder="write something"
							id=""
							bind:value={newMessage}
						></textarea>
						<button class="w-20 h-10 border-none rounded-lg bg-purple-600 dark:bg-[#202020] text-white"> Send </button>
					</form>
				</div>
				<!-- </div> -->
			{/if}
		</div>
	</div>
</div>
