const { Constants, MessageEmbed } = require("discord.js")
	, DiscordCommand = require("../classes/DiscordCommand.js");

class Help extends DiscordCommand
{
	constructor(client)
	{
		super(client, {
			name: "help",
			description: "An overview of the commands that this bot offers.",
			interaction: {
				options: [
					{
						type: Constants.ApplicationCommandOptionTypes.STRING,
						name: "command",
						description: "The specific command.",
						choices: DiscordCommand.commands.map(c => ({
							name: c.name,
							value: c.name
						}))
					}
				]
			}
		});
	}

	run(interaction)
	{
		const commandName = interaction.options.getString("command");

		let embed;
		if (commandName == null)
		{
			embed = new MessageEmbed()
				.setAuthor("Commands");

			for (const cmd of DiscordCommand.commands.slice(0, 25))
				embed.addField(`/${cmd.name}`, `*${cmd.description}*`);
		}

		else
			embed = DiscordCommand.commands.find(c => c.name === commandName).embed;

		interaction.reply({
			embeds: [ embed ],
			ephemeral: true
		}).catch(console.error);
	}
}

module.exports = Help;
