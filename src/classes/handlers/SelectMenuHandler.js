const { ComponentType } = require("discord.js")
	, MessageComponentHandler = require("./MessageComponentHandler.js");

class SelectMenuHandler extends MessageComponentHandler
{
	constructor(customID, callback)
	{
		super(customID, callback);
		this.componentType = ComponentType.SelectMenu;
	}
}

module.exports = SelectMenuHandler;
