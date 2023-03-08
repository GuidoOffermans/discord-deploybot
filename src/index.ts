import { Hono } from 'hono'
import { poweredBy } from 'hono/powered-by'
import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from 'discord-interactions';

import { DEPLOY_COMMAND, REGISTER_COMMAND, SETUP_DEPLOY_COMMAND } from './commands';
import { registerGlobalCommands } from './register';
import { Bindings } from './bindings';
import { confirmMessage, confirmMessageDenied, deployFailed, deploySucceeded, messageModal, selectMessage } from './messages';

class JsonResponse extends Response {
	constructor(body, init) {
		const jsonBody = JSON.stringify(body);
		init = init || {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		};
		super(jsonBody, init);
	}
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', poweredBy())

app.get('/', (c) => {
	return new Response(`👋 ${c.env.DISCORD_APPLICATION_ID}`)
})

app.post('/', async (c) => {
	const message = await c.req.json() as any;

	if (message.type === InteractionType.PING) {
		return new JsonResponse(
			{ type: InteractionResponseType.PONG, },
			null
		);
	}

	if (message.type === InteractionType.APPLICATION_COMMAND) {
		switch (message.data.name.toLowerCase()) {
			case DEPLOY_COMMAND.name.toLowerCase(): {
				const sites = await c.env.DEPLOYABLE_SITES.list();

				return new JsonResponse(
					{
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: selectMessage(sites.keys),
					},
					null
				);
			}

			case SETUP_DEPLOY_COMMAND.name.toLowerCase(): {
				return new JsonResponse(
					{
						type: InteractionResponseType.MODAL,
						data: messageModal,
					},
					null
				);
			}

			case REGISTER_COMMAND.name.toLowerCase(): {

				await registerGlobalCommands(c.env.DISCORD_TOKEN, c.env.DISCORD_APPLICATION_ID)
				return new JsonResponse(
					{
						type: 4,
						data: {
							content: 'registered commands',
						},
					},
					null
				);
			}

			default:
				console.error('Unknown Command');
				return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
		}
	}

	if (message.type === InteractionType.MESSAGE_COMPONENT) {

		if (message.data.custom_id.includes("deploy_confirm")) {
			console.log(message.data.custom_id)

			const siteName = message.data.custom_id.slice("deploy_confirm_".length)
			const deployHook = await c.env.DEPLOYABLE_SITES.get(siteName);

			const response = await fetch(deployHook, {
				method: 'POST',
			});

			if (response.ok) {
				return new JsonResponse(
					{
						type: 7,
						data: deploySucceeded(siteName)
					},
					null
				);
			} else {
				return new JsonResponse(
					{
						type: 7,
						data: deployFailed(siteName)
					},
					null
				);
			}
		}

		switch (message.data.custom_id) {
			case "select_site_to_deploy": {
				return new JsonResponse(
					{
						type: 7,
						data: confirmMessage(message.data.values[0])
					},
					null
				);
			}

			case "deploy_cancel": {
				console.log(message)
				return new JsonResponse(
					{
						type: 7,
						data: confirmMessageDenied
					},
					null
				);
			}

			default:
				console.error('Unknown Command');
				return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
		}
	}

	if (message.type === InteractionType.MODAL_SUBMIT) {
		switch (message.data.custom_id) {
			case "setup_deploy_website": {
				return new JsonResponse(
					{
						type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
						data: {
							content: "completed"
						},
					},
					null
				);
			}

			default:
				console.error('Unknown Command');
				return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
		}
	}

	console.error('Unknown Type');
	return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});

app.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		if (request.method === 'POST') {
			// Using the incoming headers, verify this request actually came from discord.
			const signature = request.headers.get('x-signature-ed25519');
			const timestamp = request.headers.get('x-signature-timestamp');

			const body = await request.clone().arrayBuffer();
			const isValidRequest = verifyKey(
				body,
				signature,
				timestamp,
				env.DISCORD_PUBLIC_KEY
			);

			if (!isValidRequest) {
				console.error('Invalid Request');
				return new Response('Bad request signature.', { status: 401 });
			}
		}

		return app.fetch(request, env, ctx)
	},
}


