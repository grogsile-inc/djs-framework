const { Constants } = require("discord.js")
	, MessageComponentHandler = require("./MessageComponentHandler.js");

class ButtonHandler extends MessageComponentHandler
{
	constructor(customID, callback)
	{
		super(customID, callback);
		this.componentType = Constants.MessageComponentTypes.BUTTON;
	}
}

module.exports = ButtonHandler;
