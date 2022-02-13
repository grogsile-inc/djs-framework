const { Constants } = require("discord.js")
	, { SlashCommand, SelectMenuHandler } = require("../../index.js");

class SelectMenu extends SlashCommand
{
	constructor(client)
	{
		// Create a new command as usual
		super(client, {
			name: "select-menu",
			description: "A test Select Menu."
		});

		// Construct a new `SelectMenuHandler` with the same `customId` as the ActionRow
		this.menuHandler = new SelectMenuHandler("select_item", async interaction =>
		{
			// `interaction.values` contains the chosen value
			await interaction.reply(interaction.values[0]);
		});
	}

	async run(interaction)
	{
		// Define the SelectMenu as part of an ActionRow along with a `customId` and some options
		const itemSelect = {
			type: Constants.MessageComponentTypes.ACTION_ROW,
			components: [
				{
					"type": Constants.MessageComponentTypes.SELECT_MENU,
					"custom_id": "select_item",
					"placeholder": "Pick an Item",
					"options": [
						{
							label: "Item 1",
							value: "1",
						},
						{
							label: "Item 2",
							value: "2",
						},
						{
							label: "Item 3",
							value: "3",
						}
					]
				}
			]
		};

		// Reply with the attached component
		return await interaction.reply({
			content: "Please choose the item that you want to display:",
			components: [ itemSelect ]
		});
	}
}

module.exports = SelectMenu;
