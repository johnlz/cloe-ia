require('dotenv').config();

const axios = require('axios').default;
const chatContextHandler = require('./chatContextHandler');
const key = process.env.OPENAI_API_KEY;
const url = process.env.OPENAI_API_URL;
const maxLines = parseInt(process.env.MAX_NUMBER_OF_PROMPT_LINES);
const basePromptLength = parseInt(process.env.BASE_PROMPT_LENGTH);
const config = {
	headers: {
		"Content-Type": "application/json", "Authorization": "Bearer " + key
	}
}
let data = {
	//"model": "davinci:2020-05-03",
	"prompt": "",
	"temperature": 0.9,
	"max_tokens": 150,
	"top_p": 1,
	"best_of": 1,
	"frequency_penalty": 0,
	"presence_penalty": 0.6,
	"stop": [
		"Human:",
		//"Cloe:",
		"\n"]
};

class Relay {
	static async relayMessage(message, userName, channelId, callApi = false) {

		let currentChatContext = chatContextHandler.getFile(channelId);
		data.prompt = '';
		if (currentChatContext === undefined) {
			data.prompt = chatContextHandler.basePrompt;
			currentChatContext = '';
		}
		if (message === '') {
			return null;
		}
		currentChatContext = currentChatContext + "\nHuman: " + message.trim();
		let promptLines = currentChatContext.split('\n');
		if (promptLines.length > (maxLines)) {
			console.log([
				"Removing Lines:",
				((promptLines.length) - maxLines)])
			promptLines.splice(basePromptLength, ((promptLines.length - basePromptLength) - maxLines));
			currentChatContext = promptLines.join('\n');
		}
		data.prompt = data.prompt + currentChatContext;
		while (data.prompt.includes("\n\n")) {
			data.prompt = data.prompt.replace("\n\n", "\n");
		}

		if (!callApi) {
			chatContextHandler.saveFile(channelId, data.prompt);
			return null;
		}
		let sentDataPrompt = data.prompt;
		data.prompt = data.prompt + "\nCloe:";

		const result = await axios.post(url, data, config);
		let returnMessage = '';
		if (result.isAxiosError === true) {
			console.log(result.data.error);
			returnMessage = "Wow you broke it.";
		} else if (result.data.choices[0].text !== '') {
			console.log(result.data.choices);
			sentDataPrompt = sentDataPrompt + "\nCloe: " + result.data.choices[0].text.trim();
			returnMessage = result.data.choices[0].text;
		} else {
			console.log(result.data);
			sentDataPrompt = sentDataPrompt + "\nCloe: " + chatContextHandler.emptyResponseMessage;
			returnMessage = chatContextHandler.emptyResponseMessage;
		}
		chatContextHandler.saveFile(channelId, sentDataPrompt);

		return returnMessage;
	}
}

module.exports = Relay;