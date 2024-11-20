<script lang="ts">
	import Conversation from '$lib/components/Conversation.svelte';
	import Message from '$lib/components/Message.svelte';
	import { page } from '$app/stores';
	import { getContext, onMount, afterUpdate } from 'svelte';
	import * as m from '$paraglide/messages';

	// Obtener el socket del contexto
	const { socket }: { socket: any } = getContext('socket');
	$: console.log({ socket });

	// Estados y variables
  let conversationId = $page.url.searchParams.get('conversationId')
	let conversations: any[] = [];
	let messages: any[] = [];
	let currentChat: any = null
	let newMessage: string = '';
	let arrivalMessage: any = null;
	let element: HTMLDivElement;
	let isSmallview: boolean = false;
	let friendId: string;

	// Estado para verificar si las conversaciones se cargaron correctamente
	let isLoadingConversations: boolean = true;

	// Obtener conversaciones del servidor (usando datos proporcionados por `load`)
	$: {
		if ($page.data.conversations) {
			conversations = $page.data.conversations;
			isLoadingConversations = false;
		} else {
			isLoadingConversations = true;
		}
	}

	$: console.log({ conversations, isLoadingConversations });

	// Obtener url del servidor
	let serverUrl: string;
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			serverUrl = data.server_url;
		} catch (error) {
			console.error('Error al solicitar Server Url');
		}
	}

	onMount(getServerUrl);

	

	// Obtener mensajes de la conversacion actual
	const getMessages = async (currentChatId: string) => {
    if (!serverUrl) {
        console.error('Error: serverUrl no está definido.');
        return;
    }
		try {
			const response = await fetch(`${serverUrl}/chat/messages/${currentChatId}`);
			const data = await response.json();

			messages = [...(data?.messages ?? [])];
		} catch (error) {
			console.error('Error obteniendo mensajes:', error);
			messages = [];
		}
	};	


   // Reactividad para manejar el cambio de conversación
  $: if (currentChat && currentChat._id !== conversationId) {
    currentChat = conversations.find((conv) => conv._id === conversationId);
    if (currentChat) {
      getMessages(currentChat._id);
      friendId = currentChat.members.find((member: any) => member !== $page.data.user._id);
    }
  }

	// Enviar mensaje
	const handleSendMessage = async () => {
		const message = {
			sender: $page.data.user._id,
			text: newMessage,
			conversationId: currentChat._id
		};

		const receiverId = currentChat?.members.find((member: any) => member !== $page.data.user._id);

		socket?.emit('sendMessage', {
			senderId: $page.data.user._id,
			receiverId: receiverId,
			text: newMessage
		});

		try {
			const response = await fetch(`${serverUrl}/chat/messages`, {
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

	// Desplazar hacia abajo en los mensajes
	const scrollToBottom = (node: HTMLDivElement) => {
		node?.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	afterUpdate(() => {
		if (messages && element) scrollToBottom(element);
	});
</script>

{#if conversations.length > 0}
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
				<!-- Mostrar lista de conversaciones -->
				{#each conversations as result}
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
								<Message own={message?.sender === $page.data.user._id} {friendId} {message} />
							{/each}
						</div>

						<!-- Chatbox SendMessages -->
						<div class="dark:bg-[#121212] w-full">
							<!-- <div class="flex items-center justify-evenly mt-1 h-20"> -->
							<form
								class="flex items-center justify-evenly mt-1 h-20"
								on:submit={handleSendMessage}
							>
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
{:else}
	<!-- Mostrar mensaje cuando no hay conversaciones -->
	<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
		<iconify-icon icon="mdi:conversation" height="5rem" width="5rem" class="text-[#707070] mb-4" />
		<p class="text-lg text-[#707070] mb-2">Aún no tienes ninguna conversación</p>
		<p class="text-lg text-[#707070]">
			Puedes comenzar una conversación explorando las tiendas o conectándote con otros usuarios. ¡Descubre productos interesantes y haz nuevos amigos!
		</p>
	</div>
{/if}
