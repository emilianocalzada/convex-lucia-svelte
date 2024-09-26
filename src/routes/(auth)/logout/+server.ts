import { redirect } from '@sveltejs/kit';
import { client } from '$lib'; // Adjust the import according to your project structure
import { api } from '../../../convex/_generated/api.js';
import { loginPath } from '$lib/routes.js';

export const POST = async ({ locals, cookies }) => {
	const sessionId = locals.session?.id || '';
	const blankCookie = JSON.parse(await client.mutation(api.users.logoutUser, { sessionId }));
	cookies.set(blankCookie.name, blankCookie.value, {
		path: '.',
		...blankCookie.attributes
	});
	return redirect(302, loginPath);
};
