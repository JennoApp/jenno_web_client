<script lang="ts">
	import { cartItems, getTotal } from '$lib/stores/cartStore';
	import { page } from '$app/stores';
  import { Separator } from '$lib/components/ui/separator'
  import { toast } from 'svelte-sonner'
	let shippingData = $page.data?.user?.shippingInfo;

  function getTotalFormatted() {
    const total = getTotal()
    return total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  }

  let items= []

  // transformar datos para stripe
  const productsFormattedStripe = $cartItems.map(product => ({
    price_data: {
      product_data: {
        name: product.productname,
        description: product?.description
      },
      currency: 'usd',
      unit_amount: product.price * 100
    },
    quantity: product.amount
  })) 

  const handleSubmitPayment = async () => {
    const response = await fetch('http://localhost:3000/payments/stripe', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(productsFormattedStripe)
    })

    const response_data = await response.json()

    if (response.status === 201) {
    window.location = response_data?.url
    } else {
      toast.error("Error en solicitud de pago!!!")
    }

    console.log({response_data})
  }

  $: console.log({ productsFormattedStripe })

	$: console.log($cartItems);

	$: console.log(shippingData);
</script>

<div class="flex w-8/12 mx-auto mt-5">
	<div class="w-3/5 p-3">
		{#each $cartItems as cartItem}
			<a href={`/${cartItem.username}/${cartItem._id}`} class="cursor-default">
				<div
					class="flex gap-3 items-center rounded-lg mb-3 p-3 relative dark:bg-[#202020] hover:dark:bg-[#252525]"
				>
					<img
						class="w-12 h-12 object-cover rounded-sm mr-2"
						src={`${cartItem.imgs[0]}`}
						alt={cartItem.productname}
					/>
					<div class="flex w-full mx-7 justify-between">
						<div class="flex gap-5 items-center">
							<h2 class="text-lg font-semibold">{cartItem.productname}</h2>
							<p class="text-base text-white">${cartItem.price}</p>
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>

	<div class="flex flex-col items-center w-2/5 h-full mx-2">
		<div class="dark:bg-[#202020] w-10/12 h-5/6 m-3 p-3 rounded-lg">
			<h3 class="text-md font-semibold">Shipping Info</h3>
			<div class="flex justify-between gap-2">
				<h3>Address:</h3>
				<p>{shippingData?.address}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>Country:</h3>
				<p>{shippingData?.country}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>State:</h3>
				<p>{shippingData?.state}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>City:</h3>
				<p>{shippingData?.city}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>Postal code:</h3>
				<p>{shippingData?.postalCode}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>Phone number:</h3>
				<p>{shippingData?.phoneNumber}</p>
			</div>

			<!-- Order Summary -->
			<h3 class="text-md font-semibold mt-3">Order Summary</h3>
			<div class="flex justify-between gap-2">
				<h3>Total price</h3>
				<p>{getTotalFormatted()}</p>
			</div>
			<div class="flex justify-between gap-2">
				<h3>Delivery price</h3>
				<p>${1212425}</p>
			</div>
      <Separator class="bg-[#707070] my-1"/>
			<div class="flex justify-between gap-2">
				<h3 class="font-bold">Payment amount</h3>
				<p>${1212545}</p>
			</div>
		</div>
		<!-- Cofirm Button -->
			<!-- Shipping Submit -->
			<button
				class="h-10 w-10/12 mt-4 border border-[#222222] bg-[#202020] rounded-lg dark:text-gray-200 hover:bg-[#252525]"
        on:click={() => handleSubmitPayment()}
			>
				Confirm Payment
			</button>
	</div>
</div>
