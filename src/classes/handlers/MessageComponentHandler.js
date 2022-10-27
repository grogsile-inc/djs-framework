const { Constants } = require("discord.js")
	, BaseHandler = require("./BaseHandler.js");

class MessageComponentHandler extends BaseHandler
{
	interactionType = Constants.InteractionTypes.MESSAGE_COMPONENT;
	componentType = null;

	constructor(customID, callback)
	{
		super();

		if (this.constructor === MessageComponentHandler)
			throw new Error(`AbstractError: '${this.constructor.name}' may not be instantiated directly.`);

		this.customId = customID;
		this.callback = callback;
	}

	handle(interaction)
	{
		if (!(this.componentType === Constants.MessageComponentTypes[interaction.componentType]
			&& this.customId === interaction.customId))
			return;

		return this.callback(interaction);
	}
}

module.exports = MessageComponentHandler;
