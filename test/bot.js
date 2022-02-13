require("dotenv").config();

const { Client, Intents } = require("discord.js")
	, { commands, init } = require("../index.js");

const client = new Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ] });
client.login(process.env.DISCORD_TOKEN)
	.then(() =>
	{
		console.log("Logged in.");
		init(client);
	}).catch(console.error);

new commands.Help(client);
new commands.SelectMenu(client);
