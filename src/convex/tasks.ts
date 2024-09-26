import { queryWithAuth } from './auth/withAuth';

export const get = queryWithAuth({
	args: {},
	handler: async (ctx) => {
		const identity = ctx.userSessionContext?.user;
		if (!identity) {
			throw new Error('Not authenticated');
		}
		console.log(identity);

		const tasks = await ctx.db
			.query('tasks')
			// .filter((task) => task.userId === identity._id)
			.collect();
		return tasks.map((task) => ({ ...task, assigner: 'tom' }));
	}
});
