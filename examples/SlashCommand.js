const { Constants } = require("discord.js")
	, { init, SlashCommand } = require("@medallyon/djs-framework");

// Create a class that inherits SlashCommand for your chosen Command
class Ping extends SlashCommand
{
	constructor(client)
	{
		// In 'super', pass in the DiscordClient and an object defining your SlashCommand
		super(client, {
			name: "ping",
			description: "Pong!",
			options: [
				{
					type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
					name: "pong",
					description: "Pong?",
					required: false
				}
			]
		});
	}

	// The 'run' method is always required, and is executed when a user types "/ping"
	async run(interaction)
	{
		// The bot responds with "Pong!" or "Ping?..." based on if the user supplied the 'pong' option
		const pong = interaction.options.getBoolean("pong") ? "Ping?..." : "Pong!";
		await interaction.reply({ content: pong });
	}
}

// Create an instance of your custom Command
new Ping(client);

// At the time of writing, it's recommended to call 'init' after the "ready" event
client.once("ready", () =>
{
	// Finally, call 'init' and pass in your DiscordClient after setting up all commands & events
	init(client);
});
