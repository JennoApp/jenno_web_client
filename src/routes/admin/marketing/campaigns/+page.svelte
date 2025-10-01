<script lang="ts">
	import * as m from '$paraglide/messages';
</script>

<div class="flex flex-col items-center justify-center h-[calc(100vh-56px)] w-full">
	<iconify-icon
		icon="material-symbols:construction-rounded"
		height="7rem"
		width="7rem"
		class="text-[#707070] mb-4"
	></iconify-icon>
	<h1 class="text-xl font-semibold text-[#707070] mb-2">{m.admin_marketing_nomarketing_title()}</h1>
	<p class="text-lg text-[#707070]">{m.admin_marketing_nomarketing_p()}</p>
</div>
