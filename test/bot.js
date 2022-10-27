require("dotenv").config();

const { Client, IntentsBitField } = require("discord.js")
	, { commands, init } = require("../index.js");

const client = new Client({ intents: new IntentsBitField(Object.keys(IntentsBitField.Flags)) });
client.login(process.env.DISCORD_TOKEN)
	.then(() =>
	{
		console.log("Logged in.");
		init(client);
	}).catch(console.error);

new commands.Help(client);
