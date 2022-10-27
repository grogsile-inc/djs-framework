const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js")
	, SlashCommand = require("../classes/SlashCommand.js");

class Help extends SlashCommand
{
	constructor(client)
	{
		super(client, {
			name: "help",
			description: "An overview of the commands that this bot offers.",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "command",
					description: "The specific command.",

					// We make this a getter because otherwise, we would only pick up on commands registered before this one
					get choices()
					{
						return SlashCommand.commands.map(c => ({
							name: c.name,
							value: c.name
						}));
					}
				}
			]
		});
	}

	run(interaction)
	{
		const commandName = interaction.options.getString("command");

		let embed;
		if (commandName == null)
		{
			embed = new EmbedBuilder()
				.setAuthor({
					name: "Commands",
					iconURL: this.client.user.displayAvatarURL()
				});

			for (const cmd of SlashCommand.commands.slice(0, 25))
				embed.addFields([{
					name: `/${cmd.name}`,
					value: `*${cmd.description}*`
				}]);
		}

		else
			embed = SlashCommand.commands.find(c => c.name === commandName).embed;

		interaction.reply({
			embeds: [ embed ],
			ephemeral: true
		}).catch(console.error);
	}
}

module.exports = Help;
