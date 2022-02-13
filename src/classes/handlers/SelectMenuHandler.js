const { Constants } = require("discord.js")
	, MessageComponentHandler = require("./MessageComponentHandler.js");

class SelectMenuHandler extends MessageComponentHandler
{
	constructor(customID, callback)
	{
		super(customID, callback);
		this.componentType = Constants.MessageComponentTypes.SELECT_MENU;
	}
}

module.exports = SelectMenuHandler;
