export type DiscordWebhookAuthor = {
	name: string;
	icon_url?: string;
};

export type DiscordWebhookRequest = {
	url: string;
	title: string;
	description: string;
	author: DiscordWebhookAuthor;
	timestamp: string;
	color: number;
};

export default class DiscordWebhook {
	url: string;
	avatar = "https://cdn.discordapp.com/avatars/955780901583880232/db5c1a9efe559528fa91c5baa5280e37.png";

	constructor(url: string) {
		this.url = url;
	}

	async push(request: DiscordWebhookRequest) {
		return fetch(this.url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: "Height",
				avatar_url: this.avatar,
				embeds: [{
					type: "rich",
					...request,
				}],
			}),
		});
	}
};
