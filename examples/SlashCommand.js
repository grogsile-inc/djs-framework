const { Constants } = require("discord.js")
	, { SlashCommand } = require("@medallyon/djs-framework");

// Create a class that inherits SlashCommand for your chosen Command
class Ping extends SlashCommand
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
SlashCommand.updateInteractions(process.env.DISCORD_ID, process.env.DISCORD_TOKEN);
