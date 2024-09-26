import { ConvexError, v } from 'convex/values';
import { DatabaseWriter, mutation } from './_generated/server';
import { getAuth } from './auth/lucia';
import { Scrypt } from 'lucia';

export const register = mutation({
	args: {
		email: v.string(),
		password: v.string()
	},
	handler: async (ctx, args) => {
		if (args.email.length < 3) throw new ConvexError('email must be at least 3 characters long');
		if (args.password.length < 8)
			throw new ConvexError('Password must be at least 8 characters long');

		const auth = getAuth(ctx.db);
		const existingUser = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('email'), args.email))
			.first();
		if (existingUser) throw new ConvexError('User already exists');
		const password_hash = await new Scrypt().hash(args.password);

		const user = await ctx.db.insert('users', {
			email: args.email,
			password_hash
		});

		const session = await auth.createSession(user, {});

		return JSON.stringify(session);
	}
});

export const login = mutation({
	args: {
		email: v.string(),
		password: v.string()
	},
	handler: async (ctx, args) => {
		const invaildUserOrPassword = new ConvexError('Invalid email or password');
		const auth = getAuth(ctx.db);
		const existingUser = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('email'), args.email))
			.first();
		if (!existingUser) throw invaildUserOrPassword;
		const passwordMatches = await new Scrypt().verify(existingUser.password_hash, args.password);
		if (!passwordMatches) throw invaildUserOrPassword;
		const session = await auth.createSession(existingUser._id, {});
		return JSON.stringify(session);
	}
});

export const validateSession = mutation({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const auth = getAuth(ctx.db as DatabaseWriter);
		const userSession = await auth.validateSession(args.sessionId);
		return JSON.stringify(userSession);
	}
});

export const logoutUser = mutation({
	args: {
		sessionId: v.string()
	},
	handler: async (ctx, args) => {
		const auth = getAuth(ctx.db as DatabaseWriter);
		await auth.invalidateSession(args.sessionId);
		return JSON.stringify(auth.createBlankSessionCookie());
	}
});
