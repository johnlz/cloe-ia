require('dotenv').config();
const { Listener } = require('@sapphire/framework');
const Relay = require('../relay');
const minResponseChance = 1;
const maxResponseChance = parseInt(process.env.MAX_RESPONSE_CHANCE);
const botUserId = process.env.BOT_USER_ID;

class MessageCreationListener extends Listener {
	constructor(context, options) {
		super(context, {
			...options, event: 'messageCreate'
		});
	}

	async run(message) {
		let authorId = message.author.id;
		if (authorId === botUserId) {
			return false;
		}

		let botPinged = false;
		if (message.mentions !== []) {
			if (message.mentions.users.has(botUserId)) {
				botPinged = true;
			}
		}
		let randomChance = Math.floor(Math.random() * (maxResponseChance - minResponseChance + 1) + minResponseChance);
		let messageContent = message.content;
		// utilizando @cloe e mandando uma mensagem para a mesma, ela irá responder de acordo com a api!
		let channelId = message.channelId;
		messageContent = messageContent.replace("<@!" + botUserId + ">", '')
			.replace("<@" + botUserId + ">", '')
			.replace("\n", ' ');
		let usersName = message.author.username;
		if (botPinged || randomChance === maxResponseChance) {
			let response = await Relay.relayMessage(messageContent, usersName, channelId, true);
			console.log([
				'respondendo com',
				response]);

			return message.reply(response);
		} else {
			console.log('adicionando mensagem no histórico de prompts e não solicitando uma resposta.');
			await Relay.relayMessage(messageContent, usersName, channelId, false);
		}
	}
}

module.exports = {
	MessageCreationListener
};