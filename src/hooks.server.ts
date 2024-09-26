import { client } from '$lib';
import type { Handle } from '@sveltejs/kit';
import { api } from './convex/_generated/api';
import type { Session, User } from './app';
import { redirect } from '@sveltejs/kit';
import { loginPath, signupPath, appPath, public_paths } from '$lib/routes';

function isPathAllowed(path: string) {
	return public_paths.some(
		(allowedPath) => path === allowedPath || path.startsWith(allowedPath + '/')
	);
}

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = new URL(event.request.url).pathname;

	const sessionCookie = event.cookies.get('session');

	let isUserLoggedIn = false;

	if (sessionCookie) {
		const sessionJson = await client.mutation(api.users.validateSession, {
			sessionId: sessionCookie
		});

		const session = JSON.parse(sessionJson) as { user: User | null; session: Session | null };
		isUserLoggedIn = session.user != null && session.session != null;

		event.locals.user = session.user;
		event.locals.session = session.session;
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	if (!isUserLoggedIn && !isPathAllowed(pathname)) {
		// User is not logged in and is trying to access a protected route
		return redirect(302, loginPath);
	}

	if (isUserLoggedIn && (pathname === loginPath || pathname === signupPath)) {
		// User is logged in and is trying to access the login or signup page
		throw redirect(302, appPath);
	}

	return await resolve(event);
};
