import Height, {TaskObject, ActivityObject, UserObject} from "height-app-api";
import DiscordWebhook from "./discord.js";
import {green, taskStatus, white, yellow} from "./utils.js";

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
			const parentTask: TaskObject | null = task.parentTaskId ? await height.tasks.get({ id: task.parentTaskId }) : null;
			await webhook.push(
				{
					url: task.url,
					title: `New task: ${parentTask ? `T-${parentTask.index} ${parentTask.name} -> ` : ""}T-${task.index} ${task.name}`,
					description: task.description,
					author: {
						name: author.username,
						icon_url: author.pictureUrl || webhook.avatar,
					},
					timestamp: task.createdAt,
					color: white,
			});
		}
		if (event.type == "task.updated") {
			const task = event.data.model as TaskObject;
			const assignees: UserObject[] = await Promise.all(task.assigneesIds.map(async (assigneeId: string) => height.users.get({ id: assigneeId })));
			const parentTask: TaskObject | null = task.parentTaskId ? await height.tasks.get({ id: task.parentTaskId }) : null;
			const status = await taskStatus(height, task.status);
			const fields = task.fields.map((field: any) => `${field.name}: ${field.label.value}`).join("\n");
			await webhook.push(
				{
					url: task.url,
					title: `Updated task: ${parentTask ? `T-${parentTask.index} ${parentTask.name} -> ` : ""}T-${task.index} ${task.name}`,
					description: `${task.description}\nStatus: ${status.name}\n${fields}\nAssignees: ${assignees.map(assignee => assignee.username).join(", ")}`,
					author: {
						name: "Height",
						icon_url: webhook.avatar,
					},
					timestamp: task.createdAt,
					color: status.color,
				});
		}
		return new Response();
	},
};
