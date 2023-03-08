import { DEPLOY_COMMAND, REGISTER_COMMAND, SETUP_DEPLOY_COMMAND } from './commands.js';

export async function registerGlobalCommands(token: string, applicationId: string) {
	if (!token) {
		throw new Error('The DISCORD_TOKEN environment variable is required.');
	}
	if (!applicationId) {
		throw new Error(
			'The DISCORD_APPLICATION_ID environment variable is required.'
		);
	}
	const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
	await registerCommands(url, token);
}

async function registerCommands(url: string, token: string) {
	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bot ${token}`,
		},
		method: 'PUT',
		body: JSON.stringify([DEPLOY_COMMAND, REGISTER_COMMAND, SETUP_DEPLOY_COMMAND]),
	});

	if (response.ok) {
		console.log('Registered all commands');
	} else {
		console.error('Error registering commands');
		const text = await response.text();
		console.error(text);
	}
	return response;
}

