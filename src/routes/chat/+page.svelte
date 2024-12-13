<script lang="ts">
	import Conversation from '$lib/components/Conversation.svelte';
	import Message from '$lib/components/Message.svelte';
	import { page } from '$app/stores';
	import { getContext, onMount, afterUpdate } from 'svelte';
	import * as m from '$paraglide/messages';
	import { toast } from 'svelte-sonner';
	import { messages, currentChat, isLoadingMessages } from '$lib/stores/messagesStore';
	import { get } from 'svelte/store';
	import { error } from '@sveltejs/kit';

	// Obtener el socket del contexto
	const { socket }: { socket: any } = getContext('socket');
	$: console.log({ socket });

	// Estados y variables
	let conversationId = $page.url.searchParams.get('conversationId');
	let conversations: any[] = [];
	let newMessage: string = '';
	let element: HTMLDivElement;
	let isSmallview = window.innerWidth < 768;
	let friendId: string | null;
	let openChatbox: boolean = false;
	let currentChatValue;

	// Suscripción reactiva al store
	$: currentChatValue = $currentChat;

	// Estado para verificar si las conversaciones se cargaron correctamente
	let isLoadingConversations: boolean = true;

	// Obtener conversaciones del servidor
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
	let serverUrl: string | undefined = undefined;
	async function getServerUrl() {
		try {
			const response = await fetch(`/api/server`);
			const data = await response.json();

			if (data.server_url) {
				serverUrl = data.server_url;
				console.log('serverUrl:', serverUrl);
			} else {
				console.error('Error: server_url no está presente en la respuesta.');
			}
		} catch (error) {
			console.error('Error al solicitar Server Url');
		}
	}

	onMount(async () => {
		await getServerUrl();
	});

	// Obtener mensajes de la conversacion actual
	const getMessages = async (currentChatId: string) => {
		isLoadingMessages.set(true);
		console.log('Intentando obtener mensajes para:', currentChatId);

		if (!serverUrl) {
			console.error('Error: serverUrl no está definido.');
			return;
		}

		try {
			const response = await fetch(`${serverUrl}/chat/messages/${currentChatId}`);
			console.log('Respuesta del servidor:', response);

			if (response.ok) {
				const data = await response.json();
				messages.set(data.messages);
			} else {
				messages.set([]);
			}
		} catch (error) {
			console.error('Error obteniendo mensajes:', error);
			messages.set([]);
		} finally {
			isLoadingMessages.set(false);
		}
	};

	$: console.log({ currentChat });

	// Escuchar mensajes entrantes
	socket?.on('getMessage', (data: any) => {
		if (!data || !data.conversationId || !data._id) {
			console.warn('Datos de mensaje inválidos recibidos:', data);
			return;
		}

		const { conversationId, _id, text, sender } = data;

		// Validar campos obligatorios
		if (!conversationId || !_id || !text || !sender) {
			console.warn('Datos de mensaje incompletos recibidos:', data);
			return;
		}

		const currentChatValue = get(currentChat);
		const messagesValue = get(messages);

		if (currentChatValue?._id === data.conversationId) {
			const messageExists = messagesValue.some((msg) => msg._id === _id);
			if (!messageExists) {
				messages.update((msgs) => [...msgs, data]);
			}
		}
	});

	// Enviar mensaje
	const handleSendMessage = async () => {
		if (!newMessage.trim() || !currentChat) {
			console.log('El mensaje está vacío o no hay una conversación seleccionada.');
			return;
		}

		const currentChatValue = get(currentChat);
		if (!currentChatValue) return;

		const message = {
			conversationId: currentChatValue._id,
			sender: $page.data.user._id,
			text: newMessage
		};

		// Obtener el ID del receptor
		const receiverId = currentChatValue?.members.find(
			(member: any) => member !== $page.data.user._id
		);

		// Emitir mensaje con socket
		socket?.emit('sendMessage', {
			_id: '',
			sender: $page.data.user._id,
			receiverId,
			text: newMessage,
			conversationId: currentChatValue._id
		});

		try {
			const response = await fetch(`${serverUrl}/chat/messages`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(message)
			});

			if (response.ok) {
				const data = await response.json();
				if (data?.savedMessage && data.savedMessage._id && data.savedMessage.conversationId) {
					// messages.update((msgs) => [...msgs, data.savedMessage]);
					newMessage = '';
				} else {
					console.error('Respuesta inesperada del servidor:', data);
					toast.error('El mensaje no pudo ser enviado. Intenta de nuevo.');
				}
			} else {
				console.error('Error en la respuesta del servidor:', response.statusText);
				toast.error('Hubo un problema al enviar el mensaje. Por favor, intentalo de nuevo.');
			}
		} catch (error) {
			console.log('Error al enviar el mensaje:', error);
			toast.error('Hubo un problema al enviar el mensaje. Por favor, intentalo de nuevo.');
		}
	};

	// Listener para manejar cambios de tamaño de pantalla
	window.addEventListener('resize', () => {
		isSmallview = window.innerWidth < 768;
	});

	// Desplazar hacia abajo en los mensajes
	const scrollToBottom = (node: HTMLDivElement) => {
		if (node) {
			node?.scroll({
				top: node.scrollHeight,
				behavior: 'smooth'
			});
		}
	};

	afterUpdate(() => {
		if (get(messages)?.length > 0 && element) {
			scrollToBottom(element);
		}
	});

	$: console.log({ messages });

	const selectConversation = (id: string) => {
		console.log('Seleccionando conversacion:', id);
		conversationId = id;
		const selectedChat = conversations.find((conv) => conv._id === id);
		if (selectedChat) {
			currentChat.set(selectedChat);
			getMessages(selectedChat._id);
		}
	};

	$: if (conversationId && serverUrl && conversations.length > 0) {
		console.log('Cambiando conversationId a:', conversationId);

		// Encontrar la conversación actual (si no existe o cambia el ID)
		const newChat = conversations.find((conv) => conv._id === conversationId);
		if (newChat) {
			// Actualizar `currentChat` solo si cambia
			if (!currentChatValue || currentChatValue._id !== newChat._id) {
				currentChat.set(newChat);
				console.log('Actualizando conversación a:', newChat._id);
			}

			// Actualizar el ID del amigo basado en los miembros
			friendId = newChat.members.find((member: any) => member !== $page.data.user._id);

			// Obtener mensajes de la conversación (siempre que cambie `conversationId`)
			console.log('Cargando mensajes para conversación:', newChat._id);
			getMessages(newChat._id);
		} else {
			console.warn('No se encontró una conversación con el ID:', conversationId);
			currentChat.set(null);
			friendId = null;
		}

		// Abrir la caja de chat y manejar vistas pequeñas
		openChatbox = true;
		if (isSmallview) isSmallview = true;

		console.log('openChatbox:', openChatbox, 'isSmallview:', isSmallview, 'friendId:', friendId);
	}

	$: if (!conversationId) {
		currentChat.set(null);
		friendId = null;
		console.log('conversationId no definido, limpiando datos.');

		messages.set([]);
	}
