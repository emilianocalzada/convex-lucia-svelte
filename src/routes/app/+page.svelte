<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import Button from '$lib/components/ui/button/button.svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();
	const sessionId = data.session?.id;
	const convex = useConvexClient();

	const query = useQuery(api.tasks.get, {
		sessionId: sessionId
	});
	async function addTask(text: string, isCompleted: boolean) {
		await convex.mutation(api.tasks.add, {
			sessionId: sessionId,
			text: text,
			isCompleted: isCompleted
		});
	}
	async function toggleCompleted(taskId: string, isCompleted: boolean) {
		await convex.mutation(api.tasks.toggleCompleted, {
			sessionId: sessionId,
			id: taskId,
			isCompleted: isCompleted
		});
	}

	async function deleteTask(taskId: string) {
		await convex.mutation(api.tasks.deleteTask, {
			sessionId: sessionId,
			id: taskId
		});
	}

	let text = $state('');
	let isCompleted = $state(false);
</script>

<h2>Welcome {data.user?.email}</h2>

<form
	onsubmit={(e) => {
		e.preventDefault();
		addTask(text, isCompleted);
		text = '';
		isCompleted = false;
	}}
>
	<input type="text" name="text" placeholder="Task" required bind:value={text} />
	<input type="checkbox" name="isCompleted" bind:checked={isCompleted} />
	<Button type="submit" disabled={!text}>Add Task</Button>
</form>

{#if query.isLoading}
	Loading...
{:else if query.error}
	failed to load: {query.error.toString()}
{:else}
	<ul>
		{#each query.data as task}
			<li>
				<input
					type="checkbox"
					checked={task.isCompleted}
					onchange={() => toggleCompleted(task._id, !task.isCompleted)}
				/>
				<span>{task.text}</span>
				<span>assigned by {task.assigner}</span>
				<Button variant="destructive" on:click={() => deleteTask(task._id)}>Delete</Button>
			</li>
		{/each}
	</ul>
{/if}

<form method="POST" action="/logout" use:enhance>
	<Button type="submit" variant="destructive">Logout</Button>
</form>
