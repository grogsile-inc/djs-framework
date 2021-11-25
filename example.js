const DiscordCommand = require("./src/classes/DiscordCommand.js")
	, DiscordEvent = require("./src/classes/DiscordEvent.js");

const { Client, Intents, Constants } = require("discord.js");

// Create the client
const client = new Client({
	// Don't forget your Intents
	intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ]
});

// Create a class that inherits DiscordCommand for your chosen Command
class Ping extends DiscordCommand
{
	constructor(client)
	{
		super(client, {
			name: "ping",
			description: "Pong!",
			// The 'interaction' property defines your Slash Command
			interaction: {
				options: [
					{
						type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
						name: "pong",
						description: "Pong?",
						required: false
					}
				]
			}
		});
	}

	// The 'run' method is always required
	async run(interaction)
	{
		// The bot responds with "Pong!" or "Ping?..." based on if the user supplied the 'pong' option
		const pong = interaction.options.getBoolean("pong") ? "Ping?..." : "Pong!";
		await interaction.reply({ content: pong });
	}
}

// Create an instance of your custom Command
new Ping(client);

// Call this to update your Slash Commands after you have declared all of your custom Commands
DiscordCommand.updateInteractions(process.env.DISCORD_BOT_ID, process.env.DISCORD_TOKEN);

// Create a middleware function for an event
function log({ author, content })
{
	console.log(`${author.username}: "${content}"`);
	// Prints: Medallyon: "There is no way a bee should be able to fly."
}

// Then, create a new DiscordEvent instance and supply the Event Name, the Client, and any Options
new DiscordEvent("messageCreate", client, { middleware: [ log ] });

/**************
       OR
 **************/

// Create your DiscordEvent instance and store it
const onMessageCreate = new DiscordEvent("messageCreate", client);

// And register any middleware after creating your DiscordEvent
onMessageCreate.registerMiddleware(log);

// You can then call login whenever
client.login(process.env.DISCORD_TOKEN)
	.then(() => console.log("I'm logged in!"))
	.catch(console.error);