</script>

{#if conversations.length > 0}
	<div class="flex m-0 p-0">
		<!-- ChatMenu -->
		<div
			class={`w-full md:w-1/4 top-14 h-[calc(100vh-56px)] ${openChatbox && isSmallview ? 'hidden' : ''}`}
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
						class={`w-full rounded-lg ${currentChatValue?._id === result._id ? 'bg-[#303030]' : ''}`}
						on:click={() => {
							selectConversation(result._id);
							currentChat.set(result);
							conversationId = result._id;
							openChatbox = true;
							if (isSmallview) isSmallview = true;
						}}
					>
						<Conversation conversation={result} userId={$page.data.user._id} />
					</button>
				{/each}
			</div>
		</div>

		<!-- ChatBox -->
		<div class={`w-full ${openChatbox ? '' : 'hidden'}`}>
			<div class="flex flex-col w-full top-14 h-[calc(100vh-56px)]">
				<div class="p-3 h-[calc(100vh-100px)]">
					<!-- ChatBox Head -->
					{#if isSmallview}
						<button
							class={`${isSmallview === true ? '' : 'hidden'}`}
							on:click={() => {
								openChatbox = false;
							}}
						>
							<!-- Close Icon -->
							<iconify-icon icon="ion:arrow-back" height="1.5rem" width="1.5rem"></iconify-icon>
						</button>
					{/if}

					{#if currentChat}
						<!-- Chatbox Body -->
						<div
							bind:this={element}
							class="mx-5 pt-5 pr-5 h-[90%] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-gray-300
            dark:[&::-webkit-scrollbar-track]:bg-neutral-700
            dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
						>
							{#each $messages as message (message._id)}
								<Message
									own={message?.sender === $page.data.user._id}
									{friendId}
									{message}
									{serverUrl}
								/>
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
									class="w-20 h-10 border-none rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-[#202020] dark:text-white dark:hover:bg-[#252525]"
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
			Puedes comenzar una conversación explorando las tiendas o conectándote con otros usuarios.
			¡Descubre productos interesantes y haz nuevos amigos!
		</p>
	</div>
{/if}
