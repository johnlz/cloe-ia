const { Listener } = require('@sapphire/framework');
const { Permissions } = require('discord.js');
const chatContextHandler = require('../chatContextHandler');
const botUserId = process.env.BOT_USER_ID;
const maxLines = parseInt(process.env.MAX_NUMBER_OF_PROMPT_LINES);

class ReadyListener extends Listener {
	constructor(context, options) {
		super(context, {
			...options, once: true, event: 'ready'
		});
	}

	run(client) {
		const { username, id } = client.user;
		client.channels.cache.forEach(function (value, key, map) {
			let channel = map.get(key);
			let channelId = value.id;
			if (channel.type === 'GUILD_TEXT') {
				let permissionCheck = new Permissions(channel.permissionsFor(botUserId));
				if (permissionCheck.has(Permissions.FLAGS.SEND_MESSAGES)
					&& permissionCheck.has(Permissions.FLAGS.READ_MESSAGE_HISTORY)
					&& permissionCheck.has(Permissions.FLAGS.VIEW_CHANNEL)) {
					if (value.messages !== undefined) {
						try {
							value.messages.fetch({ limit: maxLines }).then(channelMessages => {
								let messageHistory = '';
								let counter = 0;
								channelMessages.forEach(channelMessage => {
									let prefix = channelMessage.author.id === botUserId ? 'Cloe: ' : 'Human: '//`${channelMessage.author.username}: `;
									let messageContent = channelMessage.content.replace("<@!" + botUserId + ">", '')
										.replace("<@" + botUserId + ">", '')
										.replace("\n", ' ')
										.trim();
									if (++counter === 50) {
										messageHistory = prefix + messageContent + messageHistory;
									} else {
										messageHistory = "\n" + prefix + messageContent + messageHistory;
									}
								});
								while (messageHistory.includes("\n\n")) {
									messageHistory = messageHistory.replace("\n\n", "\n");
								}
								messageHistory = chatContextHandler.basePrompt + messageHistory;
								chatContextHandler.saveFile(channelId, (messageHistory));

							});
						} catch (err) {
							console.log(err);
						}
					}
				}
			}
		});

		this.container.logger.info(`Logado com sucesso em: ${username} (${id})`);
	}
}

module.exports = {
	ReadyListener
};