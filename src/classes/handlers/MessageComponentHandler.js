const { InteractionType, ComponentType } = require("discord.js")
	, BaseHandler = require("./BaseHandler.js");

class MessageComponentHandler extends BaseHandler
{
	interactionType = InteractionType.MessageComponent;
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
		if (!(this.componentType === interaction.componentType
			&& this.customId === interaction.customId))
			return;

		return this.callback(interaction);
	}
}

module.exports = MessageComponentHandler;
