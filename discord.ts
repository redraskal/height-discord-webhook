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

	green = 0x03d723;
	red = 0xd70303;
	yellow = 0xd7d703;

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
				avatar_url: "https://height.app/a/statics/assets/icon-logo-LZGX7GYI.svg",
				embeds: [{
					type: "rich",
					...request,
				}],
			}),
		});
	}
};
