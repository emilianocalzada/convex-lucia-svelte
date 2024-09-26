<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import Button from '$lib/components/ui/button/button.svelte';
	import { enhance } from '$app/forms';

	export let data;
	const query = useQuery(api.tasks.get, {});
</script>

<h2>Welcome {data.user?.email}</h2>

{#if query.isLoading}
	Loading...
{:else if query.error}
	failed to load: {query.error.toString()}
{:else}
	<ul>
		{#each query.data as task}
			<li>
				{task.isCompleted ? '☑' : '☐'}
				<span>{task.text}</span>
				<span>assigned by {task.assigner}</span>
			</li>
		{/each}
	</ul>
{/if}

<form method="POST" action="/logout" use:enhance>
	<Button type="submit" variant="destructive">Logout</Button>
</form>
