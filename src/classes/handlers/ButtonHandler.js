const { ComponentType } = require("discord.js")
	, MessageComponentHandler = require("./MessageComponentHandler.js");

class ButtonHandler extends MessageComponentHandler
{
	constructor(customID, callback)
	{
		super(customID, callback);
		this.componentType = ComponentType.Button;
	}
}

module.exports = ButtonHandler;
