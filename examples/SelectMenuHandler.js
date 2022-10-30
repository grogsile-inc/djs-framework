const { ComponentType } = require("discord.js")
	, { SelectMenuHandler, SlashCommand } = require("../index.js");

// Creating an instance of 'SelectMenu' creates an example Slash Command called "select-menu".
class SelectMenu extends SlashCommand
{
	constructor(client)
	{
		// Create a new command as usual.
		super(client, {
			name: "select-menu",
			description: "A test Select Menu."
		});

		this.menuCustomId = "unique_menu_custom_id";

		// Construct a new `SelectMenuHandler` with the same `customId` as the ActionRow.
		this.menuHandler = new SelectMenuHandler(this.menuCustomId, async interaction =>
		{
			// `interaction.values` contains the chosen value.
			await interaction.reply(interaction.values[0]);
		});
	}

	// The 'run' method is executed when a user uses types "/select-menu".
	async run(interaction)
	{
		// Define the SelectMenu as part of an ActionRow along with a `customId` and some options.
		const itemSelect = {
			type: ComponentType.ActionRow,
			components: [
				{
					"type": ComponentType.SelectMenu,
					"custom_id": this.menuCustomId,
					"placeholder": "Pick an Item",
					"options": [
						{
							label: "Pizza",
							value: "1",
						},
						{
							label: "Hamborgar",
							value: "2",
						},
						{
							label: "Milkshake",
							value: "3",
						}
					]
				}
			]
		};

		// Reply with the attached component.
		return await interaction.reply({
			content: "Please choose the item that you want to display:",
			components: [ itemSelect ]
		});
	}
}

// Create an instance of this custom command.
new SelectMenu(client);
