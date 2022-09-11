require('dotenv').config();
const { SapphireClient } = require('@sapphire/framework');

const token = process.env.DISCORD_BOT_TOKEN;
const client = new SapphireClient({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

client.login(token);