import Height, { TaskObject, ActivityObject } from "height-app-api";
import DiscordWebhook from "./discord.js";

const port = process.env.PORT || 3000;
const webhookId = process.env.HEIGHT_WEBHOOK_ID;
const secretKey = process.env.HEIGHT_SECRET;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!webhookId) {
	console.warn("Allowing all requests since WEBHOOK_ID env variable was not set.");
}

if (!webhookUrl) {
	console.error("DISCORD_WEBHOOK_URL env variable not set.");
	process.exit(1);
} else if (!secretKey) {
	console.error("HEIGHT_SECRET env variable not set.");
	process.exit(1);
}

const height = new Height({ secretKey });
const webhook = new DiscordWebhook(webhookUrl);

console.log(`Hello via Bun at http://127.0.0.1:${port}!`);

type HeightTaskEvent = "task.created" | "task.updated" | "task.deleted";
type HeightActivityEvent = "activity.created" | "activity.updated" | "activity.deleted";
type HeightEvent = HeightTaskEvent | HeightActivityEvent;
type HeightWebhookModel = TaskObject | ActivityObject;

type HeightWebhookData = {
	model: HeightWebhookModel;
	previousModel?: HeightWebhookModel;
};

type HeightWebhook = {
	id: string;
	model: "webhookEvent";
	webhookId: string;
	type: HeightEvent;
	data: HeightWebhookData;
};

export default {
	port,
	async fetch(request: Request): Promise<Response> {
		console.log(request.headers.toJSON());
		const event = await request.json<HeightWebhook>();
		if (webhookId && event.webhookId != webhookId) {
			return new Response("", {
				status: 400,
			});
		}
		console.log(event);
		if (event.type == "task.created") {
			const task = event.data.model as TaskObject;
			const author = await height.users.get({ id: task.createdUserId });
			await webhook.push(
				{
					url: task.url,
					title: `New task: ${task.name}`,
					description: task.description,
					author: {
						name: author.username,
						icon_url: author.pictureUrl,
					},
					timestamp: task.createdAt,
					color: webhook.green,
			});
		}
		return new Response();
	},
};
