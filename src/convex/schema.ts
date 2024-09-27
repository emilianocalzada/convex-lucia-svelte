import { v } from 'convex/values';
import { defineEnt, defineEntSchema, getEntDefinitions } from 'convex-ents';

// Auth tables
const users = defineEnt({
	email: v.string(),
	password_hash: v.string()
}).index('byemail', ['email']);

const sessions = defineEnt({
	id: v.string(),
	user_id: v.id('users'),
	expires_at: v.float64()
})
	.index('byUserId', ['user_id'])
	.index('byId', ['id']);

// Tasks table
const tasks = defineEnt({
	text: v.string(),
	isCompleted: v.boolean(),
	userId: v.id('users')
}).index('by_user', ['userId']);

// Schema
const schema = defineEntSchema({
	tasks,
	users,
	sessions
});

export default schema;
export const entDefinitions = getEntDefinitions(schema);
