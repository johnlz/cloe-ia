const fs = require('fs');

class ChatContextHandler { // definição abaixo do prompt a partir da api, ou seja, você vai estar definindo como a sua inteligência artificial irá se comportar.
	static basePrompt = 'Cloe is a sexy women and funny virtual assistant who loves to answer questions and understands all existing programming languages ​​and knows everything about pop culture, geek and gamer.\n';
	static emptyResponseMessage = "Ah!! You're unlucky, I was activated by your message but no AI response was given... You've now got 1 minute worth of bad luck :("; // mensagem de erro

	static getFile(channelId) {
		try {
			return fs.readFileSync('./chatContextFiles/' + channelId + '.txt', 'utf8');
		} catch(err) {
			try {
				this.saveFile(channelId, '');
				return fs.readFileSync('./chatContextFiles/' + channelId + '.txt', 'utf8');
			} catch(err) {
				console.error(err)
				return undefined;
			}
		}
	}

	static saveFile(channelId, content) {
		fs.writeFile('./chatContextFiles/' + channelId + '.txt', content, err => {
			if(err) {
				console.error(err);
			}
		});
	}
}

module.exports = ChatContextHandler;