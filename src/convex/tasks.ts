import { ConvexError, v } from 'convex/values';
import { mutationWithAuth, queryWithAuth } from './auth/withAuth';

export const get = queryWithAuth({
	args: {},
	handler: async (ctx) => {
		const user = ctx.userSessionContext?.user;
		if (!user) {
			throw new ConvexError('Not authenticated');
		}

		const tasks = await ctx.db
			.query('tasks')
			.withIndex('by_user', (q) => q.eq('userId', user.id))
			.collect();
		return tasks.map((task) => ({ ...task, assigner: 'tom' }));
	}
});

export const add = mutationWithAuth({
	args: { text: v.string(), isCompleted: v.boolean() },
	handler: async (ctx, args) => {
		const user = ctx.userSessionContext?.user;
		if (!user) {
			throw new ConvexError('Not authenticated');
		}

		const newTaskId = await ctx.db.insert('tasks', {
			text: args.text,
			isCompleted: args.isCompleted,
			userId: user.id
		});
		return newTaskId;
	}
});
